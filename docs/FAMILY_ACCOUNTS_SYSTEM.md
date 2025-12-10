# Family Accounts & Discount System

## Overview

The Fort Jiu-Jitsu family account system allows families to train together under a single subscription with automatic discounts. This system follows Stripe family billing best practices and provides comprehensive family management features.

## Family Plan Structure

### Pricing Model
- **1 Member**: Individual rate ($75 kids, $100 adults)
- **2 Members**: $150/month flat family rate
- **3+ Members**: $150 base + $50 per additional member (25% discount)

### Savings Examples
- **2 members** (1 adult + 1 kid): Individual = $175, Family = $150 → **Save $25/month**
- **3 members** (2 adults + 1 kid): Individual = $275, Family = $200 → **Save $75/month**
- **4 members** (2 adults + 2 kids): Individual = $350, Family = $250 → **Save $100/month**

### Key Features
- **Primary Account Holder**: Manages all billing and family members
- **Individual Profiles**: Each member has their own profile for attendance tracking
- **Shared Billing**: All charges consolidated under primary account
- **Automatic Prorations**: Mid-cycle additions/removals are prorated automatically
- **QR Code Check-ins**: Each member gets their own check-in QR code

## Database Schema

### Tables Created

#### `family_accounts`
Aggregate table tracking family information:
```sql
- id (UUID, primary key)
- primary_member_id (UUID, references members.id)
- family_name (TEXT)
- total_members (INTEGER)
- monthly_rate (DECIMAL)
- discount_percentage (DECIMAL)
- stripe_subscription_id (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMPTZ)
```

#### Enhanced `members` table
Added columns:
```sql
- family_account_id (UUID, references members.id)
- is_primary_account_holder (BOOLEAN)
- family_role (TEXT) -- 'primary', 'spouse', 'child', 'other'
- relationship_to_primary (TEXT)
- individual_monthly_cost (DECIMAL)
```

### Database Functions

#### `calculate_family_pricing()`
PostgreSQL function that calculates:
- Monthly total based on member count
- Base rate and additional member rates
- Total savings vs individual pricing
- Current member count

#### `sync_family_account_totals()`
Automatic trigger function that:
- Updates family_accounts table when members added/removed
- Recalculates pricing automatically
- Maintains data integrity

### Views

#### `family_account_summary`
Complete family information with all members aggregated.

#### `member_family_details`
Individual member view with family account context.

## API Routes

### `GET /api/family?memberId={id}`
Fetch family account with all members and billing summary.

**Response:**
```json
{
  "success": true,
  "familyMembers": [...],
  "billing": {...},
  "pricing": {
    "monthlyTotal": 200,
    "savings": 75,
    "vsIndividual": 275,
    "memberCount": 3
  },
  "familyAccount": {...}
}
```

### `POST /api/family/pricing`
Calculate family pricing based on member types.

**Request:**
```json
{
  "memberCount": 3,
  "memberTypes": ["adult", "adult", "kid"]
}
```

**Response:**
```json
{
  "success": true,
  "monthlyTotal": 200,
  "breakdown": [...],
  "savings": 75,
  "vsIndividual": 275,
  "memberCount": 3
}
```

### `POST /api/family/add-member`
Add a new family member to existing account.

**Request:**
```json
{
  "primaryAccountHolderId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "dateOfBirth": "2010-05-15",
  "program": "kids-bjj",
  "familyRole": "child",
  "relationshipToPrimary": "Son"
}
```

**Response:**
```json
{
  "success": true,
  "message": "John Doe has been added to the family account",
  "newMember": {...},
  "familyMembers": [...],
  "memberCount": 3,
  "pricing": {...},
  "stripeUpdated": true
}
```

### `POST /api/family/remove-member`
Remove a family member from account.

