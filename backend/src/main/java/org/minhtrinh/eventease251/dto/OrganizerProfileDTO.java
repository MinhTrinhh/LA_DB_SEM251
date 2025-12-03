package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.eventease251.entity.OrganizerStatus;

/**
 * OrganizerProfileDTO
 * Used for returning organizer profile data in API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerProfileDTO {
    private String profileCode; // Auto-generated: O1, O2, O3...
    private String officialName;
    private String taxId;
    private String logoUrl;
    private OrganizerStatus status;
}

