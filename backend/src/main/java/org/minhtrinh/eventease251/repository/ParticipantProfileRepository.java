package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.ParticipantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParticipantProfileRepository extends JpaRepository<ParticipantProfile, Long> {
    Optional<ParticipantProfile> findByUser_UserId(Long userId);
}

