/*

              EVENT-EASE DATABASE - COMPLETE SETUP SCRIPT                     
                     SQL Server 2022 - EventEase System                       
═

  IMPORTANT: Before running this script
   
   1. DISABLE FLYWAY in application.properties:
      spring.flyway.enabled=false
   
   2. RUN this entire script in Azure Data Studio or SSMS
   
   3. START Spring Boot:
      cd backend
      ./mvnw spring-boot:run


*/

USE master;
GO

-- Create database if not exists
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'event-ease-db')
BEGIN
    CREATE DATABASE [event-ease-db];
END
GO

USE [event-ease-db];
GO

-- ================================================
-- CORE TABLES
-- ================================================

CREATE TABLE [user] (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    email_address NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) DEFAULT 'PENDING',
    timestamp DATETIME2 DEFAULT GETDATE(),
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME2 NULL,
    CONSTRAINT chk_user_status CHECK (status IN ('AUTHENTICATED', 'SUSPENDED', 'PENDING')),
    CONSTRAINT chk_lock_logic CHECK (
        (failed_login_attempts < 5 AND account_locked_until IS NULL)
        OR (failed_login_attempts >= 5 AND account_locked_until IS NOT NULL)
    )
);
CREATE INDEX idx_user_lockout ON [user](account_locked_until);

