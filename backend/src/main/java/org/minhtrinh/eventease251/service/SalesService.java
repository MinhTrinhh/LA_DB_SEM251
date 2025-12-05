package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.*;
import org.minhtrinh.eventease251.entity.Event;
import org.minhtrinh.eventease251.entity.User;
import org.minhtrinh.eventease251.repository.EventRepository;
import org.minhtrinh.eventease251.repository.SalesRepository;
import org.minhtrinh.eventease251.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for handling sales data using stored procedures and functions.
 * This service demonstrates the use of SQL Server stored procedures and functions
 * to retrieve sales statistics and revenue reports.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SalesService {

    private final SalesRepository salesRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    /**
     * Get complete sales summary for an event.
     * Calls multiple stored procedures:
     * - sp_GetEventSalesSummary (category breakdown)
     * - sp_GetEventDailySales (daily sales data)
     * - sp_GetEventRecentOrders (recent orders)
     * - fn_CalculateEventRevenue (total revenue function)
     * 
     * @param eventId The event ID
     * @param organizerId The organizer ID (for authorization)
     * @return Complete sales summary DTO
     */
    @Transactional(readOnly = true)
    public EventSalesSummaryDTO getEventSalesSummary(Long eventId, Long organizerId) {
        log.info("SalesService: Getting sales summary for event ID: {} by organizer ID: {}", eventId, organizerId);
        
        // Validate event exists and belongs to organizer
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
        
        if (!event.getOrganizerProfile().getUser().getUserId().equals(organizerId)) {
            throw new RuntimeException("You don't have permission to view sales for this event");
        }
        
        // Get event totals using stored procedure/function
        EventSalesSummaryDTO summary = salesRepository.getEventSalesTotals(eventId);
        
        // Get category breakdown using stored procedure
        List<CategorySalesDTO> categoryBreakdown = salesRepository.getEventCategorySales(eventId, 0);
        summary.setCategoryBreakdown(categoryBreakdown);
        
        // Get daily sales (last 30 days) using stored procedure
        try {
            List<DailySalesDTO> dailySales = salesRepository.getEventDailySales(eventId, 30);
            summary.setDailySales(dailySales);
        } catch (Exception e) {
            log.warn("No daily sales data available for event {}: {}", eventId, e.getMessage());
            summary.setDailySales(new ArrayList<>());
        }
        
        // Get recent orders (top 10) using stored procedure
        try {
            List<RecentOrderDTO> recentOrders = salesRepository.getEventRecentOrders(eventId, 10);
            summary.setRecentOrders(recentOrders);
        } catch (Exception e) {
            log.warn("No recent orders available for event {}: {}", eventId, e.getMessage());
            summary.setRecentOrders(new ArrayList<>());
        }
        
        log.info("SalesService: Sales summary retrieved for event {} - Revenue: {}, Tickets Sold: {}", 
                eventId, summary.getTotalRevenue(), summary.getTotalTicketsSold());
        
        return summary;
    }

    /**
     * Get revenue calculated using the database function.
     * This directly calls fn_CalculateEventRevenue.
     * 
     * @param eventId The event ID
     * @return The total revenue as BigDecimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getEventRevenue(Long eventId) {
        log.info("SalesService: Calculating revenue for event ID: {} using database function", eventId);
        return salesRepository.calculateEventRevenue(eventId);
    }

    /**
     * Get available tickets for a category using database function.
     * This directly calls fn_GetAvailableTickets.
     * 
     * @param categoryId The ticket category ID
     * @return Number of available tickets
     */
    @Transactional(readOnly = true)
    public Integer getAvailableTickets(Long categoryId) {
        log.info("SalesService: Getting available tickets for category ID: {} using database function", categoryId);
        return salesRepository.getAvailableTickets(categoryId);
    }

    /**
     * Get organizer revenue report across all their events.
     * Calls sp_GetOrganizerRevenueReport stored procedure.
     * 
     * @param organizerId The organizer's user ID
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return Complete organizer revenue report
     */
    @Transactional(readOnly = true)
    public OrganizerRevenueReportDTO getOrganizerRevenueReport(Long organizerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("SalesService: Getting revenue report for organizer ID: {}", organizerId);
        
        // Validate organizer exists
        User user = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + organizerId));
        
        if (!user.isOrganizer()) {
            throw new RuntimeException("User is not an organizer");
        }
        
        // Get summary totals
        OrganizerRevenueReportDTO report;
        try {
            report = salesRepository.getOrganizerSummary(organizerId, startDate, endDate);
        } catch (Exception e) {
            log.warn("Error getting organizer summary, creating empty report: {}", e.getMessage());
            report = OrganizerRevenueReportDTO.builder()
                    .organizerId(organizerId)
                    .organizerName(user.getOrganizerProfile() != null ? user.getOrganizerProfile().getOfficialName() : "Unknown")
                    .totalEvents(0)
                    .totalTicketsSold(0)
                    .grandTotalRevenue(BigDecimal.ZERO)
                    .events(new ArrayList<>())
                    .build();
        }
        
        // Get event breakdown using stored procedure
        try {
            List<EventRevenueDTO> events = salesRepository.getOrganizerEventRevenues(
                    organizerId, startDate, endDate, BigDecimal.ZERO);
            report.setEvents(events);
        } catch (Exception e) {
            log.warn("No event revenue data available for organizer {}: {}", organizerId, e.getMessage());
            report.setEvents(new ArrayList<>());
        }
        
        log.info("SalesService: Revenue report retrieved for organizer {} - Total Events: {}, Total Revenue: {}", 
                organizerId, report.getTotalEvents(), report.getGrandTotalRevenue());
        
        return report;
    }

    /**
     * Get category sales breakdown for an event.
     * Calls sp_GetEventSalesSummary stored procedure.
     * 
     * @param eventId The event ID
     * @param minTicketsSold Minimum tickets sold filter (for HAVING clause demo)
     * @return List of category sales data
     */
    @Transactional(readOnly = true)
    public List<CategorySalesDTO> getEventCategorySales(Long eventId, Integer minTicketsSold) {
        log.info("SalesService: Getting category sales for event ID: {} with min tickets: {}", eventId, minTicketsSold);
        return salesRepository.getEventCategorySales(eventId, minTicketsSold != null ? minTicketsSold : 0);
    }

    /**
     * Get daily sales for an event.
     * Calls sp_GetEventDailySales stored procedure.
     * 
     * @param eventId The event ID
     * @param days Number of days to look back
     * @return List of daily sales data
     */
    @Transactional(readOnly = true)
    public List<DailySalesDTO> getEventDailySales(Long eventId, Integer days) {
        log.info("SalesService: Getting daily sales for event ID: {} for {} days", eventId, days);
        return salesRepository.getEventDailySales(eventId, days != null ? days : 30);
    }

    /**
     * Get recent orders for an event.
     * Calls sp_GetEventRecentOrders stored procedure.
     * 
     * @param eventId The event ID
     * @param limit Number of orders to return
     * @return List of recent orders
     */
    @Transactional(readOnly = true)
    public List<RecentOrderDTO> getEventRecentOrders(Long eventId, Integer limit) {
        log.info("SalesService: Getting recent orders for event ID: {} with limit: {}", eventId, limit);
        return salesRepository.getEventRecentOrders(eventId, limit != null ? limit : 10);
    }
}
