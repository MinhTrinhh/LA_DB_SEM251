-- ================================================
-- V4: EDIT EVENT PROCEDURES AND STOCK VALIDATION TRIGGER
-- Additional Functions, Stored Procedures, and Triggers
-- ================================================

-- ================================================
-- FUNCTION 3: Calculate Total Sold Tickets for a Category
-- Uses: COUNT aggregate, helps validate ticket stock
-- ================================================
CREATE FUNCTION fn_GetSoldTicketsCount(@CategoryId BIGINT)
RETURNS INT
AS
BEGIN
    DECLARE @SoldCount INT;
    
    SELECT @SoldCount = COUNT(*)
    FROM ticket
    WHERE category_id = @CategoryId;

    RETURN ISNULL(@SoldCount, 0);
END;
GO

-- ================================================
-- STORED PROCEDURE 5: Update Event Basic Info
-- Uses: Input validation, UPDATE with WHERE, transaction handling
-- ================================================
CREATE PROCEDURE sp_UpdateEventBasicInfo
    @EventId BIGINT,
    @OrganizerId BIGINT,
    @Title NVARCHAR(255) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @PosterUrl NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @EventId IS NULL OR @OrganizerId IS NULL
    BEGIN
        RAISERROR('EventId and OrganizerId are required', 16, 1);
        RETURN;
    END
    
    -- Validate event exists and belongs to organizer
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('Event not found or you do not have permission to edit it', 16, 1);
        RETURN;
    END
    
    -- Check if event can be edited (not CANCELED or COMPLETED)
    DECLARE @CurrentStatus NVARCHAR(50);
    SELECT @CurrentStatus = event_status FROM event WHERE event_id = @EventId;
    
    IF @CurrentStatus IN ('CANCELED', 'COMPLETED')
    BEGIN
        RAISERROR('Cannot edit a %s event', 16, 1, @CurrentStatus);
        RETURN;
    END
    
    -- Update only provided fields
    UPDATE event
    SET 
        title = ISNULL(@Title, title),
        general_introduction = ISNULL(@Description, general_introduction),
        poster_url = ISNULL(@PosterUrl, poster_url),
        timestamp = GETDATE()
    WHERE event_id = @EventId;
    
    -- Return updated event info
    SELECT 
        event_id AS EventId,
        title AS Title,
        general_introduction AS Description,
        poster_url AS PosterUrl,
        event_status AS Status,
        'Event updated successfully' AS Message
    FROM event
    WHERE event_id = @EventId;
END;
GO

-- ================================================
-- STORED PROCEDURE 6: Update Session Details
-- Uses: Multiple table updates, validation, conditional logic
-- ================================================
CREATE PROCEDURE sp_UpdateSession
    @SessionId BIGINT,
    @EventId BIGINT,
    @OrganizerId BIGINT,
    @StartDateTime DATETIME2 = NULL,
    @EndDateTime DATETIME2 = NULL,
    @VenueName NVARCHAR(255) = NULL,
    @VenueAddress NVARCHAR(500) = NULL,
    @MeetingUrl NVARCHAR(500) = NULL,
    @PlatformName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate event belongs to organizer
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('Event not found or you do not have permission to edit it', 16, 1);
        RETURN;
    END
    
    -- Validate session exists
    IF NOT EXISTS (
        SELECT 1 FROM [session] 
        WHERE session_id = @SessionId AND event_id = @EventId
    )
    BEGIN
        RAISERROR('Session not found', 16, 1);
        RETURN;
    END
    
    -- Check if event can be edited
    DECLARE @CurrentStatus NVARCHAR(50);
    SELECT @CurrentStatus = event_status FROM event WHERE event_id = @EventId;
    
    IF @CurrentStatus IN ('CANCELED', 'COMPLETED')
    BEGIN
        RAISERROR('Cannot edit sessions for a %s event', 16, 1, @CurrentStatus);
        RETURN;
    END
    
    -- Validate date range if both provided
    IF @StartDateTime IS NOT NULL AND @EndDateTime IS NOT NULL
    BEGIN
        IF @EndDateTime <= @StartDateTime
        BEGIN
            RAISERROR('End date must be after start date', 16, 1);
            RETURN;
        END
    END
    
    -- Update session
    UPDATE [session]
    SET 
        start_date_time = ISNULL(@StartDateTime, start_date_time),
        end_date_time = ISNULL(@EndDateTime, end_date_time)
    WHERE session_id = @SessionId AND event_id = @EventId;
    
    -- Update offline session details if provided
    IF @VenueName IS NOT NULL OR @VenueAddress IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM offline_session WHERE session_id = @SessionId AND event_id = @EventId)
        BEGIN
            UPDATE offline_session
            SET 
                venue_name = ISNULL(@VenueName, venue_name),
                venue_address = ISNULL(@VenueAddress, venue_address)
            WHERE session_id = @SessionId AND event_id = @EventId;
        END
    END
    
    -- Update online session details if provided
    IF @MeetingUrl IS NOT NULL OR @PlatformName IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM online_session WHERE session_id = @SessionId AND event_id = @EventId)
        BEGIN
            UPDATE online_session
            SET 
                meeting_url = ISNULL(@MeetingUrl, meeting_url),
                platform_name = ISNULL(@PlatformName, platform_name)
            WHERE session_id = @SessionId AND event_id = @EventId;
        END
    END
    
    SELECT 'Session updated successfully' AS Message;
