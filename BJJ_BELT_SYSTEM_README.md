# BJJ Belt Progression & Rank Tracking System

Complete belt management system for The Fort Jiu-Jitsu, following [Martialytics](https://www.martialytics.com) best practices for BJJ academy management.

## Overview

This system provides comprehensive belt tracking, promotion management, and progress visualization for both adult and kids BJJ programs.

### Features

- ✅ **Adult Belt System** (16+): White → Blue → Purple → Brown → Black
- ✅ **Kids Belt System** (under 16): White → Grey → Yellow → Orange → Green (with white/black variants)
- ✅ **Stripe Tracking**: Up to 4 stripes per belt
- ✅ **Promotion History**: Complete timeline of all promotions
- ✅ **Eligibility Tracking**: Automatic calculation based on time and attendance
- ✅ **Admin Dashboard**: Batch promotions and member management
- ✅ **Member Portal**: Belt progress tracking and achievement history
- ✅ **Visual Components**: Realistic belt displays with gradients and textures
- ✅ **Notifications**: Automatic alerts when members are promoted
- ✅ **Certificates**: Printable promotion certificates

## Database Setup

### 1. Run the SQL Migration

Execute the belt progression SQL in your Supabase dashboard:

```bash
# Open Supabase SQL Editor
https://qpyjujdwdkyvdmhpsyul.supabase.co

# Run the migration
supabase/belt_progression.sql
```

This creates:
- `belt_ranks` table: 18 belt ranks (5 adult + 13 kids)
- `member_belt_history` table: Complete promotion history
- Belt-related columns in `members` table
- Database functions for eligibility calculations
- Row-level security policies

### 2. Verify Belt Ranks

After running the migration, verify belt ranks are seeded:

```sql
SELECT * FROM belt_ranks ORDER BY is_kids_belt, sort_order;
```

You should see:
- 5 adult belts (white, blue, purple, brown, black)
- 13 kids belts (grey/yellow/orange/green with variants)

## API Endpoints

### GET `/api/belts`
List all belt ranks, grouped by adult/kids.

**Response:**
```json
{
  "adult_belts": [...],
  "kids_belts": [...],
  "all_belts": [...]
}
```

### GET `/api/belts?member_id={id}`
Get a specific member's belt history.

**Response:**
```json
{
  "member": { ... },
  "history": [ ... ]
}
```

### GET `/api/members/{id}/belt`
Get member's current belt and promotion eligibility.

**Response:**
```json
{
  "member": { ... },
  "history": [ ... ],
  "eligibility": {
    "is_eligible": true,
    "days_at_current_belt": 200,
    "classes_since_promotion": 65,
    "current_belt_name": "Blue Belt",
    "next_belt_name": "Purple Belt",
    "recommendation": "Ready for promotion"
  }
}
```

### POST `/api/members/{id}/belt`
Promote a member (admin only).

**Request Body (Stripe Promotion):**
```json
{
  "promoted_by": "instructor_id",
  "is_stripe_promotion": true,
  "notes": "Excellent progress on guard passing"
}
```

**Request Body (Belt Promotion):**
```json
{
  "promoted_by": "instructor_id",
  "new_belt_id": "belt_rank_id",
  "stripes": 0,
  "notes": "Promoted for consistent attendance and technical improvement",
  "is_stripe_promotion": false
}
```

### GET `/api/admin/promotions`
List all members with promotion eligibility.

**Query Params:**
- `program`: Filter by program (kids-bjj, adult-bjj, beginners)
- `belt`: Filter by current belt name
- `min_days`: Minimum days required (default: 180)
- `min_classes`: Minimum classes required (default: 50)

**Response:**
```json
{
  "members": [ ... ],
  "stats": {
    "total_members": 45,
    "eligible_count": 12,
    "by_belt": { "White Belt": 20, "Blue Belt": 15, ... }
  },
  "filters": { ... }
}
```

### POST `/api/admin/promotions`
Batch promote multiple members.

**Request Body:**
```json
{
  "promoted_by": "instructor_id",
  "promotions": [
    {
      "member_id": "uuid",
      "new_belt_id": "belt_rank_id",
      "stripes": 0,
      "notes": "Promotion notes",
      "is_stripe_promotion": false
    }
  ]
}
```

## React Components

### `<BeltDisplay />`
Visual belt component with realistic appearance.

```tsx
import BeltDisplay from '@/app/components/BeltDisplay';

<BeltDisplay
  beltName="blue"
  beltDisplayName="Blue Belt"
  stripes={2}
  size="lg" // sm | md | lg | xl
  showStripes={true}
  showLabel={true}
/>
```

### `<BeltBadge />`
Compact belt badge for cards/lists.

```tsx
import { BeltBadge } from '@/app/components/BeltDisplay';

<BeltBadge
  beltName="purple"
  beltDisplayName="Purple Belt"
  stripes={3}
/>
```

### `<BeltIcon />`
Small belt icon for avatars.

```tsx
import { BeltIcon } from '@/app/components/BeltDisplay';

<BeltIcon
  beltName="brown"
  stripes={1}
  size={24}
/>
```

### `<BeltProgress />`
Belt progress component for member dashboard.

```tsx
import BeltProgress from '@/app/member/components/BeltProgress';

<BeltProgress
  currentBelt={{ name: 'blue', display_name: 'Blue Belt' }}
  stripes={2}
  beltUpdatedAt="2024-01-15T00:00:00Z"
  daysAtBelt={200}
  classesAtBelt={65}
  isEligible={true}
  recommendation="Ready for promotion"
  estimatedDaysToNext={165}
  progressPercentage={55}
/>
```

### `<BeltHistory />`
Full promotion history timeline.

```tsx
import BeltHistory from '@/app/member/components/BeltHistory';

<BeltHistory
  history={memberBeltHistory}
  memberName="John Smith"
/>
```

### `<PromotionModal />`
Admin promotion modal (admin only).

```tsx
import PromotionModal from '@/app/admin/components/PromotionModal';

<PromotionModal
  member={member}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    loadMembers();
    setShowModal(false);
  }}
  promotedBy={instructorId}
/>
```

## Utility Functions

### Belt Display Utilities

```typescript
import {
  getBeltColor,           // Get solid belt color
  getBeltGradient,        // Get CSS gradient string
  formatBeltRank,         // Format "Blue Belt - 2 Stripes"
  getNextBelt,           // Get next belt in progression
  isEligibleForPromotion, // Check promotion eligibility
  getBeltStyle,          // Get React style object
  getStripeIndicators,   // Get stripe array for display
  formatTimeSincePromotion, // Format "6 months ago"
  getBeltEmoji,          // Get belt emoji (🔵 for blue)
  getPromotionMessage,   // Get congratulations message
  isValidPromotion,      // Validate belt progression
} from '@/lib/belt-utils';
```

### Example Usage

```typescript
// Check if member can be promoted
const { eligible, reason } = isEligibleForPromotion(
  daysAtBelt,      // 200
  classesAttended, // 65
  currentStripes,  // 2
  'blue',         // current belt
  false           // is kids belt
);

// Get next belt
const nextBelt = getNextBelt('blue', false); // Returns 'purple'

// Validate promotion
const validation = isValidPromotion('blue', 'black', false);
// Returns: { valid: false, error: 'Cannot skip belts' }

// Format belt display
const formatted = formatBeltRank('Blue Belt', 2);
// Returns: "Blue Belt - 2 Stripes"
```

## Member Portal Integration

### Update Member Dashboard

Add belt display to `/app/member/components/MemberDashboard.tsx`:

```tsx
// Fetch member belt info
const [beltInfo, setBeltInfo] = useState(null);

useEffect(() => {
  async function loadBeltInfo() {
    const res = await fetch(`/api/members/${memberId}/belt`);
    const data = await res.json();
    setBeltInfo(data);
  }
  loadBeltInfo();
}, [memberId]);

// Display in dashboard
{beltInfo && (
  <>
    <BeltProgress
      currentBelt={beltInfo.member.current_belt}
      stripes={beltInfo.member.current_stripes}
      {...beltInfo.eligibility}
    />

    <BeltHistory
      history={beltInfo.history}
      memberName={`${member.first_name} ${member.last_name}`}
    />
  </>
)}
```

## Admin Portal Integration

### Promotions Page

Create `/app/admin/promotions/page.tsx` for promotion management:

```tsx
import PromotionsPage from '@/app/admin/promotions/page';

// Features:
// - Filter by program, belt, eligibility
// - Bulk selection and promotion
// - Individual promotion modal
// - Eligibility status display
// - Progress tracking
```

### Add to Admin Navigation

Update `/app/admin/layout.tsx`:

```tsx
<nav>
  <Link href="/admin">Dashboard</Link>
  <Link href="/admin/check-ins">Check-ins</Link>
  <Link href="/admin/classes">Classes</Link>
  <Link href="/admin/waivers">Waivers</Link>
  <Link href="/admin/promotions">Promotions</Link> {/* NEW */}
</nav>
```

## Promotion Workflow

### Stripe Promotion (Same Belt)

1. Admin selects member
2. Opens promotion modal
3. Selects "Stripe Promotion"
4. Adds notes (optional)
5. Clicks "Promote"
6. System:
   - Adds 1 stripe (max 4)
   - Creates history entry
   - Updates member record
   - Sends notification

### Belt Promotion (New Belt)

1. Admin selects member
2. Opens promotion modal
3. Selects "Belt Promotion"
4. System auto-suggests next belt
5. Sets starting stripes (default 0)
6. Adds notes (optional)
7. Clicks "Promote"
8. System:
   - Validates promotion is legal
   - Creates history entry
   - Updates member belt
   - Sends notification
   - Generates certificate

## Promotion Eligibility Rules

### Adults (16+)

Based on IBJJF and Martialytics recommendations:

- **White → Blue**: 1-2 years (12-24 months), ~50+ classes
- **Blue → Purple**: 2+ years (24+ months), ~100+ classes
- **Purple → Brown**: 1.5-2+ years (18-24 months), ~100+ classes
- **Brown → Black**: 1+ year minimum (12+ months), ~100+ classes
- **Stripes**: Every 3-6 months, ~30-50 classes

### Kids (Under 16)

Faster progression to maintain engagement:

- **Belt Promotions**: Every 4-6 months, ~30+ classes
- **Stripes**: Every 2-3 months, ~15-20 classes
- **Transition to Adult System**: At 16 years old, typically start at white or blue belt

### Configurable Requirements

Modify in `/api/admin/promotions/route.ts`:

```typescript
const minDays = parseInt(searchParams.get('min_days') || '180');
const minClasses = parseInt(searchParams.get('min_classes') || '50');
```

## Notifications

When promoted, members receive:

1. **In-App Notification**: "Congratulations! You've been promoted to [Belt]!"
2. **Email** (if configured): Promotion announcement with certificate
3. **Member Portal Badge**: Belt update visible immediately
4. **History Entry**: Permanent record with instructor notes

## Belt Colors & Visual Design

### Adult Belt Colors

- **White**: `#FFFFFF` (subtle grey gradient)
- **Blue**: `#0066CC` → `#1E90FF` gradient
- **Purple**: `#6B21A8` → `#7C3AED` gradient
- **Brown**: `#8B4513` → `#A0522D` gradient
- **Black**: `#000000` → `#1F1F1F` gradient

### Kids Belt Colors

- **Grey Variants**: `#808080` with white/black variations
- **Yellow Variants**: `#FFD700` with white/black variations
- **Orange Variants**: `#FF8C00` with white/black variations
- **Green Variants**: `#228B22` with white/black variations

All belts include:
- Realistic gradient backgrounds
- Subtle fabric texture
- Stripe indicators (white bars, skewed -15deg)
- Proper shadows and borders
- Responsive sizing (sm/md/lg/xl)

## Testing Checklist

### Database
- [ ] Belt ranks seeded correctly (18 total)
- [ ] Member belt columns added
- [ ] Triggers working (auto-update current belt)
- [ ] Functions working (eligibility calculation)
- [ ] RLS policies active

### API Endpoints
- [ ] GET `/api/belts` returns all ranks
- [ ] GET `/api/belts?member_id=X` returns member history
- [ ] GET `/api/members/X/belt` returns eligibility
- [ ] POST `/api/members/X/belt` promotes member
- [ ] POST `/api/admin/promotions` batch promotes

### Components
- [ ] BeltDisplay renders correctly
- [ ] BeltBadge shows in lists
- [ ] BeltProgress calculates percentages
- [ ] BeltHistory shows timeline
- [ ] PromotionModal validates input

### Member Portal
- [ ] Belt visible on dashboard
- [ ] Progress bars accurate
- [ ] History displays all promotions
- [ ] Certificates printable
- [ ] Share functionality works

### Admin Portal
- [ ] Promotions page loads members
- [ ] Filters work (program, belt, eligible)
- [ ] Promotion modal opens
- [ ] Stripe promotions work
- [ ] Belt promotions validated
- [ ] Batch promotions work
- [ ] Notifications sent

## Troubleshooting

### Belt not updating after promotion

Check:
1. Trigger `trigger_update_member_belt` is enabled
2. History entry has `is_current = true`
3. Member record has matching `current_belt_id`

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_member_belt';

-- Check recent promotions
SELECT * FROM member_belt_history
WHERE is_current = true
ORDER BY promoted_at DESC
LIMIT 10;
```

### Eligibility calculation incorrect

Database function may need adjustment:

```sql
-- Test eligibility function
SELECT * FROM get_promotion_eligibility(
  'member_id_here',
  180,  -- min days
  50    -- min classes
);
```

### Belt colors not displaying

Ensure `belt-utils.ts` is imported correctly and belt names match database exactly:

```typescript
// Correct
getBeltColor('blue')

// Incorrect
getBeltColor('Blue Belt')
```

## Future Enhancements

- [ ] Automated promotion suggestions based on ML
- [ ] Competition tracking integration
- [ ] Belt exam scheduling
- [ ] Video technique requirements per belt
- [ ] Parent notifications (for kids)
- [ ] Belt ceremony calendar
- [ ] Stripe/belt photos for social media
- [ ] Belt progression analytics dashboard

## Support

For issues or questions:
1. Check database logs in Supabase
2. Review API endpoint responses
3. Verify RLS policies
4. Test with service role key (bypasses RLS)

---

**Built for The Fort Jiu-Jitsu** 🥋

Based on [Martialytics](https://www.martialytics.com) best practices for martial arts academy management.
