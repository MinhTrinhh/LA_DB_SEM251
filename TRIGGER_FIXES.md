# Database Trigger and Entity Fixes

## Issues Identified and Fixed

### 1. StackOverflowError: User ↔ ParticipantProfile Circular Reference
**Problem:** The entities had circular references in their `hashCode()` and `toString()` methods.

**Solution:** Already implemented properly:
- `User.java`: `@EqualsAndHashCode(exclude = {"userRoles", "participantProfile", "organizerProfile"})`
- `ParticipantProfile.java`: `@EqualsAndHashCode(exclude = "user")`

### 2. Hibernate AssertionFailure: null identifier (Ticket)
**Problem:** Two database triggers were interfering with Hibernate's identity generation:

1. **trg_GenerateTicketQRCode** (AFTER INSERT): Was updating the QR code URL after insert, but the application already generates this.
2. **trg_PreventTicketOverselling** (INSTEAD OF INSERT): Was intercepting the INSERT operation and manually performing it, which broke Hibernate's identity column management.

**Solution:** Created migration `V5__fix_ticket_triggers.sql`:
- Dropped both conflicting triggers
- Created new `trg_ValidateTicketAvailability` (AFTER INSERT) that validates capacity without interfering with the insert
- QR code generation is now handled entirely by the application (in `OrderService.java`)

## Migration Details

### File: V5__fix_ticket_triggers.sql

**Changes:**
1. **Dropped:** `trg_GenerateTicketQRCode` - QR codes are generated in Java code
2. **Dropped:** `trg_PreventTicketOverselling` - Replaced with validation-only trigger
3. **Created:** `trg_ValidateTicketAvailability` - Validates after insert (doesn't interfere with Hibernate)

**Why This Works:**
- AFTER INSERT triggers execute after Hibernate has completed the insert and received the generated ID
- The application already validates ticket availability in `OrderService.createOrder()` (lines 75-81)
- The trigger provides an additional database-level safety check
- QR code generation in the application (line 125 in OrderService) is more flexible and testable

## How to Apply the Fix

1. **Stop the backend application** if it's running
2. **The migration will auto-apply** on next startup (Flyway will detect V5)
3. **Restart the backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

## Verification

After restart, check the logs for:
```
Successfully applied 5 migrations to schema [dbo], now at version v5
```

## Testing the Fix

Try creating an order through the API:
```bash
POST http://localhost:20001/api/orders
{
  "sessionId": 1,
  "eventId": 1,
  "ticketQuantities": {
    "1": 2
  },
  "currency": "VND"
}
```

Expected behavior:
- ✅ Order is created successfully
- ✅ Tickets are generated with IDs
- ✅ QR codes are set by the application
- ✅ No StackOverflowError
- ✅ No Hibernate AssertionFailure

## Additional Notes

### Why INSTEAD OF triggers don't work well with Hibernate:
- They intercept the INSERT and perform it manually
- Hibernate expects to receive the generated ID immediately after the insert
- When a trigger performs the INSERT, the ID generation mechanism gets bypassed
- Result: Hibernate tries to create an EntityKey with a null ID → AssertionFailure

### Why AFTER triggers work better:
- They execute after the INSERT is complete
- Hibernate has already received the generated ID
- Triggers can validate and rollback if needed
- Result: Clean separation of concerns

## Design Pattern Applied

**Strategy:** Move business logic to the application layer, use database triggers only for validation.

**Benefits:**
- Better testability
- More flexibility
- Cleaner debugging
- Fewer Hibernate conflicts
- Easier to maintain

**Trade-offs:**
- Slightly less database-level enforcement
- But we keep the validation trigger as a safety net

