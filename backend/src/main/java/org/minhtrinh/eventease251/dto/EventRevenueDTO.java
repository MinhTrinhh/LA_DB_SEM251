package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for event revenue in organizer report
 * Maps to the result from sp_GetOrganizerRevenueReport stored procedure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRevenueDTO {
    private Long eventId;
    private String eventTitle;
    private String eventStatus;
    private LocalDateTime startDateTime;
    private Integer totalOrders;
    private Integer totalTicketsSold;
    private BigDecimal totalRevenue;
    private Integer totalCapacity;
    private BigDecimal capacityPercentage;
}
