package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.dto.CreateEventRequest;
import org.minhtrinh.eventease251.dto.SessionRequest;
import org.minhtrinh.eventease251.dto.TicketCategoryRequest;

import java.util.List;
import java.util.Map;

/**
 * Custom repository for Event operations using JDBC Template
 * This is separate from the JPA repository to demonstrate JDBC usage for the database assignment
 */
public interface EventRepositoryCustom {
    
    /**
     * Create a new event with sessions and ticket categories using JDBC Template
     * @param request The event creation request containing all event, session, and ticket details
     * @param organizerId The user ID of the organizer creating the event
     * @return The ID of the created event
     */
    Long createEvent(CreateEventRequest request, Long organizerId);
    
    /**
     * Create a session for an event
     * @param eventId The event ID
     * @param sessionRequest The session details
     * @return The generated session ID
     */
    Long createSession(Long eventId, SessionRequest sessionRequest);
    
    /**
     * Create a ticket category for a session
     * @param eventId The event ID
     * @param sessionId The session ID
     * @param ticketCategoryRequest The ticket category details
     * @return The generated ticket category ID
     */
    Long createTicketCategory(Long eventId, Long sessionId, TicketCategoryRequest ticketCategoryRequest);

    /**
     * Get filtered and sorted events using stored function
     * @param eventStatus Filter by event status (ONGOING, COMING_SOON, COMPLETED) or null for all
     * @param sortByPrice Sort by price ('ASC' for cheapest first, 'DESC' for expensive first, null for no sort)
     * @return List of event data maps with event details and min_price
     */
    List<Map<String, Object>> getFilteredAndSortedEvents(String eventStatus, String sortByPrice);

    /**
     * Update event statuses based on current date/time
     * Calls stored procedure sp_UpdateEventStatuses
     */
    void updateEventStatuses();
}
