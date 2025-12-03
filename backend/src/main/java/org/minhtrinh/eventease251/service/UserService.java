package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.dto.OrganizerProfileDTO;
import org.minhtrinh.eventease251.dto.ParticipantProfileDTO;
import org.minhtrinh.eventease251.entity.User;
import org.minhtrinh.eventease251.entity.ParticipantProfile;
import org.minhtrinh.eventease251.entity.OrganizerProfile;
import org.minhtrinh.eventease251.repository.UserRepository;
import org.springframework.stereotype.Service;

/**
 * UserService - READ ONLY
 *
 * Purpose: Retrieve user profile data (separate methods for participant and organizer)
 * Returns DTOs to avoid JSON serialization issues with entities
 * Does NOT: Create or update profiles (use ProfileService for that)
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get participant profile for a user
     * Returns DTO to avoid lazy loading and circular reference issues
     * Throws exception if user or profile doesn't exist
     */
    public ParticipantProfileDTO getParticipantProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasParticipantProfile()) {
            throw new RuntimeException("Participant profile not found");
        }

        ParticipantProfile profile = user.getParticipantProfile();

        // Convert entity to DTO
        return ParticipantProfileDTO.builder()
                .profileCode(profile.getProfileCode())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .dateOfBirth(profile.getDateOfBirth())
                .age(profile.getAge())
                .userStatus(user.getStatus())  // Add user status
                .build();
    }

    /**
     * Get organizer profile for a user
     * Returns DTO to avoid lazy loading and circular reference issues
     * Throws exception if user or profile doesn't exist
     */
    public OrganizerProfileDTO getOrganizerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasOrganizerProfile()) {
            throw new RuntimeException("Organizer profile not found");
        }

        OrganizerProfile profile = user.getOrganizerProfile();

        // Convert entity to DTO
        return OrganizerProfileDTO.builder()
                .profileCode(profile.getProfileCode())
                .officialName(profile.getOfficialName())
                .taxId(profile.getTaxId())
                .logoUrl(profile.getLogoUrl())
                .status(profile.getStatus())
                .build();
    }

    // Note: For updating profiles, use ProfileService.updateParticipantProfile() or updateOrganizerProfile()
    // UserService is READ ONLY - it only retrieves user data
}

