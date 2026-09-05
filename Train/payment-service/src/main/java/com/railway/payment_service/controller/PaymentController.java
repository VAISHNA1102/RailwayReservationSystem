package com.railway.payment_service.controller;

import com.railway.payment_service.dto.PaymentResponseDTO;
import com.railway.payment_service.entity.Payment;
import com.railway.payment_service.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }


    /**
     * Initiates the payment process for a reservation using the provided PNR.
     */
    @PostMapping("/initiate/{pnr}")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(
            @PathVariable String pnr,
            @RequestParam(value = "paymentMethod", defaultValue = "UPI") String paymentMethod) {
        PaymentResponseDTO response = paymentService.initiateCheckout(pnr, paymentMethod);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Handles successful payment callback from Stripe.
     */
    @GetMapping("/success")
    public ResponseEntity<String> handleStripeSuccess(@RequestParam("session_id") String sessionId) {
        String message = paymentService.handlePaymentSuccess(sessionId);
        return ResponseEntity.status(HttpStatus.OK).body(message);
    }

    @PostMapping("/confirm/{pnr}")
    public ResponseEntity<String> confirmPayment(
            @PathVariable String pnr,
            @RequestParam(value = "paymentMethod", defaultValue = "UPI") String paymentMethod) {
        String message = paymentService.confirmPayment(pnr, paymentMethod);
        return ResponseEntity.status(HttpStatus.OK).body(message);
    }


    /**
     * Retrieves all payment records.
     */
    @GetMapping("/allPayments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }


    /**
     * Returns the total number of payments recorded.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countAllPayments() {
        long count = paymentService.countAllPayments();
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/refund/{reservationId}")
    public ResponseEntity<String> processRefund(@PathVariable Integer reservationId, @RequestParam double refundAmount) {
        paymentService.processRefund(reservationId, refundAmount);
        return ResponseEntity.ok("Refund processed successfully");
    }
    
    @GetMapping("/revenue")
    public ResponseEntity<Double> getTotalRevenue() {
        double revenue = paymentService.getTotalRevenue();
        return ResponseEntity.ok(revenue);
    }
    
    @GetMapping("/count/successful")
    public ResponseEntity<Long> countSuccessfulPayments() {
        long count = paymentService.countSuccessfulPayments();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/count/refunded")
    public ResponseEntity<Long> countRefundedPayments() {
        long count = paymentService.countRefundedPayments();
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/fix-cancelled-payments")
    public ResponseEntity<String> fixCancelledPayments() {
        paymentService.fixCancelledPayments();
        return ResponseEntity.ok("Fixed cancelled payments successfully");
    }
}
