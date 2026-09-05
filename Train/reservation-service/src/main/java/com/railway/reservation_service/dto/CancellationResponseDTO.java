package com.railway.reservation_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CancellationResponseDTO {
    private String pnr;
    private String status;
    private BigDecimal refundAmount;
    private LocalDateTime cancellationTime;
    private String message;
}