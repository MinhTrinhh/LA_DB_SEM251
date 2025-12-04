package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating event basic information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEventRequest {
    private String title;
    private String description;
    private String posterUrl;
}
