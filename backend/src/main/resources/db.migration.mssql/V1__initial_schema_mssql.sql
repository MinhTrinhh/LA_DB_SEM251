-- ================================================
-- EventEase Database - Complete MSSQL Schema
-- ================================================
-- Microsoft SQL Server 2022 Compatible
-- This is a complete schema migration from MySQL to MSSQL
-- ================================================

-- ================================================
-- DATABASE INITIALIZATION
-- ================================================
-- Note: Flyway expects the database to already exist
-- Run these commands manually in SSMS or sqlcmd BEFORE running migrations:
/*
-- Create the database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EventEase')
BEGIN
    CREATE DATABASE EventEase;
END
GO

-- Set compatibility level for SQL Server 2022
ALTER DATABASE EventEase SET COMPATIBILITY_LEVEL = 160;
GO

-- Optional: Set recovery model
ALTER DATABASE EventEase SET RECOVERY SIMPLE;
GO

-- Create login and user (change password in production!)
USE EventEase;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'eventease_login')
BEGIN
    CREATE LOGIN eventease_login WITH PASSWORD = 'EventEase@2024!';
END
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'eventease_user')
BEGIN
    CREATE USER eventease_user FOR LOGIN eventease_login;
    ALTER ROLE db_owner ADD MEMBER eventease_user;
END
GO
*/

-- ================================================
-- CORE USER TABLES
-- ================================================

-- User table (base entity)
CREATE TABLE [user] (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    email_address NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL, --stored as bcrypt hash
    status NVARCHAR(50) DEFAULT 'PENDING',
    timestamp DATETIME2 DEFAULT GETDATE(),
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME2 NULL,

    -- The Row-Based Check Constraint
    CONSTRAINT chk_user_status CHECK (status IN ('AUTHENTICATED', 'SUSPENDED', 'PENDING')),

    -- Constraint 2: The Login Lock Logic
    CONSTRAINT chk_lock_logic CHECK (
        (failed_login_attempts < 5 AND account_locked_until IS NULL)
        OR
        (failed_login_attempts >= 5 AND account_locked_until IS NOT NULL)
    )
);
CREATE INDEX idx_user_lockout ON [user](account_locked_until);

-- User roles table (stores multiple roles per user)
CREATE TABLE user_role (
    user_id BIGINT NOT NULL,
    role NVARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),

    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES [user](user_id)
        ON DELETE CASCADE       ON UPDATE CASCADE,

    CONSTRAINT chk_user_role CHECK (role IN ('ROLE_PARTICIPANT', 'ROLE_ORGANIZER', 'ROLE_ADMIN'))
);
CREATE INDEX idx_user_role_role ON user_role(role);

CREATE SEQUENCE seq_participant_id
    START WITH 1
    INCREMENT BY 1;
CREATE TABLE participant_profile (
    profile_code NVARCHAR(20)
        DEFAULT ('P' + CAST(NEXT VALUE FOR seq_participant_id AS NVARCHAR(20))),

    user_id BIGINT NOT NULL UNIQUE,
    full_name NVARCHAR(255),
    phone_number NVARCHAR(255),
    date_of_birth DATE,

    -- Auto-calculated Age
    age AS (DATEDIFF(YEAR, date_of_birth, GETDATE())),

    CONSTRAINT pk_participant_profile PRIMARY KEY (profile_code),

    CONSTRAINT fk_participant_profile_user FOREIGN KEY (user_id) REFERENCES [user](user_id)
        ON DELETE CASCADE       ON UPDATE CASCADE
);

CREATE SEQUENCE seq_organizer_id
    START WITH 1
    INCREMENT BY 1;
CREATE TABLE organizer_profile (
    profile_code NVARCHAR(20)
        DEFAULT ('O' + CAST(NEXT VALUE FOR seq_organizer_id AS NVARCHAR(20))),

    user_id BIGINT NOT NULL UNIQUE,
    official_name NVARCHAR(255),
    tax_id NVARCHAR(255),
    logo_url NVARCHAR(500),
    status NVARCHAR(50) DEFAULT 'PENDING',

    CONSTRAINT pk_organizer_profile PRIMARY KEY (profile_code),

    CONSTRAINT chk_organizer_status CHECK (status IN ('VERIFIED', 'PENDING')),

    CONSTRAINT fk_organizer_profile_user FOREIGN KEY (user_id) REFERENCES [user](user_id)
        ON DELETE CASCADE       ON UPDATE CASCADE
);

