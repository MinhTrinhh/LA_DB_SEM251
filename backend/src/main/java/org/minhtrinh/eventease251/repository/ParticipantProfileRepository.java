package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.ParticipantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ParticipantProfile Repository using JPA
 */
@Repository
public interface ParticipantProfileRepository extends JpaRepository<ParticipantProfile, Long> {

    /**
     * Find participant profile by user ID
     * @param userId The user ID to search for
     * @return Optional containing the participant profile if found
     */
    Optional<ParticipantProfile> findByUser_UserId(Long userId);
}

