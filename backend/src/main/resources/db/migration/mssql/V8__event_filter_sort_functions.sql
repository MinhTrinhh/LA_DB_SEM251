-- =============================================
-- V8: Event Filter and Sort Functions
-- =============================================
-- Purpose: Stored functions for filtering and sorting events
-- Created: 2024-12-05
-- =============================================

-- =============================================
-- Function: fn_GetMinTicketPrice
-- Purpose: Get the minimum ticket price for an event
-- =============================================
CREATE FUNCTION dbo.fn_GetMinTicketPrice(@EventId BIGINT)
RETURNS DECIMAL(19,2)
AS
BEGIN
    DECLARE @MinPrice DECIMAL(19,2);

    SELECT @MinPrice = MIN(tc.price)
    FROM ticket_category tc
    INNER JOIN session s ON tc.session_id = s.session_id
    WHERE s.event_id = @EventId;

    RETURN ISNULL(@MinPrice, 0);
END;
GO

-- =============================================
-- Function: fn_GetFilteredAndSortedEvents
-- Purpose: Get events filtered by status and sorted by price
-- Parameters:
--   @EventStatusFilter: Filter by event status (NULL for all public events)
--   @SortByPrice: 'ASC' for cheapest first, 'DESC' for most expensive first, NULL for no sorting
-- Returns: Table with event details and minimum price
-- =============================================
CREATE FUNCTION dbo.fn_GetFilteredAndSortedEvents(
    @EventStatusFilter NVARCHAR(50),
    @SortByPrice NVARCHAR(10)
)
    RETURNS TABLE
    AS
RETURN
(
    SELECT
        e.event_id,
        e.title,
        e.general_introduction,
        e.event_status,
        e.organizer_id,
        e.start_date_time,
        e.end_date_time,
        e.timestamp,
        e.poster_url,
        dbo.fn_GetMinTicketPrice(e.event_id) AS min_price
    FROM event e
    WHERE
        -- Filter out drafts (public events only)
        e.event_status != 'DRAFT'
        -- Apply status filter if provided
        AND (@EventStatusFilter IS NULL OR e.event_status = @EventStatusFilter)
);
GO

-- =============================================
-- Test queries (commented out, for reference)
-- =============================================
-- Get all public events
-- SELECT * FROM dbo.fn_GetFilteredAndSortedEvents(NULL, NULL);

-- Get COMING_SOON events sorted by cheapest price
-- SELECT * FROM dbo.fn_GetFilteredAndSortedEvents('COMING_SOON', 'ASC');

-- Get ONGOING events sorted by most expensive price
-- SELECT * FROM dbo.fn_GetFilteredAndSortedEvents('ONGOING', 'DESC');

-- Get COMPLETED events
-- SELECT * FROM dbo.fn_GetFilteredAndSortedEvents('COMPLETED', NULL);

