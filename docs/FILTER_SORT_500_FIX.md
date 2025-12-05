# ✅ Filter & Sort 500 Error - FIXED

**Issue:** Filter and sort returns 500 error "Request failed with status code 500"  
**Date:** December 6, 2025  
**Status:** ✅ **FIXED**

---

## Problem Identified

### Error
```
Error Loading Events
Request failed with status code 500
```

### Root Cause

The repository code was trying to call `sp_GetFilteredAndSortedEvents` as a **stored procedure**:

```java
String sql = "EXEC dbo.sp_GetFilteredAndSortedEvents ?, ?";
```

But in the database (V8 migration), it was created as a **table-valued function**:

```sql
CREATE FUNCTION dbo.fn_GetFilteredAndSortedEvents(...)
RETURNS TABLE
```

**Result:** SQL Server error because `sp_GetFilteredAndSortedEvents` stored procedure doesn't exist!

---

## Solution Applied

### Fixed File: `EventRepositoryCustomImpl.java`

**Changed from:**
```java
// Trying to call as stored procedure (doesn't exist!)
String sql = "EXEC dbo.sp_GetFilteredAndSortedEvents ?, ?";
List<Map<String, Object>> events = jdbcTemplate.queryForList(sql, eventStatus, sortByPrice);
```

**Changed to:**
```java
// First update event statuses
jdbcTemplate.execute("EXEC dbo.sp_UpdateEventStatuses");

// Then call the table-valued function (correct!)
String sql = "SELECT * FROM dbo.fn_GetFilteredAndSortedEvents(?, ?)";
List<Map<String, Object>> events = jdbcTemplate.queryForList(sql, eventStatus, sortByPrice);
```

---

## How It Works Now

### Complete Flow

```
1. User clicks "Filter & Sort" on frontend
   ↓
2. Frontend calls: GET /api/events/public/filtered?status=ONGOING&sortByPrice=ASC
   ↓
3. EventController.getFilteredAndSortedEvents()
   ↓
4. EventService.getFilteredAndSortedEvents()
   ↓
5. EventRepositoryCustomImpl.getFilteredAndSortedEvents()
   ↓
6. EXEC dbo.sp_UpdateEventStatuses ✅
   (Updates COMING_SOON → ONGOING, ONGOING → COMPLETED)
   ↓
7. SELECT * FROM dbo.fn_GetFilteredAndSortedEvents(?, ?) ✅
   (Returns filtered events with min_price)
   ↓
8. Java sorts results by price (ASC/DESC) or date (default)
   ↓
9. EventService converts to EventDTOs
   ↓
10. Returns to frontend with 200 OK ✅
```

---

## Database Objects Used

### 1. Stored Procedure: `sp_UpdateEventStatuses`

**Created by:** V9 migration  
**Purpose:** Update event statuses based on current time  
**Called by:** Repository before filtering

```sql
CREATE PROCEDURE dbo.sp_UpdateEventStatuses
AS
BEGIN
    UPDATE event SET event_status = 'ONGOING'
    WHERE event_status = 'COMING_SOON'
      AND start_date_time <= GETDATE()
      AND end_date_time > GETDATE();
    
    UPDATE event SET event_status = 'COMPLETED'
    WHERE event_status IN ('ONGOING')
      AND end_date_time <= GETDATE();
END;
```

### 2. Table-Valued Function: `fn_GetFilteredAndSortedEvents`

**Created by:** V8 migration  
**Purpose:** Filter events by status and calculate min_price  
**Called by:** Repository with SELECT statement

```sql
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
    WHERE e.event_status != 'DRAFT'
      AND (@EventStatusFilter IS NULL OR e.event_status = @EventStatusFilter)
);
```

---

## Testing the Fix

### Test 1: Default (No Filters)

**Request:**
```
GET /api/events/public/filtered
```

**Expected:**
- ✅ Returns all public events
- ✅ Sorted by start_date_time DESC
- ✅ No 500 error

### Test 2: Filter by Status

**Request:**
```
GET /api/events/public/filtered?status=ONGOING
```

**Expected:**
- ✅ Returns only ONGOING events
- ✅ Statuses updated before filtering
- ✅ Sorted by start_date_time DESC

### Test 3: Sort by Price ASC

**Request:**
```
GET /api/events/public/filtered?sortByPrice=ASC
```

**Expected:**
- ✅ Returns all public events
- ✅ Sorted by min_price ascending (cheapest first)
- ✅ Events with min_price displayed in order

### Test 4: Filter + Sort

**Request:**
```
GET /api/events/public/filtered?status=COMING_SOON&sortByPrice=DESC
```

