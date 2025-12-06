package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.*;
import org.minhtrinh.eventease251.repository.EventEditRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for event editing operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventEditService {

    private final EventEditRepository eventEditRepository;

    /**
     * Get event details for editing
     * Uses stored procedure sp_GetEventForEdit
     */
    @Transactional(readOnly = true)
    public EventEditDetailsDTO getEventForEdit(Long eventId, Long organizerId) {
        log.info("Getting event {} details for edit", eventId);
        return eventEditRepository.getEventForEdit(eventId, organizerId);
    }

    /**
     * Update event basic information
     * Uses stored procedure sp_UpdateEventBasicInfo
     */
    @Transactional
    public void updateEventBasicInfo(Long eventId, Long organizerId, UpdateEventRequest request) {
        log.info("Updating event {} basic info", eventId);
        eventEditRepository.updateEventBasicInfo(
                eventId,
                organizerId,
                request.getTitle(),
                request.getDescription(),
                request.getPosterUrl()
        );
    }

    /**
     * Update session details
     * Uses stored procedure sp_UpdateSession
     */
    @Transactional
    public void updateSession(Long organizerId, UpdateSessionRequest request) {
        log.info("Updating session {} for event {}", request.getSessionId(), request.getEventId());
        eventEditRepository.updateSession(
                request.getSessionId(),
                request.getEventId(),
                organizerId,
                request.getStartDateTime(),
                request.getEndDateTime(),
                request.getVenueName(),
                request.getVenueAddress(),
                request.getMeetingUrl(),
                request.getPlatformName()
        );
    }

    /**
     * Update ticket category
     * Uses stored procedure sp_UpdateTicketCategory
     */
    @Transactional
    public void updateTicketCategory(Long organizerId, UpdateTicketCategoryRequest request) {
        log.info("Updating ticket category {}", request.getCategoryId());
        eventEditRepository.updateTicketCategory(
                request.getCategoryId(),
                organizerId,
                request.getCategoryName(),
                request.getPrice(),
                request.getMaximumSlot()
        );
    }

    /**
     * Add a new ticket category
     * Uses stored procedure sp_AddTicketCategory
     */
    @Transactional
    public Long addTicketCategory(Long organizerId, AddTicketCategoryRequest request) {
        log.info("Adding ticket category to session {} event {}", request.getSessionId(), request.getEventId());
        return eventEditRepository.addTicketCategory(
                request.getSessionId(),
                request.getEventId(),
                organizerId,
                request.getCategoryName(),
                request.getPrice(),
                request.getMaximumSlot(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );
    }

    /**
     * Delete a ticket category
     * Uses stored procedure sp_DeleteTicketCategory
     */
    @Transactional
    public void deleteTicketCategory(Long categoryId, Long organizerId) {
        log.info("Deleting ticket category {}", categoryId);
        eventEditRepository.deleteTicketCategory(categoryId, organizerId);
    }

    /**
     * Delete an event
     * Uses stored procedure sp_DeleteEvent
     * Validates ownership and checks for sold tickets before deletion
     */
    @Transactional
    public void deleteEvent(Long eventId, Long organizerId) {
        log.info("Deleting event {} by organizer {}", eventId, organizerId);
        eventEditRepository.deleteEvent(eventId, organizerId);
    }

    /**
     * Delete a session
     * Uses stored procedure sp_DeleteSession
     * Validates ownership, checks for sold tickets, and ensures it's not the last session
     */
    @Transactional
    public void deleteSession(Long sessionId, Long eventId, Long organizerId) {
        log.info("Deleting session {} from event {} by organizer {}", sessionId, eventId, organizerId);
        eventEditRepository.deleteSession(sessionId, eventId, organizerId);
    }
}