-- ================================================
-- EVENT TABLES
-- ================================================

-- Event table
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

    CONSTRAINT chk_event_status CHECK (
        event_status IN ('DRAFT', 'COMING_SOON','ONGOING', 'CANCELED', 'COMPLETED')),

    CONSTRAINT chk_event_dates CHECK (end_date_time > start_date_time),

    CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id) REFERENCES organizer_profile(user_id)
        ON DELETE CASCADE   ON UPDATE CASCADE
);
CREATE INDEX idx_event_organizer ON event(organizer_id);
CREATE INDEX idx_event_status ON event(event_status);
CREATE INDEX idx_event_start ON event(start_date_time);

-- Event regulations (OneToMany)
CREATE TABLE event_regulation (
    event_id BIGINT,
    aregulation NVARCHAR(500),
    PRIMARY KEY (event_id, aregulation),
    CONSTRAINT fk_event_regulation_event FOREIGN KEY (event_id) REFERENCES event(event_id)
        ON DELETE CASCADE   ON UPDATE CASCADE
);

-- Session table
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

    CONSTRAINT fk_session_event FOREIGN KEY (event_id) REFERENCES event(event_id)
        ON DELETE CASCADE   ON UPDATE CASCADE
);
CREATE INDEX idx_session_event ON [session](event_id);

-- Online session (inheritance)
CREATE TABLE online_session (
    session_id BIGINT,
    event_id BIGINT,
    meeting_url NVARCHAR(500),
    platform_name NVARCHAR(100),
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT fk_online_session FOREIGN KEY (session_id, event_id)
        REFERENCES [session](session_id, event_id) ON DELETE CASCADE    ON UPDATE CASCADE
);

-- Offline session (inheritance)
CREATE TABLE offline_session (
    session_id BIGINT,
    event_id BIGINT,
    venue_name NVARCHAR(255),
    venue_address NVARCHAR(500),
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT fk_offline_session FOREIGN KEY (session_id, event_id)
        REFERENCES [session](session_id, event_id) ON DELETE CASCADE    ON UPDATE CASCADE
);

-- Seat map
CREATE TABLE seat_map (
    seat_map_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    seat_map_url NVARCHAR(500)
);

-- Seat table (weak entity)
CREATE TABLE seat (
    seat_id BIGINT,
    seat_map_id BIGINT,
    section_number NVARCHAR(255),
    row_number NVARCHAR(255),
    seat_number NVARCHAR(255),
    PRIMARY KEY (seat_id, seat_map_id),
    CONSTRAINT fk_seat_seatmap FOREIGN KEY (seat_map_id)
        REFERENCES seat_map(seat_map_id) ON DELETE CASCADE  ON UPDATE CASCADE
);

-- Use relationship (Session uses SeatMap)
CREATE TABLE [use] (
    session_id BIGINT,
    event_id BIGINT,
    seat_map_id BIGINT,
    PRIMARY KEY (session_id, event_id, seat_map_id),

    CONSTRAINT fk_use_session FOREIGN KEY (session_id, event_id)
        REFERENCES [session](session_id, event_id) ON DELETE CASCADE    ON UPDATE CASCADE,

    CONSTRAINT fk_use_seatmap FOREIGN KEY (seat_map_id)
        REFERENCES seat_map(seat_map_id) ON DELETE CASCADE  ON UPDATE CASCADE
);

-- ================================================
-- TICKET TABLES
-- ================================================

-- Ticket category
CREATE TABLE ticket_category (
    category_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(255),
    price DECIMAL(10, 2),
    maximum_slot INT,
    start_date_time DATETIME2,
    end_date_time DATETIME2,

    session_id BIGINT,
    event_id BIGINT,

    -- Ticket category belongs to a session (organizer can choose different categories per session)
    CONSTRAINT fk_ticket_category_session FOREIGN KEY (session_id, event_id)
        REFERENCES [session](session_id, event_id) ON DELETE CASCADE    ON UPDATE CASCADE,

    -- Check constraints for data integrity
    CONSTRAINT chk_ticket_price CHECK (price >= 0),
    CONSTRAINT chk_ticket_slots CHECK (maximum_slot > 0),
    CONSTRAINT chk_ticket_dates CHECK (end_date_time > start_date_time)
);
CREATE INDEX idx_ticket_category_session ON ticket_category(session_id, event_id);


