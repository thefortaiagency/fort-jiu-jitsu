# Family Account System - Implementation Guide

## Quick Start

The family account linking system is now fully integrated and ready to use. Here's how to test and deploy it.

## What Was Built

### 1. Automatic Family Linking ✅
When a child (under 18) signs up with a parent email that exists in the system:
- Child automatically links to parent's account
- Uses parent's Stripe customer for billing
- Family discount applied automatically ($150/mo vs $175/mo)

### 2. Dedicated Family Signup Page ✅
URL: `/signup/family?parent=<parent_member_id>`
- Pre-fills parent information
- Simplified 3-step flow (Info → Waiver → Payment)
- Shows family discount in payment summary
- Parent signature required

### 3. Family Management API ✅
- `GET /api/family?memberId=xxx` - Get all family members + billing
- `POST /api/family/link` - Link existing member to family
- `GET /api/member-lookup?id=xxx` - Look up member by ID

### 4. Helper Functions ✅
Added to `lib/supabase.ts`:
- `getFamilyMembers(primaryMemberId)` - Get all family members
- `linkToFamily(childId, parentId)` - Link child to parent
- `getFamilyBilling(primaryMemberId)` - Calculate family billing
- `getMemberByEmail(email)` - Find member by email

## Testing Guide

### Test 1: Sign Up Adult (Primary Account Holder)
```bash
1. Navigate to: http://localhost:3000/signup
2. Enter email: parent@example.com
3. Fill in adult information
4. Select "Adult Gi Classes" ($100/mo)
5. Complete waiver and payment
6. Verify in database:
   - is_primary_account_holder = true
   - family_account_id = null
   - stripe_customer_id = cus_xxx
```

### Test 2: Sign Up Child with Existing Parent (Auto-Link)
```bash
1. Navigate to: http://localhost:3000/signup
2. Enter email: child@example.com
3. Fill in child information (date of birth < 18 years)
4. Parent email: parent@example.com (from Test 1)
5. Complete waiver and payment
6. Verify in database:
   - is_primary_account_holder = false
   - family_account_id = <parent_id>
   - stripe_customer_id = <parent_stripe_customer_id>
```

### Test 3: Use Family Signup Link
```bash
1. Get parent member ID from database
2. Navigate to: http://localhost:3000/signup/family?parent=<parent_id>
3. See blue banner showing parent's name
4. Fill in child information
5. Complete waiver (parent signature)
6. See family discount in payment summary ($150 total)
7. Verify child linked to parent in database
```

### Test 4: API - Get Family Members
```bash
curl http://localhost:3000/api/family?memberId=<parent_id>

Expected response:
{
  "success": true,
  "familyMembers": [
    { "id": "parent-id", "is_primary_account_holder": true, ... },
    { "id": "child-id", "family_account_id": "parent-id", ... }
  ],
  "billing": {
    "totalMembers": 2,
    "monthlyTotal": 150,
    "savings": 25,
    "stripeCustomerId": "cus_xxx"
  }
}
```

### Test 5: API - Link Existing Members
```bash
curl -X POST http://localhost:3000/api/family/link \
  -H "Content-Type: application/json" \
  -d '{"parentMemberId": "parent-uuid", "childMemberId": "child-uuid"}'

Expected response:
{
  "success": true,
  "message": "Child has been linked to Parent's family account",
  "linkedMember": {...},
  "familyMembers": [...],
  "billing": {...}
}
```

## Database Verification Queries

### Check Family Structure
```sql
-- Get all family members for a parent
SELECT
  id,
  first_name,
  last_name,
  email,
  is_primary_account_holder,
  family_account_id,
  stripe_customer_id,
  individual_monthly_cost
FROM members
WHERE id = '<parent_id>'
   OR family_account_id = '<parent_id>'
ORDER BY is_primary_account_holder DESC, created_at;
```

### Verify Family Billing
```sql
-- Calculate family billing
SELECT
  COUNT(*) as total_members,
  SUM(individual_monthly_cost) as individual_total,
  150 as family_discount_price,
  (SUM(individual_monthly_cost) - 150) as savings
FROM members
WHERE id = '<parent_id>'
   OR family_account_id = '<parent_id>';
```

