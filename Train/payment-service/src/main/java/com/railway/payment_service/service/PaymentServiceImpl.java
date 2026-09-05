package com.railway.payment_service.service;

import com.railway.payment_service.dto.PaymentRequestDTO;
import com.railway.payment_service.dto.PaymentResponseDTO;
import com.railway.payment_service.entity.Payment;
import com.railway.payment_service.entity.PaymentStatus;
import com.railway.payment_service.feign.ReservationClient;
import com.railway.payment_service.feign.TrainClient;
import com.railway.payment_service.feign.UserClient;
import com.railway.payment_service.repository.IPaymentRepository;
import com.railway.payment_service.utils.PdfGeneratorUtil;
import com.railway.payment_service.dto.ReservationResponseDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final IPaymentRepository IPaymentRepository;
    private final ReservationClient IReservationClient;
    private final TrainClient TrainClient;
    private final UserClient UserClient;

    @Autowired
    private EmailService emailService;

    public PaymentServiceImpl(IPaymentRepository IPaymentRepository, ReservationClient IReservationClient, TrainClient TrainClient, UserClient userClient) {
        this.IPaymentRepository = IPaymentRepository;
        this.IReservationClient = IReservationClient;
        this.TrainClient = TrainClient;
        this.UserClient = userClient;
    }

    /**
     * Initiates the checkout process for a reservation.
     */
    @Override
    public PaymentResponseDTO initiateCheckout(String pnr) {
        return initiateCheckout(pnr, "UPI");
    }

    @Override
    public PaymentResponseDTO initiateCheckout(String pnr, String paymentMethod) {
        // Get reservation details using Feign client
        ResponseEntity<ReservationResponseDTO> response = IReservationClient.getReservationByPNR(pnr);

        ReservationResponseDTO reservation = response.getBody();
        if (reservation == null) {
            throw new RuntimeException("Reservation not found for PNR: " + pnr);
        }

        // Create PaymentRequestDTO
        PaymentRequestDTO paymentRequest = PaymentRequestDTO.builder()
                .pnr(pnr)
                .ticketName("Train: " + reservation.getTrainName() + " | Class: " + reservation.getClassType())
                .currency("INR")
                .amount((long) (reservation.getTotalFare() * 100))
                .quantity(1L)
                .build();

        log.info("Payment request created for PNR: " + pnr);

        if (!"stripe".equalsIgnoreCase(paymentGateway)) {
            String encodedPnr = URLEncoder.encode(pnr, StandardCharsets.UTF_8);
            String encodedPaymentMethod = URLEncoder.encode(normalizePaymentMethod(paymentMethod), StandardCharsets.UTF_8);

            return PaymentResponseDTO.builder()
                    .status("Success")
                    .message("Local payment session created!")
                    .sessionId("LOCAL-" + pnr)
                    .sessionUrl(paymentSuccessUrl + "?pnr=" + encodedPnr + "&payment_method=" + encodedPaymentMethod)
                    .build();
        }

        // Call your existing checkout method
        return checkout(paymentRequest);
    }

    @Value("${stripe.secretKey:}")
    private String secretKey;

    @Value("${payment.gateway:mock}")
    private String paymentGateway;

    @Value("${payment.success-url:http://localhost:5173/payment-success}")
    private String paymentSuccessUrl;

    @Value("${payment.cancel-url:http://localhost:5173/dashboard}")
    private String paymentCancelUrl;


    /**
     * Creates a Stripe payment session using the provided payment request.
     */
    @Override
    public PaymentResponseDTO checkout(PaymentRequestDTO paymentRequestDTO) {
        Stripe.apiKey = secretKey;

        SessionCreateParams.LineItem.PriceData.ProductData ticketData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                .setName(paymentRequestDTO.getTicketName()).build();

        SessionCreateParams.LineItem.PriceData priceData = SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency(paymentRequestDTO.getCurrency())
                .setUnitAmount(paymentRequestDTO.getAmount())
                .setProductData(ticketData).build();

        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(paymentRequestDTO.getQuantity())
                .setPriceData(priceData).build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(paymentSuccessUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(paymentCancelUrl)
                .putMetadata("pnr", paymentRequestDTO.getPnr())
                .addLineItem(lineItem)
                .build();

        Session session = null;
        try{
            session = Session.create(params);
        }
        catch (StripeException e) {
            throw new RuntimeException(e);
        }

        log.info("Payment session created for PNR: " + paymentRequestDTO.getPnr());

        return PaymentResponseDTO.builder()
                .status("Success")
                .message("Payment Session Created!")
                .sessionId(session.getId())
                .sessionUrl(session.getUrl())
                .build();
    }


    /**
     * Handles successful payment callback from Stripe.
     */
    @Override
    public String handlePaymentSuccess(String sessionId) {
        try {
            // Retrieve session
            Session session = Session.retrieve(sessionId);

            // Extract PNR
            String pnr = session.getMetadata().get("pnr");

            // Get reservation details
            ReservationResponseDTO reservation = IReservationClient.getReservationByPNR(pnr).getBody();
            if (reservation == null) {
                throw new RuntimeException("Reservation not found for PNR: " + pnr);
            }

            // Check if reservation is already confirmed
            if ("CONFIRMED".equals(reservation.getReservationStatus())) {
                log.warn("Reservation already confirmed for PNR: {}", pnr);
                return "Reservation already confirmed - no duplicate processing";
            }

            // Check if payment already exists for this reservation
            if (IPaymentRepository.existsByReservationId(reservation.getReservationId())) {
                log.warn("Payment already processed for PNR: {}", pnr);
                return "Payment already processed";
            }

            // Save payment to DB
            Payment payment = Payment.builder()
                    .reservationId(reservation.getReservationId())
                    .amount(reservation.getTotalFare())
                    .paymentMethod("CARD")
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .build();

            IPaymentRepository.save(payment);
            log.info("Payment details saved for PNR: " + pnr);

            IReservationClient.updateReservationStatus(pnr);

            log.info("Seats were already reserved during booking creation for PNR: {}", pnr);

            // Generate PDF
            byte[] pdfBytes = PdfGeneratorUtil.generateReservationPdf(reservation);
            log.info("PDF generated successfully for PNR: {}", pnr);

            String email = UserClient.getUserByUserName(reservation.getUsername()).getBody().getEmail();

            String subject = "Reservation Details for PNR: " + pnr;
            String body = "Dear " + reservation.getUsername() + ",\n\nYour reservation has been successfully confirmed. Please find the attached PDF for your reservation details.";

            emailService.sendEmailWithAttachment(email, subject, body, pdfBytes, "reservation_" + pnr + ".pdf");

            log.info("Reservation PDF sent to email for PNR: " + pnr);

            return "Payment successful and recorded!";

        }
        catch (Exception e) {
            e.printStackTrace();
            return "Payment success processing failed!";
        }
    }


    @Override
    public String confirmPayment(String pnr, String paymentMethod) {
        try {
            ReservationResponseDTO reservation = IReservationClient.getReservationByPNR(pnr).getBody();
            if (reservation == null) {
                throw new RuntimeException("Reservation not found for PNR: " + pnr);
            }

            if (IPaymentRepository.existsByReservationId(reservation.getReservationId())) {
                log.warn("Payment already processed for PNR: {}", pnr);
                return "Payment already processed";
            }

            Payment payment = Payment.builder()
                    .reservationId(reservation.getReservationId())
                    .amount(reservation.getTotalFare())
                    .paymentMethod(normalizePaymentMethod(paymentMethod))
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .build();

            IPaymentRepository.save(payment);
            log.info("Payment details saved for PNR: " + pnr);

            if (!"CONFIRMED".equals(reservation.getReservationStatus())) {
                IReservationClient.updateReservationStatus(pnr);

                log.info("Seats were already reserved during booking creation for PNR: {}", pnr);
            }

            byte[] pdfBytes = PdfGeneratorUtil.generateReservationPdf(reservation);
            log.info("PDF generated successfully for PNR: {}", pnr);

            String email = UserClient.getUserByUserName(reservation.getUsername()).getBody().getEmail();

            String subject = "Reservation Details for PNR: " + pnr;
            String body = "Dear " + reservation.getUsername() + ",\n\nYour reservation has been successfully confirmed. Please find the attached PDF for your reservation details.";

            emailService.sendEmailWithAttachment(email, subject, body, pdfBytes, "reservation_" + pnr + ".pdf");

            log.info("Reservation PDF sent to email for PNR: " + pnr);

            return "Payment successful and recorded!";
        } catch (Exception e) {
            log.error("Payment confirmation failed for PNR: {} - {}", pnr, e.getMessage());
            throw new RuntimeException("Payment confirmation failed: " + e.getMessage(), e);
        }
    }


    /**
     * Handles failed payment callback from Stripe.
     */
    @Override
    public String handlePaymentFailure(String sessionId) {
        try {
            Session session = Session.retrieve(sessionId);
            String pnr = session.getMetadata().get("pnr");
            
            // Cancel reservation for failed payment
            IReservationClient.cancelReservation(pnr, java.util.Map.of("reason", "Payment failed"));
            log.info("Reservation cancelled for failed payment - PNR: {}", pnr);
            
            return "Payment failed - reservation cancelled";
        } catch (Exception e) {
            log.error("Failed to handle payment failure: {}", e.getMessage());
            return "Payment failure handling failed";
        }
    }


    /**
     * Retrieves all payment records from the database.
     */
    @Override
    public List<Payment> getAllPayments() {
        return IPaymentRepository.findAll();
    }


    /**
     * Returns the total number of payments recorded.
     */
    @Override
    public long countAllPayments() {
        return IPaymentRepository.count();
    }
    
    @Override
    @Transactional
    public void processRefund(Integer reservationId, double refundAmount) {
        log.info("Processing refund for reservation ID: {} - Amount: {}", reservationId, refundAmount);
        
        try {
            Payment payment = IPaymentRepository.findByReservationId(reservationId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for reservation ID: " + reservationId));
            
            log.info("Found payment: ID={}, Status={}, Amount={}", payment.getPaymentId(), payment.getPaymentStatus(), payment.getAmount());
            
            if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
                log.warn("Cannot refund payment with status: {} for reservation ID: {}", payment.getPaymentStatus(), reservationId);
                throw new IllegalStateException("Cannot refund payment that is not successful. Current status: " + payment.getPaymentStatus());
            }
            
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            payment.setRefundAmount(refundAmount);
            payment.setRefundDateTime(LocalDateTime.now());
            
            Payment savedPayment = IPaymentRepository.save(payment);
            log.info("Refund processed successfully - Payment ID: {}, New Status: {}, Refund Amount: {}", 
                    savedPayment.getPaymentId(), savedPayment.getPaymentStatus(), savedPayment.getRefundAmount());
        } catch (Exception e) {
            log.error("Error processing refund for reservation ID: {} - {}", reservationId, e.getMessage());
            throw new RuntimeException("Failed to process refund: " + e.getMessage(), e);
        }
    }
    
    @Override
    public double getTotalRevenue() {
        try {
            double totalSuccessful = IPaymentRepository.sumAmountByPaymentStatusSuccess();
            log.info("Revenue calculation - SUCCESS payments total: ₹{}", totalSuccessful);
            return totalSuccessful;
        } catch (Exception e) {
            log.error("Error calculating total revenue: {}", e.getMessage());
            return 0.0;
        }
    }
    
    @Override
    public long countSuccessfulPayments() {
        try {
            long count = IPaymentRepository.countByPaymentStatusSuccess();
            log.info("Successful payments count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error counting successful payments: {}", e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countRefundedPayments() {
        try {
            long count = IPaymentRepository.countByPaymentStatusRefunded();
            log.info("Refunded payments count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error counting refunded payments: {}", e.getMessage());
            return 0;
        }
    }
    
    @Override
    public void fixCancelledPayments() {
        log.info("Starting to fix cancelled payments...");
        
        try {
            // Fix the known cancelled reservation IDs: 6, 7, 13, 15
            int[] cancelledReservationIds = {6, 7, 13, 15};
            
            for (int reservationId : cancelledReservationIds) {
                try {
                    Payment payment = IPaymentRepository.findByReservationId(reservationId).orElse(null);
                    
                    if (payment != null && payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                        log.info("Fixing payment for cancelled reservation ID: {}", reservationId);
                        
                        payment.setPaymentStatus(PaymentStatus.REFUNDED);
                        payment.setRefundAmount(payment.getAmount());
                        payment.setRefundDateTime(LocalDateTime.now());
                        
                        Payment savedPayment = IPaymentRepository.save(payment);
                        log.info("Fixed payment ID: {} for reservation ID: {} - Status: {}, Refund: {}", 
                                savedPayment.getPaymentId(), reservationId, savedPayment.getPaymentStatus(), savedPayment.getRefundAmount());
                    } else if (payment == null) {
                        log.warn("No payment found for reservation ID: {}", reservationId);
                    } else {
                        log.info("Payment for reservation ID: {} already has status: {}", reservationId, payment.getPaymentStatus());
                    }
                } catch (Exception e) {
                    log.error("Error fixing payment for reservation ID: {} - {}", reservationId, e.getMessage());
                }
            }
            
            log.info("Finished fixing cancelled payments");
        } catch (Exception e) {
            log.error("Error in fixCancelledPayments: {}", e.getMessage());
            throw new RuntimeException("Failed to fix cancelled payments", e);
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "UPI";
        }
        return paymentMethod.trim().toUpperCase().replace(' ', '_');
    }
}
