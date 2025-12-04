package org.minhtrinh.eventease251.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateEventRequest {
    @NotBlank(message = "Event title is required")
    private String title;

    @NotBlank(message = "Event description is required")
    private String description;

    private String posterUrl;

    @NotBlank(message = "Venue name is required")
    private String venueName;

    @NotBlank(message = "Venue address is required")
    private String venueAddress;

    private List<String> regulations;

    @NotEmpty(message = "At least one session is required")
    @Valid
    private List<SessionRequest> sessions;
}
