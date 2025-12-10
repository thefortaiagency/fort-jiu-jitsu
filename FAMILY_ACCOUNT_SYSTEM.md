# Family Account Linking System

## Overview
This system allows families to link multiple members (children and parents) to a single billing account, providing a family discount and simplified billing management.

## Key Features

### 1. Automatic Parent Detection
When signing up a child (minor under 18), the system automatically checks if a parent account exists by email:
- If parent exists → Child is automatically linked to parent's family account
- If parent doesn't exist → Child signup continues with parent info collected
- Parent can later be converted to primary account holder

### 2. Family Discount
- **Individual pricing**: Adult $100/mo + Kid $75/mo = $175/mo
- **Family pricing**: $150/mo for entire family
- **Savings**: $25/mo for families

### 3. Unified Billing
- All family members share the primary account holder's Stripe customer ID
- One payment method for all family members
- When parent pays, all family members' payment status updates

## Database Schema

### Members Table Fields
```typescript
{
  family_account_id: string | null,        // Links to primary account holder's ID
  is_primary_account_holder: boolean,      // true for parent, false for children
  stripe_customer_id: string,              // Shared across family
  stripe_subscription_id: string,          // Individual subscriptions
  individual_monthly_cost: number,         // Member's individual cost
}
```

## API Routes

### 1. GET /api/family?memberId=xxx
Get all family members and billing information.

**Response:**
```json
{
  "success": true,
  "familyMembers": [
    {
      "id": "parent-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "is_primary_account_holder": true,
      ...
    },
    {
      "id": "child-uuid",
      "first_name": "Jane",
      "last_name": "Doe",
      "is_primary_account_holder": false,
      "family_account_id": "parent-uuid",
      ...
    }
  ],
  "billing": {
    "primaryMember": {...},
    "childMembers": [...],
    "totalMembers": 2,
    "monthlyTotal": 150,
    "savings": 25,
    "stripeCustomerId": "cus_xxx"
  }
}
```

### 2. POST /api/family/link
Link an existing member to a family account.

**Request:**
```json
{
  "parentMemberId": "parent-uuid",
  "childMemberId": "child-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Jane Doe has been linked to John Doe's family account",
  "linkedMember": {...},
  "familyMembers": [...],
  "billing": {...}
}
```

### 3. POST /api/signup
Updated to support family linking.

**New field:**
- `linkToParentId`: Optional UUID to link child to existing parent

**Behavior:**
1. If signing up a minor with `parentEmail`:
   - Checks if parent exists in system
   - If yes: Links to parent's account automatically
   - If no: Creates standalone account (can be linked later)

2. If `linkToParentId` is provided:
   - Links directly to specified parent
   - Uses parent's Stripe customer ID
   - Sets `is_primary_account_holder = false`

### 4. GET /api/member-lookup?id=xxx
Added GET method to look up member by ID (in addition to POST by email).

## New Pages

### /signup/family?parent=<parent_member_id>
Dedicated family member signup flow:
- URL parameter specifies parent member ID
- Pre-fills parent information
- Skips parent info collection step
- Automatically links to parent's billing
- Shows family discount in payment summary

**Features:**
- Progress indicator (3 steps: Info → Waiver → Payment)
- Blue banner showing parent's name
- Family discount highlighted ($150 total vs $175 individual)
- Parent signature required for minors

## Helper Functions (lib/supabase.ts)

### getFamilyMembers(primaryMemberId: string)
Returns all family members linked to a primary account holder.
- Handles both primary members and children
- Sorts by primary holder first, then by creation date

### linkToFamily(childId: string, parentId: string)
Links a child member to a parent's family account.
- Validates parent is primary account holder
- Updates child's family_account_id
- Shares parent's Stripe customer ID
- Sets is_primary_account_holder = false

### getFamilyBilling(primaryMemberId: string)
Calculates family billing information.
- Total monthly cost (with family discount)
- Savings compared to individual pricing
- List of all family members
- Primary member's Stripe customer ID

### getMemberByEmail(email: string)
Simple lookup function to find member by email.

## User Flows