### Find All Families
```sql
-- List all family accounts
SELECT
  p.id,
  p.first_name || ' ' || p.last_name as parent_name,
  p.email as parent_email,
  COUNT(c.id) as children_count,
  p.stripe_customer_id
FROM members p
LEFT JOIN members c ON c.family_account_id = p.id
WHERE p.is_primary_account_holder = true
GROUP BY p.id, p.first_name, p.last_name, p.email, p.stripe_customer_id
HAVING COUNT(c.id) > 0;
```

## Integration with Existing Features

### Member Portal Integration
To add family management to the member portal, add this to `/app/member/page.tsx`:

```typescript
// Fetch family members
const { data } = await fetch(`/api/family?memberId=${memberId}`);

// Display family members list
{data.familyMembers?.map(member => (
  <div key={member.id}>
    {member.first_name} {member.last_name}
    {member.is_primary_account_holder && <span>👑 Primary</span>}
  </div>
))}

// Add family member button
<Link href={`/signup/family?parent=${memberId}`}>
  + Add Family Member
</Link>
```

### Stripe Webhook Updates
When processing Stripe webhook for subscription updates:

```typescript
// Update all family members when parent pays
const { data: familyMembers } = await getFamilyMembers(memberId);

await Promise.all(
  familyMembers.map(member =>
    supabase
      .from('members')
      .update({
        payment_status: 'active',
        last_payment_date: new Date().toISOString()
      })
      .eq('id', member.id)
  )
);
```

## Deployment Checklist

- [x] All TypeScript compiles without errors
- [x] Build succeeds (`npm run build`)
- [x] Database has required columns:
  - `family_account_id` (UUID, nullable)
  - `is_primary_account_holder` (boolean, default false)
  - `individual_monthly_cost` (integer, default 100)
- [ ] Test all signup flows in development
- [ ] Test family API endpoints
- [ ] Verify Stripe integration works
- [ ] Update member portal UI (optional)
- [ ] Configure environment variables (if any)
- [ ] Deploy to production
- [ ] Test on production with real Stripe account

## Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_BASE_URL`

## Common Scenarios

### Scenario 1: Parent Signs Up First
✅ Works automatically
- Parent creates account (`is_primary_account_holder = true`)
- Child signs up with parent's email
- System auto-links child to parent
- Family discount applied

### Scenario 2: Child Signs Up First
⚠️ Requires manual linking
- Child creates standalone account
- Parent signs up later
- Use `/api/family/link` to connect them
- Or rebuild child account under parent

### Scenario 3: Multiple Children
✅ Works automatically
- First child links to parent
- Second child links to same parent
- All share `family_account_id`
- Family discount applies to all

### Scenario 4: Divorced Parents / Co-Parents
⚠️ Design decision needed
- Currently one primary account holder
- Could support `secondary_account_holder`
- Or duplicate child accounts under each parent
- Requires business logic decision

## Troubleshooting

### Issue: Child not auto-linking
**Cause:** Parent email mismatch or parent doesn't exist
**Fix:**
1. Check parent email is exact match
2. Verify parent account exists: `GET /api/member-lookup` (POST with email)
3. Manually link: `POST /api/family/link`

### Issue: Family discount not showing
**Cause:** Billing calculation not using family rate
**Fix:** Use `getFamilyBilling()` helper which applies discount

### Issue: Payment failing for child
**Cause:** Child has own Stripe customer instead of parent's
**Fix:**
1. Verify child's `stripe_customer_id` matches parent's
2. If not, update child's record to parent's ID
3. Re-link using `/api/family/link`

### Issue: Can't access /signup/family page
**Cause:** Missing parent ID in URL
**Fix:** Use full URL: `/signup/family?parent=<uuid>`

## Next Steps

1. **Test thoroughly** using the test cases above
2. **Update member portal** to show family members
3. **Add family management UI** for parents
4. **Document for users** how to add family members
5. **Monitor Stripe webhooks** for family payment updates
6. **Consider edge cases** (divorced parents, adult siblings, etc.)

## Support

For questions or issues:
1. Check `FAMILY_ACCOUNT_SYSTEM.md` for detailed documentation
2. Review database schema in `lib/supabase.ts`
3. Test API endpoints using curl/Postman
4. Verify Stripe integration in Stripe Dashboard

---

**System Status:** ✅ Fully Implemented & Build Passing
**Last Updated:** December 2024
**Version:** 1.0