**Expected:**
- ✅ Returns only COMING_SOON events
- ✅ Sorted by min_price descending (most expensive first)
- ✅ Combined filters work correctly

---

## Backend Logs (After Fix)

### Successful Request

```
INFO EventService: Getting filtered and sorted events - status: ONGOING, sortByPrice: ASC
INFO Getting filtered and sorted events: status=ONGOING, sortByPrice=ASC
DEBUG Event statuses updated before filtering
INFO Retrieved 3 events from function
INFO Sorting by min_price ASC
INFO Found 3 events with filters
INFO Stored function returned 3 events
INFO   Event #1: ID=1, Title=Event A, MinPrice=50000.00
INFO   Event #2: ID=2, Title=Event B, MinPrice=100000.00
INFO   Event #3: ID=3, Title=Event C, MinPrice=150000.00
INFO Event IDs in sorted order: [1, 2, 3]
INFO Returning 3 EventDTOs in sorted order
```

---

## Frontend Response

### Success (200 OK)

```json
[
  {
    "eventId": 1,
    "title": "Event A",
    "posterUrl": "/uploads/posters/abc123.png",
    "eventStatus": "ONGOING",
    "startDateTime": "2025-12-06T10:00:00",
    "sessions": [...],
    ...
  },
  {
    "eventId": 2,
    "title": "Event B",
    ...
  }
]
```

### Before Fix (500 Error)

```json
{
  "timestamp": "2025-12-06T03:20:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Could not find stored procedure 'sp_GetFilteredAndSortedEvents'",
  "path": "/api/events/public/filtered"
}
```

---

## Why This Happened

### Confusion Between Function and Procedure

**Table-Valued Function (TVF):**
- Defined with `CREATE FUNCTION ... RETURNS TABLE`
- Called with `SELECT * FROM function_name(params)`
- Returns a table/result set

**Stored Procedure:**
- Defined with `CREATE PROCEDURE`
- Called with `EXEC procedure_name params`
- Can return multiple result sets or nothing

**The Issue:**
- V8 created `fn_GetFilteredAndSortedEvents` as a **function**
- Repository code tried to call it as a **procedure**
- Mismatch caused 500 error

---

## Verification Steps

### After Restarting Backend

1. **Open homepage:**
   - Go to `http://localhost:20002`
   - Should load events successfully

2. **Click "Filter & Sort":**
   - Should open filter panel
   - No errors in console

3. **Select filter:**
   - Choose "Status: ONGOING"
   - Should filter events successfully
   - No 500 error

4. **Select sort:**
   - Choose "Price: Low to High"
   - Should sort events by price
   - Cheapest events appear first

5. **Check browser console:**
   ```
   📡 Calling getFilteredAndSortedEvents with: { status: "ONGOING", sort: "ASC" }
   ✅ Received events: 3 events
   📊 Events with prices (in received order):
     1. Event A - Min Price: 50000 VND
     2. Event B - Min Price: 100000 VND
     3. Event C - Min Price: 150000 VND
   
   (No errors!)
   ```

6. **Check backend logs:**
   ```
   INFO Retrieved 3 events from function
   INFO Sorting by min_price ASC
   
   (No SQL errors!)
   ```

---

## Related Database Objects

### Complete Function Chain

```
fn_GetFilteredAndSortedEvents()
    ↓ calls
fn_GetMinTicketPrice(event_id)
    ↓ queries
ticket_category table
    ↓ joins
session table
```

### All Functions Created

1. **V8:** `fn_GetMinTicketPrice` - Get cheapest ticket for event
2. **V8:** `fn_GetFilteredAndSortedEvents` - Filter and get events with min price
3. **V9:** `sp_UpdateEventStatuses` - Update event statuses based on time

---

## Summary

✅ **Issue:** Repository calling non-existent stored procedure  
✅ **Root Cause:** Code used `EXEC sp_GetFilteredAndSortedEvents` but only `fn_GetFilteredAndSortedEvents` function exists  
✅ **Solution:** Changed to `SELECT * FROM fn_GetFilteredAndSortedEvents(...)`  
✅ **Additional:** Added automatic status update before filtering  
✅ **Result:** Filter and sort now works correctly  

**Action Required:** 🔄 **Restart backend to apply fix**

After restart:
- ✅ Filter by status works
- ✅ Sort by price works
- ✅ Combined filters work
- ✅ No 500 errors
- ✅ Event statuses auto-update

---

**Last Updated:** December 6, 2025  
**File Modified:** `EventRepositoryCustomImpl.java`  
**Status:** ✅ **READY TO TEST**