END;
GO

-- ================================================
-- STORED PROCEDURE 7: Update Ticket Category
-- Uses: Validation with business logic, aggregate checks
-- ================================================
CREATE PROCEDURE sp_UpdateTicketCategory
    @CategoryId BIGINT,
    @OrganizerId BIGINT,
    @CategoryName NVARCHAR(255) = NULL,
    @Price DECIMAL(10,2) = NULL,
    @MaximumSlot INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get event ID for this category
    DECLARE @EventId BIGINT;
    SELECT @EventId = tc.event_id
    FROM ticket_category tc
    WHERE tc.category_id = @CategoryId;
    
    IF @EventId IS NULL
    BEGIN
        RAISERROR('Ticket category not found', 16, 1);
        RETURN;
    END
    
    -- Validate organizer owns the event
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('You do not have permission to edit this ticket category', 16, 1);
        RETURN;
    END
    
    -- Check if event can be edited
    DECLARE @CurrentStatus NVARCHAR(50);
    SELECT @CurrentStatus = event_status FROM event WHERE event_id = @EventId;
    
    IF @CurrentStatus IN ('CANCELED', 'COMPLETED')
    BEGIN
        RAISERROR('Cannot edit ticket categories for a %s event', 16, 1, @CurrentStatus);
        RETURN;
    END
    
    -- Validate new maximum slot is not less than sold tickets
    IF @MaximumSlot IS NOT NULL
    BEGIN
        DECLARE @SoldCount INT;
        SELECT @SoldCount = COUNT(*) FROM ticket WHERE category_id = @CategoryId;

        IF @MaximumSlot < @SoldCount
        BEGIN
            RAISERROR('Cannot set maximum slot (%d) below already sold tickets (%d)', 16, 1, @MaximumSlot, @SoldCount);
            RETURN;
        END
    END
    
    -- Validate price is non-negative
    IF @Price IS NOT NULL AND @Price < 0
    BEGIN
        RAISERROR('Price cannot be negative', 16, 1);
        RETURN;
    END
    
    -- Update ticket category
    UPDATE ticket_category
    SET 
        category_name = ISNULL(@CategoryName, category_name),
        price = ISNULL(@Price, price),
        maximum_slot = ISNULL(@MaximumSlot, maximum_slot)
    WHERE category_id = @CategoryId;
    
    -- Return updated category info with availability
    SELECT 
        tc.category_id AS CategoryId,
        tc.category_name AS CategoryName,
        tc.price AS Price,
        tc.maximum_slot AS MaximumSlot,
        dbo.fn_GetSoldTicketsCount(@CategoryId) AS SoldCount,
        dbo.fn_GetAvailableTickets(@CategoryId) AS AvailableCount,
        'Ticket category updated successfully' AS Message
    FROM ticket_category tc
    WHERE tc.category_id = @CategoryId;
