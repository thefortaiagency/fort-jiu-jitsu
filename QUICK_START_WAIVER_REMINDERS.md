# Waiver Reminder System - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Test Locally (Optional but Recommended)

```bash
# Test the email template
npx tsx scripts/test-waiver-reminder.ts

# Check your email inbox - verify it looks good
```

### 2. Check Which Members Will Get Reminders

```bash
# See who has waivers expiring in 30 days
npx tsx scripts/check-expiring-waivers.ts
```

### 3. Deploy to Vercel

```bash
# Commit and push
git add .
git commit -m "Add waiver expiration reminder system"
git push origin main

# Vercel auto-deploys
# Wait 2-3 minutes for deployment to complete
```

### 4. Verify Cron Job is Active

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project
3. Settings → Cron Jobs
4. Should see: `/api/cron/waiver-reminders` running daily at `0 14 * * *` (9 AM EST)

### 5. Done! ✅

The system will now automatically send emails every day at 9:00 AM EST to members whose waivers expire in 30 days.

---

## 📧 What Happens Next

Every day at 9 AM EST:
1. System checks for waivers expiring in exactly 30 days
2. Sends professional reminder emails to active members
3. Members click "Renew Your Waiver Now" button
4. Redirects to `/member/renew-waiver` (already exists)
5. Members sign electronically
6. Waiver renewed for another year

---

## 🔧 Manual Test (Optional)

Test the cron job manually right now:

```bash
# In browser or terminal:
curl https://thefortjiujitsu.com/api/cron/waiver-reminders

# Returns JSON:
{
  "success": true,
  "message": "Sent 3 waiver expiration reminders",
  "emailsSent": 3,
  ...
}
```

---

## 📊 Monitor Performance

### Vercel Dashboard
- **Deployments** → **Functions** → `/api/cron/waiver-reminders`
- See execution logs, timing, and errors

### Resend Dashboard
- See all sent emails
- Check delivery status
- Monitor open/click rates

---

## 🆘 Troubleshooting

### "No emails sent"
- No waivers expiring in 30 days (this is normal!)
- Run `npx tsx scripts/check-expiring-waivers.ts` to confirm

### "Email failed to send"
- Check `RESEND_API_KEY` in Vercel environment variables
- Verify `RESEND_FROM_EMAIL` domain is verified in Resend

### "Cron not running"
- Cron only works in Production (not Preview deployments)
- Check Settings → Cron Jobs in Vercel Dashboard

---

## 📖 Full Documentation

For detailed information, see:
- **WAIVER_REMINDER_SETUP.md** - Complete setup guide
- **WAIVER_REMINDER_IMPLEMENTATION.md** - Technical details

---

## ✨ That's It!

You now have a fully automated waiver reminder system. No manual work required!

Members will never miss their waiver renewal deadline.

**Questions?** Contact: aoberlin@thefortaiagency.ai
