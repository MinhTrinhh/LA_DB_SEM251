package org.minhtrinh.eventease251.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CompleteOrganizerProfileRequest {
    @NotBlank(message = "Organization name is required")
    private String officialName;

    @NotBlank(message = "Tax ID is required")
    @Pattern(regexp = "^[0-9]{9,15}$", message = "Tax ID must be 9-15 digits")
    private String taxId;

    private String logoUrl;
}
