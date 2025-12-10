# Waiver Age-Based Logic and Notification System

## Implementation Summary

This document outlines the waiver expiration, age-based logic, and notification system implemented for The Fort Jiu-Jitsu website.

## Core Features Implemented

### 1. Waiver Utility Functions (`lib/waiver-utils.ts`)

A comprehensive set of utility functions for waiver management:

- **`isWaiverValid(signedAt)`** - Checks if waiver is within 1-year validity period
- **`getWaiverExpiration(signedAt)`** - Returns expiration date (1 year from signing)
- **`daysUntilExpiration(signedAt)`** - Calculates days until expiration (negative if expired)
- **`isMinor(birthDate)`** - Checks if person is under 18 years old
- **`needsAdultWaiver(birthDate, lastWaiverDate, lastWaiverRelationship)`** - Determines if member turned 18 and needs to sign own waiver
- **`getWaiverWarningMessage(...)`** - Returns appropriate warning message based on waiver status
- **`getSignerRelationship(birthDate, isParentSigning)`** - Determines correct relationship ('self', 'parent', or 'guardian')

### 2. API Routes

#### `/api/waiver-status` (GET)
Query parameter: `?memberId=xxx`

Returns comprehensive waiver status:
```json
{
  "valid": true/false,
  "expiresAt": "2025-12-10T00:00:00Z",
  "needsRenewal": false,
  "turnedAdult": false,
  "daysUntilExpiration": 180,
  "warning": "Your waiver expires in 30 days...",
  "warningType": "expiring_soon"
}
```

#### Updated `/api/member-lookup` (POST)
Now includes:
- `turnedAdult` flag - indicates member turned 18 since last waiver
- Uses waiver utility functions for expiration calculation
- Fetches `birth_date` and `signer_relationship` from database

### 3. Signup Flow Updates (`app/signup/page.tsx`)

#### Parent Information Validation
- Parent/Guardian info is now **REQUIRED** (not optional) for minors
- Enforced in both frontend validation and backend API
- `validateInfo()` function checks for parent info when `isMinor()` returns true

#### Waiver Warning Banners
Two new visual banners appear when relevant:

**"You Need to Sign Your Own Waiver"** (Blue Banner)
- Shows when `memberInfo.turnedAdult === true`
- Indicates member turned 18 since last waiver
- Requires member to sign their own waiver (not parent/guardian)

**"Waiver Expired"** (Yellow Banner)
- Shows when `!memberInfo.hasValidWaiver` and waiver exists
- Displays expiration date
- Warns member they need new waiver to continue training

### 4. Backend API Updates

#### `/api/signup` Route
- **Required parent info validation** for minors at API level
- Determines `signerRelationship` intelligently:
  - Compares `signerName` to parent name
  - Sets 'parent' if match, 'guardian' if different
  - Sets 'self' for adults
- Stores relationship correctly in waivers table

#### `/api/drop-in` Route
- Uses `isMinor()` utility to check current age
- Properly determines `signerRelationship` for waiver renewals
- Handles members who turned 18 (now signs as 'self')

### 5. Notifications Table (`supabase/add_notifications_table.sql`)

Complete notification system with:

**Table Structure:**
- `type`: waiver_expiring, waiver_expired, turned_18, payment_failed, membership_ending
- `priority`: low, normal, high, urgent
- `read`, `dismissed` flags
- `action_url`, `action_label` for user actions
- `email_sent`, `email_sent_at` for email tracking
- `metadata` JSONB for additional context
- `expires_at` for auto-cleanup

**Helper Functions:**
1. **`create_waiver_expiration_notification(...)`**
   - Auto-creates/updates notifications based on days until expiration
   - Priority levels: urgent (<0 days), high (≤7 days), normal (≤30 days)
   - Prevents duplicates
   - Updates existing notifications if status changes

2. **`create_turned_adult_notification(...)`**
   - Creates notification when member turns 18
   - Links to old waiver for reference
   - Directs to adult waiver signup

**RLS Policies:**
- Service role: full access
- Members: can view and update their own notifications

## Waiver Expiration Logic

### Timeline
- **Day 0**: Waiver signed
- **Day 335** (30 days before expiration): "Expiring Soon" notification (normal priority)
- **Day 358** (7 days before expiration): "Expiring Soon" notification (high priority)
- **Day 365**: Waiver expires
- **Day 366+**: "Expired" notification (urgent priority)

