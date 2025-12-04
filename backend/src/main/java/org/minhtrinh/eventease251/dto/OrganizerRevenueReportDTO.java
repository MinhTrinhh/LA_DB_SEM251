package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for organizer revenue report
 * Maps to the result from sp_GetOrganizerRevenueReport stored procedure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerRevenueReportDTO {
    private Long organizerId;
    private String organizerName;
    private Integer totalEvents;
    private Integer totalTicketsSold;
    private BigDecimal grandTotalRevenue;
    
    // List of events with revenue
    private List<EventRevenueDTO> events;
}
