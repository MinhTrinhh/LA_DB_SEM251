-- ================================================
-- EventEase Database - Initial Setup Script
-- ================================================
-- Run this script BEFORE starting the Spring Boot application
-- This creates the database, login, and user
-- Execute in SSMS or with sqlcmd:
-- sqlcmd -S localhost -U sa -P YourSaPassword -i V0__create_database.sql
-- ================================================

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EventEase')
BEGIN
    CREATE DATABASE EventEase;
    PRINT 'Database EventEase created successfully.';
END
ELSE
BEGIN
    PRINT 'Database EventEase already exists.';
END
GO

-- Set compatibility level for SQL Server 2022
ALTER DATABASE EventEase SET COMPATIBILITY_LEVEL = 160;
PRINT 'Compatibility level set to 160 (SQL Server 2022).';
GO

-- Optional: Set recovery model for development (use FULL for production)
ALTER DATABASE EventEase SET RECOVERY SIMPLE;
PRINT 'Recovery model set to SIMPLE.';
GO

-- Switch to the EventEase database
USE EventEase;
GO

-- Create login if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'eventease_login')
BEGIN
    CREATE LOGIN eventease_login WITH PASSWORD = 'EventEase@2024!';
    PRINT 'Login eventease_login created successfully.';
END
ELSE
BEGIN
    PRINT 'Login eventease_login already exists.';
END
GO

-- Create user and grant permissions
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'eventease_user')
BEGIN
    CREATE USER eventease_user FOR LOGIN eventease_login;
    PRINT 'User eventease_user created successfully.';
END
ELSE
BEGIN
    PRINT 'User eventease_user already exists.';
END
GO

-- Grant db_owner role to the user (for migrations)
-- In production, consider using more restrictive permissions
IF IS_ROLEMEMBER('db_owner', 'eventease_user') = 0
BEGIN
    ALTER ROLE db_owner ADD MEMBER eventease_user;
    PRINT 'User eventease_user added to db_owner role.';
END
ELSE
BEGIN
    PRINT 'User eventease_user already has db_owner role.';
END
GO

PRINT '================================================';
PRINT 'Database initialization complete!';
PRINT 'You can now start your Spring Boot application.';
PRINT '================================================';
GO

