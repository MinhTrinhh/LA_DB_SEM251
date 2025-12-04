package org.minhtrinh.eventease251.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SessionRequest {
    @NotNull(message = "Session start date time is required")
    private LocalDateTime startDateTime;

    @NotNull(message = "Session end date time is required")
    private LocalDateTime endDateTime;

    // For offline sessions
    private String venueName;
    private String venueAddress;

    // For online sessions
    private String meetingUrl;
    private String platformName;

    @NotEmpty(message = "At least one ticket category is required")
    @Valid
    private List<TicketCategoryRequest> ticketCategories;
}