END;
GO

-- ================================================
-- STORED PROCEDURE 8: Get Event Details for Editing
-- Uses: Multiple JOINs, aggregates, returns comprehensive data
-- ================================================
CREATE PROCEDURE sp_GetEventForEdit
    @EventId BIGINT,
    @OrganizerId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate event belongs to organizer
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('Event not found or you do not have permission to view it', 16, 1);
        RETURN;
    END
    
    -- Return event basic info
    SELECT 
        e.event_id AS EventId,
        e.title AS Title,
        e.general_introduction AS Description,
        e.poster_url AS PosterUrl,
        e.event_status AS Status,
        e.start_date_time AS StartDateTime,
        e.end_date_time AS EndDateTime,
        dbo.fn_CalculateEventRevenue(@EventId) AS TotalRevenue,
        (SELECT COUNT(*) FROM ticket t
         INNER JOIN ticket_category tc ON t.category_id = tc.category_id
         WHERE tc.event_id = @EventId) AS TotalTicketsSold
    FROM event e
    WHERE e.event_id = @EventId;
    
    -- Return sessions with venue info
    SELECT 
        s.session_id AS SessionId,
        s.event_id AS EventId,
        s.start_date_time AS StartDateTime,
        s.end_date_time AS EndDateTime,
        s.max_capacity AS MaxCapacity,
        s.type AS SessionType,
        ISNULL(os.venue_name, '') AS VenueName,
        ISNULL(os.venue_address, '') AS VenueAddress,
        ISNULL(ons.meeting_url, '') AS MeetingUrl,
        ISNULL(ons.platform_name, '') AS PlatformName
    FROM [session] s
    LEFT JOIN offline_session os ON s.session_id = os.session_id AND s.event_id = os.event_id
    LEFT JOIN online_session ons ON s.session_id = ons.session_id AND s.event_id = ons.event_id
    WHERE s.event_id = @EventId
    ORDER BY s.start_date_time;
    
    -- Return ticket categories with sales info
    SELECT 
        tc.category_id AS CategoryId,
        tc.session_id AS SessionId,
        tc.category_name AS CategoryName,
        tc.price AS Price,
        tc.maximum_slot AS MaximumSlot,
        dbo.fn_GetSoldTicketsCount(tc.category_id) AS SoldCount,
        dbo.fn_GetAvailableTickets(tc.category_id) AS AvailableCount,
        CASE 
            WHEN tc.maximum_slot > 0 
            THEN CAST((dbo.fn_GetSoldTicketsCount(tc.category_id) * 100.0 / tc.maximum_slot) AS DECIMAL(5,2))
            ELSE 0 
        END AS SoldPercentage
    FROM ticket_category tc
    WHERE tc.event_id = @EventId
    ORDER BY tc.session_id, tc.category_name;
END;
GO

-- ================================================
-- TRIGGER 4: Auto-Update Event Dates Based on Sessions
-- Updates event start/end dates when sessions are modified
-- ================================================
CREATE TRIGGER trg_UpdateEventDatesOnSessionChange
ON [session]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get affected event IDs
    DECLARE @EventId BIGINT;
    
    -- Use LOCAL cursor to avoid naming conflicts
    DECLARE event_cursor CURSOR LOCAL FOR
        SELECT DISTINCT event_id FROM inserted;
    
    OPEN event_cursor;
    FETCH NEXT FROM event_cursor INTO @EventId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Update event dates based on all sessions
        UPDATE event
        SET 
            start_date_time = (SELECT MIN(start_date_time) FROM [session] WHERE event_id = @EventId),
            end_date_time = (SELECT MAX(end_date_time) FROM [session] WHERE event_id = @EventId)
        WHERE event_id = @EventId;
        
        FETCH NEXT FROM event_cursor INTO @EventId;
    END
    
    CLOSE event_cursor;
    DEALLOCATE event_cursor;
