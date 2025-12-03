# EventEase Database Setup Guide

## Overview
This guide will help you set up the MSSQL database for the EventEase application.

## Prerequisites
- Microsoft SQL Server 2022 (or compatible version)
- SQL Server Management Studio (SSMS) or `sqlcmd` command-line tool
- Docker with SQL Server running on port 20000 (as per docker-compose.yaml)

## Step-by-Step Setup

### Step 1: Ensure SQL Server is Running

If using Docker, start your SQL Server container:
```bash
cd backend
docker-compose up -d
```

Verify the container is running:
```bash
docker ps | grep mssql
```

### Step 2: Initialize the Database

You have two options to initialize the database:

#### Option A: Using SQL Server Management Studio (SSMS)

1. Open SSMS
2. Connect to your SQL Server instance:
   - Server: `localhost,20000`
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: `Database@251` (from your docker-compose.yaml)

3. Open the initialization script:
   - File → Open → File
   - Navigate to: `backend/src/main/resources/db.migration.mssql/V0__create_database.sql`

4. Execute the script (F5 or click Execute)

5. Verify the database was created:
   - Refresh the Databases node in Object Explorer
   - You should see `EventEase` database

#### Option B: Using sqlcmd Command Line

From the terminal, run:

```bash
cd backend/src/main/resources/db.migration.mssql

sqlcmd -S localhost,20000 -U sa -P "Database@251" -i V0__create_database.sql
```

**Note:** If you get connection errors, make sure:
- SQL Server is accepting TCP/IP connections
- Port 20000 is not blocked by firewall
- The Docker container is running

### Step 3: Verify Database Setup

Connect to the EventEase database and check:

```sql
USE EventEase;
GO

-- Check if user exists
SELECT name FROM sys.database_principals WHERE name = 'eventease_user';
GO

-- Check if login exists
SELECT name FROM sys.server_principals WHERE name = 'eventease_login';
GO
```

You should see both `eventease_user` and `eventease_login` in the results.

### Step 4: Start the Spring Boot Application

The application will automatically run Flyway migrations on startup:

```bash
cd backend
./mvnw spring-boot:run
```

Or if using Maven wrapper:
```bash
cd backend
mvn spring-boot:run
```

### Step 5: Verify Migrations

Check the Flyway schema history table:

```sql
USE EventEase;
GO

SELECT * FROM flyway_schema_history ORDER BY installed_rank;
GO
```

You should see the migration `V1__initial_schema_mssql` with success status.

### Step 6: Verify Tables Were Created

```sql
USE EventEase;
GO

-- List all tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
```

You should see tables like:
- `user`
- `user_role`
- `participant_profile`
- `organizer_profile`
- `event`
- `session`
- `online_session`
- `offline_session`
- `seat_map`
- `seat`
- `ticket_category`
- etc.

## Troubleshooting

### Issue: Database Already Exists

If you need to start fresh:

```sql
-- WARNING: This will delete all data!
DROP DATABASE EventEase;
GO
```

Then run the initialization script again.

### Issue: Login Already Exists

If you need to reset the login:

```sql
USE EventEase;
GO
DROP USER eventease_user;
GO
DROP LOGIN eventease_login;
GO
```

Then run the initialization script again.

### Issue: Flyway Baseline Error

If Flyway complains about baseline:

```sql
USE EventEase;
GO
DROP TABLE IF EXISTS flyway_schema_history;
GO
```

Then restart the Spring Boot application.

### Issue: Connection Refused

1. Check if SQL Server is running:
   ```bash
   docker ps
   ```

2. Check if port 20000 is accessible:
   ```bash
   telnet localhost 20000
   ```

3. Check Docker logs:
   ```bash
   docker-compose logs mssql
   ```

### Issue: Authentication Failed

Verify your credentials in `application.properties`:
- Database name: `EventEase`
- Username: `eventease_user`
- Password: `EventEase@2024!`

Or use SA account for testing:
- Username: `sa`
- Password: `Database@251`

## Configuration Files

### Database Connection
Location: `backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:sqlserver://localhost:20000;databaseName=EventEase;encrypt=false;trustServerCertificate=true
spring.datasource.username=eventease_user
spring.datasource.password=EventEase@2024!
```

### Flyway Configuration
```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db.migration.mssql
spring.flyway.table=flyway_schema_history
```

## Security Notes

⚠️ **Important for Production:**

1. Change the default passwords:
   - SA password
   - eventease_login password
   - JWT secret key
   - reCAPTCHA keys

2. Use more restrictive database permissions instead of `db_owner` role

3. Enable encryption for SQL Server connections

4. Use environment variables for sensitive configuration

## Additional Resources

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [SQL Server Docker Setup](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker)
- [Spring Boot with Flyway](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)

## Support

If you encounter issues not covered in this guide, check:
1. Application logs: `backend/logs/event-ease-backend.log`
2. Docker logs: `docker-compose logs`
3. SQL Server error logs

