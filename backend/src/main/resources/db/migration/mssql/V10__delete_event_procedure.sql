-- ================================================
-- V10: DELETE EVENT STORED PROCEDURE
-- Implements event deletion with validation
-- ================================================

-- ================================================
-- STORED PROCEDURE: Delete Event
-- Uses: DELETE with validation (cannot delete if tickets sold, must be event owner)
-- Input validation, conditional logic with IF statements
-- ================================================
CREATE PROCEDURE sp_DeleteEvent
    @EventId BIGINT,
    @OrganizerId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @EventId IS NULL OR @OrganizerId IS NULL
    BEGIN
        RAISERROR('EventId and OrganizerId are required', 16, 1);
        RETURN;
    END
    
    -- Validate event exists
    IF NOT EXISTS (SELECT 1 FROM event WHERE event_id = @EventId)
    BEGIN
        RAISERROR('Event not found', 16, 1);
        RETURN;
    END
    
    -- Validate organizer owns the event
    IF NOT EXISTS (
        SELECT 1 FROM event 
        WHERE event_id = @EventId AND organizer_id = @OrganizerId
    )
    BEGIN
        RAISERROR('You do not have permission to delete this event', 16, 1);
        RETURN;
    END
    
    -- Check if any tickets have been sold for this event
    -- Join through ticket_category to find sold tickets
    DECLARE @TotalSoldTickets INT;
    SELECT @TotalSoldTickets = COUNT(*)
    FROM ticket t
    INNER JOIN ticket_category tc ON t.category_id = tc.category_id
    WHERE tc.event_id = @EventId;
    
    IF @TotalSoldTickets > 0
    BEGIN
        RAISERROR('Cannot delete event with %d sold tickets. Please cancel the event and process refunds first.', 16, 1, @TotalSoldTickets);
        RETURN;
    END
    
    -- Get event status for logging
    DECLARE @EventTitle NVARCHAR(255);
    DECLARE @EventStatus NVARCHAR(50);
    SELECT @EventTitle = title, @EventStatus = event_status 
    FROM event 
    WHERE event_id = @EventId;
    
    -- Delete the event (CASCADE will handle sessions, ticket_categories, etc.)
    DELETE FROM event WHERE event_id = @EventId;
    
    -- Return success message with deleted event info
    SELECT 
        @EventId AS DeletedEventId,
        @EventTitle AS DeletedEventTitle,
        @EventStatus AS PreviousStatus,
        'Event deleted successfully' AS Message;
END;
GO

PRINT 'Delete event stored procedure created successfully.';
GO
