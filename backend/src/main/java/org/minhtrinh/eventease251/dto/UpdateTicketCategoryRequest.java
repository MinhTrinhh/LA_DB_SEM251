package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating ticket category information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketCategoryRequest {
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private Integer maximumSlot;
}
