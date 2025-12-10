# BJJ Belt System - Quick Implementation Guide

Fast-track guide to get the belt system running in The Fort Jiu-Jitsu.

## Step 1: Database Setup (5 minutes)

### Run SQL Migration

1. Open Supabase SQL Editor:
   ```
   https://qpyjujdwdkyvdmhpsyul.supabase.co
   ```

2. Copy contents of `supabase/belt_progression.sql`

3. Execute in SQL Editor

4. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('belt_ranks', 'member_belt_history');
   ```

5. Verify belt ranks seeded:
   ```sql
   SELECT COUNT(*) FROM belt_ranks;
   -- Should return 18 (5 adult + 13 kids)
   ```

## Step 2: Update Member Records (2 minutes)

### Assign Initial Belts to Existing Members

```sql
-- Get white belt ID
SELECT id FROM belt_ranks WHERE name = 'white' LIMIT 1;

-- Assign white belt to all adult BJJ members without a belt
UPDATE members
SET
  current_belt_id = 'white_belt_id_from_above',
  current_stripes = 0,
  belt_updated_at = NOW(),
  total_classes_attended = 0
WHERE program IN ('adult-bjj', 'beginners')
AND current_belt_id IS NULL;

-- Get kids white belt ID
SELECT id FROM belt_ranks WHERE name = 'kids_white' LIMIT 1;

-- Assign kids white belt
UPDATE members
SET
  current_belt_id = 'kids_white_belt_id_from_above',
  current_stripes = 0,
  belt_updated_at = NOW(),
  total_classes_attended = 0
WHERE program = 'kids-bjj'
AND current_belt_id IS NULL;

-- Create initial belt history entries
INSERT INTO member_belt_history (member_id, belt_rank_id, stripes, promoted_at, is_current)
SELECT
  id,
  current_belt_id,
  0,
  created_at,
  true
FROM members
WHERE current_belt_id IS NOT NULL
AND id NOT IN (SELECT DISTINCT member_id FROM member_belt_history);
```

## Step 3: Test API Endpoints (5 minutes)

### Test Belt Rankings Endpoint

```bash
curl http://localhost:3000/api/belts
```

Expected response:
```json
{
  "adult_belts": [ ... 5 belts ... ],
  "kids_belts": [ ... 13 belts ... ],
  "all_belts": [ ... 18 belts ... ]
}
```

### Test Member Belt Info

```bash
# Replace {member_id} with actual member ID
curl http://localhost:3000/api/members/{member_id}/belt
```

Expected response:
```json
{
  "member": { "current_belt": { ... }, "current_stripes": 0 },
  "history": [ ... ],
  "eligibility": { ... }
}
```

### Test Promotion Eligibility

```bash
curl http://localhost:3000/api/admin/promotions
```

Expected response:
```json
{
  "members": [ ... ],
  "stats": { "total_members": X, "eligible_count": Y }
}
```

## Step 4: Update Member Dashboard (10 minutes)

### Add Belt Display to Member Portal

Edit `/app/member/components/MemberDashboard.tsx`:

```tsx
import BeltProgress from './BeltProgress';
import BeltHistory from './BeltHistory';

// Add state for belt info
const [beltInfo, setBeltInfo] = useState<any>(null);

// Load belt info
useEffect(() => {
  if (member?.id) {
    fetch(`/api/members/${member.id}/belt`)
      .then(res => res.json())
      .then(data => setBeltInfo(data))
      .catch(err => console.error('Failed to load belt info:', err));
  }
}, [member?.id]);

// Add to dashboard JSX (after existing sections)
{beltInfo && (
  <>
    <div className="mb-8">
      <BeltProgress
        currentBelt={beltInfo.member.current_belt || { name: 'white', display_name: 'White Belt' }}
        stripes={beltInfo.member.current_stripes || 0}
        beltUpdatedAt={beltInfo.member.belt_updated_at}
        daysAtBelt={beltInfo.eligibility?.days_at_current_belt || 0}
        classesAtBelt={beltInfo.eligibility?.classes_since_promotion || 0}
        isEligible={beltInfo.eligibility?.is_eligible || false}
        recommendation={beltInfo.eligibility?.recommendation || 'Keep training!'}
      />
    </div>

    <div className="mb-8">
      <BeltHistory
        history={beltInfo.history || []}
        memberName={`${member.first_name} ${member.last_name}`}
      />
    </div>
  </>
)}
```

## Step 5: Add Admin Promotions Page (5 minutes)

### Update Admin Navigation

Edit `/app/admin/layout.tsx`:

```tsx
<nav className="flex gap-4">
  <Link href="/admin">Dashboard</Link>
  <Link href="/admin/check-ins">Check-ins</Link>
  <Link href="/admin/classes">Classes</Link>
  <Link href="/admin/waivers">Waivers</Link>
  <Link href="/admin/promotions">Promotions</Link> {/* NEW */}
</nav>
```

The promotions page is already created at `/app/admin/promotions/page.tsx` - it will work automatically.

## Step 6: Add Belt Statistics to Admin Dashboard (5 minutes)

Edit `/app/admin/components/AdminDashboard.tsx`:

```tsx
import { BeltStatisticsCard } from './BeltStatistics';

