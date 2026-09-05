package com.railway.reservation_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationResponseDTO {
    private Integer reservationId;

    private String pnrNumber;

    private String trainNumber;
    private String trainName;
    private String classType;

    private String username;

    private LocalDate journeyDate;

    private int numberOfSeats;

    private double totalFare;

    private String reservationStatus;

    private LocalDateTime reservationTime;

    private List<PassengerDTO> passengers;
}
