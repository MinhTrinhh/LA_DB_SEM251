package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.minhtrinh.eventease251.entity.UserStatus;

import java.time.LocalDate;

/**
 * ParticipantProfileDTO
 * Used for returning participant profile data in API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantProfileDTO {
    private String profileCode; // Auto-generated: P1, P2, P3...
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Integer age;
    private UserStatus userStatus;  // User account status
}

