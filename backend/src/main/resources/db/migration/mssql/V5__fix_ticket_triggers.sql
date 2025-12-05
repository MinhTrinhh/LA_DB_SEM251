-- ================================================
-- V5: FIX TICKET TRIGGERS
-- Fix the INSTEAD OF INSERT trigger to properly handle identity columns
-- ================================================

-- Drop the existing triggers that conflict with Hibernate
DROP TRIGGER IF EXISTS trg_GenerateTicketQRCode;
DROP TRIGGER IF EXISTS trg_PreventTicketOverselling;
GO

-- ================================================
-- New AFTER INSERT trigger for ticket validation
-- This validates after the insert, allowing Hibernate to properly manage the ID
-- ================================================
CREATE TRIGGER trg_ValidateTicketAvailability
ON TICKET
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId BIGINT;
    DECLARE @CurrentSold INT;
    DECLARE @MaximumSlot INT;
    DECLARE @TicketCount INT;

    -- Get unique categories from inserted tickets
    DECLARE category_cursor CURSOR FOR
        SELECT DISTINCT Category_ID
        FROM inserted;

    OPEN category_cursor;
    FETCH NEXT FROM category_cursor INTO @CategoryId;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Get maximum slot for this category
        SELECT @MaximumSlot = maximum_slot
        FROM ticket_category
        WHERE category_id = @CategoryId;

        -- Get current sold count (including just inserted)
        SELECT @CurrentSold = COUNT(*)
        FROM TICKET
        WHERE Category_ID = @CategoryId;

        -- Check if we've exceeded capacity
        IF @CurrentSold > @MaximumSlot
        BEGIN
            CLOSE category_cursor;
            DEALLOCATE category_cursor;

            -- Get count of tickets just inserted for this category
            SELECT @TicketCount = COUNT(*)
            FROM inserted
            WHERE Category_ID = @CategoryId;

            DECLARE @ErrorMsg NVARCHAR(500);
            SET @ErrorMsg = CONCAT(
                'Ticket capacity exceeded for category ', @CategoryId,
                '. Maximum: ', @MaximumSlot,
                ', Current sold: ', @CurrentSold,
                '. Cannot add ', @TicketCount, ' more ticket(s).'
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        FETCH NEXT FROM category_cursor INTO @CategoryId;
    END

    CLOSE category_cursor;
    DEALLOCATE category_cursor;
END;
GO

-- ================================================
-- Note: QR Code generation is now handled by the application
-- This is more flexible and doesn't interfere with Hibernate's ID management
-- ================================================

PRINT 'Ticket triggers fixed successfully.';

