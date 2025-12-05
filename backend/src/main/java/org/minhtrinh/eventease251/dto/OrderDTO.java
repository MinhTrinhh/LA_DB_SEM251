package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String orderStatus;
    private String currency;
    private BigDecimal amountOfMoney;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketDTO> tickets;
    private EventDTO event; // For displaying event details in My Tickets

    // Payment information
    private String qrCodeUrl;
    private PaymentMethodDTO paymentMethod;
    private String paymentDescription;
}
