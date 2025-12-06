-- ================================================
-- V11: DELETE SESSION STORED PROCEDURE
-- Implements session deletion with validation
-- ================================================

-- ================================================
-- FUNCTION: Get Sold Tickets Count for Session
-- Returns the count of sold tickets for a specific session
-- ================================================
CREATE FUNCTION fn_GetSessionSoldTickets
(
    @SessionId BIGINT,
    @EventId BIGINT
)
RETURNS INT
AS
BEGIN
    DECLARE @SoldCount INT;
    
    SELECT @SoldCount = COUNT(*)
    FROM ticket t
    INNER JOIN ticket_category tc ON t.category_id = tc.category_id
    WHERE tc.session_id = @SessionId AND tc.event_id = @EventId;
    
    RETURN ISNULL(@SoldCount, 0);
END;
GO

-- ================================================
-- STORED PROCEDURE: Delete Session
-- Uses: DELETE with validation
-- - Cannot delete if session has sold tickets
-- - Cannot delete if it's the last session of an event
-- - Must be event owner
-- Input validation, conditional logic with IF statements
-- ================================================
CREATE PROCEDURE sp_DeleteSession
    @SessionId BIGINT,
    @EventId BIGINT,
    @OrganizerId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @SessionId IS NULL OR @EventId IS NULL OR @OrganizerId IS NULL
    BEGIN
        RAISERROR('SessionId, EventId and OrganizerId are required', 16, 1);
        RETURN;
    END
    
    -- Validate event exists
    IF NOT EXISTS (SELECT 1 FROM event WHERE event_id = @EventId)
    BEGIN
        RAISERROR('Event not found', 16, 1);
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
    
    -- Validate organizer owns the event
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('You do not have permission to delete this session', 16, 1);
        RETURN;
    END
    
    -- Check if this is the last session of the event
    DECLARE @SessionCount INT;
    SELECT @SessionCount = COUNT(*) FROM [session] WHERE event_id = @EventId;
    
    IF @SessionCount <= 1
    BEGIN
        RAISERROR('Cannot delete the last session of an event. Delete the entire event instead.', 16, 1);
        RETURN;
    END
    
    -- Check if any tickets have been sold for this session
    DECLARE @TotalSoldTickets INT;
    SET @TotalSoldTickets = dbo.fn_GetSessionSoldTickets(@SessionId, @EventId);
    
    IF @TotalSoldTickets > 0
    BEGIN
        RAISERROR('Cannot delete session with %d sold tickets. Please cancel tickets and process refunds first.', 16, 1, @TotalSoldTickets);
        RETURN;
    END
    
    -- Get session info for logging
    DECLARE @SessionType NVARCHAR(255);
    DECLARE @StartDateTime DATETIME2;
    SELECT @SessionType = type, @StartDateTime = start_date_time
    FROM [session] 
    WHERE session_id = @SessionId AND event_id = @EventId;
    
    -- Delete ticket categories first (they reference the session)
    DELETE FROM ticket_category 
    WHERE session_id = @SessionId AND event_id = @EventId;
    
    -- Delete from online_session or offline_session (child tables)
    DELETE FROM online_session 
    WHERE session_id = @SessionId AND event_id = @EventId;
    
    DELETE FROM offline_session 
    WHERE session_id = @SessionId AND event_id = @EventId;
    
    -- Delete the session
    DELETE FROM [session] 
    WHERE session_id = @SessionId AND event_id = @EventId;
    
    -- Return success message with deleted session info
    SELECT 
        @SessionId AS DeletedSessionId,
        @EventId AS EventId,
        @SessionType AS SessionType,
        @StartDateTime AS StartDateTime,
        'Session deleted successfully' AS Message;
END;
GO

PRINT 'Delete session stored procedure and function created successfully.';
GO
