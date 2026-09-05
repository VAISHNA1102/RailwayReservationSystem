package com.railway.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDTO {
    private Integer reservationId;
    private String pnrNumber;
    private String username;
    private Integer trainNumber;
    private String trainName;
    private String classType;
    private LocalDate journeyDate;
    private Integer numberOfSeats;
    private Double totalFare;
    private String reservationStatus;
    private List<PassengerDTO> passengers;
}