CREATE TRIGGER trg_ValidateTicketAvailability
ON ticket
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId BIGINT;
    DECLARE @CurrentSold INT;
    DECLARE @MaximumSlot INT;
    DECLARE @TicketCount INT;

    -- Get unique categories from inserted tickets
    -- Use LOCAL cursor to avoid naming conflicts
    DECLARE category_cursor CURSOR LOCAL FOR
        SELECT DISTINCT category_id
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
        FROM ticket
        WHERE category_id = @CategoryId;

        -- Check if we've exceeded capacity
        IF @CurrentSold > @MaximumSlot
        BEGIN
            CLOSE category_cursor;
            DEALLOCATE category_cursor;

            -- Get count of tickets just inserted for this category
            SELECT @TicketCount = COUNT(*)
            FROM inserted
            WHERE category_id = @CategoryId;

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

