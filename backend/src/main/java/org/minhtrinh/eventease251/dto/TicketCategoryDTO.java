package org.minhtrinh.eventease251.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@Builder
public class TicketCategoryDTO {
    private Long ticketCategoryId;
    private Long sessionId;
    private String categoryName;
    private BigDecimal price;
    private Integer quantity;
    private Integer soldQuantity;
}
