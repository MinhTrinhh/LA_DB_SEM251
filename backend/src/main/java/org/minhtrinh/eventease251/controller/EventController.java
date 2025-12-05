package org.minhtrinh.eventease251.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.dto.CreateEventRequest;
import org.minhtrinh.eventease251.dto.CreateEventResponse;
import org.minhtrinh.eventease251.dto.ErrorResponse;
import org.minhtrinh.eventease251.dto.EventDTO;
import org.minhtrinh.eventease251.entity.Event;
import org.minhtrinh.eventease251.service.EventService;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:20002", "http://127.0.0.1:20002"})
public class EventController {

    private final EventService eventService;

    /**
     * Create a new event
     * Only authenticated organizers can create events
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> createEvent(@Valid @RequestBody CreateEventRequest request) {
        try {
            // Get the current authenticated user's ID from the security context
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            
            CreateEventResponse response = eventService.createEvent(request, organizerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse();

            // Check if this is a database validation error from trigger
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("Event validation failed")) {
                // Extract the specific validation error from the trigger
                errorResponse.setMessage(errorMessage);
            } else if (errorMessage != null && errorMessage.contains("date/time")) {
                // Generic date/time related error
                errorResponse.setMessage("Invalid event date/time: " + errorMessage);
            } else {
                // Generic error
                errorResponse.setMessage(errorMessage != null ? errorMessage : "Failed to create event");
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get all events for the authenticated organizer
     */
    @GetMapping("/my-events")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getMyEvents() {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            List<EventDTO> events = eventService.getOrganizerEvents(organizerId);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get draft events for the authenticated organizer
     */
    @GetMapping("/my-events/drafts")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getDraftEvents() {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            List<EventDTO> draftEvents = eventService.getDraftEvents(organizerId);
            return ResponseEntity.ok(draftEvents);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Publish a draft event
     */
    @PutMapping("/{eventId}/publish")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> publishEvent(@PathVariable Long eventId) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            eventService.publishEvent(eventId, organizerId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Event published successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get all public events (no authentication required)
     * Only returns published events (COMING_SOON, HAPPENING, ENDED)
     */
    @GetMapping("/public")
    public ResponseEntity<?> getAllPublicEvents() {
        try {
            List<EventDTO> events = eventService.getAllPublicEvents();
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get filtered and sorted public events (no authentication required)
     * Uses stored function for efficient filtering and sorting
     * 
     * @param status Filter by event status: ONGOING, COMING_SOON, COMPLETED (optional)
     * @param sortByPrice Sort by price: ASC (cheapest first) or DESC (most expensive first) (optional)
     * @return List of filtered and sorted events
     * 
     * Examples:
     * - GET /api/events/public/filtered - All public events
     * - GET /api/events/public/filtered?status=ONGOING - Only ongoing events
     * - GET /api/events/public/filtered?sortByPrice=ASC - Sorted by cheapest price
     * - GET /api/events/public/filtered?status=COMING_SOON&sortByPrice=ASC - Coming soon events, cheapest first
     */
    @GetMapping("/public/filtered")
    public ResponseEntity<?> getFilteredAndSortedEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortByPrice) {
        try {
            // Validate sortByPrice parameter
            if (sortByPrice != null && !sortByPrice.equals("ASC") && !sortByPrice.equals("DESC")) {
                ErrorResponse errorResponse = new ErrorResponse();
                errorResponse.setMessage("Invalid sortByPrice parameter. Must be 'ASC' or 'DESC'");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Validate status parameter
            if (status != null && !status.equals("ONGOING") && !status.equals("COMING_SOON") && !status.equals("COMPLETED")) {
                ErrorResponse errorResponse = new ErrorResponse();
                errorResponse.setMessage("Invalid status parameter. Must be 'ONGOING', 'COMING_SOON', or 'COMPLETED'");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            List<EventDTO> events = eventService.getFilteredAndSortedEvents(status, sortByPrice);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get event details by ID (no authentication required)
     * Returns event with sessions and ticket categories
     */
    @GetMapping("/public/{eventId}")
    public ResponseEntity<?> getEventById(@PathVariable Long eventId) {
        try {
            EventDTO event = eventService.getEventById(eventId);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Get all sessions for a specific event (no authentication required)
     */
    @GetMapping("/public/{eventId}/sessions")
    public ResponseEntity<?> getEventSessions(@PathVariable Long eventId) {
        try {
            EventDTO event = eventService.getEventById(eventId);
            return ResponseEntity.ok(event.getSessions());
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}

