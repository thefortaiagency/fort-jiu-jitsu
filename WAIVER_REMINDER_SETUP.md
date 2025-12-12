# Waiver Expiration Reminder System

## Overview

Automated email system that sends reminders to members 30 days before their waiver expires. The system ensures members renew their waivers in time to avoid training interruptions.

## Files Created

### 1. API Route: `/app/api/cron/waiver-reminders/route.ts`

**Purpose**: Cron job endpoint that finds and emails members with expiring waivers.

**Features**:
- Queries database for waivers expiring in 30 days (signed 335-336 days ago)
- Groups by member to avoid duplicate reminders
- Filters to only active members
- Sends professional HTML emails via Resend
- Rate limits (2 second delay between emails)
- Detailed logging and error handling
- Returns comprehensive results

**Usage**:
- **Manual Trigger**: `GET https://thefortjiujitsu.com/api/cron/waiver-reminders`
- **Vercel Cron**: Auto-runs daily (see setup below)

**Response**:
```json
{
  "success": true,
  "message": "Sent 5 waiver expiration reminders",
  "emailsSent": 5,
  "emailsFailed": 0,
  "totalWaivers": 7,
  "uniqueMembers": 5,
  "activeMembers": 5,
  "results": [
    {
      "memberId": "uuid",
      "memberName": "John Doe",
      "email": "john@example.com",
      "expiresAt": "2024-01-15T00:00:00.000Z",
      "daysUntilExpiration": 30,
      "status": "sent"
    }
  ]
}
```

### 2. Email Template: `/lib/email.ts`

**Function**: `sendWaiverExpirationReminder()`

**Features**:
- Professional HTML email matching welcome email style
- Dark header with logo
- Prominent expiration date warning card (red gradient)
- Clear CTA button linking to `/member/renew-waiver`
- "Why this matters" explanation section
- Step-by-step renewal instructions
- Contact information
- Plain text fallback

**Email Preview**:
- Subject: "Reminder: Your waiver expires in 30 days"
- From: "The Fort Jiu-Jitsu <noreply@thefortaiagency.ai>"
- Includes: Logo, expiration countdown, renewal link, contact info

## Setup Instructions

### 1. Environment Variables

Ensure these are set in Vercel:

```env
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=noreply@thefortaiagency.ai
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 2. Vercel Cron Setup

Create or update `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/waiver-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule Explanation**:
- `0 9 * * *` = Every day at 9:00 AM UTC (4:00 AM EST / 3:00 AM CST)
- You can change this to any time using cron syntax

**Common Schedules**:
- `0 9 * * *` - Daily at 9 AM UTC
- `0 14 * * *` - Daily at 2 PM UTC (9 AM EST)
- `0 0 * * 1` - Weekly on Mondays at midnight UTC
- `0 9 1 * *` - Monthly on the 1st at 9 AM UTC

### 3. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Add waiver expiration reminder system"
git push

# Vercel will auto-deploy
# Cron jobs are enabled automatically for Production deployments
```

### 4. Verify Cron is Active

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Settings" → "Cron Jobs"
4. You should see: `/api/cron/waiver-reminders` with schedule `0 9 * * *`

## Testing

### Manual Test (Recommended Before Production)

Test the cron job manually before relying on scheduled runs:

```bash
# Test in browser or curl
curl https://thefortjiujitsu.com/api/cron/waiver-reminders

