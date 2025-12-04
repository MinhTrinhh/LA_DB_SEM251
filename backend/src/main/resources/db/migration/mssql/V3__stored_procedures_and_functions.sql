-- ================================================
-- V3: STORED PROCEDURES, FUNCTIONS, AND TRIGGERS
-- For Assignment Requirements 5.1 and 5.2
-- ================================================

-- ================================================
-- FUNCTIONS (5.1 - Requirement: At least 2 functions)
-- ================================================

-- Function 1: Calculate Total Revenue for an Event
-- Uses: Aggregate function (SUM), WHERE clause, JOINs across multiple tables
CREATE FUNCTION fn_CalculateEventRevenue(@EventId BIGINT)
RETURNS DECIMAL(19,2)
AS
BEGIN
    DECLARE @Revenue DECIMAL(19,2);
    
    SELECT @Revenue = ISNULL(SUM(o.Amount_of_Money), 0)
    FROM [ORDER] o
    INNER JOIN TICKET t ON o.Order_ID = t.Order_ID
    INNER JOIN ticket_category tc ON t.Category_ID = tc.category_id
    WHERE tc.event_id = @EventId
      AND o.Order_Status IN ('COMPLETED', 'PENDING');
    
    RETURN @Revenue;
END;
GO

-- Function 2: Get Available Tickets Count for a Category
-- Uses: Aggregate function (COUNT), control statement (IF), input validation
CREATE FUNCTION fn_GetAvailableTickets(@CategoryId BIGINT)
RETURNS INT
AS
BEGIN
    DECLARE @Available INT;
    DECLARE @MaxSlot INT;
    DECLARE @Sold INT;
    
    -- Input validation: return -1 if category doesn't exist
    IF NOT EXISTS (SELECT 1 FROM ticket_category WHERE category_id = @CategoryId)
        RETURN -1;
    
    SELECT @MaxSlot = maximum_slot FROM ticket_category WHERE category_id = @CategoryId;
    SELECT @Sold = COUNT(*) FROM TICKET WHERE Category_ID = @CategoryId;
    
    SET @Available = @MaxSlot - @Sold;
    
    -- Control statement: ensure non-negative result
    IF @Available < 0
        SET @Available = 0;
    
    RETURN @Available;
END;
GO

-- ================================================
-- STORED PROCEDURES (5.1 - Requirement: At least 2 procedures)
-- ================================================

-- Stored Procedure 1: Get Event Sales Summary
-- Requirements satisfied:
-- - Input parameters used in WHERE clause
-- - Queries with WHERE and ORDER BY across 2+ tables
-- - Aggregate functions (SUM, COUNT), GROUP BY, HAVING
-- - Input parameter validation
CREATE PROCEDURE sp_GetEventSalesSummary
    @EventId BIGINT,
    @MinTicketsSold INT = 0  -- Optional: filter categories with minimum sold tickets
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @EventId IS NULL
    BEGIN
        RAISERROR('EventId is required', 16, 1);
        RETURN;
    END
    
    IF NOT EXISTS (SELECT 1 FROM event WHERE event_id = @EventId)
    BEGIN
        RAISERROR('Event not found with the specified ID', 16, 1);
        RETURN;
    END
    
    -- Main query: Get sales summary per ticket category
    -- Joins: ticket_category -> TICKET -> ORDER (3 tables)
    -- Uses: WHERE, GROUP BY, HAVING, ORDER BY, Aggregate functions
    SELECT 
        tc.category_id AS CategoryId,
        tc.category_name AS CategoryName,
        tc.price AS Price,
        tc.maximum_slot AS TotalCapacity,
        COUNT(t.Ticket_ID) AS TicketsSold,
        tc.maximum_slot - COUNT(t.Ticket_ID) AS TicketsAvailable,
        CAST(tc.price * COUNT(t.Ticket_ID) AS DECIMAL(19,2)) AS Revenue,
        CASE 
            WHEN tc.maximum_slot > 0 
            THEN CAST((COUNT(t.Ticket_ID) * 100.0 / tc.maximum_slot) AS DECIMAL(5,2))
            ELSE 0 
        END AS SoldPercentage,
        SUM(CASE WHEN t.Used_flag = 1 THEN 1 ELSE 0 END) AS CheckedInCount
    FROM ticket_category tc
    LEFT JOIN TICKET t ON tc.category_id = t.Category_ID
    LEFT JOIN [ORDER] o ON t.Order_ID = o.Order_ID AND o.Order_Status IN ('COMPLETED', 'PENDING')
    WHERE tc.event_id = @EventId
    GROUP BY tc.category_id, tc.category_name, tc.price, tc.maximum_slot
    HAVING COUNT(t.Ticket_ID) >= @MinTicketsSold
    ORDER BY Revenue DESC, tc.category_name;
    
    -- Return event totals
    SELECT 
        e.event_id AS EventId,
        e.title AS EventTitle,
        dbo.fn_CalculateEventRevenue(@EventId) AS TotalRevenue,
        (SELECT COUNT(*) FROM TICKET t 
         INNER JOIN ticket_category tc ON t.Category_ID = tc.category_id 
         WHERE tc.event_id = @EventId) AS TotalTicketsSold,
        (SELECT SUM(tc.maximum_slot) FROM ticket_category tc WHERE tc.event_id = @EventId) AS TotalCapacity
    FROM event e
    WHERE e.event_id = @EventId;
