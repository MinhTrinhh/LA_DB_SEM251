# 📘 Database Setup Instructions

## 🎯 Quick Start

**Event-Ease** database complete setup using a single SQL script.

---

## 📋 Prerequisites

- SQL Server 2022 (Docker or local)
- Azure Data Studio or SSMS
- `sa` password: `Database@251`

---

## 🚀 Setup (3 Steps)

### Step 1: Disable Flyway in Spring Boot

**File:** `backend/src/main/resources/application.properties`

**Find this line:**
```properties
spring.flyway.enabled=true
```

**Change it to:**
```properties
spring.flyway.enabled=false
```

**Why?** 
- The `COMPLETE_DATABASE_SETUP.sql` script creates the entire database with all tables, functions, procedures, and triggers.
- If Flyway is enabled, it will try to run migrations again, causing errors because tables already exist.

---

### Step 2: Ensure SQL Server is Running

**If using Docker:**
```powershell
cd backend
docker-compose up -d
```

**Verify SQL Server is running:**
```powershell
docker ps | Select-String "event-ease"
```

You should see:
```
CONTAINER ID   IMAGE                                        STATUS
xxxxx          mcr.microsoft.com/mssql/server:2022-latest   Up X minutes
```

---

### Step 3: Run the Complete Database Setup Script

**Option A: Using Azure Data Studio (Recommended)**

1. Open **Azure Data Studio**
2. Connect to SQL Server:
   - Server: `localhost,20000`
   - Authentication: SQL Login
   - User: `sa`
   - Password: `Database@251`

3. Open the file: `COMPLETE_DATABASE_SETUP.sql`
4. Click **Run** (or press `F5`)
5. Wait for completion (5-10 seconds)

**Option B: Using Docker + sqlcmd**

```powershell
docker exec -it event-ease /opt/mssql-tools/bin/sqlcmd `
  -S localhost `
  -U sa `
  -P "Database@251" `
  -i /path/to/COMPLETE_DATABASE_SETUP.sql
```

**Option C: Using PowerShell**

```powershell
docker exec -i event-ease /opt/mssql-tools/bin/sqlcmd `
  -S localhost -U sa -P "Database@251" `
  < COMPLETE_DATABASE_SETUP.sql
```

---

### Step 4: Verify Database Creation

**Connect to SQL Server and run:**

```sql
USE [event-ease-db];
GO

-- Check tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Check functions
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

-- Check stored procedures
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- Check triggers
SELECT name 
FROM sys.triggers
ORDER BY name;
```

**Expected Results:**
- ✅ **Tables:** 20+ tables (user, event, session, ticket, order, etc.)
- ✅ **Functions:** 3+ functions (fn_CalculateEventRevenue, fn_GetAvailableTickets, etc.)
- ✅ **Procedures:** 4+ procedures (sp_GetEventSalesSummary, sp_GetOrganizerRevenueReport, etc.)
- ✅ **Triggers:** 4+ triggers (trg_ValidateTicketAvailability, etc.)

---

### Step 5: Start Spring Boot Application

**Navigate to backend directory:**
```powershell
cd backend
```

**Run Spring Boot:**
```powershell
./mvnw spring-boot:run
```

**Expected Output:**
```
Started EventEase251Application in X seconds
Tomcat started on port 20001
```

**Access the application:**
- Backend API: http://localhost:20001
- Swagger UI: http://localhost:20001/swagger-ui.html (if enabled)

---

## ⚠️ Troubleshooting

### Problem: "Database already exists" error

**Solution:**
```sql
USE master;
GO

DROP DATABASE [event-ease-db];
GO
```

Then re-run `COMPLETE_DATABASE_SETUP.sql`.

---

### Problem: Spring Boot fails with "table already exists"

**Cause:** Flyway is still enabled.

**Solution:**
1. Check `application.properties`
2. Ensure `spring.flyway.enabled=false`
3. Restart Spring Boot

---

### Problem: Cannot connect to SQL Server

**Check 1: Is SQL Server running?**
```powershell
docker ps
```

**Check 2: Is port 20000 accessible?**
```powershell
Test-NetConnection -ComputerName localhost -Port 20000
```

**Check 3: Is password correct?**
- Default password: `Database@251`
- Check `docker-compose.yaml` for `SA_PASSWORD`

---

## 🔄 Switching Between Flyway and Manual Setup

### Use Flyway (Fresh Database)

**application.properties:**
```properties
spring.flyway.enabled=true
```

**Steps:**
1. Drop database if exists
2. Start Spring Boot
3. Flyway will create database and run migrations

### Use Manual Setup (Pre-populated Database)

**application.properties:**
```properties
spring.flyway.enabled=false
```

**Steps:**
1. Run `COMPLETE_DATABASE_SETUP.sql`
2. Start Spring Boot
3. Database is ready with all schema and data

---

## 📊 What's Included in COMPLETE_DATABASE_SETUP.sql?

| Component | Description |
|-----------|-------------|
| **V1** | Core schema (user, event, session, ticket_category tables) |
| **V2** | Order and ticket tables |
| **V3** | Functions and stored procedures for reporting |
| **V4** | Event edit procedures and stock validation |
| **V5** | Ticket validation triggers |
| **V6** | Payment method tables |
| **V7** | Event date/time validation trigger |
| **V8** | Event filter and sort functions |
| **V9** | Auto-update event status trigger |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Database `event-ease-db` exists
- [ ] All tables created (20+)
- [ ] All constraints applied
- [ ] Functions installed (3+)
- [ ] Stored procedures installed (4+)
- [ ] Triggers installed (4+)
- [ ] Flyway disabled in `application.properties`
- [ ] Spring Boot starts without errors
- [ ] Can access backend at http://localhost:20001

---

## 📞 Support

If you encounter issues:

1. Check SQL Server logs:
   ```powershell
   docker logs event-ease
   ```

2. Check Spring Boot logs for detailed error messages

3. Verify database connection credentials in `application.properties`

---

**Script Version:** 1.0  
**Last Updated:** December 6, 2025  
**Database:** SQL Server 2022  
**Compatible with:** Spring Boot 3.4.0
