package com.railway.train_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainClassRequestDTO {
    @Pattern(regexp = "AC|Sleeper", message = "Class type must be either 'AC' or 'Sleeper'")
    private String classType;
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    @Min(value = 1, message = "Price must be positive")
    private Double price;
    @NotBlank(message = "Quota is required")
    private String quota;
}
