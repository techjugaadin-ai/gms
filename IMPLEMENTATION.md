# GMS Implementation Guide

## Project Overview

**GMS (Gym Management System)** is a multi-tenant SaaS platform for managing gym operations. The PoC is built with modern web technologies and structured for scalability.

**Current Status:** Production-ready MVP ✅  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zod, Recharts  
**Database:** JSON files (upgradable to PostgreSQL)

---

## Quick Start

### Installation & Setup

```bash
cd gms
npm install
npm run seed       # Generate hashed passwords + demo data
npm run dev        # Start at http://localhost:3000
```

### Login Credentials

```
Super Admin:  superadmin@gms.local / Admin@123
Gym Owner 1:  owner@gms.local / Owner@123
Gym Owner 2:  owner2@gms.local / Owner@123
```

---

## Architecture

### Layered Design

```
┌─────────────────────────────────────────────────────┐
│          UI Layer (React Components)                │
│  (Pages, Forms, Tables, Charts, Modals)            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│        API Routes (Next.js Route Handlers)         │
│  /api/auth, /api/members, /api/payments, etc.     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│       Service Layer (Business Logic)               │
│  - MemberService          - DashboardService       │
│  - PaymentService         - NotificationService    │
│  - MembershipPlanService  - AdminService           │
│  - GymService                                       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│      Repository Interfaces (Data Access)           │
│  - IUserRepository        - IPaymentRepository     │
│  - IMemberRepository      - INotificationRepo      │
│  - IPlanRepository        - IGymRepository         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│    Storage Implementations (Pluggable)             │
│  - JsonFileRepository (current)                    │
│  - PostgresRepository (future)                     │
└─────────────────────────────────────────────────────┘
```

### Key Patterns

**Repository Pattern:** All data access goes through repositories, never directly to storage.

**Multi-tenancy:** Every query is scoped by `gymId` from authenticated user session.

**Zod Validation:** All API inputs validated using Zod schemas before processing.

**Session-based Auth:** In-memory session store (replaceable with Redis/DB).

---

## File Structure

