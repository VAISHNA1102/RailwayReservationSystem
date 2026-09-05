package com.railway.payment_service;

import com.railway.payment_service.controller.PaymentController;
import com.railway.payment_service.dto.PaymentResponseDTO;
import com.railway.payment_service.entity.Payment;
import com.railway.payment_service.entity.PaymentStatus;
import com.railway.payment_service.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;


    /**
     * Tests the initiatePayment endpoint.
     */
    @Test
    void testInitiatePayment() throws Exception {
        PaymentResponseDTO response = PaymentResponseDTO.builder()
                .status("Success")
                .message("Session created")
                .sessionId("sess_123")
                .sessionUrl("http://mock-url")
                .build();

        Mockito.when(paymentService.initiateCheckout("ABC123", "UPI")).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/initiate/ABC123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Success"))
                .andExpect(jsonPath("$.sessionId").value("sess_123"));
    }


    /**
     * Tests the handleStripeSuccess endpoint.
     */
    @Test
    void testHandleStripeSuccess() throws Exception {
        Mockito.when(paymentService.handlePaymentSuccess("sess_123")).thenReturn("Payment successful");

        mockMvc.perform(get("/api/v1/payments/success")
                        .param("session_id", "sess_123"))
                .andExpect(status().isOk())
                .andExpect(content().string("Payment successful"));
    }


    /**
     * Tests the getAllPayments endpoint.
     */
    @Test
    void testGetAllPayments() throws Exception {
        Payment payment = Payment.builder()
                .paymentId(1)
                .reservationId(101)
                .amount(500.0)
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentMethod("CARD")
                .build();

        Mockito.when(paymentService.getAllPayments()).thenReturn(List.of(payment));

        mockMvc.perform(get("/api/v1/payments/allPayments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentId").value(1))
                .andExpect(jsonPath("$[0].paymentStatus").value("SUCCESS"));
    }


    /**
     * Tests the countAllPayments endpoint.
     */
    @Test
    void testCountAllPayments() throws Exception {
        Mockito.when(paymentService.countAllPayments()).thenReturn(5L);

        mockMvc.perform(get("/api/v1/payments/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }
}
