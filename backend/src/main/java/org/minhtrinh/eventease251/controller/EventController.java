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
        } catch (RuntimeException e) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
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
}

