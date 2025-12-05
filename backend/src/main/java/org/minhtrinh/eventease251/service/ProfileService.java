package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.dto.AuthResponse;
import org.minhtrinh.eventease251.dto.CompleteOrganizerProfileRequest;
import org.minhtrinh.eventease251.dto.CompleteParticipantProfileRequest;
import org.minhtrinh.eventease251.entity.*;
import org.minhtrinh.eventease251.repository.OrganizerProfileRepository;
import org.minhtrinh.eventease251.repository.ParticipantProfileRepository;
import org.minhtrinh.eventease251.repository.UserRepository;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ParticipantProfileRepository participantProfileRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Complete participant profile
     * Updates the existing empty participant profile created during registration
     */
    @Transactional
    public AuthResponse completeParticipantProfile(Long userId, CompleteParticipantProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if has participant profile (should always exist after registration)
        if (!user.hasParticipantProfile()) {
            throw new RuntimeException("Participant profile not found");
        }

        // Update participant profile with actual data
        ParticipantProfile profile = user.getParticipantProfile();
        profile.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setAge(Period.between(request.getDateOfBirth(), LocalDate.now()).getYears());

        User savedUser = userRepository.save(user);

        // Generate new token (roles unchanged, just return updated info)
        String token = jwtTokenProvider.generateToken(savedUser);

        return new AuthResponse(
            token,
            savedUser.getUserId(),
            savedUser.getEmailAddress(),
            savedUser.getRoles(),
            savedUser.hasParticipantProfile(),
            savedUser.hasOrganizerProfile()
        );
    }

    /**
     * Complete organizer profile
     * Creates profile and adds ROLE_ORGANIZER
     */
    @Transactional
    public AuthResponse completeOrganizerProfile(Long userId, CompleteOrganizerProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already has organizer profile
        if (user.hasOrganizerProfile()) {
            throw new RuntimeException("Organizer profile already exists");
        }

        // Create organizer profile
        OrganizerProfile profile = new OrganizerProfile();
        profile.setUser(user);
        profile.setOfficialName(request.getOfficialName());
        profile.setTaxId(request.getTaxId());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setStatus(OrganizerStatus.VERIFIED); // Needs admin verification

        user.setOrganizerProfile(profile);

        // Save user with organizer profile first
        User savedUser = userRepository.saveAndFlush(user);

        // Add organizer role (userId is already set)
        savedUser.addRole(Role.ROLE_ORGANIZER);
        savedUser = userRepository.save(savedUser);

        // Generate new token with updated roles
        String token = jwtTokenProvider.generateToken(savedUser);

        return new AuthResponse(
            token,
            savedUser.getUserId(),
            savedUser.getEmailAddress(),
            savedUser.getRoles(),
            savedUser.hasParticipantProfile(),
            savedUser.hasOrganizerProfile()
        );
    }

    /**
     * Update participant profile
     */
    @Transactional
    public ParticipantProfile updateParticipantProfile(Long userId, CompleteParticipantProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasParticipantProfile()) {
            throw new RuntimeException("No participant profile to update");
        }

        ParticipantProfile profile = user.getParticipantProfile();
        profile.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setAge(Period.between(request.getDateOfBirth(), LocalDate.now()).getYears());

        return participantProfileRepository.save(profile);
    }

    /**
     * Update organizer profile
     */
    @Transactional
    public OrganizerProfile updateOrganizerProfile(Long userId, CompleteOrganizerProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasOrganizerProfile()) {
            throw new RuntimeException("No organizer profile to update");
        }

        OrganizerProfile profile = user.getOrganizerProfile();
        profile.setOfficialName(request.getOfficialName());
        profile.setTaxId(request.getTaxId());
        profile.setLogoUrl(request.getLogoUrl());

        return organizerProfileRepository.save(profile);
    }
}

