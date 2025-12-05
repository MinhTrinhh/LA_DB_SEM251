package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.OrganizerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * OrganizerProfile Repository using JPA
 */
@Repository
public interface OrganizerProfileRepository extends JpaRepository<OrganizerProfile, Long> {

    /**
     * Find organizer profile by user ID
     * @param userId The user ID to search for
     * @return Optional containing the organizer profile if found
     */
    Optional<OrganizerProfile> findByUser_UserId(Long userId);
}

