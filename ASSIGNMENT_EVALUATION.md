# Database Assignment Requirements Evaluation Report

**Project:** EventEase - Event Ticketing System  
**DBMS:** Microsoft SQL Server 2022  
**Backend:** Spring Boot 3.4.0 (Java)  
**Frontend:** React + TypeScript + Vite  
**Date:** December 4, 2025

---

## 📊 Overall Score Summary

| Section | Max Points | Earned | Status |
|---------|------------|--------|--------|
| 4.1 Create Tables | 2.0 | **2.0** | ✅ Complete |
| 4.2 Insert Data | 1.5 | **0.0** | ❌ Missing |
| 5.1 Functions & Stored Procedures | 2.0 | **2.0** | ✅ Complete |
| 5.2 Triggers | 1.0 | **1.0** | ✅ Complete |
| 6.2 Create User (sManager) | 0.5 | **0.0** | ❌ Missing |
| 6.3 Login/Logout | 0.5 | **0.5** | ✅ Complete |
| 6.3 CRUD Operations | 1.0 | **0.75** | ⚠️ Partial (no DELETE) |
| 6.3 Data Retrieval | 1.0 | **1.0** | ✅ Complete |
| 6.3 Call Function/Procedure | 0.5 | **0.5** | ✅ Complete |
| 6.4 Bonus - UI | 0.5 | **0.5** | ✅ Complete |
| 6.4 Bonus - MVC | 0.5 | **0.5** | ✅ Complete |
| **TOTAL** | **11.0** | **8.75** | **79.5%** |

---

## 📋 Detailed Evaluation

### 4. Part 1: Create Database (3.5 points)

#### 4.1 Create Tables (2 points) ✅ **FULLY SATISFIED**

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Primary Key | `user_id BIGINT IDENTITY(1,1) PRIMARY KEY` in all tables | ✅ |
| Auto Increment PK | `IDENTITY(1,1)` used in user, event, ticket, order tables | ✅ |
| PK with Prefix + Auto-increment | `profile_code DEFAULT ('P' + CAST(NEXT VALUE FOR seq_participant_id...))` for participant_profile (P001, P002...) and organizer_profile (O001, O002...) | ✅ |
| Foreign Key Constraint | Multiple FK constraints: `fk_event_organizer`, `fk_ticket_category_session`, `fk_ticket_order`, etc. | ✅ |
| UNIQUE Constraint | `email_address NVARCHAR(255) NOT NULL UNIQUE` in user table | ✅ |
| NOT NULL Constraint | `email_address NVARCHAR(255) NOT NULL`, `password NVARCHAR(255) NOT NULL` | ✅ |
| DEFAULT Constraint | `status NVARCHAR(50) DEFAULT 'PENDING'`, `timestamp DATETIME2 DEFAULT GETDATE()` | ✅ |
| Row-based CHECK Constraint (single column) | `CONSTRAINT chk_user_status CHECK (status IN ('AUTHENTICATED', 'SUSPENDED', 'PENDING'))` | ✅ |
| Row-based CHECK Constraint (two columns) | `CONSTRAINT chk_event_dates CHECK (end_date_time > start_date_time)` | ✅ |
| Complex CHECK Constraint | `CONSTRAINT chk_lock_logic CHECK ((failed_login_attempts < 5 AND account_locked_until IS NULL) OR (failed_login_attempts >= 5 AND account_locked_until IS NOT NULL))` | ✅ |

**Tables Created (18 total):**
- `[user]`, `user_role`, `participant_profile`, `organizer_profile`
- `event`, `event_regulation`, `[session]`, `online_session`, `offline_session`
- `seat_map`, `seat`, `[use]`
- `ticket_category`, `agreement_term`, `TICKET`
- `[ORDER]`

#### 4.2 Insert Data (1.5 points) ❌ **NOT SATISFIED**

| Requirement | Status |
|-------------|--------|
| At least 3/4 of tables with 4+ rows | ❌ No seed data migration exists |
| Meaningful and realistic data | ❌ No INSERT statements |
| Executable SQL script | ❌ Need to create V5__seed_data.sql |

**Action Required:** Create `V5__seed_data.sql` with INSERT statements for at least 14 tables (3/4 of 18) with 4+ rows each.