**Request:**
```json
{
  "primaryAccountHolderId": "uuid",
  "memberIdToRemove": "uuid",
  "convertToIndividual": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Jane Doe has been removed from the family account",
  "pricingMessage": "Family subscription updated...",
  "unlinkedMember": {...},
  "remainingMembers": [...],
  "memberCount": 2,
  "convertedToIndividual": false
}
```

### `PUT /api/family`
Update family account settings.

**Request:**
```json
{
  "primaryMemberId": "uuid",
  "familyName": "The Smith Family",
  "metadata": {...}
}
```

### `POST /api/family` (existing link endpoint)
Link existing member to family account.

## Stripe Integration

### Functions in `lib/stripe.ts`

#### `calculateFamilyPrice(memberTypes: MemberType[])`
Pure function to calculate family pricing:
```typescript
const pricing = calculateFamilyPrice(['adult', 'adult', 'kid']);
// Returns: { monthlyTotal: 200, savings: 75, ... }
```

#### `updateFamilySubscription(familyAccountId, memberCount)`
Updates Stripe subscription when family size changes:
- Retrieves current subscription
- Calculates new pricing
- Updates subscription with prorations
- Syncs database

#### `createFamilySubscription({...})`
Creates new family subscription checkout session:
- Calculates pricing
- Creates checkout session
- Includes metadata for webhooks

### Webhook Handlers

Enhanced `app/api/webhooks/stripe/route.ts` to handle:

#### `customer.subscription.updated`
- Detects family subscriptions via metadata
- Updates all family members' status
- Syncs family_accounts table

#### `customer.subscription.deleted`
- Cancels all family members
- Deactivates family_accounts record
- Maintains data for historical purposes

## Frontend Components

### `FamilyBuilder.tsx`
Interactive component for building families during signup:

**Features:**
- Add/remove family members dynamically
- Live pricing calculation
- Age-based program selection
- Relationship tracking
- Visual savings indicator
- Responsive design with animations

**Usage:**
```tsx
import FamilyBuilder from '@/app/signup/components/FamilyBuilder';

<FamilyBuilder
  onFamilyChange={(family) => setFamilyMembers(family)}
  onPricingChange={(pricing) => setPricing(pricing)}
  initialMembers={[]}
/>
```

## Email Notifications

### Templates in `lib/emails/family-notifications.ts`

#### 1. Welcome New Family Member
Sent when member is added to family:
- Family details
- Pricing information
- Next steps
- Login credentials

#### 2. Member Removed
Sent when member is removed:
- Notification of removal
- Link to sign up individually
- Contact information

#### 3. Billing Updated
Sent to primary account holder:
- Old vs new member count
- Old vs new pricing
- Proration notice

#### 4. Subscription Confirmation
Sent when family subscription starts:
- Complete family roster
- Savings summary
- Next billing date
- Member portal link

## Usage Examples

### Creating a Family During Signup

1. User signs up as primary account holder
2. Adds family members via FamilyBuilder component
3. System calculates family pricing
4. Stripe checkout created with family subscription
5. On payment success:
   - Primary member marked as `is_primary_account_holder = true`
   - Additional members linked via `family_account_id`
   - Family_accounts record created
   - Welcome emails sent

### Adding Member to Existing Family

```typescript
const response = await fetch('/api/family/add-member', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    primaryAccountHolderId: primaryId,
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah@example.com',
    dateOfBirth: '2015-08-20',
    program: 'kids-bjj',
    familyRole: 'child',
    relationshipToPrimary: 'Daughter',
  }),
});

const { newMember, pricing, stripeUpdated } = await response.json();
```

### Removing Member from Family

```typescript
const response = await fetch('/api/family/remove-member', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    primaryAccountHolderId: primaryId,
    memberIdToRemove: memberId,
    convertToIndividual: true, // Auto-convert if drops to 1 member
  }),
});

const { pricingMessage, remainingMembers } = await response.json();
```

### Fetching Family Information

