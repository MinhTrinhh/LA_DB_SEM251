package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for recent order data
 * Maps to the result from sp_GetEventRecentOrders stored procedure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentOrderDTO {
    private Long orderId;
    private String customerName;
    private String customerEmail;
    private String ticketCategory;
    private Integer quantity;
    private BigDecimal amount;
    private String status;
    private LocalDateTime purchaseDate;
}
