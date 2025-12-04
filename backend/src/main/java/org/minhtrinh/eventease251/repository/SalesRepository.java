package org.minhtrinh.eventease251.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for calling stored procedures and functions related to sales data.
 * This demonstrates calling SQL Server stored procedures from Java.
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class SalesRepository {

    private final JdbcTemplate jdbcTemplate;

    // ========================================
    // FUNCTION CALLS
    // ========================================

    /**
     * Call fn_CalculateEventRevenue function to get total revenue for an event
     */
    public BigDecimal calculateEventRevenue(Long eventId) {
        log.info("Calling fn_CalculateEventRevenue for event ID: {}", eventId);
        String sql = "SELECT dbo.fn_CalculateEventRevenue(?) AS Revenue";
        BigDecimal revenue = jdbcTemplate.queryForObject(sql, BigDecimal.class, eventId);
        log.info("Event {} revenue: {}", eventId, revenue);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    /**
     * Call fn_GetAvailableTickets function to get available tickets for a category
     */
    public Integer getAvailableTickets(Long categoryId) {
        log.info("Calling fn_GetAvailableTickets for category ID: {}", categoryId);
        String sql = "SELECT dbo.fn_GetAvailableTickets(?) AS Available";
        Integer available = jdbcTemplate.queryForObject(sql, Integer.class, categoryId);
        log.info("Category {} available tickets: {}", categoryId, available);
        return available != null ? available : 0;
    }

    // ========================================
    // STORED PROCEDURE CALLS
    // ========================================

    /**
     * Call sp_GetEventSalesSummary stored procedure
     * Returns category breakdown for event sales
     */
    public List<CategorySalesDTO> getEventCategorySales(Long eventId, Integer minTicketsSold) {
        log.info("Calling sp_GetEventSalesSummary for event ID: {}, minTicketsSold: {}", eventId, minTicketsSold);
        
        // Execute stored procedure and map first result set (category breakdown)
        String sql = "EXEC sp_GetEventSalesSummary @EventId = ?, @MinTicketsSold = ?";
        
        return jdbcTemplate.query(sql, new Object[]{eventId, minTicketsSold}, new RowMapper<CategorySalesDTO>() {
            @Override
            public CategorySalesDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                return CategorySalesDTO.builder()
                        .categoryId(rs.getLong("CategoryId"))
                        .categoryName(rs.getString("CategoryName"))
                        .price(rs.getBigDecimal("Price"))
                        .totalCapacity(rs.getInt("TotalCapacity"))
                        .ticketsSold(rs.getInt("TicketsSold"))
                        .ticketsAvailable(rs.getInt("TicketsAvailable"))
                        .revenue(rs.getBigDecimal("Revenue"))
                        .soldPercentage(rs.getBigDecimal("SoldPercentage"))
                        .checkedInCount(rs.getInt("CheckedInCount"))
                        .build();
            }
        });
    }

    /**
     * Get event totals from sp_GetEventSalesSummary
     * This is a separate call to get the second result set
     */
    public EventSalesSummaryDTO getEventSalesTotals(Long eventId) {
        log.info("Getting event sales totals for event ID: {}", eventId);
        
        // Query for event totals
        String sql = """
            SELECT 
                e.event_id AS EventId,
                e.title AS EventTitle,
                dbo.fn_CalculateEventRevenue(?) AS TotalRevenue,
                (SELECT COUNT(*) FROM TICKET t 
                 INNER JOIN ticket_category tc ON t.Category_ID = tc.category_id 
                 WHERE tc.event_id = ?) AS TotalTicketsSold,
                (SELECT ISNULL(SUM(tc.maximum_slot), 0) FROM ticket_category tc WHERE tc.event_id = ?) AS TotalCapacity
            FROM event e
            WHERE e.event_id = ?
            """;
        
        return jdbcTemplate.queryForObject(sql, new Object[]{eventId, eventId, eventId, eventId}, 
            (rs, rowNum) -> {
                int totalTicketsSold = rs.getInt("TotalTicketsSold");
                int totalCapacity = rs.getInt("TotalCapacity");
                BigDecimal capacityPercentage = totalCapacity > 0 
                    ? BigDecimal.valueOf((totalTicketsSold * 100.0) / totalCapacity)
                    : BigDecimal.ZERO;
                
                return EventSalesSummaryDTO.builder()
                        .eventId(rs.getLong("EventId"))
                        .eventTitle(rs.getString("EventTitle"))
                        .totalRevenue(rs.getBigDecimal("TotalRevenue"))
                        .totalTicketsSold(totalTicketsSold)
                        .totalCapacity(totalCapacity)
                        .capacityPercentage(capacityPercentage)
                        .build();
            });
    }

    /**
     * Call sp_GetEventDailySales stored procedure
     */
    public List<DailySalesDTO> getEventDailySales(Long eventId, Integer days) {
        log.info("Calling sp_GetEventDailySales for event ID: {}, days: {}", eventId, days);
        
        String sql = "EXEC sp_GetEventDailySales @EventId = ?, @Days = ?";
        
        return jdbcTemplate.query(sql, new Object[]{eventId, days}, (rs, rowNum) -> 
            DailySalesDTO.builder()
                .saleDate(rs.getDate("SaleDate").toLocalDate())
                .orderCount(rs.getInt("OrderCount"))
                .ticketsSold(rs.getInt("TicketsSold"))
                .dailyRevenue(rs.getBigDecimal("DailyRevenue"))
                .build()
        );
    }

    /**
     * Call sp_GetEventRecentOrders stored procedure
     */
    public List<RecentOrderDTO> getEventRecentOrders(Long eventId, Integer topN) {
        log.info("Calling sp_GetEventRecentOrders for event ID: {}, topN: {}", eventId, topN);
        
        String sql = "EXEC sp_GetEventRecentOrders @EventId = ?, @TopN = ?";
        
        return jdbcTemplate.query(sql, new Object[]{eventId, topN}, (rs, rowNum) -> 
            RecentOrderDTO.builder()
                .orderId(rs.getLong("OrderId"))
                .customerName(rs.getString("CustomerName"))
                .customerEmail(rs.getString("CustomerEmail"))
                .ticketCategory(rs.getString("TicketCategory"))
                .quantity(rs.getInt("Quantity"))
                .amount(rs.getBigDecimal("Amount"))
                .status(rs.getString("Status"))
                .purchaseDate(rs.getTimestamp("PurchaseDate").toLocalDateTime())
                .build()
        );
    }

    /**
     * Call sp_GetOrganizerRevenueReport stored procedure
     * Returns revenue data for all events of an organizer
     */
    public List<EventRevenueDTO> getOrganizerEventRevenues(Long organizerId, LocalDateTime startDate, LocalDateTime endDate, BigDecimal minRevenue) {
        log.info("Calling sp_GetOrganizerRevenueReport for organizer ID: {}", organizerId);
        
        String sql = "EXEC sp_GetOrganizerRevenueReport @OrganizerId = ?, @StartDate = ?, @EndDate = ?, @MinRevenue = ?";
        
        return jdbcTemplate.query(sql, new Object[]{organizerId, startDate, endDate, minRevenue}, (rs, rowNum) -> 
            EventRevenueDTO.builder()
                .eventId(rs.getLong("EventId"))
                .eventTitle(rs.getString("EventTitle"))
                .eventStatus(rs.getString("EventStatus"))
                .startDateTime(rs.getTimestamp("StartDateTime") != null 
                    ? rs.getTimestamp("StartDateTime").toLocalDateTime() 
                    : null)
                .totalOrders(rs.getInt("TotalOrders"))
                .totalTicketsSold(rs.getInt("TotalTicketsSold"))
                .totalRevenue(rs.getBigDecimal("TotalRevenue"))
                .totalCapacity(rs.getInt("TotalCapacity"))
                .capacityPercentage(rs.getBigDecimal("CapacityPercentage"))
                .build()
        );
    }

    /**
     * Get organizer summary totals
     */
    public OrganizerRevenueReportDTO getOrganizerSummary(Long organizerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting organizer summary for organizer ID: {}", organizerId);
        
        String sql = """
            SELECT 
                ? AS OrganizerId,
                (SELECT official_name FROM organizer_profile WHERE user_id = ?) AS OrganizerName,
                COUNT(DISTINCT e.event_id) AS TotalEvents,
                (SELECT COUNT(DISTINCT t2.Ticket_ID) 
                 FROM event e2 
                 LEFT JOIN [session] s2 ON e2.event_id = s2.event_id
                 LEFT JOIN ticket_category tc2 ON s2.session_id = tc2.session_id AND s2.event_id = tc2.event_id
                 LEFT JOIN TICKET t2 ON tc2.category_id = t2.Category_ID
                 WHERE e2.organizer_id = ?
                   AND (? IS NULL OR e2.start_date_time >= ?)
                   AND (? IS NULL OR e2.start_date_time <= ?)) AS TotalTicketsSold,
                ISNULL((SELECT SUM(dbo.fn_CalculateEventRevenue(e3.event_id)) 
                        FROM event e3 
                        WHERE e3.organizer_id = ?
                          AND (? IS NULL OR e3.start_date_time >= ?)
                          AND (? IS NULL OR e3.start_date_time <= ?)), 0) AS GrandTotalRevenue
            FROM event e
            WHERE e.organizer_id = ?
              AND (? IS NULL OR e.start_date_time >= ?)
              AND (? IS NULL OR e.start_date_time <= ?)
            """;
        
        return jdbcTemplate.queryForObject(sql, 
            new Object[]{
                organizerId, organizerId, organizerId, 
                startDate, startDate, endDate, endDate,
                organizerId, startDate, startDate, endDate, endDate,
                organizerId, startDate, startDate, endDate, endDate
            }, 
            (rs, rowNum) -> OrganizerRevenueReportDTO.builder()
                .organizerId(rs.getLong("OrganizerId"))
                .organizerName(rs.getString("OrganizerName"))
                .totalEvents(rs.getInt("TotalEvents"))
                .totalTicketsSold(rs.getInt("TotalTicketsSold"))
                .grandTotalRevenue(rs.getBigDecimal("GrandTotalRevenue"))
                .build()
        );
    }
}
