package com.railway.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentRequestDTO {
    private String pnr;
    private String ticketName;
    private String currency;
    private Long amount;
    private Long quantity;
}
