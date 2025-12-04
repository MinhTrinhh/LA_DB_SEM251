package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for event sales summary
 * Maps to the result from sp_GetEventSalesSummary stored procedure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSalesSummaryDTO {
    private Long eventId;
    private String eventTitle;
    private BigDecimal totalRevenue;
    private Integer totalTicketsSold;
    private Integer totalCapacity;
    private BigDecimal capacityPercentage;
    
    // Breakdown by category
    private List<CategorySalesDTO> categoryBreakdown;
    
    // Daily sales data
    private List<DailySalesDTO> dailySales;
    
    // Recent orders
    private List<RecentOrderDTO> recentOrders;
}
