package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaidByDTO {
    private Long orderId;
    private Long methodId;
    private String qrCodeUrl;
    private Long transactionId;
    private LocalDateTime timestamp;
    private PaymentMethodDTO paymentMethod;
}