END;
GO

-- ================================================
-- STORED PROCEDURE 9: Add New Ticket Category to Session
-- Uses: INSERT with validation, returns new ID
-- ================================================
CREATE PROCEDURE sp_AddTicketCategory
    @SessionId BIGINT,
    @EventId BIGINT,
    @OrganizerId BIGINT,
    @CategoryName NVARCHAR(255),
    @Price DECIMAL(10,2),
    @MaximumSlot INT,
    @StartDateTime DATETIME2 = NULL,
    @EndDateTime DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate organizer owns the event
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('You do not have permission to add ticket categories to this event', 16, 1);
        RETURN;
    END
    
    -- Validate session exists
    IF NOT EXISTS (
        SELECT 1 FROM [session] 
        WHERE session_id = @SessionId AND event_id = @EventId
    )
    BEGIN
        RAISERROR('Session not found', 16, 1);
        RETURN;
    END
    
    -- Check event status
    DECLARE @CurrentStatus NVARCHAR(50);
    SELECT @CurrentStatus = event_status FROM event WHERE event_id = @EventId;
    
    IF @CurrentStatus IN ('CANCELED', 'COMPLETED')
    BEGIN
        RAISERROR('Cannot add ticket categories to a %s event', 16, 1, @CurrentStatus);
        RETURN;
    END
    
    -- Validate inputs
    IF @MaximumSlot <= 0
    BEGIN
        RAISERROR('Maximum slot must be greater than 0', 16, 1);
        RETURN;
    END
    
    IF @Price < 0
    BEGIN
        RAISERROR('Price cannot be negative', 16, 1);
        RETURN;
    END
    
    -- Use session dates if not provided
    IF @StartDateTime IS NULL OR @EndDateTime IS NULL
    BEGIN
        SELECT 
            @StartDateTime = ISNULL(@StartDateTime, start_date_time),
            @EndDateTime = ISNULL(@EndDateTime, end_date_time)
        FROM [session]
        WHERE session_id = @SessionId AND event_id = @EventId;
    END
    
    -- Insert new ticket category
    INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id)
    VALUES (@CategoryName, @Price, @MaximumSlot, @StartDateTime, @EndDateTime, @SessionId, @EventId);
    
    DECLARE @NewCategoryId BIGINT = SCOPE_IDENTITY();
    
    -- Return the new category
    SELECT 
        @NewCategoryId AS CategoryId,
        @CategoryName AS CategoryName,
        @Price AS Price,
        @MaximumSlot AS MaximumSlot,
        0 AS SoldCount,
        @MaximumSlot AS AvailableCount,
        'Ticket category added successfully' AS Message;
END;
GO

-- ================================================
-- STORED PROCEDURE 10: Delete Ticket Category
-- Uses: DELETE with validation (cannot delete if tickets sold)
-- ================================================
CREATE PROCEDURE sp_DeleteTicketCategory
    @CategoryId BIGINT,
    @OrganizerId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get event ID for this category
    DECLARE @EventId BIGINT;
    SELECT @EventId = tc.event_id
    FROM ticket_category tc
    WHERE tc.category_id = @CategoryId;
    
    IF @EventId IS NULL
    BEGIN
        RAISERROR('Ticket category not found', 16, 1);
        RETURN;
    END
    
    -- Validate organizer owns the event
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('You do not have permission to delete this ticket category', 16, 1);
        RETURN;
    END
    
    -- Check if tickets have been sold
    DECLARE @SoldCount INT;
    SELECT @SoldCount = COUNT(*) FROM ticket WHERE category_id = @CategoryId;

    IF @SoldCount > 0
    BEGIN
        RAISERROR('Cannot delete ticket category with %d sold tickets. Please process refunds first.', 16, 1, @SoldCount);
        RETURN;
    END
    
    -- Delete the category
    DELETE FROM ticket_category WHERE category_id = @CategoryId;
    
    SELECT 'Ticket category deleted successfully' AS Message;
END;
GO

PRINT 'Edit event procedures and stock validation trigger created successfully.';
GO
