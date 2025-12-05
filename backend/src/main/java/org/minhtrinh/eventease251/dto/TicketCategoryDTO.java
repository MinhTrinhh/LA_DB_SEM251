package org.minhtrinh.eventease251.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCategoryDTO {
    private Long ticketCategoryId;
    private Long sessionId;
    private String name; // Changed from categoryName to match frontend
    private BigDecimal price;
    private Integer quantity;
    private Integer soldQuantity;
}
