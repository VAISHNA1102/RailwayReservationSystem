package com.railway.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerDTO {
    private Integer passengerId;
    private String name;
    private Integer age;
    private String gender;
    private String address;
    private String quota;
    private Boolean windowSeatPreferred;
    private String coachNumber;
    private String seatNumber;
}