// Add to dashboard grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Existing dashboard cards */}

  {/* NEW: Belt statistics card */}
  <BeltStatisticsCard />
</div>
```

## Step 7: Test Promotion Workflow (10 minutes)

### Manual Test Checklist

1. **Login as Admin**:
   - Go to `/admin/login`
   - Enter admin credentials

2. **View Promotions Page**:
   - Navigate to `/admin/promotions`
   - Verify members list loads
   - Check eligibility calculations

3. **Test Stripe Promotion**:
   - Select a member with < 4 stripes
   - Click "Promote"
   - Choose "Stripe Promotion"
   - Add notes
   - Submit
   - Verify member's stripes increased

4. **Test Belt Promotion**:
   - Select a member at 4 stripes
   - Click "Promote"
   - Choose "Belt Promotion"
   - Verify next belt is pre-selected
   - Add notes
   - Submit
   - Verify member's belt changed

5. **Check Member Portal**:
   - Login as promoted member
   - Verify belt display updated
   - Check belt history shows promotion
   - View promotion certificate

## Step 8: Configure Notification System (Optional)

If you have email notifications set up:

Edit `/app/api/members/[id]/belt/route.ts` to customize notification email:

```typescript
// After successful promotion
await supabase.from('notifications').insert({
  member_id: memberId,
  type: 'belt_promotion',
  title: 'Belt Promotion!',
  message: `Congratulations! You've been promoted to ${newBelt.display_name}!`,
  action_url: '/member',
  read: false,
});

// Optional: Send email notification
// await sendPromotionEmail(member.email, newBelt.display_name);
```

## Step 9: Update Check-in System (Optional)

Track classes attended for promotion eligibility.

Edit `/app/api/check-in/route.ts`:

```typescript
// After successful check-in
await supabase
  .from('members')
  .update({
    total_classes_attended: member.total_classes_attended + 1,
    updated_at: new Date().toISOString(),
  })
  .eq('id', memberId);
```

## Step 10: Print Test Certificate (5 minutes)

1. Login as member
2. View belt history
3. Click "View Certificate" on any promotion
4. Click "Print Certificate"
5. Verify certificate displays correctly

## Common Issues & Fixes

### Issue: Belt not showing in member portal

**Fix**: Check member has `current_belt_id` set:

```sql
SELECT id, first_name, last_name, current_belt_id, current_stripes
FROM members
WHERE id = 'member_id_here';
```

If NULL, assign initial belt (see Step 2).

### Issue: Eligibility shows "Unable to calculate"

**Fix**: Ensure database function exists:

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'get_promotion_eligibility';
```

If missing, re-run belt_progression.sql.

### Issue: Promotion button disabled

**Fix**: Check promoted_by is set correctly. Must be valid instructor member ID.

### Issue: Can't skip belts (validation error)

**Expected behavior**. System prevents skipping belts per BJJ rules.

### Issue: Kids belt not showing correct colors

**Fix**: Verify belt name matches exactly in database:

```sql
SELECT name, display_name FROM belt_ranks WHERE is_kids_belt = true;
```

Belt names must match exactly (e.g., `kids_grey_white` not `kids-grey-white`).

## Production Deployment Checklist

Before going live:

- [ ] Database migration run on production Supabase
- [ ] All existing members assigned initial belts
- [ ] Initial belt history entries created
- [ ] API endpoints tested with production data
- [ ] Admin can promote test member successfully
- [ ] Member can view belt in portal
- [ ] Notifications working (if configured)
- [ ] Certificates print correctly
- [ ] Mobile responsive (test on phone)
- [ ] RLS policies active and secure

## Performance Optimization

For large academies (100+ members):

1. **Add Database Indexes** (already included):
   ```sql
   CREATE INDEX idx_belt_history_member ON member_belt_history(member_id);
   CREATE INDEX idx_members_current_belt ON members(current_belt_id);
   ```

2. **Cache Belt Ranks** (client-side):
   ```tsx
   // Store in localStorage after first fetch
   const belts = localStorage.getItem('belt_ranks');
   ```

3. **Paginate Promotions List**:
   ```tsx
   // Add limit/offset to API
   fetch(`/api/admin/promotions?limit=50&offset=0`)
   ```

## Next Steps

1. **Customize Eligibility Requirements**:
   - Modify min_days and min_classes in promotion APIs
   - Adjust per belt rank (white→blue vs brown→black)

2. **Add Belt Exam Scheduling**:
   - Create promotion events in calendar
   - Send exam invitations

3. **Track Competition Results**:
   - Link competition wins to promotion eligibility
   - Bonus points for tournament performance

4. **Add Parent Notifications** (Kids Program):
   - Email parents when child is promoted
   - Parent dashboard to view progress

5. **Social Media Integration**:
   - Auto-post promotion announcements
   - Generate shareable belt graphics

---

## Support

Questions? Check:
- `BJJ_BELT_SYSTEM_README.md` - Complete documentation
- `/lib/belt-utils.ts` - Utility functions reference
- Supabase logs for API errors
- Browser console for frontend errors

**You're ready to go! 🥋**

The belt system is production-ready and follows BJJ academy best practices from Martialytics.