### "Turned 18" Logic
1. Check if last waiver was signed by parent/guardian (`signer_relationship != 'self'`)
2. Check if member is now 18+ years old
3. If both true, flag `turnedAdult = true`
4. Member must sign new waiver as 'self'

### Signer Relationship Determination
- **Minor + Signer name matches parent**: 'parent'
- **Minor + Signer name doesn't match parent**: 'guardian'
- **Adult (18+)**: 'self'

## Database Schema

### Waivers Table
```sql
- id (UUID)
- member_id (UUID, FK to members)
- waiver_type (VARCHAR) - 'liability', 'medical', 'photo_release'
- signer_name (VARCHAR) - Full legal name of signer
- signer_email (VARCHAR) - Email of signer
- signer_relationship (VARCHAR) - 'self', 'parent', 'guardian'
- signature_data (TEXT) - Base64 signature image
- signed_at (TIMESTAMP) - When signed
- created_at (TIMESTAMP)
```

### Notifications Table
```sql
- id (UUID)
- member_id (UUID, FK to members)
- type (VARCHAR) - Notification category
- title (VARCHAR) - Short title
- message (TEXT) - Full message
- priority (VARCHAR) - low, normal, high, urgent
- read (BOOLEAN)
- dismissed (BOOLEAN)
- action_url (VARCHAR) - Link for action
- action_label (VARCHAR) - Button text
- email_sent (BOOLEAN)
- email_sent_at (TIMESTAMP)
- related_id (UUID) - Related entity ID
- metadata (JSONB) - Additional context
- expires_at (TIMESTAMP) - Auto-cleanup date
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## User Experience Flows

### New Member Signup (Minor)
1. Enter date of birth
2. System detects `isMinor() === true`
3. Parent/Guardian info section appears (REQUIRED)
4. Waiver shows "Parent/Guardian" signature prompt
5. System stores `signer_relationship` as 'parent' or 'guardian'

### New Member Signup (Adult)
1. Enter date of birth
2. System detects `isMinor() === false`
3. No parent info required
4. Waiver shows standard signature prompt
5. System stores `signer_relationship` as 'self'

### Returning Member (Waiver Expired)
1. Email lookup
2. System checks waiver validity
3. Yellow banner shows: "Your waiver expired on [date]"
4. Must sign new waiver before payment
5. New waiver stored with current relationship

### Returning Member (Turned 18)
1. Email lookup
2. System detects `needsAdultWaiver() === true`
3. Blue banner shows: "You need to sign your own waiver"
4. Must sign new waiver as 'self' (not parent/guardian)
5. New waiver stored with `signer_relationship = 'self'`

### Drop-In Visit (Expired Waiver)
1. Select "Drop-in" option
2. System checks waiver validity
3. Note shows: "Your waiver has expired and will need to be renewed"
4. Proceeds to waiver renewal
5. Then to payment

## Testing Checklist

### Age Calculations
- [ ] Member born 18+ years ago shows as adult
- [ ] Member born <18 years ago shows as minor
- [ ] Birthday edge cases handled (leap years, month/day comparison)

### Waiver Expiration
- [ ] Waiver signed today is valid
- [ ] Waiver signed 364 days ago is valid
- [ ] Waiver signed 365+ days ago is expired
- [ ] Days until expiration calculated correctly

### Turned 18 Logic
- [ ] Member with parent-signed waiver who turned 18 shows `turnedAdult = true`
- [ ] Member with self-signed waiver shows `turnedAdult = false`
- [ ] Member still under 18 shows `turnedAdult = false`

### Signup Flow Validation
- [ ] Minor cannot submit without parent info
- [ ] Adult can submit without parent info
- [ ] Error messages display correctly
- [ ] Warning banners appear when appropriate

### API Responses
- [ ] `/api/waiver-status` returns correct data
- [ ] `/api/member-lookup` includes `turnedAdult` flag
- [ ] Waiver relationship stored correctly in database

### Notification System
- [ ] SQL functions execute without errors
- [ ] Notifications table created successfully
- [ ] Helper functions create notifications correctly
- [ ] RLS policies allow member access

## Future Enhancements

1. **Automated Email Notifications**
   - Trigger emails at 30 days, 7 days, and 0 days before expiration
   - Birthday emails when member turns 18
   - Use notification system's `email_sent` tracking

2. **Admin Dashboard**
   - View members with expiring waivers
   - Send bulk reminder emails
   - Override expiration dates (with reason/notes)

3. **Member Portal**
   - View waiver status and expiration date
   - Download signed waiver PDF
   - Renew waiver online without drop-in payment

4. **Analytics**
   - Track waiver renewal rates
   - Identify members at risk of lapse
   - Monitor "turned 18" conversion rate

5. **Automated Reminder System**
   - Cron job to check waiver expirations daily
   - Auto-create notifications via SQL functions
   - Send email reminders automatically

## Files Modified/Created

### Created
- `lib/waiver-utils.ts` - Waiver utility functions
- `app/api/waiver-status/route.ts` - Waiver status API
- `supabase/add_notifications_table.sql` - Notifications table and functions
- `WAIVER-SYSTEM-IMPLEMENTATION.md` - This documentation

### Modified
- `app/signup/page.tsx` - Added warning banners, updated MemberInfo interface
- `app/api/member-lookup/route.ts` - Added turnedAdult flag, uses waiver utils
- `app/api/signup/route.ts` - Enforces parent info for minors, smart relationship detection
- `app/api/drop-in/route.ts` - Uses waiver utils for age/relationship detection

## Deployment Steps

1. **Run SQL migrations** (in order):
   ```bash
   # Already done:
   # - supabase/add_waivers_table.sql

   # New:
   - supabase/add_notifications_table.sql
   ```

2. **Verify database**:
   - Check `notifications` table exists
   - Test helper functions
   - Verify RLS policies work

3. **Deploy frontend/API**:
   ```bash
   npm run build
   npm run deploy  # or your deployment process
   ```

4. **Test in production**:
   - Create test minor signup
   - Create test adult signup
   - Test waiver expiration with old test data
   - Verify banners display correctly

5. **Monitor**:
   - Check Sentry/logs for errors
   - Verify waiver storage working
   - Test member lookup responses

## Support & Maintenance

### Common Issues

**"Parent info not showing for minor"**
- Check date of birth is correct
- Verify `isMinor()` calculation
- Inspect browser console for JS errors

**"Waiver shows as expired but was just signed"**
- Check `signed_at` timestamp in database
- Verify server time zone settings
- Test `isWaiverValid()` function with actual data

**"TurnedAdult flag not appearing"**
- Check `signer_relationship` in waivers table
- Verify birth date calculation
- Test `needsAdultWaiver()` function logic

### Database Queries for Debugging

```sql
-- Find members with expiring waivers (next 30 days)
SELECT
  m.first_name,
  m.last_name,
  m.email,
  w.signed_at,
  w.signed_at + INTERVAL '1 year' AS expires_at,
  DATE_PART('day', (w.signed_at + INTERVAL '1 year') - NOW()) AS days_until_expiration
