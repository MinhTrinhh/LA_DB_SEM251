package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EWalletDTO {
    private Long eWalletId;
    private String eWalletName;
    private Long methodId;
    private BigDecimal chargedFee;
    private String feePayer;
}

