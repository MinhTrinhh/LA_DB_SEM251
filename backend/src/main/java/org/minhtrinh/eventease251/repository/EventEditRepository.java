package org.minhtrinh.eventease251.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.EventEditDetailsDTO;
import org.minhtrinh.eventease251.dto.EventEditDetailsDTO.SessionEditDTO;
import org.minhtrinh.eventease251.dto.EventEditDetailsDTO.TicketCategoryEditDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Repository for event editing operations using stored procedures
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class EventEditRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Get event details for editing using sp_GetEventForEdit
     */
    public EventEditDetailsDTO getEventForEdit(Long eventId, Long organizerId) {
        log.info("Getting event {} for edit by organizer {}", eventId, organizerId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_GetEventForEdit")
                .declareParameters(
                        new SqlParameter("EventId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("EventId", eventId)
                .addValue("OrganizerId", organizerId);

        Map<String, Object> result = jdbcCall.execute(params);

        // Parse event info from first result set
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> eventResults = (List<Map<String, Object>>) result.get("#result-set-1");

        if (eventResults == null || eventResults.isEmpty()) {
            throw new RuntimeException("Event not found or access denied");
        }

        Map<String, Object> eventRow = eventResults.get(0);

        EventEditDetailsDTO dto = new EventEditDetailsDTO();
        dto.setEventId(((Number) eventRow.get("EventId")).longValue());
        dto.setTitle((String) eventRow.get("Title"));
        dto.setDescription((String) eventRow.get("Description"));
        dto.setPosterUrl((String) eventRow.get("PosterUrl"));
        dto.setStatus((String) eventRow.get("Status"));

        if (eventRow.get("StartDateTime") != null) {
            dto.setStartDateTime(((java.sql.Timestamp) eventRow.get("StartDateTime")).toLocalDateTime());
        }
        if (eventRow.get("EndDateTime") != null) {
            dto.setEndDateTime(((java.sql.Timestamp) eventRow.get("EndDateTime")).toLocalDateTime());
        }

        if (eventRow.get("TotalRevenue") != null) {
            dto.setTotalRevenue((BigDecimal) eventRow.get("TotalRevenue"));
        }
        if (eventRow.get("TotalTicketsSold") != null) {
            dto.setTotalTicketsSold(((Number) eventRow.get("TotalTicketsSold")).intValue());
        }

        // Parse sessions from second result set
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> sessionResults = (List<Map<String, Object>>) result.get("#result-set-2");
        List<SessionEditDTO> sessions = new ArrayList<>();

        if (sessionResults != null) {
            for (Map<String, Object> row : sessionResults) {
                SessionEditDTO session = SessionEditDTO.builder()
                        .sessionId(((Number) row.get("SessionId")).longValue())
                        .eventId(((Number) row.get("EventId")).longValue())
                        .startDateTime(row.get("StartDateTime") != null ?
                                ((java.sql.Timestamp) row.get("StartDateTime")).toLocalDateTime() : null)
                        .endDateTime(row.get("EndDateTime") != null ?
                                ((java.sql.Timestamp) row.get("EndDateTime")).toLocalDateTime() : null)
                        .maxCapacity(row.get("MaxCapacity") != null ?
                                ((Number) row.get("MaxCapacity")).intValue() : null)
                        .sessionType((String) row.get("SessionType"))
                        .venueName((String) row.get("VenueName"))
                        .venueAddress((String) row.get("VenueAddress"))
                        .meetingUrl((String) row.get("MeetingUrl"))
                        .platformName((String) row.get("PlatformName"))
                        .build();
                sessions.add(session);
            }
        }
        dto.setSessions(sessions);

        // Parse ticket categories from third result set
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> categoryResults = (List<Map<String, Object>>) result.get("#result-set-3");
        List<TicketCategoryEditDTO> categories = new ArrayList<>();

        if (categoryResults != null) {
            for (Map<String, Object> row : categoryResults) {
                TicketCategoryEditDTO category = TicketCategoryEditDTO.builder()
                        .categoryId(((Number) row.get("CategoryId")).longValue())
                        .sessionId(((Number) row.get("SessionId")).longValue())
                        .categoryName((String) row.get("CategoryName"))
                        .price((BigDecimal) row.get("Price"))
                        .maximumSlot(((Number) row.get("MaximumSlot")).intValue())
                        .soldCount(((Number) row.get("SoldCount")).intValue())
                        .availableCount(((Number) row.get("AvailableCount")).intValue())
                        .soldPercentage((BigDecimal) row.get("SoldPercentage"))
                        .build();
                categories.add(category);
            }
        }
        dto.setTicketCategories(categories);

        return dto;
    }

    /**
     * Update event basic info using sp_UpdateEventBasicInfo
     */
    public void updateEventBasicInfo(Long eventId, Long organizerId, String title, String description, String posterUrl) {
        log.info("Updating event {} basic info", eventId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_UpdateEventBasicInfo")
                .declareParameters(
                        new SqlParameter("EventId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT),
                        new SqlParameter("Title", Types.NVARCHAR),
                        new SqlParameter("Description", Types.NVARCHAR),
                        new SqlParameter("PosterUrl", Types.NVARCHAR)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("EventId", eventId)
                .addValue("OrganizerId", organizerId)
                .addValue("Title", title)
                .addValue("Description", description)
                .addValue("PosterUrl", posterUrl);

        jdbcCall.execute(params);
    }

    /**
     * Update session using sp_UpdateSession
     */
    public void updateSession(Long sessionId, Long eventId, Long organizerId,
                              LocalDateTime startDateTime, LocalDateTime endDateTime,
                              String venueName, String venueAddress,
                              String meetingUrl, String platformName) {
        log.info("Updating session {} for event {}", sessionId, eventId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_UpdateSession")
                .declareParameters(
                        new SqlParameter("SessionId", Types.BIGINT),
                        new SqlParameter("EventId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT),
                        new SqlParameter("StartDateTime", Types.TIMESTAMP),
                        new SqlParameter("EndDateTime", Types.TIMESTAMP),
                        new SqlParameter("VenueName", Types.NVARCHAR),
                        new SqlParameter("VenueAddress", Types.NVARCHAR),
                        new SqlParameter("MeetingUrl", Types.NVARCHAR),
                        new SqlParameter("PlatformName", Types.NVARCHAR)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("SessionId", sessionId)
                .addValue("EventId", eventId)
                .addValue("OrganizerId", organizerId)
                .addValue("StartDateTime", startDateTime != null ? java.sql.Timestamp.valueOf(startDateTime) : null)
                .addValue("EndDateTime", endDateTime != null ? java.sql.Timestamp.valueOf(endDateTime) : null)
                .addValue("VenueName", venueName)
                .addValue("VenueAddress", venueAddress)
                .addValue("MeetingUrl", meetingUrl)
                .addValue("PlatformName", platformName);

        jdbcCall.execute(params);
    }

    /**
     * Update ticket category using sp_UpdateTicketCategory
     */
    public void updateTicketCategory(Long categoryId, Long organizerId,
                                     String categoryName, BigDecimal price, Integer maximumSlot) {
        log.info("Updating ticket category {}", categoryId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_UpdateTicketCategory")
                .declareParameters(
                        new SqlParameter("CategoryId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT),
                        new SqlParameter("CategoryName", Types.NVARCHAR),
                        new SqlParameter("Price", Types.DECIMAL),
                        new SqlParameter("MaximumSlot", Types.INTEGER)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("CategoryId", categoryId)
                .addValue("OrganizerId", organizerId)
                .addValue("CategoryName", categoryName)
                .addValue("Price", price)
                .addValue("MaximumSlot", maximumSlot);

        jdbcCall.execute(params);
    }

    /**
     * Add ticket category using sp_AddTicketCategory
     */
    public Long addTicketCategory(Long sessionId, Long eventId, Long organizerId,
                                  String categoryName, BigDecimal price, Integer maximumSlot,
                                  LocalDateTime startDateTime, LocalDateTime endDateTime) {
        log.info("Adding ticket category to session {} event {}", sessionId, eventId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_AddTicketCategory")
                .declareParameters(
                        new SqlParameter("SessionId", Types.BIGINT),
                        new SqlParameter("EventId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT),
                        new SqlParameter("CategoryName", Types.NVARCHAR),
                        new SqlParameter("Price", Types.DECIMAL),
                        new SqlParameter("MaximumSlot", Types.INTEGER),
                        new SqlParameter("StartDateTime", Types.TIMESTAMP),
                        new SqlParameter("EndDateTime", Types.TIMESTAMP)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("SessionId", sessionId)
                .addValue("EventId", eventId)
                .addValue("OrganizerId", organizerId)
                .addValue("CategoryName", categoryName)
                .addValue("Price", price)
                .addValue("MaximumSlot", maximumSlot)
                .addValue("StartDateTime", startDateTime != null ? java.sql.Timestamp.valueOf(startDateTime) : null)
                .addValue("EndDateTime", endDateTime != null ? java.sql.Timestamp.valueOf(endDateTime) : null);

        Map<String, Object> result = jdbcCall.execute(params);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultSet = (List<Map<String, Object>>) result.get("#result-set-1");

        if (resultSet != null && !resultSet.isEmpty()) {
            return ((Number) resultSet.get(0).get("CategoryId")).longValue();
        }
        return null;
    }

    /**
     * Delete ticket category using sp_DeleteTicketCategory
     */
    public void deleteTicketCategory(Long categoryId, Long organizerId) {
        log.info("Deleting ticket category {}", categoryId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_DeleteTicketCategory")
                .declareParameters(
                        new SqlParameter("CategoryId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("CategoryId", categoryId)
                .addValue("OrganizerId", organizerId);

        jdbcCall.execute(params);
    }

    /**
     * Delete event using sp_DeleteEvent
     * Validates ownership and checks for sold tickets before deletion
     */
    public void deleteEvent(Long eventId, Long organizerId) {
        log.info("Deleting event {} by organizer {}", eventId, organizerId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_DeleteEvent")
                .declareParameters(
                        new SqlParameter("EventId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("EventId", eventId)
                .addValue("OrganizerId", organizerId);

        jdbcCall.execute(params);
    }

    /**
     * Delete session using sp_DeleteSession
     * Validates ownership, checks for sold tickets, and ensures it's not the last session
     */
    public void deleteSession(Long sessionId, Long eventId, Long organizerId) {
        log.info("Deleting session {} from event {} by organizer {}", sessionId, eventId, organizerId);

        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_DeleteSession")
                .declareParameters(
                        new SqlParameter("SessionId", Types.BIGINT),
                        new SqlParameter("EventId", Types.BIGINT),
                        new SqlParameter("OrganizerId", Types.BIGINT)
                );

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("SessionId", sessionId)
                .addValue("EventId", eventId)
                .addValue("OrganizerId", organizerId);

        jdbcCall.execute(params);
    }
}
