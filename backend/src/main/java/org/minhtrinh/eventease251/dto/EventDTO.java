package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.eventease251.entity.EventStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long eventId;
    private String title;
    private String generalIntroduction;
    private EventStatus eventStatus;
    private Long organizerId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private LocalDateTime timestamp;
    private String posterUrl;
    private String location; // venue name for display
    private List<SessionDTO> sessions; // Include sessions in event response
}