END;
GO

-- Stored Procedure 2: Get Organizer Revenue Report
-- Requirements satisfied:
-- - Input parameters used in WHERE/HAVING clauses
-- - Queries across multiple tables (event, ticket_category, TICKET, ORDER)
-- - Aggregate functions, GROUP BY, HAVING
-- - Control statements (IF)
-- - Input parameter validation
CREATE PROCEDURE sp_GetOrganizerRevenueReport
    @OrganizerId BIGINT,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @MinRevenue DECIMAL(19,2) = 0  -- Filter events with minimum revenue
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @OrganizerId IS NULL
    BEGIN
        RAISERROR('OrganizerId is required', 16, 1);
        RETURN;
    END
    
    IF NOT EXISTS (SELECT 1 FROM organizer_profile WHERE user_id = @OrganizerId)
    BEGIN
        RAISERROR('Organizer not found with the specified ID', 16, 1);
        RETURN;
    END
    
    -- Control statement: Set default date range if not provided
    IF @StartDate IS NULL
        SET @StartDate = DATEADD(YEAR, -1, GETDATE());
    
    IF @EndDate IS NULL
        SET @EndDate = GETDATE();
    
    -- Validate date range
    IF @StartDate > @EndDate
    BEGIN
        RAISERROR('StartDate must be earlier than or equal to EndDate', 16, 1);
        RETURN;
    END
    
    -- Main query: Revenue report per event for the organizer
    -- Joins across 4 tables: event -> ticket_category -> TICKET -> ORDER
    SELECT 
        e.event_id AS EventId,
        e.title AS EventTitle,
        e.event_status AS EventStatus,
        e.start_date_time AS StartDateTime,
        COUNT(DISTINCT o.Order_ID) AS TotalOrders,
        COUNT(t.Ticket_ID) AS TotalTicketsSold,
        ISNULL(SUM(o.Amount_of_Money), 0) AS TotalRevenue,
        (SELECT SUM(tc2.maximum_slot) FROM ticket_category tc2 
         INNER JOIN [session] s2 ON tc2.session_id = s2.session_id AND tc2.event_id = s2.event_id
         WHERE s2.event_id = e.event_id) AS TotalCapacity,
        CASE 
            WHEN (SELECT SUM(tc2.maximum_slot) FROM ticket_category tc2 
                  INNER JOIN [session] s2 ON tc2.session_id = s2.session_id AND tc2.event_id = s2.event_id
                  WHERE s2.event_id = e.event_id) > 0 
            THEN CAST((COUNT(t.Ticket_ID) * 100.0 / 
                  (SELECT SUM(tc2.maximum_slot) FROM ticket_category tc2 
                   INNER JOIN [session] s2 ON tc2.session_id = s2.session_id AND tc2.event_id = s2.event_id
                   WHERE s2.event_id = e.event_id)) AS DECIMAL(5,2))
            ELSE 0 
        END AS CapacityPercentage
    FROM event e
    LEFT JOIN [session] s ON e.event_id = s.event_id
    LEFT JOIN ticket_category tc ON s.session_id = tc.session_id AND s.event_id = tc.event_id
    LEFT JOIN TICKET t ON tc.category_id = t.Category_ID
    LEFT JOIN [ORDER] o ON t.Order_ID = o.Order_ID AND o.Order_Status IN ('COMPLETED', 'PENDING')
    WHERE e.organizer_id = @OrganizerId
      AND e.start_date_time >= @StartDate
      AND e.start_date_time <= @EndDate
    GROUP BY e.event_id, e.title, e.event_status, e.start_date_time
    HAVING ISNULL(SUM(o.Amount_of_Money), 0) >= @MinRevenue
    ORDER BY TotalRevenue DESC, e.start_date_time DESC;
    
    -- Return organizer summary totals
    SELECT 
        @OrganizerId AS OrganizerId,
        (SELECT official_name FROM organizer_profile WHERE user_id = @OrganizerId) AS OrganizerName,
        COUNT(DISTINCT e.event_id) AS TotalEvents,
        (SELECT COUNT(DISTINCT t2.Ticket_ID) 
         FROM event e2 
         LEFT JOIN [session] s2 ON e2.event_id = s2.event_id
         LEFT JOIN ticket_category tc2 ON s2.session_id = tc2.session_id AND s2.event_id = tc2.event_id
         LEFT JOIN TICKET t2 ON tc2.category_id = t2.Category_ID
         WHERE e2.organizer_id = @OrganizerId
           AND e2.start_date_time >= @StartDate
           AND e2.start_date_time <= @EndDate) AS TotalTicketsSold,
        ISNULL(SUM(DISTINCT dbo.fn_CalculateEventRevenue(e.event_id)), 0) AS GrandTotalRevenue
    FROM event e
    WHERE e.organizer_id = @OrganizerId
      AND e.start_date_time >= @StartDate
      AND e.start_date_time <= @EndDate;
