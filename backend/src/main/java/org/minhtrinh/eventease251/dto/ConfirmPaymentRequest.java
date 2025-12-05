package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentRequest {
    private String transactionReference; // Bank transaction reference
    private String paymentProof; // Optional URL to payment proof image
}