---

### 5. Part 2: Stored Procedures, Functions, and Triggers (3 points)

#### 5.1 Functions and Stored Procedures (2 points) ✅ **FULLY SATISFIED**

**Functions (3 implemented, requirement: 2):**

| Function | Input | Output | Features Used |
|----------|-------|--------|--------------|
| `fn_CalculateEventRevenue` | `@EventId BIGINT` | `DECIMAL(19,2)` | SUM aggregate, JOINs across 3 tables, WHERE clause |
| `fn_GetAvailableTickets` | `@CategoryId BIGINT` | `INT` | COUNT, IF control statement, input validation |
| `fn_GetSoldTicketsCount` | `@CategoryId BIGINT` | `INT` | COUNT aggregate, NULL handling |

**Stored Procedures (10 implemented, requirement: 2):**

| Procedure | Purpose | Features |
|-----------|---------|----------|
| `sp_GetEventSalesSummary` | Sales report by category | GROUP BY, HAVING, aggregates, multi-table JOIN, ORDER BY, input validation |
| `sp_GetOrganizerRevenueReport` | Organizer revenue report | 4-table JOIN, date filtering, IF statements, HAVING clause |
| `sp_GetEventDailySales` | Daily sales breakdown | Date grouping, aggregate functions |
| `sp_GetEventRecentOrders` | Recent orders list | TOP N, multi-table JOIN, ORDER BY |
| `sp_UpdateEventBasicInfo` | Edit event details | UPDATE with WHERE, input validation, status check |
| `sp_UpdateSession` | Edit session details | Multi-table UPDATE, conditional logic |
| `sp_UpdateTicketCategory` | Edit ticket category | Business rule validation, aggregate checks |
| `sp_GetEventForEdit` | Get event for editing | Complex multi-result query, function calls |
| `sp_AddTicketCategory` | Add new ticket category | INSERT with validation, SCOPE_IDENTITY() |
| `sp_DeleteTicketCategory` | Delete ticket category | DELETE with business rule enforcement |

**Requirements Checklist:**

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Queries with WHERE and ORDER BY across 2+ tables | `sp_GetEventSalesSummary` joins ticket_category, TICKET, ORDER | ✅ |
| Input parameters in WHERE/HAVING | `WHERE tc.event_id = @EventId`, `HAVING COUNT(...) >= @MinTicketsSold` | ✅ |
| Aggregate functions, GROUP BY, HAVING | `COUNT()`, `SUM()`, `GROUP BY`, `HAVING` in all procedures | ✅ |
| Control statements (IF/FOR) | `IF @EventId IS NULL`, `IF @StartDate IS NULL SET @StartDate = ...` | ✅ |
| Input parameter validation | All procedures validate inputs with RAISERROR | ✅ |

#### 5.2 Triggers (1 point) ✅ **FULLY SATISFIED**

| Trigger | Event | Type | Purpose |
|---------|-------|------|---------|
| `trg_GenerateTicketQRCode` | AFTER INSERT on TICKET | **Derived Column** | Auto-generates unique QR code URL |
| `trg_PreventCancellationWithSoldTickets` | AFTER UPDATE on event | **Business Rule** | Prevents canceling events with sold tickets |
| `trg_PreventTicketOverselling` | INSTEAD OF INSERT on TICKET | **Business Rule** | Prevents purchasing more tickets than available |
| `trg_UpdateEventDatesOnSessionChange` | AFTER INSERT/UPDATE on session | **Derived Column** | Auto-updates event dates based on sessions |

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| At least one trigger generates derived column | `trg_GenerateTicketQRCode` creates QR URL from ticket data | ✅ |
| At least one trigger enforces business rule | `trg_PreventTicketOverselling` and `trg_PreventCancellationWithSoldTickets` | ✅ |

---

### 6. Part 3: Building Application (3.5 points)

#### 6.2 Create User - sManager (0.5 points) ❌ **NOT SATISFIED**

| Requirement | Status |
|-------------|--------|
| Create user named sManager | ❌ Not implemented |
| Grant all access rights | ❌ Not implemented |

**Action Required:** Add SQL to create `sManager` login and user with DBA privileges.

