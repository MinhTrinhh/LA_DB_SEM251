package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDTO {
    private Long methodId;
    private BigDecimal chargedFee;
    private String feePayer;
    private String type; // "BANK" or "E_WALLET"
    private String name; // Bank name or E-wallet name
}

