# 🔧 Poster Display Issue - Resolution Guide

**Issue:** Event posters not displaying on main events page  
**Date:** December 6, 2025  
**Status:** ✅ **DEBUG LOGGING ADDED + SOLUTIONS PROVIDED**

---

## What I've Done

### 1. ✅ Added Debug Logging

**File:** `frontend3/src/pages/Index.tsx`

Added console logging to track poster URLs:
```typescript
console.log(`📷 Event: ${backendEvent.title}, PosterURL: ${backendEvent.posterUrl}`);
```

**How to use:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the homepage
4. Look for logs like: `📷 Event: Event Name, PosterURL: /uploads/posters/...`

### 2. ✅ Verified Code Flow

The poster display system is correctly implemented:

```
Backend Event → posterUrl field
    ↓
Index.tsx: event.image = backendEvent.posterUrl || '/placeholder.svg'
    ↓
EventCard: posterUrl = getPosterUrl(event.image)
    ↓
getPosterUrl utility: prepends http://localhost:20001 if starts with /uploads
    ↓
<img src={posterUrl} /> with onError fallback
```

**Everything is wired correctly!** ✅

---

## Most Likely Causes

### 🎯 Cause #1: Events Have NULL posterUrl (Most Common)

**If events were created before poster upload feature:**
- Database has `poster_url = NULL`
- Backend should auto-set default, but events might pre-date this fix
- Frontend shows placeholder

**Solution A - Update Database:**
```sql
-- Set default poster for all events without one
UPDATE event
SET poster_url = '/uploads/posters/default-event-poster.jpg'
WHERE poster_url IS NULL 
   OR poster_url = '';

-- Verify the update
SELECT event_id, title, poster_url
FROM event
WHERE event_status != 'DRAFT'
ORDER BY event_id;
```

**Solution B - Backend Auto-Fix (Already Implemented):**
The EventService already tries to set default:
```java
String posterUrl = event.getPosterUrl();
if (posterUrl == null || posterUrl.isEmpty()) {
    posterUrl = "/uploads/posters/default-event-poster.jpg";
}
dto.setPosterUrl(posterUrl);
```

**But** this only works for *new* queries. Restart backend to ensure this code is active.

---

### 🎯 Cause #2: Default Poster Image Missing

**Check if file exists:**
```bash
ls backend/uploads/posters/default-event-poster.jpg
```

**If not found, create it:**

**Option 1 - Simple placeholder:**
```bash
cd backend/uploads/posters/
curl -o default-event-poster.jpg "https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=Event+Poster"
```

**Option 2 - Use any image:**
```bash
cd backend/uploads/posters/
# Copy any JPG image you have
cp /path/to/your/image.jpg default-event-poster.jpg
```

**Recommended specs:**
- Size: 1200x630px (Open Graph standard)
- Format: JPG
- Content: Generic event/calendar imagery

---

### 🎯 Cause #3: Backend Not Serving Static Files

**Test direct access:**
```bash
curl -I http://localhost:20001/uploads/posters/default-event-poster.jpg
```

**Expected:** `HTTP/1.1 200`  
**If 404:** Backend not serving files correctly

**Solution:**
1. Verify `FileUploadConfig.java` is loaded
2. Check `application.properties` has:
   ```properties
   file.upload.dir=uploads/posters
   ```
3. Restart backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

---

## Step-by-Step Resolution

### Step 1: Check What's in Console

1. Open homepage (`http://localhost:20002`)
2. Open DevTools (F12) → Console tab
3. Look for logs: `📷 Event: ..., PosterURL: ...`

**Interpret results:**

| Console Output | Meaning | Solution |
|----------------|---------|----------|
| `PosterURL: null` | Database has NULL | Run SQL update or restart backend |
| `PosterURL: undefined` | Same as null | Run SQL update or restart backend |
| `PosterURL: /uploads/posters/uuid.jpg` | Has custom poster | Check if file exists |
| `PosterURL: /uploads/posters/default-event-poster.jpg` | Using default | Check if default file exists |

### Step 2: Check Network Tab

1. Stay in DevTools, go to Network tab
2. Refresh page
3. Filter by "Img" 
4. Look at poster image requests

**What to look for:**

| Status | Request URL | Meaning |
|--------|-------------|---------|
| 200 | `http://localhost:20001/uploads/posters/...` | ✅ Working |
| 404 | `http://localhost:20001/uploads/posters/...` | ❌ File not found |
| Failed | Any URL | ❌ Backend not running |

### Step 3: Apply Appropriate Fix