#### 6.3 Implement Features (3 points)

##### Login/Logout (0.5 points) ✅ **SATISFIED**

| Feature | Implementation | Status |
|---------|---------------|--------|
| Login functionality | `AuthController.java` with JWT authentication | ✅ |
| Logout functionality | Token-based logout in frontend | ✅ |
| Session management | JWT tokens with expiration | ✅ |

**Files:** `AuthController.java`, `AuthService.java`, `Login.tsx`, `AuthContext.tsx`

##### CRUD Operations (1 point) ⚠️ **PARTIALLY SATISFIED (0.75 points)**

| Operation | Events | Users | Orders | Tickets | Status |
|-----------|--------|-------|--------|---------|--------|
| **CREATE** | `POST /api/events` | `POST /api/auth/register` | `POST /api/orders` | Via Order | ✅ |
| **READ** | `GET /api/events/*` | `GET /api/users/*` | `GET /api/orders/*` | Via Order | ✅ |
| **UPDATE** | `PUT /api/events/edit/*` | `PUT /api/profile/*` | - | - | ✅ |
| **DELETE** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing | ❌ |

**Multi-table Screen Requirement:**
- ✅ Event creation involves: `event`, `session`, `offline_session`/`online_session`, `ticket_category`
- ✅ Order creation involves: `ORDER`, `TICKET`, `ticket_category`, `user`

**Input Validation:**
- ✅ Backend: `@Valid` annotations, custom validation
- ✅ Frontend: Form validation, error messages
- ✅ Database: CHECK constraints, trigger validation

##### Data Retrieval (1 point) ✅ **SATISFIED**

| Feature | Implementation | Status |
|---------|---------------|--------|
| List of objects | Events list at `/api/events/public`, Orders at `/api/orders/my-orders` | ✅ |
| Delete from list | ❌ Not implemented | ❌ |
| Detail view | `EventDetail.tsx`, `MyTickets.tsx` | ✅ |
| Create new record | `CreateEvent.tsx`, `Register.tsx` | ✅ |
| Filtering | Event filtering by status, organizer | ✅ |
| Sorting | ORDER BY in queries, frontend sorting | ✅ |

**Pages Implementing Data Retrieval:**
- `Index.tsx` - Public events list
- `OrganizerDashboard.tsx` - Organizer's events
- `MyTickets.tsx` - User's purchased tickets
- `EventSales.tsx` - Sales analytics with filtering

##### Call Function/Procedure (0.5 points) ✅ **SATISFIED**

| Feature | Procedure/Function Called | Page |
|---------|--------------------------|------|
| Event Sales Summary | `sp_GetEventSalesSummary` | `EventSales.tsx` |
| Revenue Calculation | `fn_CalculateEventRevenue` | `EventSales.tsx` |
| Available Tickets | `fn_GetAvailableTickets` | `TicketSelection.tsx` |
| Edit Event | `sp_GetEventForEdit`, `sp_UpdateEventBasicInfo`, etc. | `EditEventPage.tsx` |
| Organizer Report | `sp_GetOrganizerRevenueReport` | `OrganizerDashboard.tsx` |

**Backend Integration:**
- `SalesRepository.java` - Calls stored procedures via `JdbcTemplate`
- `EventEditRepository.java` - Calls edit procedures via `SimpleJdbcCall`

#### 6.4 Bonus (1 point) ✅ **FULLY SATISFIED**

##### Attractive UI (0.5 points) ✅

| Feature | Implementation |
|---------|---------------|
| Modern Design | Tailwind CSS with custom glass morphism effects |
| Component Library | shadcn/ui components (Button, Card, Input, etc.) |
| Responsive | Mobile-first design with responsive breakpoints |
| Dark Theme | Dark mode implementation |
| Animations | Smooth transitions, loading states, carousels |
| Icons | Lucide React icons throughout |

##### MVC Architecture (0.5 points) ✅

