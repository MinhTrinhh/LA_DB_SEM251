-- =============================================
-- V9: Automatic Event Status Update Procedure
-- =============================================
-- Purpose: Automatically update event statuses based on current date/time
-- This procedure should be called before querying events
-- Created: 2024-12-06
-- =============================================

-- =============================================
-- Procedure: sp_UpdateEventStatuses
-- Purpose: Update event statuses based on start/end times
-- Status Logic:
--   - DRAFT: Manual status (not auto-updated)
--   - COMING_SOON: Current time < start_date_time
--   - ONGOING: start_date_time <= current time < end_date_time
--   - COMPLETED: end_date_time <= current time
--   - CANCELED: Manual status (not auto-updated)
-- =============================================
CREATE PROCEDURE dbo.sp_UpdateEventStatuses
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @UpdatedCount INT = 0;

    -- Update COMING_SOON events to ONGOING when start time has passed
    UPDATE event
    SET event_status = 'ONGOING'
    WHERE event_status = 'COMING_SOON'
      AND start_date_time <= @CurrentDateTime
      AND end_date_time > @CurrentDateTime;

    SET @UpdatedCount = @UpdatedCount + @@ROWCOUNT;

    -- Update COMING_SOON or ONGOING events to COMPLETED when end time has passed
    UPDATE event
    SET event_status = 'COMPLETED'
    WHERE event_status IN ('ONGOING')
      AND end_date_time <= @CurrentDateTime;

    SET @UpdatedCount = @UpdatedCount + @@ROWCOUNT;

    -- Log the update count
    IF @UpdatedCount > 0
    BEGIN
        PRINT CONCAT('Updated ', @UpdatedCount, ' event status(es) at ', CONVERT(VARCHAR, @CurrentDateTime, 120));
    END

    RETURN @UpdatedCount;
END;
GO