**If console shows NULL/undefined:**
```sql
-- Fix in database
UPDATE event
SET poster_url = '/uploads/posters/default-event-poster.jpg'
WHERE poster_url IS NULL OR poster_url = '';
```

**If console shows path but 404:**
```bash
# Add default poster
cd backend/uploads/posters/
# Add default-event-poster.jpg file here
```

**If backend not serving files:**
```bash
# Restart backend
cd backend
mvn spring-boot:run
```

### Step 4: Verify Fix

1. Refresh homepage
2. Check console - should show poster URLs
3. Check Network - should show 200 for images
4. Visual - should see event posters, not placeholders

---

## Quick Diagnostic Commands

### Check Database
```sql
-- See what poster URLs are in database
SELECT event_id, title, poster_url
FROM event
WHERE event_status != 'DRAFT'
ORDER BY event_id;
```

### Check Files
```bash
# List uploaded posters
ls -lh backend/uploads/posters/

# Expected files:
# - .gitignore
# - .gitkeep
# - README.md
# - default-event-poster.jpg
# - {uuid}.jpg (uploaded posters)
```

### Check Backend Endpoint
```bash
# Test if backend serves files
curl -I http://localhost:20001/uploads/posters/default-event-poster.jpg

# Should return: HTTP/1.1 200 OK
```

### Check Backend API
```bash
# Get event data
curl http://localhost:20001/api/events/public | jq '.[0].posterUrl'

# Should return: "/uploads/posters/..." or null
```

---

## Expected Behavior After Fix

### Homepage Display
```
┌─────────────────────────────────────────┐
│ Featured Events                         │
├─────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │[Poster]│  │[Poster]│  │[Poster]│   │
│  │  img   │  │  img   │  │  img   │   │
│  ├────────┤  ├────────┤  ├────────┤   │
│  │Event 1 │  │Event 2 │  │Event 3 │   │
│  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────┘
```

### Browser Console
```
📷 Event: Summer Festival, PosterURL: /uploads/posters/550e8400-...jpg
📷 Event: Tech Meetup, PosterURL: /uploads/posters/default-event-poster.jpg
📷 Event: Workshop, PosterURL: /uploads/posters/a1b2c3d4-...jpg
```

### Network Tab
```
GET /uploads/posters/550e8400-...jpg  →  200 OK  (2.3 MB)
GET /uploads/posters/default-event-poster.jpg  →  200 OK  (500 KB)
GET /uploads/posters/a1b2c3d4-...jpg  →  200 OK  (1.8 MB)
```

---

## Prevention for Future

### When Creating Events
1. ✅ Use `/organizer/create` with poster upload
2. ✅ Backend auto-sets default if none uploaded
3. ✅ All new events will have posterUrl

### Database Maintenance
```sql
-- Periodic check for NULL posters
SELECT COUNT(*) 
FROM event 
WHERE poster_url IS NULL 
  AND event_status != 'DRAFT';

-- Should return: 0
```

### Monitoring
- Check backend logs for "posterUrl = null" warnings
- Monitor 404s for poster images in access logs
- Verify default-event-poster.jpg exists

---

## Summary

**Problem:** Posters not displaying on main events page

**Root Cause (Most Likely):**
- Events created before poster system have NULL posterUrl
- OR default-event-poster.jpg file missing

**Solution:**
1. ✅ Check browser console logs (now added)
2. Update database to set default poster for NULL values
3. Add default-event-poster.jpg file if missing
4. Restart backend to ensure auto-fix is active

**Code Status:**
- ✅ Frontend poster display: CORRECT
- ✅ Backend poster handling: CORRECT  
- ✅ EventCard component: CORRECT
- ✅ getPosterUrl utility: CORRECT
- 🔍 Data issue: Need to fix NULL values in database

---

## Next Steps

### Immediate Action Required:

1. **Check browser console** - Open homepage and see what poster URLs show
2. **Share console output** - Tell me what you see for posterUrl values
3. **Based on output**, I'll provide exact fix

### Most Likely Fix:

```sql
-- Run this SQL query
UPDATE event
SET poster_url = '/uploads/posters/default-event-poster.jpg'
WHERE poster_url IS NULL;
```

Then refresh homepage - posters should appear!

---

**Files Modified:**
- ✅ `Index.tsx` - Added debug logging

**Documentation Created:**
- ✅ `POSTER_DISPLAY_DEBUG.md` - Debug guide
- ✅ `POSTER_DISPLAY_RESOLUTION.md` - This file

**Status:** ⏳ **Awaiting console logs from user to identify exact cause**

---

**Last Updated:** December 6, 2025  
**Debug Ready:** Yes - check browser console  
**Most Likely Fix:** SQL UPDATE to set default poster

