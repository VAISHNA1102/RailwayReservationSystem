package com.railway.reservation_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "paymentservice")
public interface IPaymentClient {
    
    @PostMapping("/api/v1/payments/refund/{reservationId}")
    ResponseEntity<String> processRefund(@PathVariable Integer reservationId, @RequestParam double refundAmount);
}