package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for ticket category sales data
 * Maps to the result from sp_GetEventSalesSummary stored procedure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySalesDTO {
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private Integer totalCapacity;
    private Integer ticketsSold;
    private Integer ticketsAvailable;
    private BigDecimal revenue;
    private BigDecimal soldPercentage;
    private Integer checkedInCount;
}
