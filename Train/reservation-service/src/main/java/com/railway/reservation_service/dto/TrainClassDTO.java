package com.railway.reservation_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainClassDTO {
    private Integer classId;
    private String classType;
    private Integer capacity;
    private Integer availableSeats;
    private Integer totalSeats;
    private Double price;
    private String quota;
}
