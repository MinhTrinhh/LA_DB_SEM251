package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for updating session information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSessionRequest {
    private Long sessionId;
    private Long eventId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String venueName;
    private String venueAddress;
    private String meetingUrl;
    private String platformName;
}
