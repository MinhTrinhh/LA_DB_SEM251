#!/bin/bash

# ================================================
# EventEase Database Initialization Script
# ================================================
# This script automates the database setup process
# ================================================

set -e  # Exit on error

echo "================================================"
echo "EventEase Database Setup"
echo "================================================"
echo ""

# Configuration
SERVER="localhost,20000"
SA_USER="sa"
SA_PASSWORD="Database@251"
SCRIPT_DIR="src/main/resources/db.migration.mssql"
INIT_SCRIPT="V0__create_database.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "1. Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Start SQL Server container
echo "2. Starting SQL Server container..."
docker-compose up -d
echo -e "${GREEN}✓ SQL Server container started${NC}"
echo ""

# Wait for SQL Server to be ready
echo "3. Waiting for SQL Server to be ready..."
echo "   This may take 30-60 seconds..."
RETRY_COUNT=0
MAX_RETRIES=30
until docker exec event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}Error: SQL Server did not start in time.${NC}"
        echo "Check logs with: docker-compose logs"
        exit 1
    fi
    echo -n "."
    sleep 2
done
echo ""
echo -e "${GREEN}✓ SQL Server is ready${NC}"
echo ""

# Initialize database
echo "4. Initializing EventEase database..."
if [ ! -f "$SCRIPT_DIR/$INIT_SCRIPT" ]; then
    echo -e "${RED}Error: Initialization script not found at $SCRIPT_DIR/$INIT_SCRIPT${NC}"
    exit 1
fi

# Execute initialization script
docker exec -i event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U "$SA_USER" -P "$SA_PASSWORD" < "$SCRIPT_DIR/$INIT_SCRIPT"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database initialized successfully${NC}"
else
    echo -e "${RED}Error: Database initialization failed${NC}"
    exit 1
fi
echo ""

# Verify database
echo "5. Verifying database setup..."
VERIFY_RESULT=$(docker exec event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U "$SA_USER" -P "$SA_PASSWORD" -Q "SELECT name FROM sys.databases WHERE name = 'EventEase'" -h -1)

if echo "$VERIFY_RESULT" | grep -q "EventEase"; then
    echo -e "${GREEN}✓ EventEase database exists${NC}"
else
    echo -e "${RED}Error: EventEase database was not created${NC}"
    exit 1
fi
echo ""

# Verify user
VERIFY_USER=$(docker exec event-ease /opt/mssql-tools/bin/sqlcmd -S localhost -U "$SA_USER" -P "$SA_PASSWORD" -d EventEase -Q "SELECT name FROM sys.database_principals WHERE name = 'eventease_user'" -h -1)

if echo "$VERIFY_USER" | grep -q "eventease_user"; then
    echo -e "${GREEN}✓ eventease_user exists${NC}"
else
    echo -e "${YELLOW}⚠ Warning: eventease_user was not created${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Start the backend application:"
echo "     ./mvnw spring-boot:run"
echo ""
echo "  2. The application will automatically run Flyway migrations"
echo ""
echo "  3. Check the logs at: logs/event-ease-backend.log"
echo ""
echo "Database connection details:"
echo "  Server: localhost:20000"
echo "  Database: EventEase"
echo "  Username: eventease_user"
echo "  Password: EventEase@2024!"
echo ""

