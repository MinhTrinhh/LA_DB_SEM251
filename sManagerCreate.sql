USE [event-ease-db];
GO

-- CC07-Group02 - Submission 1

-- Step 1: Create SQL Server Login
CREATE LOGIN sManager WITH PASSWORD = 'Manager@251';
GO

-- Step 2: Create Database User
CREATE USER sManager FOR LOGIN sManager;
GO

-- Step 3: Grant Full Permissions
ALTER ROLE db_owner ADD MEMBER sManager;
GRANT CONTROL ON DATABASE::[event-ease-db] TO sManager;
GRANT CREATE TABLE TO sManager;
GRANT CREATE VIEW TO sManager;
GRANT CREATE PROCEDURE TO sManager;
GRANT CREATE FUNCTION TO sManager;
GRANT EXECUTE TO sManager;
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO sManager;
GO