-- =============================================
-- V7: Event DateTime Validation Trigger
-- =============================================
-- Purpose: Ensure event start and end times are in the future
-- Created: 2024-12-05
-- =============================================
-- Create trigger to validate event date/time
CREATE TRIGGER trg_ValidateEventDateTime
ON event
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EventId BIGINT;
    DECLARE @Title NVARCHAR(255);
    DECLARE @StartDateTime DATETIME;
    DECLARE @EndDateTime DATETIME;
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @ErrorMsg NVARCHAR(500);

    -- Check each inserted/updated event
    -- Use LOCAL cursor to avoid naming conflicts
    DECLARE event_cursor CURSOR LOCAL FOR
        SELECT event_id, title, start_date_time, end_date_time
        FROM inserted;

    OPEN event_cursor;
    FETCH NEXT FROM event_cursor INTO @EventId, @Title, @StartDateTime, @EndDateTime;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Validate start_date_time is in the future
        IF @StartDateTime <= @CurrentDateTime
        BEGIN
            CLOSE event_cursor;
            DEALLOCATE event_cursor;

            SET @ErrorMsg = CONCAT(
                'Event validation failed: Start date/time must be in the future. ',
                'Event "', @Title, '" (ID: ', @EventId, ') ',
                'has start time: ', CONVERT(VARCHAR, @StartDateTime, 120), ', ',
                'which is not after current time: ', CONVERT(VARCHAR, @CurrentDateTime, 120)
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate end_date_time is after start_date_time
        IF @EndDateTime <= @StartDateTime
        BEGIN
            CLOSE event_cursor;
            DEALLOCATE event_cursor;

            SET @ErrorMsg = CONCAT(
                'Event validation failed: End date/time must be after start date/time. ',
                'Event "', @Title, '" (ID: ', @EventId, ') ',
                'has start time: ', CONVERT(VARCHAR, @StartDateTime, 120), ', ',
                'end time: ', CONVERT(VARCHAR, @EndDateTime, 120)
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate end_date_time is also in the future
        IF @EndDateTime <= @CurrentDateTime
        BEGIN
            CLOSE event_cursor;
            DEALLOCATE event_cursor;

            SET @ErrorMsg = CONCAT(
                'Event validation failed: End date/time must be in the future. ',
                'Event "', @Title, '" (ID: ', @EventId, ') ',
                'has end time: ', CONVERT(VARCHAR, @EndDateTime, 120), ', ',
                'which is not after current time: ', CONVERT(VARCHAR, @CurrentDateTime, 120)
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        FETCH NEXT FROM event_cursor INTO @EventId, @Title, @StartDateTime, @EndDateTime;
    END

    CLOSE event_cursor;
    DEALLOCATE event_cursor;
END;
GO

-- Test comment: This trigger validates:
-- 1. start_date_time must be > GETDATE()
-- 2. end_date_time must be > start_date_time
-- 3. end_date_time must be > GETDATE()

