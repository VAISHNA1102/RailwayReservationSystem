package com.railway.payment_service.feign;

import com.railway.payment_service.dto.ReservationResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "reservationservice")
public interface ReservationClient {
    @GetMapping("/api/v1/reservations/getReservationByPNR/{pnr}")
    ResponseEntity<ReservationResponseDTO> getReservationByPNR(@PathVariable String pnr);

    @PutMapping("/api/v1/reservations/updateStatus/{pnr}")
    ResponseEntity<String> updateReservationStatus(@PathVariable String pnr);

    @PutMapping("/api/v1/reservations/cancel/{pnr}")
    ResponseEntity<Map<String, Object>> cancelReservation(@PathVariable String pnr, @RequestBody(required = false) Map<String, String> request);
}
