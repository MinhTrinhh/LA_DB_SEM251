package org.minhtrinh.eventease251.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.minhtrinh.eventease251.entity.Role;

import java.util.Set;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private Set<Role> roles;
    private boolean hasParticipantProfile;
    private boolean hasOrganizerProfile;
}