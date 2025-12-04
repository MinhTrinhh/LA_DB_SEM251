package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateEventResponse {
    private Long eventId;
    private String title;
    private String message;
}
