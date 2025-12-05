# 🔍 Poster URL Display Issue - Debugging Guide

**Issue:** Event posters not displaying on main events page  
**Date:** December 6, 2025  
**Status:** 🔍 **INVESTIGATING**

---

## Symptoms

- Main events page (`/`) shows placeholder images instead of event posters
- Events may have been created before poster upload feature was implemented
- Database may have NULL or empty posterUrl values

---

## Quick Checks

### 1. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
```
📷 Event: {Event Name}, PosterURL: {url or null}
```

**What to look for:**
- `PosterURL: /uploads/posters/uuid.jpg` ✅ Good - poster uploaded
- `PosterURL: null` or `PosterURL: undefined` ❌ Issue - no poster
- `PosterURL: /uploads/posters/default-event-poster.jpg` ⚠️ Using default

### 2. Check Database

```sql
-- Check poster URLs in database
SELECT event_id, title, poster_url
FROM event
WHERE event_status != 'DRAFT'
ORDER BY event_id DESC;
```

**Expected results:**
- Events with uploaded posters: `/uploads/posters/{uuid}.jpg`
- Events without posters: `NULL` or `/uploads/posters/default-event-poster.jpg`

### 3. Check Backend Logs

Look for this in backend console:
```
DEBUG EventService - Event {id}: posterUrl = {url or null}
```

---

## Common Causes

### Cause 1: Old Events with NULL posterUrl

**Symptom:** Events created before poster upload feature have NULL posterUrl

**Solution:** Backend should auto-set default poster (already implemented in EventService)

**Verify:**
```java
// In EventService.java, line ~154-159
String posterUrl = event.getPosterUrl();
if (posterUrl == null || posterUrl.isEmpty()) {
    posterUrl = "/uploads/posters/default-event-poster.jpg";
}
dto.setPosterUrl(posterUrl);
```

### Cause 2: Default Poster Image Missing

**Symptom:** Browser shows 404 for default poster

**Check:**
```bash
ls backend/uploads/posters/default-event-poster.jpg
# Should exist
```

**Solution:** Add default poster image
```bash
# Copy a default image to:
backend/uploads/posters/default-event-poster.jpg
```

### Cause 3: Backend Not Serving Static Files

**Symptom:** All poster URLs return 404

**Check:**
```bash
curl -I http://localhost:20001/uploads/posters/default-event-poster.jpg
# Should return: HTTP 200
```

**Solution:** Verify FileUploadConfig is loaded
```java
// Check FileUploadConfig.java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadDir + "/");
}
```

### Cause 4: Wrong URL Format

**Symptom:** Images try to load from wrong domain

**Check browser Network tab:**
- ❌ Bad: `http://localhost:20002/uploads/posters/...` (frontend port)
- ✅ Good: `http://localhost:20001/uploads/posters/...` (backend port)

**Solution:** Verify getPosterUrl utility
```typescript
// In posterUrl.ts
if (posterUrl.startsWith('/uploads')) {
    return `http://localhost:20001${posterUrl}`;
}
```

---

## Debugging Steps

### Step 1: Add Console Logging

**Already added in Index.tsx:**
```typescript
console.log(`📷 Event: ${backendEvent.title}, PosterURL: ${backendEvent.posterUrl}`);
```

**Check browser console for output**

### Step 2: Inspect Network Requests

1. Open DevTools → Network tab
2. Reload homepage
3. Look for image requests
4. Check status codes:
   - 200 ✅ Image loaded
   - 404 ❌ Image not found
   - 401 ❌ Authentication issue

### Step 3: Check Actual Image URLs

In browser console:
```javascript
// Check what URL is being used
document.querySelectorAll('img').forEach(img => {
  console.log(img.src);
});
```

### Step 4: Test Direct URL Access

Try accessing poster directly:
```
http://localhost:20001/uploads/posters/default-event-poster.jpg
```

Should show image or 404.

---

## Solutions

### Solution 1: Update Existing Events

If events have NULL posterUrl in database:

```sql
-- Set default poster for all events without one
UPDATE event
SET poster_url = '/uploads/posters/default-event-poster.jpg'
WHERE poster_url IS NULL 
   OR poster_url = '';
```

### Solution 2: Add Default Poster Image

Create a simple default poster:
```bash
cd backend/uploads/posters/

# Option 1: Download a generic image
curl -o default-event-poster.jpg https://via.placeholder.com/1200x630?text=Event+Poster

# Option 2: Copy an existing image
cp /path/to/your/image.jpg default-event-poster.jpg
```

### Solution 3: Verify Backend Configuration

Check application.properties:
```properties
file.upload.dir=uploads/posters
```

Restart backend to ensure FileUploadConfig is loaded.

### Solution 4: Check File Permissions

```bash
# Make sure backend can read the files
chmod 755 backend/uploads/posters
chmod 644 backend/uploads/posters/*.jpg
```

---

## Testing After Fix

### Test 1: Check Console Logs
```
Expected output in browser console:
📷 Event: Summer Festival, PosterURL: /uploads/posters/550e8400-...jpg
📷 Event: Tech Conference, PosterURL: /uploads/posters/default-event-poster.jpg
```

### Test 2: Check Image Display
- All events should show images (no broken image icons)
- Hover over images - should see scale animation
- Right-click → "Open image in new tab" - should open successfully

### Test 3: Check Network
- Network tab should show 200 for all image requests
- No 404s for poster images

---

## Quick Fix Commands

### If all events show placeholder:

```bash
# 1. Check backend is running
curl http://localhost:20001/api/events/public

# 2. Check static files are served
curl -I http://localhost:20001/uploads/posters/default-event-poster.jpg

# 3. If 404, check FileUploadConfig loaded
# Restart backend: mvn spring-boot:run

# 4. Add default poster if missing
cd backend/uploads/posters/
echo "Add default-event-poster.jpg here"
```

### Update database for old events:

```sql
-- Set default poster for events without one
UPDATE event
SET poster_url = '/uploads/posters/default-event-poster.jpg'
WHERE poster_url IS NULL;

-- Verify
SELECT event_id, title, poster_url
FROM event
WHERE event_status != 'DRAFT';
```

---

## Prevention

### For Future Events

1. ✅ Poster upload now functional in CreateEvent form
2. ✅ Backend auto-sets default if none uploaded
3. ✅ EventService handles NULL posterUrl gracefully

### Best Practices

1. Always add default-event-poster.jpg to uploads/posters/
2. Test poster display after creating event
3. Verify backend serves static files correctly
4. Check logs for poster URL values

---

## Summary Checklist

When debugging poster display issues:

- [ ] Check browser console for poster URL logs
- [ ] Check database for NULL/empty posterUrl values
- [ ] Verify default-event-poster.jpg exists
- [ ] Test direct access to poster URLs
- [ ] Check Network tab for 404 errors
- [ ] Verify FileUploadConfig is loaded
- [ ] Check file permissions
- [ ] Update old events with default poster

---

## Current Status

✅ **Frontend:** Correctly uses getPosterUrl utility  
✅ **Backend:** Auto-sets default poster for NULL values  
✅ **EventCard:** Has error fallback to placeholder  
🔍 **Issue:** May be missing default poster image OR old events have NULL  

**Next Steps:**
1. Check browser console logs
2. Verify default poster exists
3. Update old events if needed

---

**Last Updated:** December 6, 2025  
**Debug Logging:** Added to Index.tsx  
**Status:** 🔍 Awaiting user feedback from console logs

