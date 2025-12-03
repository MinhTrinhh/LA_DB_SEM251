package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.OrganizerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizerProfileRepository extends JpaRepository<OrganizerProfile, Long> {
    Optional<OrganizerProfile> findByUser_UserId(Long userId);
}

