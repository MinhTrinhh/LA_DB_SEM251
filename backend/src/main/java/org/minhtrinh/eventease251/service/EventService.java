package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.CreateEventRequest;
import org.minhtrinh.eventease251.dto.CreateEventResponse;
import org.minhtrinh.eventease251.dto.EventDTO;
import org.minhtrinh.eventease251.dto.SessionDTO;
import org.minhtrinh.eventease251.dto.TicketCategoryDTO;
import org.minhtrinh.eventease251.entity.Event;
import org.minhtrinh.eventease251.entity.EventStatus;
import org.minhtrinh.eventease251.entity.User;
import org.minhtrinh.eventease251.entity.Session;
import org.minhtrinh.eventease251.entity.OnlineSession;
import org.minhtrinh.eventease251.entity.OfflineSession;
import org.minhtrinh.eventease251.entity.TicketCategory;
import org.minhtrinh.eventease251.repository.EventRepository;
import org.minhtrinh.eventease251.repository.SessionRepository;
import org.minhtrinh.eventease251.repository.UserRepository;
import org.minhtrinh.eventease251.repository.TicketCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    
    /**
     * Create a new event using JDBC Template
     * This method validates the organizer and delegates to the JDBC repository
     */
    @Transactional
    public CreateEventResponse createEvent(CreateEventRequest request, Long organizerId) {
        log.info("EventService: Creating event for organizer ID: {}", organizerId);
        
        // Validate that the organizer exists and has organizer role
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + organizerId));
        
        if (!organizer.isOrganizer()) {
            throw new RuntimeException("User is not an organizer");
        }
        
        if (organizer.getOrganizerProfile() == null) {
            throw new RuntimeException("Organizer profile not found. Please complete your organizer profile first.");
        }
        
        // Validate request
        if (request.getSessions() == null || request.getSessions().isEmpty()) {
            throw new RuntimeException("Event must have at least one session");
        }
        
        // Create the event using JDBC Template
        Long eventId = eventRepository.createEvent(request, organizerId);
        
        log.info("Event created successfully with ID: {}", eventId);
        
        return new CreateEventResponse(
            eventId,
            request.getTitle(),
            "Event created and published successfully"
        );
    }
    
    /**
     * Get all events for a specific organizer
     */
    public List<EventDTO> getOrganizerEvents(Long organizerId) {
        log.info("EventService: Getting all events for organizer ID: {}", organizerId);
        List<Event> events = eventRepository.findByOrganizerProfile_User_UserId(organizerId);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Get draft events for a specific organizer
     */
    public List<EventDTO> getDraftEvents(Long organizerId) {
        log.info("EventService: Getting draft events for organizer ID: {}", organizerId);
        List<Event> events = eventRepository.findByOrganizerProfile_User_UserIdAndEventStatus(organizerId, EventStatus.DRAFT);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Publish a draft event by changing its status to COMING_SOON
     */
    @Transactional
    public void publishEvent(Long eventId, Long organizerId) {
        log.info("EventService: Publishing event ID: {} for organizer ID: {}", eventId, organizerId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        // Verify the event belongs to the organizer
        if (!event.getOrganizerProfile().getUser().getUserId().equals(organizerId)) {
            throw new RuntimeException("You don't have permission to publish this event");
        }

        // Check if event is in draft status
        if (event.getEventStatus() != EventStatus.DRAFT) {
            throw new RuntimeException("Only draft events can be published");
        }

        // Update status to COMING_SOON
        event.setEventStatus(EventStatus.COMING_SOON);
        eventRepository.save(event);

        log.info("Event ID: {} published successfully", eventId);
    }

    /**
     * Convert Event entity to EventDTO
     */
    private EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setEventId(event.getEventId());
        dto.setTitle(event.getTitle());
        dto.setGeneralIntroduction(event.getGeneralIntroduction());
        dto.setEventStatus(event.getEventStatus());
        dto.setOrganizerId(event.getOrganizerProfile().getUser().getUserId());
        dto.setStartDateTime(event.getStartDateTime());
        dto.setEndDateTime(event.getEndDateTime());
        dto.setTimestamp(event.getTimestamp());
        dto.setPosterUrl(event.getPosterUrl());
        
        // Fetch and convert sessions
        List<Session> sessions = sessionRepository.findByEvent(event);
        List<SessionDTO> sessionDTOs = sessions.stream()
                .map(this::convertSessionToDTO)
                .collect(Collectors.toList());
        dto.setSessions(sessionDTOs);
        
        // Set location from first offline session if available
        sessions.stream()
                .filter(s -> s instanceof OfflineSession)
                .findFirst()
                .ifPresent(s -> {
                    OfflineSession offline = (OfflineSession) s;
                    dto.setLocation(offline.getVenueName());
                });
        
        return dto;
    }
    
    /**
     * Convert Session entity to SessionDTO
     * Handles both OnlineSession and OfflineSession polymorphism
     */
    private SessionDTO convertSessionToDTO(Session session) {
        // Load ticket categories for this session
        List<TicketCategory> ticketCategories = ticketCategoryRepository.findBySession(session);
        List<TicketCategoryDTO> ticketCategoryDTOs = ticketCategories.stream()
                .map(this::convertTicketCategoryToDTO)
                .collect(Collectors.toList());
        
        SessionDTO.SessionDTOBuilder builder = SessionDTO.builder()
                .sessionId(session.getSessionId())
                .startDateTime(session.getStartDateTime())
                .endDateTime(session.getEndDateTime())
                .maxCapacity(session.getMaxCapacity())
                .type(session.getType())
                .ticketCategories(ticketCategoryDTOs);
        
        // Handle polymorphic session types
        if (session instanceof OfflineSession) {
            OfflineSession offline = (OfflineSession) session;
            builder.venueName(offline.getVenueName())
                   .venueAddress(offline.getVenueAddress());
        } else if (session instanceof OnlineSession) {
            OnlineSession online = (OnlineSession) session;
            builder.meetingUrl(online.getMeetingUrl())
                   .platformName(online.getPlatformName());
        }
        
        return builder.build();
    }

    /**
     * Convert TicketCategory entity to TicketCategoryDTO
     */
    private TicketCategoryDTO convertTicketCategoryToDTO(TicketCategory category) {
        return TicketCategoryDTO.builder()
                .ticketCategoryId(category.getCategoryId())
                .sessionId(category.getSession().getSessionId())
                .categoryName(category.getCategoryName())
                .price(category.getPrice())
                .quantity(category.getMaximumSlot())
                .soldQuantity(0) // TODO: Calculate sold quantity from tickets
                .build();
    }

    /**
     * Get all public events (non-draft events)
     * Returns events with status: COMING_SOON, HAPPENING, ENDED
     */
    public List<EventDTO> getAllPublicEvents() {
        log.info("EventService: Getting all public events");
        List<Event> events = eventRepository.findAll();
        
        // Filter out draft events
        return events.stream()
                .filter(event -> event.getEventStatus() != EventStatus.DRAFT)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get event by ID with full details
     */
    public EventDTO getEventById(Long eventId) {
        log.info("EventService: Getting event details for ID: {}", eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
        
        // Don't return draft events for public access
        if (event.getEventStatus() == EventStatus.DRAFT) {
            throw new RuntimeException("Event is not available");
        }
        
        return convertToDTO(event);
    }

}
