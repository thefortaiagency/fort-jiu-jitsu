# Family Account System - Quick Reference Card

## Pricing Formula

```
1 member  = Individual ($75 kid, $100 adult)
2 members = $150 flat
3+ members = $150 + ($50 × additional members)
```

## API Quick Reference

### Calculate Pricing
```bash
POST /api/family/pricing
{
  "memberCount": 3,
  "memberTypes": ["adult", "adult", "kid"]
}
→ Returns: { monthlyTotal: 200, savings: 75 }
```

### Get Family Info
```bash
GET /api/family?memberId={uuid}
→ Returns: { familyMembers: [], billing: {}, pricing: {} }
```

### Add Member
```bash
POST /api/family/add-member
{
  "primaryAccountHolderId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "dateOfBirth": "2010-05-15",
  "program": "kids-bjj"
}
→ Automatically updates Stripe subscription
```

### Remove Member
```bash
POST /api/family/remove-member
{
  "primaryAccountHolderId": "uuid",
  "memberIdToRemove": "uuid",
  "convertToIndividual": true
}
→ Automatically updates Stripe subscription
```

### Update Family Settings
```bash
PUT /api/family
{
  "primaryMemberId": "uuid",
  "familyName": "The Smith Family"
}
```

## Database Queries

### Find Family by Member
```sql
SELECT * FROM family_account_summary
WHERE primary_member_id = 'uuid';
```

### Get Member's Family Details
```sql
SELECT * FROM member_family_details
WHERE member_id = 'uuid';
```

### Calculate Family Pricing
```sql
SELECT * FROM calculate_family_pricing('primary-member-uuid');
```

### Find All Active Families
```sql
SELECT * FROM family_accounts
WHERE is_active = true
ORDER BY total_members DESC;
```

## Component Usage

### FamilyBuilder Component
```tsx
import FamilyBuilder from '@/app/signup/components/FamilyBuilder';

<FamilyBuilder
  onFamilyChange={(family) => {
    console.log('Family:', family);
  }}
  onPricingChange={(pricing) => {
    console.log('Monthly:', pricing.monthlyTotal);
    console.log('Savings:', pricing.savings);
  }}
  initialMembers={[]}
/>
```

## Stripe Integration

### Create Family Subscription
```typescript
import { createFamilySubscription } from '@/lib/stripe';

const session = await createFamilySubscription({
  customerId: 'cus_xxx',
  memberCount: 3,
  memberTypes: ['adult', 'adult', 'kid'],
  familyAccountId: 'uuid',
  successUrl: 'https://...',
  cancelUrl: 'https://...'
});
```

### Update Subscription
```typescript
import { updateFamilySubscription } from '@/lib/stripe';

const result = await updateFamilySubscription(
  'family-account-uuid',
  4 // new member count
);
```

## Webhook Metadata

Family subscriptions include metadata:
```json
{
  "is_family_subscription": "true",
  "family_account_id": "uuid",
  "member_count": "3",
  "monthly_rate": "200"
}
```

## Common Patterns

### Check if Member is in Family
```typescript
const { data: member } = await supabase
  .from('members')
  .select('family_account_id, is_primary_account_holder')
  .eq('id', memberId)
  .single();

const isInFamily = member.family_account_id !== null ||
                   member.is_primary_account_holder;
```

### Get All Family Members
```typescript
const { data: members } = await supabase
  .from('members')
  .select('*')
  .or(`id.eq.${primaryId},family_account_id.eq.${primaryId}`)
  .order('is_primary_account_holder', { ascending: false });
```

### Calculate Age from DOB
```typescript
const calculateAge = (dob: string) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
```

## Testing Commands

### Run Pricing Tests
```bash
npx tsx scripts/test-family-system.ts
```

### Test Webhooks Locally
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger customer.subscription.updated
```

### Database Health Check
```sql
-- Check for orphaned members
SELECT COUNT(*) FROM members
WHERE family_account_id IS NOT NULL
AND family_account_id NOT IN (
  SELECT id FROM members WHERE is_primary_account_holder = true
);

-- Should return 0
```

## Email Templates

Available in `lib/emails/family-notifications.ts`:

1. `getFamilyMemberWelcomeEmailContent()`
2. `getFamilyMemberRemovedEmailContent()`
3. `getFamilyBillingUpdatedEmailContent()`
4. `getFamilySubscriptionConfirmationEmailContent()`

## Pricing Examples

| Members | Composition | Individual | Family | Savings |
|---------|-------------|------------|--------|---------|
| 1       | 1 Adult     | $100       | $100   | $0      |
| 2       | 1A + 1K     | $175       | $150   | $25     |
| 2       | 2 Adults    | $200       | $150   | $50     |
| 3       | 2A + 1K     | $275       | $200   | $75     |
| 4       | 2A + 2K     | $350       | $250   | $100    |
| 5       | 3A + 2K     | $450       | $300   | $150    |

## Troubleshooting

### Pricing Not Calculating
```bash
# Check API
curl -X POST http://localhost:3000/api/family/pricing \
  -H "Content-Type: application/json" \
  -d '{"memberCount": 3, "memberTypes": ["adult", "adult", "kid"]}'

# Check database function
SELECT * FROM calculate_family_pricing('uuid');
```

### Stripe Not Updating
```bash
# Check Stripe subscription
stripe subscriptions retrieve sub_xxx

# Check metadata
stripe subscriptions retrieve sub_xxx | grep metadata

# Check webhook logs
stripe events list --limit 10
```

### Database Issues
```sql
-- Reset family account
UPDATE family_accounts
SET is_active = false
WHERE primary_member_id = 'uuid';

-- Unlink all members
UPDATE members
SET family_account_id = NULL
WHERE family_account_id = 'uuid';
```

## Key Files

- **Schema**: `supabase/family_accounts.sql`
- **API**: `app/api/family/**/*.ts`
- **Stripe**: `lib/stripe.ts`
- **Component**: `app/signup/components/FamilyBuilder.tsx`
- **Emails**: `lib/emails/family-notifications.ts`
- **Docs**: `docs/FAMILY_ACCOUNTS_SYSTEM.md`
- **Tests**: `scripts/test-family-system.ts`

## Support Contacts

- **Technical Issues**: andy@thefortaiagency.com
- **Documentation**: `docs/FAMILY_ACCOUNTS_SYSTEM.md`
- **API Reference**: This file + full docs

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: Production Ready ✅
