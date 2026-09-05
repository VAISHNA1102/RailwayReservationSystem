package com.railway.payment_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "trainservice")
public interface TrainClient {
    @PutMapping("/api/v1/trains/reduceSeats")
    ResponseEntity<String> reduceAvailableSeats(@RequestParam String trainNumber, @RequestParam String classType, @RequestParam int seatsToReduce);
}