### Flow 1: New Child with Existing Parent
1. Child enters email on signup page
2. System doesn't find child
3. Child proceeds to info collection
4. Child enters date of birth (under 18)
5. System requires parent email
6. **System checks parent email** → Parent exists!
7. Child is automatically linked to parent's account
8. Child completes waiver (parent signature)
9. Payment uses parent's billing → Family discount applied

### Flow 2: Parent Adds Child via Family Link
1. Parent logs into member portal
2. Clicks "Add Family Member"
3. Redirected to `/signup/family?parent=<parent_id>`
4. Parent sees blue banner with their name
5. Parent fills in child's info
6. Parent signs waiver for child
7. Payment summary shows family discount
8. Child account created and linked automatically

### Flow 3: Link Existing Member to Family
1. Admin or parent uses API to link accounts
2. POST to `/api/family/link` with both IDs
3. System validates parent is primary holder
4. Child's Stripe customer updates to parent's
5. Family discount applied immediately

## Billing Logic

### Stripe Integration
```typescript
// Parent creates initial Stripe customer
const parentStripeCustomer = stripe.customers.create({...});

// Child uses parent's customer ID
const child = {
  stripe_customer_id: parent.stripe_customer_id,
  family_account_id: parent.id,
  is_primary_account_holder: false
};

// Only parent manages payment method
// All family members share subscription status
```

### Payment Processing
- Parent's subscription covers entire family
- When parent pays → All family `payment_status = 'active'`
- When parent cancels → All family `payment_status = 'cancelled'`
- Individual costs tracked for reporting/analytics

## Security Considerations

1. **Parent Verification**
   - Only primary account holders can have children linked
   - Parent email must match existing account
   - Parent must sign waiver for minor children

2. **Data Privacy**
   - Children can only be linked by parent ID or parent email match
   - No public API for family queries (requires member ID)

3. **Billing Protection**
   - Only primary account holder can modify payment method
   - Children cannot create their own Stripe customers if linked
   - Family unlinking would require admin intervention

## Testing Checklist

- [ ] Sign up adult member → Verify `is_primary_account_holder = true`
- [ ] Sign up child with new parent email → Verify standalone account
- [ ] Sign up child with existing parent email → Verify auto-linking
- [ ] Use `/signup/family?parent=xxx` → Verify child links correctly
- [ ] Test GET `/api/family?memberId=xxx` → Verify family list returned
- [ ] Test POST `/api/family/link` → Verify linking works
- [ ] Verify family discount calculation ($150 total)
- [ ] Verify Stripe customer ID shared across family
- [ ] Test payment → Verify all family members update

## Future Enhancements

1. **Member Portal Features**
   - Parent dashboard showing all family members
   - Add/remove family members UI
   - Family billing history

2. **Advanced Pricing**
   - Tiered family discounts (3+ members = bigger discount)
   - Mixed membership types (adult + kids)
   - Sibling discounts

3. **Admin Tools**
   - Merge/split family accounts
   - Transfer primary account holder
   - Family activity reports

4. **Notifications**
   - Email parent when child added
   - Payment reminders to primary holder only
   - Family membership expiration notices

## Code Files Modified/Created

### Modified
- `/app/api/signup/route.ts` - Family linking logic
- `/lib/supabase.ts` - Family helper functions
- `/app/api/member-lookup/route.ts` - GET by ID support

### Created
- `/app/api/family/route.ts` - Family management API
- `/app/signup/family/page.tsx` - Family member signup page
- `/FAMILY_ACCOUNT_SYSTEM.md` - This documentation

## Support & Troubleshooting

### Common Issues

**Issue:** Child not linking to parent automatically
- **Check:** Parent email exact match (case-insensitive)
- **Check:** Parent account exists and is active
- **Solution:** Use `/api/family/link` to manually link

**Issue:** Payment failing for child
- **Check:** Parent's payment method is valid
- **Check:** Child's `stripe_customer_id` matches parent's
- **Solution:** Update child's Stripe customer ID to parent's

**Issue:** Family discount not applied
- **Check:** Family has multiple members
- **Check:** Billing calculation includes all linked members
- **Solution:** Recalculate using `getFamilyBilling()`

---

**Last Updated:** December 2024
**Version:** 1.0
