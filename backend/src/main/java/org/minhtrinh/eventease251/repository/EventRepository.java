package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Event;
import org.minhtrinh.eventease251.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizer_UserId(Long organizerId);
    List<Event> findByOrganizer_UserIdAndEventStatus(Long organizerId, EventStatus eventStatus);
}