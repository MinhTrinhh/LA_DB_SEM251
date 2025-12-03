package org.minhtrinh.eventease251.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.dto.AuthResponse;
import org.minhtrinh.eventease251.dto.CompleteOrganizerProfileRequest;
import org.minhtrinh.eventease251.dto.CompleteParticipantProfileRequest;
import org.minhtrinh.eventease251.entity.OrganizerProfile;
import org.minhtrinh.eventease251.entity.ParticipantProfile;
import org.minhtrinh.eventease251.service.ProfileService;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ProfileController - WRITE OPERATIONS ONLY
 *
 * Purpose: Create and update user profiles
 * Handles: All profile modifications (participant and organizer)
 * For reading: Use UserController.getUserProfile()
 */
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Complete participant profile (fill in the empty profile created during registration)
     * POST /api/profiles/participant
     * Returns: New JWT token (roles unchanged, but profile now has data)
     */
    @PostMapping("/participant")
    public ResponseEntity<AuthResponse> completeParticipantProfile(
            @Valid @RequestBody CompleteParticipantProfileRequest request) {
        Long userId = JwtTokenProvider.getAuthenticatedUserId();
        return ResponseEntity.ok(profileService.completeParticipantProfile(userId, request));
    }

    /**
     * Become an organizer (create organizer profile + add ROLE_ORGANIZER)
     * POST /api/profiles/organizer
     * Returns: New JWT token with ROLE_ORGANIZER added
     */
    @PostMapping("/organizer")
    public ResponseEntity<AuthResponse> completeOrganizerProfile(
            @Valid @RequestBody CompleteOrganizerProfileRequest request) {
        Long userId = JwtTokenProvider.getAuthenticatedUserId();
        return ResponseEntity.ok(profileService.completeOrganizerProfile(userId, request));
    }

    /**
     * Update existing participant profile
     * PUT /api/profiles/participant
     * Returns: Updated participant profile (no new JWT needed)
     */
    @PutMapping("/participant")
    public ResponseEntity<ParticipantProfile> updateParticipantProfile(
            @Valid @RequestBody CompleteParticipantProfileRequest request) {
        Long userId = JwtTokenProvider.getAuthenticatedUserId();
        return ResponseEntity.ok(profileService.updateParticipantProfile(userId, request));
    }

    /**
     * Update existing organizer profile
     * PUT /api/profiles/organizer
     * Returns: Updated organizer profile (no new JWT needed)
     */
    @PutMapping("/organizer")
    public ResponseEntity<OrganizerProfile> updateOrganizerProfile(
            @Valid @RequestBody CompleteOrganizerProfileRequest request) {
        Long userId = JwtTokenProvider.getAuthenticatedUserId();
        return ResponseEntity.ok(profileService.updateOrganizerProfile(userId, request));
    }
}