CREATE TABLE user_role (
    user_id BIGINT NOT NULL,
    role NVARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES [user](user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_user_role CHECK (role IN ('ROLE_PARTICIPANT', 'ROLE_ORGANIZER', 'ROLE_ADMIN'))
);
CREATE INDEX idx_user_role_role ON user_role(role);

CREATE SEQUENCE seq_participant_id START WITH 1 INCREMENT BY 1;
CREATE TABLE participant_profile (
    profile_code NVARCHAR(20) DEFAULT ('P' + CAST(NEXT VALUE FOR seq_participant_id AS NVARCHAR(20))),
    user_id BIGINT NOT NULL UNIQUE,
    full_name NVARCHAR(255),
    phone_number NVARCHAR(255),
    date_of_birth DATE,
    age AS (DATEDIFF(YEAR, date_of_birth, GETDATE())),
    CONSTRAINT pk_participant_profile PRIMARY KEY (profile_code),
    CONSTRAINT fk_participant_profile_user FOREIGN KEY (user_id) REFERENCES [user](user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE SEQUENCE seq_organizer_id START WITH 1 INCREMENT BY 1;
CREATE TABLE organizer_profile (
    profile_code NVARCHAR(20) DEFAULT ('O' + CAST(NEXT VALUE FOR seq_organizer_id AS NVARCHAR(20))),
    user_id BIGINT NOT NULL UNIQUE,
    official_name NVARCHAR(255),
    tax_id NVARCHAR(255),
    logo_url NVARCHAR(500),
    status NVARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT pk_organizer_profile PRIMARY KEY (profile_code),
    CONSTRAINT chk_organizer_status CHECK (status IN ('VERIFIED', 'PENDING')),
    CONSTRAINT fk_organizer_profile_user FOREIGN KEY (user_id) REFERENCES [user](user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE event (
    event_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255),
    general_introduction NVARCHAR(MAX),
    event_status NVARCHAR(50),
    organizer_id BIGINT NOT NULL,
    start_date_time DATETIME2,
    end_date_time DATETIME2,
    timestamp DATETIME2 DEFAULT GETDATE(),
    poster_url NVARCHAR(500),
    CONSTRAINT chk_event_status CHECK (event_status IN ('DRAFT', 'COMING_SOON','ONGOING', 'CANCELED', 'COMPLETED')),
    CONSTRAINT chk_event_dates CHECK (end_date_time > start_date_time),
    CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id) REFERENCES organizer_profile(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_event_organizer ON event(organizer_id);
CREATE INDEX idx_event_status ON event(event_status);
CREATE INDEX idx_event_start ON event(start_date_time);

CREATE TABLE event_regulation (
    event_id BIGINT,
    aregulation NVARCHAR(500),
    PRIMARY KEY (event_id, aregulation),
    CONSTRAINT fk_event_regulation_event FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE [session] (
    session_id BIGINT IDENTITY(1,1) NOT NULL,
    event_id BIGINT,
    start_date_time DATETIME2,
    end_date_time DATETIME2,
    max_capacity INT,
    type NVARCHAR(255),
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT chk_session_dates CHECK (end_date_time > start_date_time),
    CONSTRAINT chk_session_type CHECK (type IN ('ONLINE', 'OFFLINE')),
    CONSTRAINT chk_session_capacity CHECK (max_capacity > 0),
    CONSTRAINT fk_session_event FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_session_event ON [session](event_id);

CREATE TABLE online_session (
    session_id BIGINT,
    event_id BIGINT,
    meeting_url NVARCHAR(500),
    platform_name NVARCHAR(100),
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT fk_online_session FOREIGN KEY (session_id, event_id) REFERENCES [session](session_id, event_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE offline_session (
    session_id BIGINT,
    event_id BIGINT,
    venue_name NVARCHAR(255),
    venue_address NVARCHAR(500),
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT fk_offline_session FOREIGN KEY (session_id, event_id) REFERENCES [session](session_id, event_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE seat_map (
    seat_map_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    seat_map_url NVARCHAR(500)
);

CREATE TABLE seat (
    seat_id BIGINT,
    seat_map_id BIGINT,
    section_number NVARCHAR(255),
    row_number NVARCHAR(255),
    seat_number NVARCHAR(255),
    PRIMARY KEY (seat_id, seat_map_id),
    CONSTRAINT fk_seat_seatmap FOREIGN KEY (seat_map_id) REFERENCES seat_map(seat_map_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE [use] (
    session_id BIGINT,
    event_id BIGINT,
    seat_map_id BIGINT,
    PRIMARY KEY (session_id, event_id, seat_map_id),
    CONSTRAINT fk_use_session FOREIGN KEY (session_id, event_id) REFERENCES [session](session_id, event_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_use_seatmap FOREIGN KEY (seat_map_id) REFERENCES seat_map(seat_map_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ticket_category (
    category_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(255),
    price DECIMAL(10, 2),
    maximum_slot INT,
    start_date_time DATETIME2,
    end_date_time DATETIME2,
    session_id BIGINT,
    event_id BIGINT,
    CONSTRAINT fk_ticket_category_session FOREIGN KEY (session_id, event_id) REFERENCES [session](session_id, event_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_ticket_price CHECK (price >= 0),
    CONSTRAINT chk_ticket_slots CHECK (maximum_slot > 0),
    CONSTRAINT chk_ticket_dates CHECK (end_date_time > start_date_time)
);
CREATE INDEX idx_ticket_category_session ON ticket_category(session_id, event_id);

CREATE TABLE agreement_term (
    ticket_category_id BIGINT NOT NULL,
    aterm NVARCHAR(500) NOT NULL,
    PRIMARY KEY (ticket_category_id, aterm),
    CONSTRAINT fk_agreement_term_category FOREIGN KEY (ticket_category_id) REFERENCES ticket_category(category_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE [order] (
    order_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_status NVARCHAR(50) NOT NULL,
    currency NVARCHAR(10),
    amount_of_money DECIMAL(10, 2),
    user_id BIGINT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES [participant_profile](user_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE INDEX idx_order_user ON [order](user_id);
CREATE INDEX idx_order_status ON [order](order_status);

CREATE TABLE ticket (
    ticket_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    qr_code_url NVARCHAR(500),
    used_flag BIT NOT NULL DEFAULT 0,
    category_id BIGINT,
    order_id BIGINT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_ticket_category FOREIGN KEY (category_id) REFERENCES ticket_category(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ticket_order FOREIGN KEY (order_id) REFERENCES [order](order_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE INDEX idx_ticket_category ON ticket(category_id);
CREATE INDEX idx_ticket_order ON ticket(order_id);

CREATE TABLE payment_method (
    method_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    charged_fee DECIMAL(10, 2),
    fee_payer NVARCHAR(50)
);

CREATE TABLE bank (
    bank_id BIGINT PRIMARY KEY,
    bank_name NVARCHAR(255),
    method_id BIGINT,
    CONSTRAINT fk_bank_method FOREIGN KEY (method_id) REFERENCES payment_method(method_id) ON DELETE SET NULL
);

CREATE TABLE e_wallet (
    e_wallet_id BIGINT PRIMARY KEY,
    e_wallet_name NVARCHAR(255),
    method_id BIGINT,
    CONSTRAINT fk_ewallet_method FOREIGN KEY (method_id) REFERENCES payment_method(method_id) ON DELETE SET NULL
);

CREATE TABLE paid_by (
    order_id BIGINT PRIMARY KEY,
    method_id BIGINT,
    qr_code_url NVARCHAR(500),
    transaction_id BIGINT IDENTITY(1,1),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_paid_by_order FOREIGN KEY (order_id) REFERENCES [order](order_id) ON DELETE CASCADE,
    CONSTRAINT fk_paid_by_method FOREIGN KEY (method_id) REFERENCES payment_method(method_id)
);
GO

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
    
    SELECT @Revenue = ISNULL(SUM(o.amount_of_money), 0)
    FROM [order] o
    INNER JOIN ticket t ON o.order_id = t.order_id
    INNER JOIN ticket_category tc ON t.category_id = tc.category_id
    WHERE tc.event_id = @EventId
      AND o.order_status IN ('PAID');

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
    SELECT @Sold = COUNT(*) FROM ticket WHERE category_id = @CategoryId;

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
    -- Joins: ticket_category -> ticket -> order (3 tables)
    -- Uses: WHERE, GROUP BY, HAVING, ORDER BY, Aggregate functions
    SELECT 
        tc.category_id AS CategoryId,
        tc.category_name AS CategoryName,
        tc.price AS Price,
        tc.maximum_slot AS TotalCapacity,
        COUNT(t.ticket_id) AS TicketsSold,
        tc.maximum_slot - COUNT(t.ticket_id) AS TicketsAvailable,
        CAST(tc.price * COUNT(t.ticket_id) AS DECIMAL(19,2)) AS Revenue,
        CASE
            WHEN tc.maximum_slot > 0 
            THEN CAST((COUNT(t.ticket_id) * 100.0 / tc.maximum_slot) AS DECIMAL(5,2))
            ELSE 0
        END AS SoldPercentage,
        SUM(CASE WHEN t.used_flag = 1 THEN 1 ELSE 0 END) AS CheckedInCount
    FROM ticket_category tc
    LEFT JOIN ticket t ON tc.category_id = t.category_id
    LEFT JOIN [order] o ON t.order_id = o.order_id AND o.order_status IN ('COMPLETED', 'PENDING')
    WHERE tc.event_id = @EventId
    GROUP BY tc.category_id, tc.category_name, tc.price, tc.maximum_slot
    HAVING COUNT(t.ticket_id) >= @MinTicketsSold
    ORDER BY Revenue DESC, tc.category_name;
    
    -- Return event totals
    SELECT 
        e.event_id AS EventId,
        e.title AS EventTitle,
        dbo.fn_CalculateEventRevenue(@EventId) AS TotalRevenue,
        (SELECT COUNT(*) FROM ticket t
         INNER JOIN ticket_category tc ON t.category_id = tc.category_id
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
    -- Joins across 4 tables: event -> ticket_category -> ticket -> order
    SELECT
        e.event_id AS EventId,
        e.title AS EventTitle,
        e.event_status AS EventStatus,
        e.start_date_time AS StartDateTime,
        COUNT(DISTINCT o.order_id) AS TotalOrders,
        COUNT(t.ticket_id) AS TotalTicketsSold,
        ISNULL(SUM(o.amount_of_money), 0) AS TotalRevenue,
        (SELECT SUM(tc2.maximum_slot) FROM ticket_category tc2
         INNER JOIN [session] s2 ON tc2.session_id = s2.session_id AND tc2.event_id = s2.event_id
         WHERE s2.event_id = e.event_id) AS TotalCapacity,
        CASE 
            WHEN (SELECT SUM(tc2.maximum_slot) FROM ticket_category tc2 
                  INNER JOIN [session] s2 ON tc2.session_id = s2.session_id AND tc2.event_id = s2.event_id
                  WHERE s2.event_id = e.event_id) > 0 
            THEN CAST((COUNT(t.ticket_id) * 100.0 /
                  (SELECT SUM(tc2.maximum_slot) FROM ticket_category tc2
                   INNER JOIN [session] s2 ON tc2.session_id = s2.session_id AND tc2.event_id = s2.event_id
                   WHERE s2.event_id = e.event_id)) AS DECIMAL(5,2))
            ELSE 0 
        END AS CapacityPercentage
    FROM event e
    LEFT JOIN [session] s ON e.event_id = s.event_id
    LEFT JOIN ticket_category tc ON s.session_id = tc.session_id AND s.event_id = tc.event_id
    LEFT JOIN ticket t ON tc.category_id = t.category_id
    LEFT JOIN [order] o ON t.order_id = o.order_id AND o.order_status IN ('COMPLETED', 'PENDING')
    WHERE e.organizer_id = @OrganizerId
      AND e.start_date_time >= @StartDate
      AND e.start_date_time <= @EndDate
    GROUP BY e.event_id, e.title, e.event_status, e.start_date_time
    HAVING ISNULL(SUM(o.amount_of_money), 0) >= @MinRevenue
    ORDER BY TotalRevenue DESC, e.start_date_time DESC;
    
    -- Return organizer summary totals
    SELECT 
        @OrganizerId AS OrganizerId,
        (SELECT official_name FROM organizer_profile WHERE user_id = @OrganizerId) AS OrganizerName,
        COUNT(DISTINCT e.event_id) AS TotalEvents,
        (SELECT COUNT(DISTINCT t2.ticket_id)
         FROM event e2
         LEFT JOIN [session] s2 ON e2.event_id = s2.event_id
         LEFT JOIN ticket_category tc2 ON s2.session_id = tc2.session_id AND s2.event_id = tc2.event_id
         LEFT JOIN ticket t2 ON tc2.category_id = t2.category_id
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
        COUNT(DISTINCT o.order_id) AS OrderCount,
        COUNT(t.ticket_id) AS TicketsSold,
        ISNULL(SUM(o.amount_of_money), 0) AS DailyRevenue
    FROM [order] o
    INNER JOIN ticket t ON o.order_id = t.order_id
    INNER JOIN ticket_category tc ON t.category_id = tc.category_id
    WHERE tc.event_id = @EventId
      AND o.created_at >= DATEADD(DAY, -@Days, GETDATE())
      AND o.order_status IN ('COMPLETED', 'PENDING')
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
        o.order_id AS OrderId,
        ISNULL(pp.full_name, u.email_address) AS CustomerName,
        u.email_address AS CustomerEmail,
        tc.category_name AS TicketCategory,
        COUNT(t.ticket_id) AS Quantity,
        o.amount_of_money AS Amount,
        o.order_status AS Status,
        o.created_at AS PurchaseDate
    FROM [order] o
    INNER JOIN [user] u ON o.user_id = u.user_id
    LEFT JOIN participant_profile pp ON u.user_id = pp.user_id
    INNER JOIN ticket t ON o.order_id = t.order_id
    INNER JOIN ticket_category tc ON t.category_id = tc.category_id
    WHERE tc.event_id = @EventId
    GROUP BY o.order_id, pp.full_name, u.email_address, tc.category_name, o.amount_of_money, o.order_status, o.created_at
    ORDER BY o.created_at DESC;
END;
GO

-- ================================================
-- GRANT PERMISSIONS (if needed)
-- ================================================
-- These will be granted when sManager user is created

PRINT 'Stored procedures, functions, created successfully.';
GO

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
        ISNULL(os.venue_name, ') AS VenueName,
        ISNULL(os.venue_address, ') AS VenueAddress,
        ISNULL(ons.meeting_url, ') AS MeetingUrl,
        ISNULL(ons.platform_name, ') AS PlatformName
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

-- ================================================
-- COMPLETION
-- ================================================

PRINT '================================================================';
PRINT '================================================================';
PRINT '          DATABASE SETUP COMPLETED SUCCESSFULLY!              ';
PRINT '================================================================';
PRINT '================================================================';
PRINT 'Tables created';
PRINT 'Constraints applied';
PRINT 'Functions, Procedures, Triggers installed';
PRINT '================================================================';
PRINT '1. Set spring.flyway.enabled=false in application.properties';
PRINT '2. cd backend && ./mvnw spring-boot:run';
PRINT '3. Access: http://localhost:20001';
PRINT '================================================================';
GO

