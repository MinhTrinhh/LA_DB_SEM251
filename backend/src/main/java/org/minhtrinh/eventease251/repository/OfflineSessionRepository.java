package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.OfflineSession;
import org.minhtrinh.eventease251.entity.SessionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfflineSessionRepository extends JpaRepository<OfflineSession, SessionId> {
}