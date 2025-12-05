# 🎯 Poster Storage - Quick Reference

## What Changed?

### Backend ✅
- **EventService:** Auto-sets default poster if none provided
- **Default URL:** `/uploads/posters/default-event-poster.jpg`

### Frontend ✅
- **New Utility:** `utils/posterUrl.ts` - Handles URL construction
- **EventCard:** Uses utility + error fallback
- **EventDetail:** Uses utility + error fallback
- **Index:** Already correct (no changes)

---

## Usage Examples

### Display Event Poster
```typescript
import { getPosterUrl } from '@/utils/posterUrl';

const posterUrl = getPosterUrl(event.posterUrl);

<img 
  src={posterUrl}
  alt={event.title}
  onError={(e) => e.currentTarget.src = '/placeholder.svg'}
/>
```

### Check if Default
```typescript
import { isDefaultPoster } from '@/utils/posterUrl';

if (isDefaultPoster(event.posterUrl)) {
  console.log('Using default poster');
}
```

---

## URL Patterns

| Database Value | Backend Returns | Frontend Displays |
|----------------|----------------|-------------------|
| `/uploads/posters/uuid.jpg` | `/uploads/posters/uuid.jpg` | `http://localhost:20001/uploads/posters/uuid.jpg` |
| `NULL` or empty | `/uploads/posters/default-event-poster.jpg` | `http://localhost:20001/uploads/posters/default-event-poster.jpg` |
| Load fails | - | `/placeholder.svg` (fallback) |

---

## Testing Checklist

- [ ] View event with custom poster → Shows uploaded image
- [ ] View event without poster → Shows default poster
- [ ] Block image in DevTools → Falls back to placeholder
- [ ] Check browser console → No errors
- [ ] Mobile/tablet view → Images responsive

---

## Quick Test

1. **Start backend:** `cd backend && mvn spring-boot:run`
2. **Start frontend:** `cd frontend3 && npm run dev`
3. **Visit:** `http://localhost:20002`
4. **Check:** Event cards show posters correctly

---

## Files Changed

**Backend:**
- `EventService.java` (1 change)

**Frontend:**
- `utils/posterUrl.ts` (NEW)
- `components/EventCard.tsx` (updated)
- `pages/EventDetail.tsx` (updated)

---

## Next: Add File Upload UI

See `POSTER_STORAGE_SYSTEM.md` for how to add file upload to CreateEvent form.

---

**Status:** ✅ Ready to use!

