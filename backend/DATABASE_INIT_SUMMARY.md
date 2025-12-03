# Database Initialization Summary

## What's Been Set Up

I've created a complete database initialization system for your EventEase project. Here's what's included:

## Files Created

### 1. **V0__create_database.sql**
Location: `backend/src/main/resources/db.migration.mssql/V0__create_database.sql`

This SQL script creates:
- The `EventEase` database
- The `eventease_login` server login with password `EventEase@2024!`
- The `eventease_user` database user
- Grants `db_owner` permissions to the user

**Important:** This script must be run BEFORE starting the Spring Boot application.

### 2. **V1__initial_schema_mssql.sql** (Updated)
Location: `backend/src/main/resources/db.migration.mssql/V1__initial_schema_mssql.sql`

Updated to include comments about database initialization. This script creates:
- All tables (user, user_role, participant_profile, organizer_profile, event, session, etc.)
- All constraints and indexes
- Sequences for profile codes

This script will be automatically executed by Flyway when the application starts.

### 3. **application.properties** (Updated)
Location: `backend/src/main/resources/application.properties`

Updated database connection settings:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:20000;databaseName=EventEase;encrypt=false;trustServerCertificate=true
spring.datasource.username=eventease_user
spring.datasource.password=EventEase@2024!
```

### 4. **setup-database.sh** (Automated Script for Mac/Linux)
Location: `backend/setup-database.sh`

A bash script that automates the entire setup process:
- Starts Docker and SQL Server container
- Waits for SQL Server to be ready
- Executes the database initialization script
- Verifies the setup

### 5. **setup-database.bat** (Automated Script for Windows)
Location: `backend/setup-database.bat`

Windows batch file version of the setup script with the same functionality.

### 6. **DATABASE_SETUP.md** (Comprehensive Guide)
Location: `backend/DATABASE_SETUP.md`

A detailed guide covering:
- Prerequisites
- Step-by-step manual setup instructions
- Troubleshooting common issues
- Configuration details
- Security notes

## How to Use

### Quick Start (Automated - Recommended)

**On Mac/Linux:**
```bash
cd backend
chmod +x setup-database.sh
./setup-database.sh
```

**On Windows:**
```cmd
cd backend
setup-database.bat
```

### Manual Setup

If you prefer to do it manually or the automated script doesn't work:

1. **Start SQL Server:**
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Initialize Database:**
   
   **Using sqlcmd:**
   ```bash
   sqlcmd -S localhost,20000 -U sa -P "Database@251" -i src/main/resources/db.migration.mssql/V0__create_database.sql
   ```
   
   **Or using SSMS:**
   - Connect to `localhost,20000` with user `sa` and password `Database@251`
   - Open and execute `V0__create_database.sql`

3. **Start Application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Flyway will automatically run the V1 migration to create all tables.

## Key Changes Made

1. **Database Name:** Changed from `event-ease-db` to `EventEase` for consistency
2. **User Credentials:** Created dedicated user `eventease_user` instead of using SA account
3. **Flyway Path:** Confirmed as `classpath:db.migration.mssql`
4. **Automated Scripts:** Added scripts for easy setup and sharing with teammates

## What Happens When You Start the Application

1. Spring Boot connects to the `EventEase` database using `eventease_user`
2. Flyway checks the `flyway_schema_history` table
3. If V1 migration hasn't run, Flyway executes it automatically
4. All tables, constraints, and sequences are created
5. Application is ready to use

## Verification

After running the setup, verify everything is working:

```sql
USE EventEase;

-- Check tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Check Flyway history
SELECT * FROM flyway_schema_history;
```

You should see:
- 13+ tables created
- V1 migration in flyway_schema_history with success=true

## Sharing with Teammates

Your teammates can now easily set up the database by:

1. **Clone the repository**
2. **Run the setup script:**
   - Mac/Linux: `./setup-database.sh`
   - Windows: `setup-database.bat`
3. **Start the application:**
   - `./mvnw spring-boot:run` (Mac/Linux)
   - `mvnw.cmd spring-boot:run` (Windows)

## Important Notes

⚠️ **Passwords in the scripts are for development only!**
- Change them before deploying to production
- Use environment variables for sensitive data
- Never commit production credentials to Git

⚠️ **The V0 script is NOT run by Flyway**
- Flyway only runs migrations starting with V1
- V0 must be executed manually before first application start
- This is by design - database creation requires higher privileges

## Troubleshooting

If you encounter issues:

1. **Check Docker:** `docker ps` - ensure SQL Server container is running
2. **Check Logs:** 
   - Application: `logs/event-ease-backend.log`
   - Docker: `docker-compose logs`
3. **Reset Database:** See DATABASE_SETUP.md for reset instructions
4. **Connection Issues:** Verify port 20000 is not blocked

## File Structure

```
backend/
├── setup-database.sh         # Mac/Linux setup script
├── setup-database.bat         # Windows setup script
├── DATABASE_SETUP.md          # Detailed setup guide
├── docker-compose.yaml        # SQL Server configuration
└── src/main/resources/
    ├── application.properties # Updated with EventEase DB
    └── db.migration.mssql/
        ├── V0__create_database.sql      # Manual: Creates DB & user
        └── V1__initial_schema_mssql.sql # Auto: Creates tables
```

## Summary

✅ Database initialization is now automated
✅ Teammates can easily set up the database
✅ Flyway will handle schema migrations automatically
✅ Comprehensive documentation provided
✅ Both manual and automated options available

You're all set! Run the setup script and then start your Spring Boot application.

