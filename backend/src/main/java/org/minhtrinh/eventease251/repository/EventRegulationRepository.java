package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.EventRegulation;
import org.minhtrinh.eventease251.entity.EventRegulationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRegulationRepository extends JpaRepository<EventRegulation, EventRegulationId> {
}