package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.dto.ParticipantProfileDTO;
import org.minhtrinh.eventease251.dto.OrganizerProfileDTO;
import org.minhtrinh.eventease251.service.UserService;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * UserController - READ ONLY
 *
 * Purpose: Get user profile data (separate endpoints for participant and organizer)
 * Returns DTOs to ensure clean JSON responses without circular references
 * For updates: Use ProfileController
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get participant profile
     * GET /api/users/me/profiles/participant
     *
     * Returns participant profile DTO or 404 if not exists
     */
    @GetMapping("/me/profiles/participant")
    public ResponseEntity<ParticipantProfileDTO> getParticipantProfile() {
        try {
            Long userId = JwtTokenProvider.getAuthenticatedUserId();
            ParticipantProfileDTO profile = userService.getParticipantProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get organizer profile
     * GET /api/users/me/profiles/organizer
     *
     * Returns organizer profile DTO or 404 if not exists
     */
    @GetMapping("/me/profiles/organizer")
    public ResponseEntity<OrganizerProfileDTO> getOrganizerProfile() {
        try {
            Long userId = JwtTokenProvider.getAuthenticatedUserId();
            OrganizerProfileDTO profile = userService.getOrganizerProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Note: For creating/updating profiles, use ProfileController endpoints:
    // - POST /api/profiles/participant - Complete participant profile
    // - PUT /api/profiles/participant - Update participant profile
    // - POST /api/profiles/organizer - Become organizer
    // - PUT /api/profiles/organizer - Update organizer profile
}

