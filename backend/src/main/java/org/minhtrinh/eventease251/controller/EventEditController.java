package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.*;
import org.minhtrinh.eventease251.service.EventEditService;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for event editing endpoints
 * All endpoints require ROLE_ORGANIZER and use stored procedures
 */
@RestController
@RequestMapping("/api/events/edit")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:20002", "http://127.0.0.1:20002"})
@Slf4j
public class EventEditController {

    private final EventEditService eventEditService;

    /**
     * Get event details for editing
     * Uses stored procedure: sp_GetEventForEdit
     */
    @GetMapping("/{eventId}")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getEventForEdit(@PathVariable Long eventId) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Getting event {} for edit by organizer {}", eventId, organizerId);

            EventEditDetailsDTO eventDetails = eventEditService.getEventForEdit(eventId, organizerId);
            return ResponseEntity.ok(eventDetails);
        } catch (RuntimeException e) {
            log.error("Error getting event for edit: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Update event basic information
     * Uses stored procedure: sp_UpdateEventBasicInfo
     */
    @PutMapping("/{eventId}/basic-info")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> updateEventBasicInfo(
            @PathVariable Long eventId,
            @RequestBody UpdateEventRequest request) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Updating event {} basic info", eventId);

            eventEditService.updateEventBasicInfo(eventId, organizerId, request);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Event updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating event basic info: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Update session details
     * Uses stored procedure: sp_UpdateSession
     */
    @PutMapping("/session")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> updateSession(@RequestBody UpdateSessionRequest request) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Updating session {} for event {}", request.getSessionId(), request.getEventId());

            eventEditService.updateSession(organizerId, request);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Session updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating session: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Update ticket category
     * Uses stored procedure: sp_UpdateTicketCategory
     */
    @PutMapping("/ticket-category")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> updateTicketCategory(@RequestBody UpdateTicketCategoryRequest request) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Updating ticket category {}", request.getCategoryId());

            eventEditService.updateTicketCategory(organizerId, request);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Ticket category updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating ticket category: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Add new ticket category
     * Uses stored procedure: sp_AddTicketCategory
     */
    @PostMapping("/ticket-category")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> addTicketCategory(@RequestBody AddTicketCategoryRequest request) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Adding ticket category to session {} event {}", request.getSessionId(), request.getEventId());

            Long categoryId = eventEditService.addTicketCategory(organizerId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Ticket category added successfully");
            response.put("categoryId", categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error adding ticket category: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Delete ticket category
     * Uses stored procedure: sp_DeleteTicketCategory
     */
    @DeleteMapping("/ticket-category/{categoryId}")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> deleteTicketCategory(@PathVariable Long categoryId) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Deleting ticket category {}", categoryId);

            eventEditService.deleteTicketCategory(categoryId, organizerId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Ticket category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting ticket category: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Delete event
     * Uses stored procedure: sp_DeleteEvent
     * Validates ownership and checks for sold tickets before deletion
     */
    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Deleting event {}", eventId);

            eventEditService.deleteEvent(eventId, organizerId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Event deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting event: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Delete session
     * Uses stored procedure: sp_DeleteSession
     * Validates ownership, checks for sold tickets, and ensures it's not the last session
     */
    @DeleteMapping("/session/{eventId}/{sessionId}")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> deleteSession(
            @PathVariable Long eventId,
            @PathVariable Long sessionId) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("Deleting session {} from event {}", sessionId, eventId);

            eventEditService.deleteSession(sessionId, eventId, organizerId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Session deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting session: {}", e.getMessage());
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