# Or visit directly
https://thefortjiujitsu.com/api/cron/waiver-reminders
```

**Expected Output**:
```json
{
  "success": true,
  "message": "Sent X waiver expiration reminders",
  "emailsSent": 2,
  ...
}
```

### Check Logs

1. Vercel Dashboard → Your Project → Functions
2. Click on `/api/cron/waiver-reminders`
3. View execution logs to see:
   - How many waivers were found
   - Which members were emailed
   - Any errors

### Test Email Delivery

1. Temporarily modify the date logic in the cron route to find your own waiver
2. Run manual test
3. Check your email inbox
4. Verify email looks professional and link works
5. Revert date logic changes

## How It Works

### Date Calculation

Waivers are valid for **365 days** (1 year) from signing.

**To find waivers expiring in 30 days**:
- Calculate 335 days ago (`365 - 30 = 335`)
- Calculate 336 days ago (`365 - 29 = 336`)
- Query waivers signed between these dates
- Those waivers will expire in 29-30 days

### Email Flow

1. **Cron Triggers** (daily at 9 AM UTC)
2. **Query Database** for waivers signed 335-336 days ago
3. **Group by Member** to avoid duplicates
4. **Filter Active Members** (status = 'active')
5. **Send Emails** with 2-second rate limit between each
6. **Return Results** with success/failure counts

### Member Experience

1. Member receives email 30 days before expiration
2. Email explains why renewal is important
3. Click "Renew Your Waiver Now" button
4. Redirects to `/member/renew-waiver` (already exists)
5. Member signs electronically
6. Waiver renewed - good for another year

## Monitoring

### Check Cron Execution

Vercel Dashboard → Deployments → Functions:
- See each cron execution
- View logs and errors
- Check execution time and success rate

### Email Delivery

Check Resend dashboard:
- See all sent emails
- Delivery status
- Open/click rates
- Any bounce/complaint issues

### Database Queries

Monitor Supabase for performance:
- Query execution time
- Number of records processed
- Any slow queries

## Troubleshooting

### No Emails Being Sent

**Check**:
1. Are there waivers expiring in 30 days?
   - Run manual test and check `totalWaivers` in response
2. Are members active?
   - Check `activeMembers` count in response
3. Is Resend API key valid?
   - Check environment variables in Vercel

### Emails Not Delivered

**Check**:
1. Resend dashboard for delivery errors
2. Verify `RESEND_FROM_EMAIL` is verified domain
3. Check spam folder
4. Verify member email addresses are valid

### Cron Not Running

**Check**:
1. Vercel Settings → Cron Jobs shows the job
2. Cron only works in Production (not Preview)
3. Check Function logs for errors
4. Try manual trigger to test endpoint

### Wrong Date Range

**Check**:
1. Server timezone (Vercel uses UTC)
2. Date calculations in code
3. Waiver `signed_at` dates in database
4. Adjust logic if needed for your timezone

## Customization

### Change Reminder Timing

To send reminders at different intervals (e.g., 14 days):

```typescript
// In /app/api/cron/waiver-reminders/route.ts
// Change from:
const threeHundredThirtyFiveDaysAgo = new Date();
threeHundredThirtyFiveDaysAgo.setDate(threeHundredThirtyFiveDaysAgo.getDate() - 335);

// To (for 14 days):
const threeHundredFiftyOneDaysAgo = new Date(); // 365 - 14 = 351
threeHundredFiftyOneDaysAgo.setDate(threeHundredFiftyOneDaysAgo.getDate() - 351);
```

### Multiple Reminders

Set up multiple cron jobs for different intervals:

```json
{
  "crons": [
    {
      "path": "/api/cron/waiver-reminders-30",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/waiver-reminders-7",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Create separate routes for each interval.

### Email Customization

Modify `/lib/email.ts` → `sendWaiverExpirationReminder()`:
- Change subject line
- Update HTML template
- Modify CTA button text/link
- Add more information sections

## Security

### API Protection (Optional)

Add authentication to prevent unauthorized access:

```typescript
// In /app/api/cron/waiver-reminders/route.ts
export async function GET(request: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of code
}
```

Add `CRON_SECRET` to Vercel environment variables.

Update `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/waiver-reminders",
      "schedule": "0 9 * * *",
      "headers": {
        "authorization": "Bearer your-secret-here"
      }
    }
  ]
}
```

## Database Schema

The system expects this `waivers` table structure:

```sql
CREATE TABLE waivers (
  id UUID PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  waiver_type TEXT,
  waiver_version TEXT,
  signer_name TEXT,
  signer_email TEXT,
  signer_relationship TEXT,
  signature_data TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

And `members` table:
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'pending', 'cancelled'
  ...
);
```

## Support

For issues or questions:
1. Check Vercel Function logs
2. Check Resend delivery dashboard
3. Review Supabase query logs
4. Contact: aoberlin@thefortaiagency.ai

---

**Created**: December 11, 2024
**Version**: 1.0
**System**: The Fort Jiu-Jitsu - Waiver Expiration Reminder
