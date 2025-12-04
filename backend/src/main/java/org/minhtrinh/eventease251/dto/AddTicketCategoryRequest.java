package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for adding a new ticket category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTicketCategoryRequest {
    private Long sessionId;
    private Long eventId;
    private String categoryName;
    private BigDecimal price;
    private Integer maximumSlot;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