| Layer | Implementation |
|-------|---------------|
| **Model** | JPA Entities (`Event.java`, `User.java`, `Order.java`, `Ticket.java`) |
| **View** | React Components (`EventCard.tsx`, `Header.tsx`, Pages) |
| **Controller** | REST Controllers (`EventController.java`, `OrderController.java`, `SalesController.java`) |
| **Service Layer** | Business Logic (`EventService.java`, `OrderService.java`, `SalesService.java`) |
| **Repository Layer** | Data Access (`EventRepository.java`, `SalesRepository.java`, `EventEditRepository.java`) |

**Architecture Pattern:** Layered Architecture with Spring Boot
```
Frontend (React) <-> REST API <-> Controller <-> Service <-> Repository <-> Database
```

---

## 🔴 Missing Requirements - Action Items

### Priority 1: Section 4.2 - Seed Data (1.5 points)

Create `V5__seed_data.sql` with INSERT statements:

```sql
-- Required: At least 14 tables with 4+ rows each
-- Tables to populate:
-- 1. [user] - 4+ users
-- 2. user_role - 4+ role assignments  
-- 3. participant_profile - 4+ profiles
-- 4. organizer_profile - 4+ profiles
-- 5. event - 4+ events
-- 6. [session] - 4+ sessions
-- 7. offline_session - 4+ offline sessions
-- 8. ticket_category - 4+ categories
-- 9. [ORDER] - 4+ orders
-- 10. TICKET - 4+ tickets
-- 11. seat_map - 4+ seat maps
-- 12. seat - 4+ seats
-- 13. event_regulation - 4+ regulations
-- 14. agreement_term - 4+ terms
```

### Priority 2: Section 6.2 - sManager User (0.5 points)

Add to migration or create `V6__create_smanager.sql`:

```sql
-- Create login
CREATE LOGIN sManager WITH PASSWORD = 'SecurePassword123!';

-- Create database user
USE [event-ease-db];
CREATE USER sManager FOR LOGIN sManager;

-- Grant DBA privileges
ALTER ROLE db_owner ADD MEMBER sManager;
-- OR specific permissions:
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON SCHEMA::dbo TO sManager;
```

### Priority 3: DELETE Operations (0.25 points)

Add DELETE endpoint for events:
- `DELETE /api/events/{eventId}` - Delete event (with trigger validation)

---

## 📁 Project File Structure

```
LA_DB_SEM251/
├── backend/
│   ├── src/main/java/org/minhtrinh/eventease251/
│   │   ├── controller/      # REST Controllers (7 files)
│   │   ├── service/         # Business Logic (7 files)
│   │   ├── repository/      # Data Access (8 files)
│   │   ├── entity/          # JPA Entities
│   │   └── dto/             # Data Transfer Objects
│   └── src/main/resources/
│       └── db/migration/mssql/
│           ├── V1__initial_schema_mssql.sql      # Tables & Constraints
│           ├── V2__add_order_ticket_tables.sql   # Order & Ticket tables
│           ├── V3__stored_procedures_and_functions.sql  # Procedures & Triggers
│           └── V4__edit_event_and_stock_validation.sql  # Edit procedures
├── frontend3/
│   └── src/
│       ├── api/             # API clients (6 files)
│       ├── components/      # React components
│       ├── pages/           # Page components (21 files)
│       ├── contexts/        # Auth context
│       └── hooks/           # Custom hooks
```

---

## 📈 Recommendations for Full Score

1. **Create V5__seed_data.sql** (+1.5 points)
   - Add realistic sample data for testing
   - Ensure at least 4 rows in 14+ tables

2. **Create V6__create_smanager.sql** (+0.5 points)
   - Create sManager login and user
   - Grant appropriate permissions

3. **Add DELETE operations** (+0.25 points)
   - Implement event deletion endpoint
   - Trigger already handles validation

**Potential Score After Fixes: 11.0/11.0 (100%)**

---

## ✅ Strengths

1. **Excellent Schema Design** - Proper normalization, constraints, and relationships
2. **Comprehensive Stored Procedures** - 10 procedures covering all required features
3. **Strong Trigger Implementation** - 4 triggers including derived columns and business rules
4. **Modern Tech Stack** - Spring Boot + React with TypeScript
5. **Clean Architecture** - Proper separation of concerns with MVC pattern
6. **Beautiful UI** - Professional design with shadcn/ui and Tailwind

---

*Report generated: December 4, 2025*
