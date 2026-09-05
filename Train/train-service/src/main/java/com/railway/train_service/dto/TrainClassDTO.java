package com.railway.train_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainClassDTO {
    private Integer classId;
    private String classType;
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    @Min(value = 0, message = "Available seats cannot be negative")
    private Integer availableSeats;
    private Integer totalSeats; // For trip inventory initialization
    @Min(value = 1, message = "Price must be positive")
    private Double price;
    @NotBlank(message = "Quota is required")
    private String quota;
}
