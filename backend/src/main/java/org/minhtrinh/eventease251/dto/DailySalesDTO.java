package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for daily sales data
 * Maps to the result from sp_GetEventDailySales stored procedure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesDTO {
    private LocalDate saleDate;
    private Integer orderCount;
    private Integer ticketsSold;
    private BigDecimal dailyRevenue;
}
