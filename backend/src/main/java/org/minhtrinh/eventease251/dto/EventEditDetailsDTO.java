package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for event details used in editing
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEditDetailsDTO {
    private Long eventId;
    private String title;
    private String description;
    private String posterUrl;
    private String status;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BigDecimal totalRevenue;
    private Integer totalTicketsSold;
    private List<SessionEditDTO> sessions;
    private List<TicketCategoryEditDTO> ticketCategories;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionEditDTO {
        private Long sessionId;
        private Long eventId;
        private LocalDateTime startDateTime;
        private LocalDateTime endDateTime;
        private Integer maxCapacity;
        private String sessionType;
        private String venueName;
        private String venueAddress;
        private String meetingUrl;
        private String platformName;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketCategoryEditDTO {
        private Long categoryId;
        private Long sessionId;
        private String categoryName;
        private BigDecimal price;
        private Integer maximumSlot;
        private Integer soldCount;
        private Integer availableCount;
        private BigDecimal soldPercentage;
    }
}
