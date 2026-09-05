package com.railway.payment_service.service;

import com.railway.payment_service.dto.PaymentRequestDTO;
import com.railway.payment_service.dto.PaymentResponseDTO;
import com.railway.payment_service.entity.Payment;
import java.util.List;

public interface PaymentService {
    PaymentResponseDTO initiateCheckout(String pnr);

    PaymentResponseDTO initiateCheckout(String pnr, String paymentMethod);

    PaymentResponseDTO checkout(PaymentRequestDTO paymentRequestDTO);

    String handlePaymentSuccess(String sessionId);

    String confirmPayment(String pnr, String paymentMethod);

    String handlePaymentFailure(String sessionId);

    long countAllPayments();

    List<Payment> getAllPayments();
    
    void processRefund(Integer reservationId, double refundAmount);
    
    double getTotalRevenue();
    
    long countSuccessfulPayments();
    
    long countRefundedPayments();
    
    void fixCancelledPayments();
}