FROM members m
JOIN waivers w ON w.member_id = m.id
WHERE w.waiver_type = 'liability'
  AND w.signed_at + INTERVAL '1 year' BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY expires_at ASC;

-- Find members who turned 18 with parent-signed waivers
SELECT
  m.first_name,
  m.last_name,
  m.email,
  m.birth_date,
  DATE_PART('year', AGE(m.birth_date)) AS current_age,
  w.signer_relationship,
  w.signed_at
FROM members m
JOIN waivers w ON w.member_id = m.id
WHERE DATE_PART('year', AGE(m.birth_date)) >= 18
  AND w.signer_relationship IN ('parent', 'guardian')
ORDER BY m.birth_date DESC;

-- Test notification system
SELECT * FROM create_waiver_expiration_notification(
  'member-uuid-here',
  'waiver-uuid-here',
  NOW() + INTERVAL '7 days',
  7
);
```

## Contact & Questions

For questions about this implementation, contact the development team or refer to:
- Waiver utility tests: `lib/__tests__/waiver-utils.test.ts` (if created)
- API documentation: `/docs/api/waiver-status.md` (if created)
- Database schema: `supabase/schema.sql`

---

**Implementation Date:** December 10, 2025
**Version:** 1.0
**Status:** Complete - Ready for Testing
