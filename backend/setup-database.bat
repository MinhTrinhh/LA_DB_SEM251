@echo off
REM ================================================
REM EventEase Database Initialization Script (Windows)
REM ================================================
REM This script automates the database setup process
REM ================================================

setlocal enabledelayedexpansion

echo ================================================
echo EventEase Database Setup
echo ================================================
echo.

REM Configuration
set SERVER=localhost,20000
set SA_USER=sa
set SA_PASSWORD=Database@251
set SCRIPT_DIR=src\main\resources\db.migration.mssql
set INIT_SCRIPT=V0__create_database.sql

REM Check if Docker is running
echo 1. Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Start SQL Server container
echo 2. Starting SQL Server container...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start SQL Server container
    exit /b 1
)
echo [OK] SQL Server container started
echo.

REM Wait for SQL Server to be ready
echo 3. Waiting for SQL Server to be ready...
echo    This may take 30-60 seconds...
set RETRY_COUNT=0
set MAX_RETRIES=30

:wait_loop
docker exec event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "%SA_PASSWORD%" -Q "SELECT 1" >nul 2>&1
if not errorlevel 1 goto server_ready

set /a RETRY_COUNT+=1
if %RETRY_COUNT% geq %MAX_RETRIES% (
    echo.
    echo [ERROR] SQL Server did not start in time.
    echo Check logs with: docker-compose logs
    exit /b 1
)

echo|set /p=.
timeout /t 2 /nobreak >nul
goto wait_loop

:server_ready
echo.
echo [OK] SQL Server is ready
echo.

REM Initialize database
echo 4. Initializing EventEase database...
if not exist "%SCRIPT_DIR%\%INIT_SCRIPT%" (
    echo [ERROR] Initialization script not found at %SCRIPT_DIR%\%INIT_SCRIPT%
    exit /b 1
)

REM Execute initialization script
docker exec -i event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U "%SA_USER%" -P "%SA_PASSWORD%" < "%SCRIPT_DIR%\%INIT_SCRIPT%"
if errorlevel 1 (
    echo [ERROR] Database initialization failed
    exit /b 1
)
echo [OK] Database initialized successfully
echo.

REM Verify database
echo 5. Verifying database setup...
docker exec event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U "%SA_USER%" -P "%SA_PASSWORD%" -Q "SELECT name FROM sys.databases WHERE name = 'EventEase'" -h -1 | find "EventEase" >nul
if errorlevel 1 (
    echo [ERROR] EventEase database was not created
    exit /b 1
)
echo [OK] EventEase database exists
echo.

REM Verify user
docker exec event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U "%SA_USER%" -P "%SA_PASSWORD%" -d EventEase -Q "SELECT name FROM sys.database_principals WHERE name = 'eventease_user'" -h -1 | find "eventease_user" >nul
if errorlevel 1 (
    echo [WARNING] eventease_user was not created
) else (
    echo [OK] eventease_user exists
)
echo.

echo ================================================
echo Database setup completed successfully!
echo ================================================
echo.
echo Next steps:
echo   1. Start the backend application:
echo      mvnw.cmd spring-boot:run
echo.
echo   2. The application will automatically run Flyway migrations
echo.
echo   3. Check the logs at: logs\event-ease-backend.log
echo.
echo Database connection details:
echo   Server: localhost:20000
echo   Database: EventEase
echo   Username: eventease_user
echo   Password: EventEase@2024!
echo.

endlocal

