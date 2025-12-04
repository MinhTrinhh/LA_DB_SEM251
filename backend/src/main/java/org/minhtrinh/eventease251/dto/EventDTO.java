package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.eventease251.entity.EventStatus;

import java.time.LocalDateTime;

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
}