END;
GO

-- ================================================
-- TRIGGERS (5.2 - Requirement: At least 2 triggers)
-- ================================================

-- Trigger 1: Auto-generate QR Code URL (Derived Column Value)
-- Requirement: At least one trigger must generate a derived column value
CREATE TRIGGER trg_GenerateTicketQRCode
ON TICKET
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE t
    SET QR_Code_URL = CONCAT(
        'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=',
        'TICKET-', CAST(t.Ticket_ID AS VARCHAR(20)),
        '-ORDER-', CAST(t.Order_ID AS VARCHAR(20)),
        '-', CONVERT(VARCHAR(8), GETDATE(), 112),
        '-', LEFT(NEWID(), 8)
    )
    FROM TICKET t
    INNER JOIN inserted i ON t.Ticket_ID = i.Ticket_ID
    WHERE t.QR_Code_URL IS NULL OR t.QR_Code_URL = '';
END;
GO

-- Trigger 2: Enforce Business Rule - Prevent Event Cancellation with Sold Tickets
-- Requirement: At least one trigger must enforce a meaningful business rule
CREATE TRIGGER trg_PreventCancellationWithSoldTickets
ON event
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if status is being changed to CANCELED
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        INNER JOIN deleted d ON i.event_id = d.event_id
        WHERE i.event_status = 'CANCELED' 
          AND d.event_status != 'CANCELED'
    )
    BEGIN
        -- Check if there are any sold tickets for this event
        DECLARE @EventId BIGINT;
        DECLARE @TicketCount INT;
        
        SELECT @EventId = i.event_id
        FROM inserted i
        INNER JOIN deleted d ON i.event_id = d.event_id
        WHERE i.event_status = 'CANCELED' 
          AND d.event_status != 'CANCELED';
        
        SELECT @TicketCount = COUNT(*)
        FROM TICKET t
        INNER JOIN ticket_category tc ON t.Category_ID = tc.category_id
        WHERE tc.event_id = @EventId;
        
        IF @TicketCount > 0
        BEGIN
            RAISERROR('Cannot cancel event with sold tickets. Please process refunds first. Tickets sold: %d', 16, 1, @TicketCount);
            ROLLBACK TRANSACTION;
            RETURN;
        END
    END