```
gms/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── auth/              # Login, logout, me
│   │   ├── members/           # Member CRUD
│   │   ├── payments/          # Payment recording
│   │   ├── membership-plans/  # Plan management
│   │   ├── notifications/     # Notifications API
│   │   ├── dashboard/         # Dashboard metrics
│   │   ├── gym/               # Gym settings
│   │   └── admin/             # Admin-only routes
│   ├── login/                 # Login page
│   ├── dashboard/             # Owner dashboard
│   ├── members/               # Members pages
│   ├── payments/              # Payments page
│   ├── reports/               # Reports page
│   ├── notifications/         # Notifications page
│   ├── admin/                 # Gym owner admin area
│   ├── super-admin/           # Super admin area
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Root redirect
│   └── globals.css            # Tailwind styles
│
├── components/
│   ├── ui/                    # UI components
│   │   ├── Button.tsx         # Reusable button
│   │   ├── Input.tsx          # Input/Select/Textarea
│   │   ├── Card.tsx           # Card container
│   │   ├── Badge.tsx          # Status badges
│   │   ├── Modal.tsx          # Modal dialog
│   │   └── Toast.tsx          # Toast notifications
│   ├── layout/                # Layout components
│   │   ├── Sidebar.tsx        # Main navigation
│   │   ├── TopNav.tsx         # Header with notifications
│   │   └── AppLayout.tsx      # App wrapper
│   ├── dashboard/             # Dashboard components
│   │   ├── MetricCard.tsx     # KPI card
│   │   └── CollectionChart.tsx # 7-day chart
│   ├── members/               # Member form
│   │   └── MemberForm.tsx
│   └── payments/              # Payment form
│       └── PaymentForm.tsx
│
├── lib/
│   ├── auth/                  # Authentication
│   │   ├── password.ts        # Password hashing
│   │   └── session.ts         # Session management
│   ├── repositories/          # Data access layer
│   │   ├── index.ts           # Exported repositories
│   │   └── JsonFileRepository.ts  # JSON storage
│   ├── services/              # Business logic
│   │   ├── member.service.ts
│   │   ├── payment.service.ts
│   │   ├── membership-plan.service.ts
│   │   ├── notification.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── gym.service.ts
│   │   └── admin.service.ts
│   ├── utils/                 # Helper functions
│   │   ├── api.ts            # Response builders
│   │   ├── cn.ts             # Tailwind merge
│   │   ├── date.ts           # Date utilities
│   │   └── id.ts             # ID generators
│   └── validation/            # Zod schemas
│       └── schemas.ts
│
├── types/                     # TypeScript types
│   ├── member.ts
│   ├── payment.ts
│   ├── membership-plan.ts
│   ├── notification.ts
│   ├── gym.ts
│   ├── user.ts
│   └── index.ts
│
├── data/                      # JSON data files
│   ├── users.json            # Users with hashed passwords
│   ├── gyms.json             # Gym accounts
│   ├── members.json          # Member records
│   ├── membership-plans.json # Pricing tiers
│   ├── payments.json         # Transaction history
│   └── notifications.json    # Alerts
│
├── scripts/
│   ├── seed.js               # Data seeding script
│   └── seed.ts               # TypeScript version (optional)
│
├── public/                    # Static assets
├── .env.local                # Environment (dev)
├── .env.example              # Template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Database Entities

### Users
```typescript
{
  id: string                    // user_xxx
  gymId: string | null          // null for super admin
  name: string
  email: string
  passwordHash: string          // bcrypt hash
  role: 'SUPER_ADMIN' | 'GYM_OWNER'
  active: boolean
  createdAt: string            // ISO 8601
  updatedAt: string
}
```

### Members
```typescript
{
  id: string                    // GYM001-M000001
  gymId: string
  name: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email?: string
  address?: string
  membershipPlanId: string
  joiningDate: string           // YYYY-MM-DD
  membershipStartDate: string
  membershipEndDate: string
  referralCode: string          // Unique code
  isDeleted: boolean            // Soft delete
  createdAt: string
  updatedAt: string
}
```

### Payments
```typescript
{
  id: string                    // pay_xxx
  gymId: string
  memberId: string
  planId: string
  amount: number
  paymentDate: string           // YYYY-MM-DD
  paymentType: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other'
  notes?: string
  createdAt: string
}
```

### Membership Plans
```typescript
{
  id: string                    // plan_xxx
  gymId: string
  name: string                  // "Monthly", "Quarterly", etc.
  durationMonths: number
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}
```

### Gyms
```typescript
{
  id: string                    // gym_xxx
  name: string
  ownerId: string               // user.id
  phone: string
  email: string
  address: string
  currency: string              // "INR", "USD", etc.
  status: 'active' | 'suspended'
  subscriptionPlan: string      // "monthly", "yearly"
  subscriptionStartDate: string
  subscriptionEndDate: string
  paymentStatus: 'paid' | 'pending' | 'overdue'
  subscriptionAmount: number
  createdAt: string
  updatedAt: string
}
```

### Notifications
```typescript
{
  id: string
  gymId: string
  memberId: string
  type: string                  // "MEMBERSHIP_EXPIRING_7_DAYS", etc.
  message: string
  scheduledAt: string
  read: boolean
  createdAt: string
}
```

---

## API Routes

### Authentication
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/logout` — Logout (clear session)
- `GET /api/auth/me` — Get current user

### Members (Gym Owner only)
- `GET /api/members` — List members
- `POST /api/members` — Create member
- `GET /api/members/[id]` — Get member detail
- `PATCH /api/members/[id]` — Update member
- `DELETE /api/members/[id]` — Soft delete member
- `GET /api/members/[id]/payments` — Member's payment history

### Payments (Gym Owner only)
- `GET /api/payments` — List payments
- `POST /api/payments` — Record new payment

### Membership Plans (Gym Owner only)
- `GET /api/membership-plans` — List plans
- `POST /api/membership-plans` — Create plan
- `PATCH /api/membership-plans/[id]` — Update plan
- `DELETE /api/membership-plans/[id]` — Deactivate plan

### Notifications (Gym Owner only)
- `GET /api/notifications` — List notifications
- `PATCH /api/notifications/[id]/read` — Mark as read

### Dashboard (Gym Owner only)
- `GET /api/dashboard` — Fetch KPIs and chart data

### Gym Settings (Gym Owner only)
- `GET /api/gym` — Get gym details
- `PATCH /api/gym` — Update gym config

