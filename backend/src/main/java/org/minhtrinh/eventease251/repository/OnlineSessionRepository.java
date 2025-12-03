package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.OnlineSession;
import org.minhtrinh.eventease251.entity.SessionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnlineSessionRepository extends JpaRepository<OnlineSession, SessionId> {
}