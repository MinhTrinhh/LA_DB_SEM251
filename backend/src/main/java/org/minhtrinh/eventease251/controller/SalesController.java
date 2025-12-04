package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.*;
import org.minhtrinh.eventease251.service.SalesService;
import org.minhtrinh.eventease251.ultility.JwtTokenProvider;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for sales data endpoints.
 * 
 * This controller demonstrates the use of stored procedures and functions:
 * - sp_GetEventSalesSummary: Get event sales breakdown by category
 * - sp_GetEventDailySales: Get daily sales data
 * - sp_GetEventRecentOrders: Get recent orders for an event
 * - sp_GetOrganizerRevenueReport: Get organizer's overall revenue report
 * - fn_CalculateEventRevenue: Calculate total revenue for an event
 * - fn_GetAvailableTickets: Get available tickets for a category
 */
@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:20002", "http://127.0.0.1:20002"})
@Slf4j
public class SalesController {

    private final SalesService salesService;

    /**
     * Get complete sales summary for an event.
     * Calls multiple stored procedures and functions.
     * 
     * GET /api/sales/events/{eventId}/summary
     */
    @GetMapping("/events/{eventId}/summary")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getEventSalesSummary(@PathVariable Long eventId) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("SalesController: Getting sales summary for event {} by organizer {}", eventId, organizerId);
            
            EventSalesSummaryDTO summary = salesService.getEventSalesSummary(eventId, organizerId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting sales summary", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get event revenue using database function.
     * Demonstrates calling fn_CalculateEventRevenue function.
     * 
     * GET /api/sales/events/{eventId}/revenue
     */
    @GetMapping("/events/{eventId}/revenue")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getEventRevenue(@PathVariable Long eventId) {
        try {
            log.info("SalesController: Getting revenue for event {} using DB function", eventId);
            
            BigDecimal revenue = salesService.getEventRevenue(eventId);
            return ResponseEntity.ok(java.util.Map.of(
                "eventId", eventId,
                "totalRevenue", revenue,
                "message", "Revenue calculated using fn_CalculateEventRevenue function"
            ));
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting event revenue", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get available tickets for a category using database function.
     * Demonstrates calling fn_GetAvailableTickets function.
     * 
     * GET /api/sales/categories/{categoryId}/available
     */
    @GetMapping("/categories/{categoryId}/available")
    public ResponseEntity<?> getAvailableTickets(@PathVariable Long categoryId) {
        try {
            log.info("SalesController: Getting available tickets for category {} using DB function", categoryId);
            
            Integer available = salesService.getAvailableTickets(categoryId);
            return ResponseEntity.ok(java.util.Map.of(
                "categoryId", categoryId,
                "availableTickets", available,
                "message", "Available tickets calculated using fn_GetAvailableTickets function"
            ));
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting available tickets", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get category sales breakdown for an event.
     * Demonstrates calling sp_GetEventSalesSummary stored procedure.
     * 
     * GET /api/sales/events/{eventId}/categories
     * Query params: minTicketsSold (optional) - for HAVING clause demo
     */
    @GetMapping("/events/{eventId}/categories")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getEventCategorySales(
            @PathVariable Long eventId,
            @RequestParam(required = false, defaultValue = "0") Integer minTicketsSold) {
        try {
            log.info("SalesController: Getting category sales for event {} with minTicketsSold={}", eventId, minTicketsSold);
            
            List<CategorySalesDTO> categories = salesService.getEventCategorySales(eventId, minTicketsSold);
            return ResponseEntity.ok(java.util.Map.of(
                "eventId", eventId,
                "categories", categories,
                "message", "Category sales retrieved using sp_GetEventSalesSummary stored procedure"
            ));
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting category sales", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get daily sales for an event.
     * Demonstrates calling sp_GetEventDailySales stored procedure.
     * 
     * GET /api/sales/events/{eventId}/daily
     * Query params: days (optional, default 30)
     */
    @GetMapping("/events/{eventId}/daily")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getEventDailySales(
            @PathVariable Long eventId,
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        try {
            log.info("SalesController: Getting daily sales for event {} for {} days", eventId, days);
            
            List<DailySalesDTO> dailySales = salesService.getEventDailySales(eventId, days);
            return ResponseEntity.ok(java.util.Map.of(
                "eventId", eventId,
                "dailySales", dailySales,
                "message", "Daily sales retrieved using sp_GetEventDailySales stored procedure"
            ));
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting daily sales", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get recent orders for an event.
     * Demonstrates calling sp_GetEventRecentOrders stored procedure.
     * 
     * GET /api/sales/events/{eventId}/orders
     * Query params: limit (optional, default 10)
     */
    @GetMapping("/events/{eventId}/orders")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getEventRecentOrders(
            @PathVariable Long eventId,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        try {
            log.info("SalesController: Getting recent orders for event {} with limit {}", eventId, limit);
            
            List<RecentOrderDTO> orders = salesService.getEventRecentOrders(eventId, limit);
            return ResponseEntity.ok(java.util.Map.of(
                "eventId", eventId,
                "recentOrders", orders,
                "message", "Recent orders retrieved using sp_GetEventRecentOrders stored procedure"
            ));
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting recent orders", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Get organizer's revenue report across all their events.
     * Demonstrates calling sp_GetOrganizerRevenueReport stored procedure.
     * 
     * GET /api/sales/organizer/report
     * Query params: 
     *   - startDate (optional, ISO format)
     *   - endDate (optional, ISO format)
     */
    @GetMapping("/organizer/report")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> getOrganizerRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            Long organizerId = JwtTokenProvider.getAuthenticatedUserId();
            log.info("SalesController: Getting revenue report for organizer {} from {} to {}", organizerId, startDate, endDate);
            
            OrganizerRevenueReportDTO report = salesService.getOrganizerRevenueReport(organizerId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            log.error("SalesController: Error getting organizer revenue report", e);
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
