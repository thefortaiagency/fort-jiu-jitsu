# Member Portal Documentation

## Overview
The Member Portal provides a comprehensive self-service interface for members and their families to manage their accounts, view check-in history, and monitor membership status.

## Features

### 1. Email-Based Login
- Simple email entry to access the portal
- No password required (authentication can be added later)
- Validates email format before accessing

### 2. Member Dashboard
Displays comprehensive member information including:

#### Status Cards
- **Membership Status**: Active, Inactive, Past Due, or Cancelled
- **Check-ins This Month**: Real-time count of monthly visits
- **Membership Plan**: Current plan type and monthly cost
- **Waiver Status**: Valid or Expired with expiration date

#### Family Members Section
- Lists all family members linked to the account
- Shows each member's program and status
- Primary account holder indicator
- "Add Member" button for primary account holders
- Links to signup with pre-filled family_account_id

#### Recent Check-ins
- Last 30 days of check-in history
- Shows date, time, and class type
- Scrollable list with visual cards

#### Account Details
- Full name, email, program
- Account type (Primary or Family Member)
- Billing status with visual indicators
- Payment due alerts for past due accounts

### 3. Support & Contact
- Quick access to phone support
- Link to contact form
- Emergency contact information

## File Structure

```
/app/member/
├── page.tsx                           # Main portal page with login/dashboard routing
├── components/
│   ├── MemberLogin.tsx               # Email-based login form
│   └── MemberDashboard.tsx           # Main dashboard with all member info

/app/api/member/
├── [email]/
│   └── route.ts                      # GET member data by email + family members
└── [id]/
    ├── check-ins/
    │   └── route.ts                  # GET check-in history (last 30 days)
    └── waivers/
        └── route.ts                  # GET waiver status and validity
```

## API Routes

### GET /api/member/[email]
Retrieves member data and family members by email.

**Response:**
```json
{
  "member": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "active",
    "paymentStatus": "active",
    "membershipType": "monthly",
    "program": "adult-bjj",
    "isActive": true,
    "individualMonthlyCost": 100,
    "isPrimaryAccountHolder": true,
    "familyAccountId": "uuid",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "familyMembers": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "program": "kids-bjj",
      "status": "active",
      "isPrimaryAccountHolder": false
    }
  ]
}
```

### GET /api/member/[id]/check-ins
Retrieves check-in history for the last 30 days.

**Response:**
```json
{
  "checkIns": [
    {
      "id": "uuid",
      "checkInTime": "2024-01-15T18:30:00Z",
      "classType": "adult-bjj"
    }
  ],
  "thisMonthCount": 8,
  "totalCount": 12,
  "period": "30 days"
}
```

### GET /api/member/[id]/waivers
Retrieves waiver status and validity (1 year from signing).

**Response:**
```json
{
  "waivers": [
    {
      "id": "uuid",
      "waiverType": "liability",
      "signedAt": "2024-01-01T00:00:00Z",
      "signerName": "John Doe",
      "isValid": true,
      "expiresAt": "2025-01-01T00:00:00Z"
    }
  ],
  "hasValidWaiver": true,
  "validWaiver": { /* most recent valid waiver */ },
  "totalWaivers": 2
}
```

## Database Tables Used

### members
- All member information including personal details
- `family_account_id` links family members together
- `is_primary_account_holder` identifies the account owner
- Stripe integration fields for billing

### check_ins
- Tracks member attendance
- Links to member via `member_id`
- Includes `check_in_time` and `class_type`

### waivers
- Stores signed waivers
- Links to member via `member_id`
- Validity calculated as 1 year from `signed_at`

## Design System

The portal follows The Fort Jiu-Jitsu design language:
- **Background**: Black (#000000)
- **Cards**: Dark gray (#1a1a1a / gray-900)
- **Borders**: Gray-800 (#1f2937)
- **Text**: White primary, gray-400 secondary
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first with Tailwind CSS

## Future Enhancements

### Authentication
Currently uses simple email entry. Future improvements:
- Magic link authentication
- SMS verification
- Password-based login
- OAuth (Google, Facebook)

### Additional Features
- Edit member information
- Manage payment methods
- View billing history
- Schedule class reservations
- Message instructors
- Download waivers
- Family member switching (view other family members' data)
- Push notifications for check-ins

### Security
- Rate limiting on API routes
- Input sanitization
- Session management
- CSRF protection
- Encrypted member data

## Navigation Integration

The Member Portal is accessible from the main navigation bar:
- Desktop: "Member Portal" link in top nav
- Mobile: "Member Portal" in hamburger menu
- Direct URL: `/member`

## Usage Example

1. Member visits `/member`
2. Enters their email address
3. Dashboard loads with:
   - Current status and metrics
   - Family members list
   - Recent check-ins
   - Account details
4. Primary account holders can add family members via "Add Member" button
5. Link pre-fills family_account_id in signup form

## Support

For issues or questions:
- Phone: (260) 452-7615
- Contact form: `/contact`
- In-person at the gym

---

Built with Next.js 16, TypeScript, Tailwind CSS, Framer Motion, and Supabase