END;
GO

-- ================================================
-- ADDITIONAL HELPER PROCEDURE: Get Daily Sales
-- ================================================

CREATE PROCEDURE sp_GetEventDailySales
    @EventId BIGINT,
    @Days INT = 30  -- Number of days to look back
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @EventId IS NULL
    BEGIN
        RAISERROR('EventId is required', 16, 1);
        RETURN;
    END
    
    IF @Days <= 0 OR @Days > 365
        SET @Days = 30;
    
    -- Get daily sales for the specified event
    SELECT 
        CAST(o.created_at AS DATE) AS SaleDate,
        COUNT(DISTINCT o.Order_ID) AS OrderCount,
        COUNT(t.Ticket_ID) AS TicketsSold,
        ISNULL(SUM(o.Amount_of_Money), 0) AS DailyRevenue
    FROM [ORDER] o
    INNER JOIN TICKET t ON o.Order_ID = t.Order_ID
    INNER JOIN ticket_category tc ON t.Category_ID = tc.category_id
    WHERE tc.event_id = @EventId
      AND o.created_at >= DATEADD(DAY, -@Days, GETDATE())
      AND o.Order_Status IN ('COMPLETED', 'PENDING')
    GROUP BY CAST(o.created_at AS DATE)
    ORDER BY SaleDate DESC;
END;
GO

-- ================================================
-- ADDITIONAL HELPER PROCEDURE: Get Recent Orders for Event
-- ================================================

CREATE PROCEDURE sp_GetEventRecentOrders
    @EventId BIGINT,
    @TopN INT = 10  -- Number of recent orders to return
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Input validation
    IF @EventId IS NULL
    BEGIN
        RAISERROR('EventId is required', 16, 1);
        RETURN;
    END
    
    IF @TopN <= 0 OR @TopN > 100
        SET @TopN = 10;
    
    -- Get recent orders for the event
    SELECT TOP (@TopN)
        o.Order_ID AS OrderId,
        ISNULL(pp.full_name, u.email_address) AS CustomerName,
        u.email_address AS CustomerEmail,
        tc.category_name AS TicketCategory,
        COUNT(t.Ticket_ID) AS Quantity,
        o.Amount_of_Money AS Amount,
        o.Order_Status AS Status,
        o.created_at AS PurchaseDate
    FROM [ORDER] o
    INNER JOIN [user] u ON o.User_ID = u.user_id
    LEFT JOIN participant_profile pp ON u.user_id = pp.user_id
    INNER JOIN TICKET t ON o.Order_ID = t.Order_ID
    INNER JOIN ticket_category tc ON t.Category_ID = tc.category_id
    WHERE tc.event_id = @EventId
    GROUP BY o.Order_ID, pp.full_name, u.email_address, tc.category_name, o.Amount_of_Money, o.Order_Status, o.created_at
    ORDER BY o.created_at DESC;
END;
GO

-- ================================================
-- GRANT PERMISSIONS (if needed)
-- ================================================
-- These will be granted when sManager user is created

PRINT 'Stored procedures, functions, and triggers created successfully.';
GO