### Admin (Super Admin only)
- `GET /api/admin/dashboard` — SaaS metrics
- `GET /api/admin/gyms` — List all gyms
- `PATCH /api/admin/gyms/[id]/status` — Activate/suspend gym
- `PATCH /api/admin/gyms/[id]/subscription` — Renew subscription

---

## Key Features

### For Gym Owners

✅ **Dashboard**
- Today's collection amount
- Monthly collection
- Active/expiring/expired member counts
- New members today/this month
- 7-day collection chart
- Unread notifications count

✅ **Members**
- Search by name or phone
- Add new members with bio data
- Edit member details
- Soft delete (undo-able)
- View payment history
- Membership status badges

✅ **Payments**
- Record manual payments
- Multiple payment types (Cash, UPI, Card, Bank Transfer)
- Auto-extend membership when payment recorded
- Filter by date range

✅ **Notifications**
- Auto-generated expiry alerts (7, 3, 1 days before & after)
- Mark as read
- Persistent across sessions

✅ **Reports**
- Date-filtered collection reports
- Member status breakdown
- Payment history
- Quick filters (Today, This Week, This Month, Custom)

✅ **Settings**
- Edit gym name, phone, email, address
- Set currency (INR, USD, EUR, GBP)
- Manage membership plans (create, edit, deactivate)

### For Super Admin

✅ **Dashboard**
- Total gyms (active/suspended)
- Total members across all gyms
- Total revenue
- Subscription health (expiring/expired)
- Pending payments

✅ **Gym Management**
- Suspend/activate gyms
- Renew subscriptions
- Update payment status
- View gym details

---

## Deployment

### Local Development
```bash
npm run dev
# Runs at http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push to GitHub
2. Import in Vercel dashboard
3. Set environment variables (from `.env.example`)
4. Deploy

**Environment Variables for Vercel:**
```
NEXT_PUBLIC_APP_NAME=GMS
AUTH_SECRET=<generate with: openssl rand -base64 32>
STORAGE_MODE=blob
BLOB_TOKEN=<from Vercel Blob dashboard>
```

---

## Upgrades & Future Work

### Phase 2: Database
- [ ] Replace `JsonFileRepository` with PostgreSQL implementation
- [ ] Add Prisma ORM
- [ ] Run migrations
- [ ] Index key queries

### Phase 3: Auth
- [ ] Replace session-based auth with Auth.js/Clerk
- [ ] Add Google/email sign-up
- [ ] Two-factor authentication
- [ ] Password reset flow

### Phase 4: Integrations
- [ ] Razorpay/Stripe payment gateway
- [ ] WhatsApp/Email notifications
- [ ] Google Forms member onboarding
- [ ] Bulk SMS reminders

### Phase 5: Analytics
- [ ] Member lifetime value
- [ ] Churn prediction
- [ ] Revenue forecasting
- [ ] Retention cohorts

### Phase 6: Mobile
- [ ] React Native companion app
- [ ] QR code check-in
- [ ] Push notifications

---

## Development Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed demo data (destructive)
```

---

## Tech Stack Details

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2.8 |
| Framework | Next.js | 16.3.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4 |
| UI Icons | Lucide React | 1.33.0 |
| Validation | Zod | 4.4.3 |
| Charts | Recharts | 3.10.1 |
| Password | bcryptjs | 3.0.3 |
| ID Gen | UUID | 9.x |

---

## Error Handling

All API routes follow a consistent error response format:

```javascript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "Human readable message" } }
```

Common error codes:
- `UNAUTHORIZED` — Not authenticated (401)
- `FORBIDDEN` — Authenticated but no permission (403)
- `VALIDATION_ERROR` — Input validation failed (400)
- `NOT_FOUND` — Resource not found (404)
- `INTERNAL_ERROR` — Server error (500)

---

## Testing Workflow

1. **Login** → Use demo credentials from login page quick-fill buttons
2. **Dashboard** → View KPIs and charts (auto-generated from seeded data)
3. **Members** → Add/edit/view members, see soft delete working
4. **Payments** → Record payments, see membership extended
5. **Reports** → Filter by date, see collection metrics
6. **Notifications** → See auto-generated expiry alerts
7. **Switch User** → Logout and login as different role

---

## Support

For issues or questions, refer to:
- `README.md` — Quick start
- This file — Architecture & implementation details
- Inline code comments — For complex logic
