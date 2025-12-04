package org.minhtrinh.eventease251.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SessionDTO {
    private Long sessionId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer maxCapacity;
    private String type; // ONLINE or OFFLINE
    
    // For offline sessions
    private String venueName;
    private String venueAddress;
    
    // For online sessions
    private String meetingUrl;
    private String platformName;
    
    // Ticket categories for this session
    private List<TicketCategoryDTO> ticketCategories;
}