```typescript
const response = await fetch(`/api/family?memberId=${memberId}`);
const { familyMembers, billing, pricing, familyAccount } = await response.json();

console.log(`Family has ${familyMembers.length} members`);
console.log(`Monthly rate: $${pricing.monthlyTotal}`);
console.log(`Saving: $${pricing.savings}/month`);
```

## Testing

### Manual Testing Checklist

1. **Family Creation**
   - [ ] Create family with 2 members → Pricing = $150
   - [ ] Create family with 3 members → Pricing = $200
   - [ ] Create family with 4 members → Pricing = $250
   - [ ] Verify all members have same Stripe customer ID
   - [ ] Verify primary account holder flag

2. **Add Member**
   - [ ] Add member to 2-person family → Pricing increases to $200
   - [ ] Add member to 3-person family → Pricing increases by $50
   - [ ] Verify Stripe subscription updated
   - [ ] Verify welcome email sent

3. **Remove Member**
   - [ ] Remove from 3-person family → Pricing decreases to $150
   - [ ] Remove from 2-person family → Option to convert to individual
   - [ ] Verify Stripe subscription updated
   - [ ] Verify removed member status = inactive

4. **Webhooks**
   - [ ] Test subscription.updated with family metadata
   - [ ] Test subscription.deleted for family
   - [ ] Verify all family members updated

5. **Edge Cases**
   - [ ] Try removing primary account holder → Should fail
   - [ ] Try adding member already in another family → Should fail
   - [ ] Test family dropping to 1 member → Conversion logic
   - [ ] Test mid-cycle additions → Verify proration

## Deployment

### Database Migration

1. Run the SQL migration:
```bash
psql -h your-supabase-host -U postgres -d postgres -f supabase/family_accounts.sql
```

2. Verify tables and functions created:
```sql
\dt family_accounts
\df calculate_family_pricing
\df sync_family_account_totals
```

### Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Stripe Configuration

1. Update webhook endpoint to handle family metadata
2. Ensure `customer.subscription.updated` and `customer.subscription.deleted` events enabled
3. Test webhook signing in production

## Security Considerations

1. **Authorization**: Only primary account holders can:
   - Add/remove family members
   - Update family settings
   - View billing details

2. **Data Validation**: All API routes validate:
   - Primary account holder status
   - Member ownership
   - Required fields
   - Email uniqueness

3. **Stripe Security**:
   - Webhook signature verification
   - Customer ID validation
   - Metadata integrity checks

## Future Enhancements

1. **Family Portal**: Dedicated dashboard for family management
2. **Member Invitations**: Email invites for family members to claim accounts
3. **Attendance Reports**: Family-wide attendance tracking
4. **Bulk Operations**: Add multiple members at once
5. **Family Events**: Special pricing for family events/seminars
6. **Gift Memberships**: Allow gifting family memberships
7. **Referral Bonuses**: Rewards for referring other families

## Support & Troubleshooting

### Common Issues

**Family pricing not calculating:**
- Check API endpoint `/api/family/pricing`
- Verify memberTypes array format
- Check browser console for errors

**Stripe subscription not updating:**
- Verify webhook configuration
- Check Stripe dashboard for failed webhooks
- Ensure metadata includes `is_family_subscription: true`

**Member can't be added:**
- Verify email isn't already in use
- Check if member already in another family
- Ensure primary account holder ID is correct

### Debug Queries

```sql
-- Find all family accounts
SELECT * FROM family_account_summary;

-- Find member's family details
SELECT * FROM member_family_details WHERE member_id = 'uuid';

-- Calculate pricing for family
SELECT * FROM calculate_family_pricing('primary-member-uuid');

-- Find orphaned family members (no primary)
SELECT * FROM members
WHERE family_account_id IS NOT NULL
AND family_account_id NOT IN (
  SELECT id FROM members WHERE is_primary_account_holder = true
);
```

## Contact

For questions or issues with the family account system:
- Email: andy@thefortaiagency.com
- System: The Fort Jiu-Jitsu Management Platform
- Version: 1.0
- Last Updated: December 2024
