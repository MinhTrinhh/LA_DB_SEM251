# 🔧 FINAL FIX: Poster 403 Error - Step by Step

**Current Status:** Still getting 403 errors after SecurityConfig update  
**Issue:** Backend not restarted properly OR configuration not loading

---

## IMMEDIATE ACTION REQUIRED

### Step 1: STOP Backend Completely
```bash
# In the terminal running the backend, press:
Ctrl + C

# OR kill all Java processes:
pkill -9 java
```

### Step 2: Clean and Compile
```bash
cd "/Users/minhtrinh/Downloads/Database System/LA_DB_SEM_251/backend"
mvn clean compile
```

**Wait for:** `BUILD SUCCESS`

### Step 3: Start Backend Fresh
```bash
mvn spring-boot:run
```

### Step 4: Watch for These Logs

**You MUST see this on startup:**
```
=== WebSecurityCustomizer: Configuring to ignore /uploads/** ===
=== Ignoring Spring Security for /uploads/** ===
```

**If you DON'T see these logs, the configuration is not loading!**

### Step 5: Test Direct Access

Once backend is running, test in a NEW terminal:
```bash
curl -I http://localhost:20001/uploads/posters/06450c9d-e2b9-4b13-bc02-557707c05779.png
```

**Expected:** `HTTP/1.1 200 OK`  
**If 403/401:** Configuration still not working

---

## What Changed in SecurityConfig

Added `WebSecurityCustomizer` bean that tells Spring Security to completely ignore `/uploads/**`:

```java
@Bean
public WebSecurityCustomizer webSecurityCustomizer() {
    System.out.println("=== WebSecurityCustomizer: Configuring to ignore /uploads/** ===");
    return (web) -> {
        System.out.println("=== Ignoring Spring Security for /uploads/** ===");
        web.ignoring().requestMatchers("/uploads/**");
    };
}
```

This completely bypasses Spring Security for uploaded files.

---

## After Backend Restarts

### What Should Happen:

1. **Startup logs show:**
   ```
   === WebSecurityCustomizer: Configuring to ignore /uploads/** ===
   === Ignoring Spring Security for /uploads/** ===
   Upload directory exists: /absolute/path/to/uploads/posters
   Configuring resource handler:
     Pattern: /uploads/**
     Location: file:/absolute/path/to/uploads/posters/
   ```

2. **Request logs should NOT show "Securing GET /uploads/..."**
   - Before: `Securing GET /uploads/posters/...` ❌
   - After: (no security logs for /uploads/**) ✅

3. **Browser console:**
   ```
   📷 Event: event1, PosterURL: /uploads/posters/06450c9d-...png
   📷 Event: event2, PosterURL: /uploads/posters/d70a8a1d-...webp
   
   (No 403/401 errors!)
   ```

4. **Network tab:**
   ```
   GET /uploads/posters/06450c9d-...png → 200 OK
   GET /uploads/posters/d70a8a1d-...webp → 200 OK
   ```

---

## If Still Not Working After Restart

### Check 1: Verify Logs Show Ignoring
```bash
# Check backend startup logs for:
grep "Ignoring Spring Security" backend-logs.txt

# Should show:
# === Ignoring Spring Security for /uploads/** ===
```

### Check 2: Verify Files Exist
```bash
ls -lh "backend/uploads/posters/"

# Should show your PNG and WEBP files
```

### Check 3: Test with curl
```bash
# Direct test
curl -v http://localhost:20001/uploads/posters/06450c9d-e2b9-4b13-bc02-557707c05779.png -o test.png

# Should download the file successfully
```

### Check 4: Verify SecurityConfig.java
```bash
grep -A 5 "WebSecurityCustomizer" backend/src/main/java/org/minhtrinh/eventease251/config/SecurityConfig.java

# Should show the new bean with logging
```

---

## Complete Restart Checklist

- [ ] Stop backend (Ctrl+C or pkill -9 java)
- [ ] Run: `mvn clean compile`
- [ ] See: BUILD SUCCESS
- [ ] Run: `mvn spring-boot:run`
- [ ] See startup log: "Ignoring Spring Security for /uploads/**"
- [ ] Test: `curl -I http://localhost:20001/uploads/posters/06450c9d-...png`
- [ ] See: HTTP/1.1 200 OK
- [ ] Refresh browser
- [ ] See: Posters display (no 403 errors)

---

## Why This Fix Works

**The Problem:**
- Using `.requestMatchers("/uploads/**").permitAll()` tells Spring Security to ALLOW the request
- But Spring Security still processes it (authentication, filters, etc.)
- The authentication entry point was still rejecting anonymous requests

**The Solution:**
- Using `web.ignoring().requestMatchers("/uploads/**")` tells Spring Security to COMPLETELY IGNORE the path
- Spring Security doesn't process these requests AT ALL
- Files are served directly by FileUploadConfig resource handler
- No authentication, no filters, no rejections

---

## Summary

✅ **Added:** `WebSecurityCustomizer` bean with logging  
✅ **Effect:** `/uploads/**` completely bypassed by Spring Security  
✅ **Action:** MUST restart backend for changes to take effect  
✅ **Verification:** Check logs for "Ignoring Spring Security" message  

**RESTART BACKEND NOW AND CHECK LOGS!**

---

**Last Updated:** December 6, 2025  
**Status:** ⏳ Awaiting backend restart

