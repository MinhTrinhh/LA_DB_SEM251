package org.minhtrinh.eventease251.dto;

import lombok.Data;
import org.minhtrinh.eventease251.entity.Role;
import org.minhtrinh.eventease251.entity.UserStatus;
import org.minhtrinh.eventease251.entity.OrganizerStatus;

import java.time.LocalDate;
import java.util.Set;

@Data
public class UserProfileResponse {
    private Long userId;
    private String email;
    private UserStatus status;
    private Set<Role> roles;

    // Optional participant profile data
    private ParticipantProfileData participantProfile;

    // Optional organizer profile data
    private OrganizerProfileData organizerProfile;

    @Data
    public static class ParticipantProfileData {
        private String profileCode; // Auto-generated: P1, P2, P3...
        private String fullName;
        private String phoneNumber;
        private LocalDate dateOfBirth;
        private Integer age;
    }

    @Data
    public static class OrganizerProfileData {
        private String profileCode; // Auto-generated: O1, O2, O3...
        private String officialName;
        private String taxId;
        private String logoUrl;
        private OrganizerStatus status;
    }
}

