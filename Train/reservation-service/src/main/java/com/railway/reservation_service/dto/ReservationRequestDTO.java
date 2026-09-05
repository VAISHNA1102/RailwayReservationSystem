package com.railway.reservation_service.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationRequestDTO {
    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Train number is required")
    private String trainNumber;

    @NotBlank(message = "Train type is required")
    private String trainType;

    @NotBlank(message = "Class type is required")
    @Pattern(regexp = "AC|Sleeper", message = "Class type must be either 'AC' or 'Sleeper'")
    private String classType;

    @NotNull(message = "Journey date is required")
    private LocalDate journeyDate;



    @NotEmpty(message = "Passenger list cannot be empty")
    @Size(min = 1, max = 6, message = "You must provide details for 1 to 6 passengers")
    private List<PassengerDTO> passengers;
}