-- Agreement terms (OneToMany)
CREATE TABLE agreement_term (
    ticket_category_id BIGINT NOT NULL,
    aterm NVARCHAR(500) NOT NULL,
    PRIMARY KEY (ticket_category_id, aterm),
    CONSTRAINT fk_agreement_term_category FOREIGN KEY (ticket_category_id)
        REFERENCES ticket_category(category_id) ON DELETE CASCADE   ON UPDATE CASCADE
);

-- -- Ticket
-- CREATE TABLE ticket (
--     ticket_id BIGINT IDENTITY(1,1) PRIMARY KEY,
--     qr_code_url NVARCHAR(500),
--     used_flag BIT,
--     category_id BIGINT,
--     order_id BIGINT,
--     CONSTRAINT fk_ticket_category FOREIGN KEY (category_id)
--         REFERENCES ticket_category(category_id)
-- );
-- CREATE INDEX idx_ticket_category ON ticket(category_id);
-- CREATE INDEX idx_ticket_order ON ticket(order_id);
--
-- -- ================================================
-- -- ORDER AND PAYMENT TABLES
-- -- ================================================
--
-- -- Order table
-- CREATE TABLE [order] (
--     order_id BIGINT IDENTITY(1,1) PRIMARY KEY,
--     order_status NVARCHAR(50),
--     currency NVARCHAR(10),
--     amount_of_money DECIMAL(10, 2),
--     user_id BIGINT,
--     CONSTRAINT fk_order_user FOREIGN KEY (user_id)
--         REFERENCES [user](user_id) ON DELETE CASCADE
-- );
-- CREATE INDEX idx_order_user ON [order](user_id);
-- CREATE INDEX idx_order_status ON [order](order_status);
--
-- -- Update ticket foreign key
-- ALTER TABLE ticket
-- ADD CONSTRAINT fk_ticket_order FOREIGN KEY (order_id)
--     REFERENCES [order](order_id);
--
-- -- Payment method
-- CREATE TABLE payment_method (
--     method_id BIGINT IDENTITY(1,1) PRIMARY KEY,
--     charged_fee DECIMAL(10, 2),
--     fee_payer NVARCHAR(50)
-- );
--
-- -- Bank (payment method subtype)
-- CREATE TABLE bank (
--     method_id BIGINT PRIMARY KEY,
--     bank_id NVARCHAR(100),
--     bank_name NVARCHAR(255),
--     CONSTRAINT fk_bank_method FOREIGN KEY (method_id)
--         REFERENCES payment_method(method_id) ON DELETE CASCADE
-- );
--
-- -- E-wallet (payment method subtype)
-- CREATE TABLE e_wallet (
--     method_id BIGINT PRIMARY KEY,
--     e_wallet_id NVARCHAR(100),
--     e_wallet_name NVARCHAR(255),
--     CONSTRAINT fk_ewallet_method FOREIGN KEY (method_id)
--         REFERENCES payment_method(method_id) ON DELETE CASCADE
-- );
--
-- -- Paid by (Order - Payment Method relationship)
-- CREATE TABLE paid_by (
--     order_id BIGINT PRIMARY KEY,
--     method_id BIGINT NOT NULL,
--     qr_code_url NVARCHAR(500),
--     transaction_id NVARCHAR(255),
--     timestamp DATETIME2 DEFAULT GETDATE(),
--     CONSTRAINT fk_paid_by_order FOREIGN KEY (order_id)
--         REFERENCES [order](order_id) ON DELETE CASCADE,
--     CONSTRAINT fk_paid_by_method FOREIGN KEY (method_id)
--         REFERENCES payment_method(method_id)
-- );
--
-- -- Payout account
-- CREATE TABLE payout_account (
--     account_id BIGINT IDENTITY(1,1) PRIMARY KEY,
--     account_number NVARCHAR(255),
--     organizer_id BIGINT,
--     method_id BIGINT,
--     CONSTRAINT fk_payout_account_organizer FOREIGN KEY (organizer_id)
--         REFERENCES [user](user_id) ON DELETE CASCADE,
--     CONSTRAINT fk_payout_account_method FOREIGN KEY (method_id)
--         REFERENCES payment_method(method_id) ON DELETE SET NULL
-- );
-- CREATE INDEX idx_payout_account_organizer ON payout_account(organizer_id);
--
-- -- Refund
-- CREATE TABLE refund (
--     refunded_id BIGINT IDENTITY(1,1) PRIMARY KEY,
--     refund_amount DECIMAL(10, 2),
--     reason NVARCHAR(500),
--     request_unit NVARCHAR(255),
--     order_id BIGINT,
--     CONSTRAINT fk_refund_order FOREIGN KEY (order_id)
--         REFERENCES [order](order_id) ON DELETE CASCADE
-- );
-- CREATE INDEX idx_refund_order ON refund(order_id);
--
-- -- ================================================
-- -- DISCOUNT TABLES
-- -- ================================================
--
-- -- Discount
-- CREATE TABLE discount (
--     discount_id BIGINT IDENTITY(1,1) PRIMARY KEY,
--     discount_percent DECIMAL(5, 2),
--     max_discount_amount DECIMAL(10, 2),
--     expired_date_time DATETIME2,
--     usage_limit INT
-- );
--
-- -- Applied to (Discount - Ticket relationship)
-- CREATE TABLE applied_to (
--     discount_id BIGINT NOT NULL,
--     ticket_id BIGINT NOT NULL,
--     PRIMARY KEY (discount_id, ticket_id),
--     CONSTRAINT fk_applied_to_discount FOREIGN KEY (discount_id)
--         REFERENCES discount(discount_id) ON DELETE CASCADE,
--     CONSTRAINT fk_applied_to_ticket FOREIGN KEY (ticket_id)
--         REFERENCES ticket(ticket_id) ON DELETE CASCADE
-- );
--
-- -- Used for (Discount - TicketCategory relationship)
-- CREATE TABLE used_for (
--     discount_id BIGINT NOT NULL,
--     category_id BIGINT NOT NULL,
--     PRIMARY KEY (discount_id, category_id),
--     CONSTRAINT fk_used_for_discount FOREIGN KEY (discount_id)
--         REFERENCES discount(discount_id) ON DELETE CASCADE,
--     CONSTRAINT fk_used_for_category FOREIGN KEY (category_id)
--         REFERENCES ticket_category(category_id) ON DELETE CASCADE
-- );
--
-- -- ================================================
-- -- SOCIAL TABLES
-- -- ================================================
--
-- -- Invited by (User - User relationship)
-- CREATE TABLE invited_by (
--     invitee_id BIGINT PRIMARY KEY,
--     invitor_id BIGINT NOT NULL,
--     CONSTRAINT fk_invited_by_invitee FOREIGN KEY (invitee_id)
--         REFERENCES [user](user_id) ON DELETE CASCADE,
--     CONSTRAINT fk_invited_by_invitor FOREIGN KEY (invitor_id)
--         REFERENCES [user](user_id) ON DELETE NO ACTION
-- );
--
-- -- Tied with (Ticket - Seat relationship)
-- CREATE TABLE tied_with (
--     seat_id BIGINT NOT NULL,
--     seat_map_id BIGINT NOT NULL,
--     ticket_id BIGINT NOT NULL,
--     PRIMARY KEY (seat_id, seat_map_id, ticket_id),
--     CONSTRAINT fk_tied_with_seat FOREIGN KEY (seat_id, seat_map_id)
--         REFERENCES seat(seat_id, seat_map_id) ON DELETE CASCADE,
--     CONSTRAINT fk_tied_with_ticket FOREIGN KEY (ticket_id)
--         REFERENCES ticket(ticket_id) ON DELETE CASCADE
-- );
--
-- -- Database administrator (legacy - if needed)
-- CREATE TABLE database_administrator (
--     user_id BIGINT PRIMARY KEY,
--     administrator_name NVARCHAR(255),
--     CONSTRAINT fk_database_administrator_user FOREIGN KEY (user_id)
--         REFERENCES [user](user_id) ON DELETE CASCADE
-- );

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
-- All tables and constraints have been created
-- Database schema migrated to MSSQL Server 2022
-- ================================================

