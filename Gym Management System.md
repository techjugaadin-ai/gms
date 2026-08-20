# Gym Management System — Minimal PoC

## 1. Objective

Build a minimal but scalable Gym Management System (GMS) as a Proof of Concept.

The system has two main user roles:

1. **Super Admin**
   - Application owner / SaaS administrator.
   - Can see and manage all registered gyms.
   - Can monitor subscriptions, revenue, member counts and gym status.

2. **Gym Owner**
   - Owner/admin of an individual gym.
   - Can manage gym members.
   - Can manage membership plans.
   - Can view dashboard, reports and notifications.
   - Can configure gym settings.

The PoC should focus primarily on the **Gym Owner workflow**, while implementing a basic Super Admin dashboard.

---

# 2. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive UI
- App Router

## Backend

Use Next.js Route Handlers / Server Actions.

Do NOT create a separate Python backend for this PoC.

Python is not required because:

- CRUD operations are simple.
- Authentication is simple.
- Business logic is relatively small.
- Next.js can handle frontend and backend in one repository.
- Deployment to Vercel becomes much easier.

Python can be introduced later if we add:

- AI/LLM services
- complex background processing
- analytics pipelines
- ML models
- independent microservices

## Storage

Initial:

- JSON-based storage.

Architecture must use a repository abstraction so that storage can later be replaced by PostgreSQL.

Recommended structure:

```text
Application
     |
     v
Service / Business Logic
     |
     v
Repository Interface
     |
     +---- JsonFileRepository
     |
     +---- JsonBlobRepository
     |
     +---- PostgresRepository (future)
```

The application must never directly read/write JSON files from business logic.

---

# 3. Important Vercel Storage Decision

Do NOT assume that this will work reliably on Vercel:

```text
data/members.json
data/gyms.json
```

and then modify those files during API requests.

Vercel's deployed filesystem should not be treated as a persistent database.

Therefore create two storage implementations.

### Local Development

```text
JsonFileRepository
```

Example:

```text
/data
    gyms.json
    members.json
    membership-plans.json
    payments.json
    notifications.json
    users.json
```

This makes local development very simple.

### Vercel PoC

Use a JSON-compatible persistent object/blob storage implementation.

For example:

```text
JsonBlobRepository
```

The actual data format remains JSON.

Environment variables can contain the storage credentials.

### Future Production

Replace:

```text
JsonBlobRepository
```

with:

```text
PostgresRepository
```

No UI/business logic should need to change.

---

# 4. High-Level Architecture

```text
                         GMS
                          |
             +------------+------------+
             |                         |
        Super Admin                Gym Owner
             |                         |
       Admin Dashboard           Gym Dashboard
             |                         |
      Gym Management            Member Management
      Subscription              Membership Plans
      Revenue                   Payments
      Gym Metrics               Notifications
                                   |
                                   v
                            Next.js Application
                                   |
                        +----------+----------+
                        |                     |
                    API Layer            Business Logic
                        |                     |
                        +----------+----------+
                                   |
                            Repository Layer
                                   |
                +------------------+------------------+
                |                  |                  |
          JSON File          JSON Blob          PostgreSQL
           Local               PoC               Future
```

---

# 5. User Roles

## Super Admin

The Super Admin represents the SaaS/application provider.

Capabilities:

- View all gyms.
- View total number of gyms.
- View total members.
- View total revenue.
- View subscription expiry.
- View payment status.
- View suspended gyms.
- Renew gym subscription.
- Suspend/activate gym.
- View basic business metrics.

For the PoC, do not build a complicated billing system.

Only maintain subscription information.

Example:

```json
{
  "subscriptionPlan": "yearly",
  "subscriptionStart": "2026-01-01",
  "subscriptionExpiry": "2026-12-31",
  "paymentStatus": "paid",
  "status": "active"
}
```

---

# 6. Gym Owner

The Gym Owner is the primary user of the application.

The Gym Owner should see:

```text
Dashboard
Users / Members
Reports
Notifications
Admin
```

---

# 7. Authentication

For the PoC implement basic authentication with role-based access.

Roles:

```text
SUPER_ADMIN
GYM_OWNER
```

The authentication system should be designed so it can later be replaced with:

- Auth.js
- Clerk
- Supabase Auth
- another production authentication provider

For the PoC:

- Seed demo users.
- Login using email/password.
- Create a secure session.
- Store only the session identifier in the cookie.
- Never expose passwords to the frontend.
- Passwords must not be stored as plaintext even in the PoC.

Example users:

```text
Super Admin
email: superadmin@gms.local

Gym Owner
email: owner@gms.local
```

Use environment variables for demo credentials if appropriate.

---

# 8. Gym Owner Dashboard

The dashboard should be very simple.

Display cards:

```text
Today's Collection
This Month's Collection
Custom Date Range Collection

Total Registered Members
Members With No Dues
Members With Dues
Total Pending Payments

New Members Today
New Members This Month
```

Example layout:

```text
------------------------------------------------
| Today's Collection | This Month Collection  |
------------------------------------------------
| Total Members      | Members With No Dues   |
------------------------------------------------
| Pending Payments   | New Members This Month |
------------------------------------------------
```

Add a simple collection chart.

For the PoC, the chart can show:

```text
Last 7 Days
```

or

```text
Last 30 Days
```

Do not build advanced analytics initially.

---

# 9. Member Management

This is the most important feature of the PoC.

The Gym Owner should be able to:

```text
Add Member
View Members
Search Members
Edit Member
Remove Member
View Member Details
Record Payment
```

Member list should contain:

```text
Name
Phone
Membership Plan
Membership Expiry
Payment Status
Actions
```

---

# 10. Add New Member

Provide two options.

## Option A — Add Manually

Display a form.

Required fields:

```text
Name
Gender
Phone
Membership Plan
Joining Date
```

Optional fields:

```text
Email
Permanent Address
Emergency Contact
Weight
Height
Medical Information
```

The system should automatically generate:

```text
Member ID
Referral Code
```

Example:

```text
Member ID: GYM001-M000123
Referral Code: TALIB82
```

---

# 11. Add Member Through Google Form

The architecture diagram includes:

```text
Add Member via GForm
      |
      +--- GForm Link
      |
      +--- GForm QR Code
```

For the minimal PoC:

### Do NOT implement automatic Google Forms synchronization initially.

Instead provide:

```text
Google Form Link
Copy Link
Generate QR Code
```

The Gym Owner can share the form with customers.

Later implement:

```text
Google Form
      |
      v
Google Sheets
      |
      v
Webhook / Polling
      |
      v
GMS
      |
      v
Create Member
```

This should be a Phase 2 feature.

---

# 12. Member Metadata

Store the following information:

```text
Member ID
Name
Age
Gender
Membership Plan
Image
Current Address
Permanent Address
Phone Number
Emergency Contact Number
Weight
Height
Joining Date
Medical Information
Referral Code
Created At
Updated At
```

Do not store unnecessary sensitive information during the PoC.

Medical information should be optional.

---

# 13. Membership Plans

Gym Owner should be able to create membership plans.

Initial plans:

```text
Monthly
Quarterly
Half-Yearly
Yearly
Custom
```

Each plan should contain:

```json
{
  "id": "plan_001",
  "name": "Monthly",
  "durationMonths": 1,
  "price": 1500,
  "active": true
}
```

The Gym Owner should be able to:

```text
Create Plan
Edit Plan
Delete/Deactivate Plan
```

---

# 14. Important Membership Rule

Membership plans can change in the future.

However:

> Changing a membership plan must NOT modify historical payments.

Example:

Old plan:

```text
Monthly = ₹1,000
```

Gym changes it to:

```text
Monthly = ₹1,500
```

Existing payment records must continue showing:

```text
₹1,000
```

New members/payments should use:

```text
₹1,500
```

Therefore payment records must store the actual amount paid rather than only referencing the current plan price.

---

# 15. Payment Management

For the PoC, do not integrate Razorpay/Stripe initially.

Allow Gym Owner to manually record a payment.

Payment fields:

```text
Payment ID
Member ID
Amount
Payment Date
Payment Type
Membership Plan
Payment Screenshot
Created At
```

Payment type:

```text
Cash
UPI
Card
Bank Transfer
Other
```

For the PoC, payment screenshot can be optional.

---

# 16. Member Payment History

Opening a member should show:

```text
Member Information

Membership Information

Payment History
```

Example:

```text
Payment History

01 Aug 2026
₹1,500
UPI

01 Jul 2026
₹1,500
Cash

01 Jun 2026
₹1,500
UPI
```

---

# 17. Membership Expiry

Every membership should have:

```text
startDate
endDate
```

The system should calculate membership status:

```text
ACTIVE
EXPIRING_SOON
EXPIRED
```

Suggested logic:

```text
endDate > today + 7 days
    ACTIVE

endDate between today and today + 7 days
    EXPIRING_SOON

endDate < today
    EXPIRED
```

Do not store calculated status if it can be derived from dates.

---

# 18. Notifications

The dashboard should show upcoming payment/membership reminders.

Initial notification rules:

```text
7 days before expiry
3 days before expiry
1 day before expiry
Expiry day
2 days after expiry
7 days after expiry
```

Also show:

```text
Payments Pending
Membership Expiring Soon
Expired Memberships
```

For the PoC, notifications can simply appear in the dashboard.

Do NOT build WhatsApp integration initially.

---

# 19. Future WhatsApp Integration

Design the notification system so that WhatsApp can be plugged in later.

Architecture:

```text
NotificationService
       |
       +---- InAppNotificationProvider
       |
       +---- WhatsAppProvider       (future)
       |
       +---- EmailProvider           (future)
```

Later:

```text
Membership Expiry
       |
       v
Notification Engine
       |
       +---- WhatsApp
       +---- Email
       +---- SMS
```

This prevents WhatsApp-specific code from spreading throughout the application.

---

# 20. Reports

Minimal reports:

```text
Today's Collection
Monthly Collection
Custom Date Collection

Total Members
Active Members
Expired Members

Members With Pending Payment
Members Expiring Soon

New Members
```

Allow date filtering:

```text
Today
This Week
This Month
Custom Range
```

---

# 21. Admin Settings

Gym Owner Admin section:

```text
Settings
    |
    +--- Configuration
    |
    +--- Membership Plans
```

Configuration can contain:

```text
Gym Name
Gym Phone
Gym Email
Gym Address
Currency
Default Membership Duration
Reminder Settings
```

Keep this simple.

---

# 22. Super Admin Dashboard

Super Admin should have a completely separate dashboard.

Display:

```text
Total Gyms
Active Gyms
Suspended Gyms

Total Members
Total Revenue

Subscriptions Expiring Soon
Expired Subscriptions

Paid Gyms
Pending Payments
```

Gym table:

```text
Gym Name
Owner
Members
Subscription
Expiry
Payment Status
Status
Actions
```

Actions:

```text
View
Suspend
Activate
Renew
```

---

# 23. Subscription Management

For the PoC, support:

```text
Monthly
Quarterly
Half-Yearly
Yearly
Custom
```

Super Admin can assign/update the subscription.

Do not implement automatic payment processing yet.

Store:

```text
subscriptionPlan
subscriptionStartDate
subscriptionEndDate
paymentStatus
amount
```

Later this can be integrated with:

```text
Razorpay
Stripe
```

---

# 24. Data Model

The JSON structures should be designed similarly to relational database tables.

## gyms.json

```json
[
  {
    "id": "gym_001",
    "name": "FitZone Gym",
    "ownerId": "user_001",
    "phone": "+91XXXXXXXXXX",
    "email": "gym@example.com",
    "address": "Kozhikode",
    "status": "active",
    "subscriptionPlan": "yearly",
    "subscriptionStartDate": "2026-01-01",
    "subscriptionEndDate": "2026-12-31",
    "paymentStatus": "paid",
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-01T10:00:00Z"
  }
]
```

## users.json

```json
[
  {
    "id": "user_001",
    "gymId": "gym_001",
    "name": "Gym Owner",
    "email": "owner@example.com",
    "passwordHash": "...",
    "role": "GYM_OWNER",
    "active": true
  }
]
```

## members.json

```json
[
  {
    "id": "member_001",
    "gymId": "gym_001",
    "name": "John Doe",
    "gender": "male",
    "phone": "+91XXXXXXXXXX",
    "membershipPlanId": "plan_001",
    "joiningDate": "2026-08-01",
    "membershipStartDate": "2026-08-01",
    "membershipEndDate": "2026-09-01",
    "referralCode": "JOHN123",
    "createdAt": "2026-08-01T10:00:00Z",
    "updatedAt": "2026-08-01T10:00:00Z"
  }
]
```

## membership-plans.json

```json
[
  {
    "id": "plan_001",
    "gymId": "gym_001",
    "name": "Monthly",
    "durationMonths": 1,
    "price": 1500,
    "active": true
  }
]
```

## payments.json

```json
[
  {
    "id": "payment_001",
    "gymId": "gym_001",
    "memberId": "member_001",
    "planId": "plan_001",
    "amount": 1500,
    "paymentDate": "2026-08-01",
    "paymentType": "UPI",
    "createdAt": "2026-08-01T10:00:00Z"
  }
]
```

## notifications.json

```json
[
  {
    "id": "notification_001",
    "gymId": "gym_001",
    "memberId": "member_001",
    "type": "MEMBERSHIP_EXPIRING",
    "message": "Membership expires in 3 days",
    "scheduledAt": "2026-08-29T10:00:00Z",
    "read": false
  }
]
```

---

# 25. Multi-Tenant Architecture

This is extremely important.

The application is SaaS-oriented, therefore every gym is a tenant.

Every gym-owned entity should contain:

```text
gymId
```

For example:

```text
members.gymId
payments.gymId
membershipPlans.gymId
notifications.gymId
```

Never allow a Gym Owner to query another gym's data.

Every backend query must be scoped by:

```text
authenticatedUser.gymId
```

Example:

```text
GET /api/members
```

must internally behave like:

```text
getMembers({
    gymId: currentUser.gymId
})
```

NOT:

```text
getAllMembers()
```

This will make PostgreSQL migration and SaaS scaling much easier later.

---

# 26. API Design

Use REST-style API routes.

## Authentication

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Members

```text
GET    /api/members
GET    /api/members/:id
POST   /api/members
PATCH  /api/members/:id
DELETE /api/members/:id
```

## Payments

```text
GET  /api/payments
GET  /api/members/:id/payments
POST /api/payments
```

## Membership Plans

```text
GET    /api/membership-plans
POST   /api/membership-plans
PATCH  /api/membership-plans/:id
DELETE /api/membership-plans/:id
```

## Dashboard

```text
GET /api/dashboard
```

The dashboard API should calculate:

```text
totalMembers
activeMembers
expiredMembers
pendingPayments
todayCollection
monthlyCollection
newMembers
```

## Notifications

```text
GET /api/notifications
PATCH /api/notifications/:id/read
```

## Gym

```text
GET   /api/gym
PATCH /api/gym
```

## Super Admin

```text
GET /api/admin/gyms
GET /api/admin/dashboard
PATCH /api/admin/gyms/:id/status
PATCH /api/admin/gyms/:id/subscription
```

---

# 27. Business Logic Layer

Do not put business logic directly inside API routes.

Bad:

```text
/api/members/route.ts
    |
    +--- read JSON
    +--- validate
    +--- calculate membership
    +--- create member
```

Instead:

```text
API Route
    |
    v
MemberService
    |
    v
MemberRepository
    |
    v
Storage
```

Example:

```text
POST /api/members
        |
        v
MemberService.createMember()
        |
        +--- validate data
        +--- generate member ID
        +--- generate referral code
        +--- calculate membership dates
        |
        v
MemberRepository.create()
        |
        v
Storage
```

This is the most important part of making the PoC scalable.

---

# 28. Recommended Folder Structure

```text
gms/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── members/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── payments/
│   │   └── page.tsx
│   │
│   ├── reports/
│   │   └── page.tsx
│   │
│   ├── notifications/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── membership-plans/
│   │       └── page.tsx
│   │
│   ├── super-admin/
│   │   ├── page.tsx
│   │   └── gyms/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       ├── members/
│       ├── payments/
│       ├── membership-plans/
│       ├── notifications/
│       ├── dashboard/
│       ├── gym/
│       └── admin/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── members/
│   ├── payments/
│   ├── notifications/
│   └── admin/
│
├── lib/
│   ├── auth/
│   ├── repositories/
│   ├── services/
│   ├── validation/
│   ├── utils/
│   └── storage/
│
├── types/
│   ├── user.ts
│   ├── gym.ts
│   ├── member.ts
│   ├── payment.ts
│   ├── membership-plan.ts
│   └── notification.ts
│
├── data/
│   ├── gyms.json
│   ├── users.json
│   ├── members.json
│   ├── payments.json
│   ├── membership-plans.json
│   └── notifications.json
│
├── scripts/
│   └── seed.ts
│
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# 29. Repository Abstraction

Define interfaces first.

Example concept:

```text
MemberRepository
    |
    +--- getById()
    +--- getByGymId()
    +--- create()
    +--- update()
    +--- delete()
```

Implementation:

```text
JsonMemberRepository
```

Later:

```text
PostgresMemberRepository
```

The service should depend on:

```text
MemberRepository
```

rather than:

```text
JsonMemberRepository
```

This makes the storage layer replaceable.

---

# 30. Dependency Flow

Use this architecture:

```text
React Components
       |
       v
Next.js Pages
       |
       v
API / Server Actions
       |
       v
Services
       |
       v
Repository Interfaces
       |
       v
Storage Implementation
```

Never:

```text
React
   |
   v
JSON file
```

Never:

```text
React
   |
   v
PostgreSQL
```

The UI should never know how data is stored.

---

# 31. Validation

Use a schema validation library such as:

```text
Zod
```

Validate:

- Member creation
- Member update
- Payment
- Membership plan
- Gym settings
- Authentication input

Example:

```text
CreateMemberSchema
UpdateMemberSchema
CreatePaymentSchema
CreateMembershipPlanSchema
```

---

# 32. Error Handling

Create standard API responses.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member not found"
  }
}
```

Do not expose internal errors to users.

Log technical errors on the server.

---

# 33. Environment Variables

Create:

```text
.env.local
.env.example
```

Example:

```env
NEXT_PUBLIC_APP_NAME=GMS

AUTH_SECRET=change-me

STORAGE_MODE=json

BLOB_TOKEN=

DEMO_ADMIN_EMAIL=
DEMO_ADMIN_PASSWORD=

DEMO_GYM_OWNER_EMAIL=
DEMO_GYM_OWNER_PASSWORD=
```

Never commit:

```text
.env.local
```

Commit only:

```text
.env.example
```

---

# 34. UI Requirements

Keep the PoC UI clean and simple.

Use:

```text
Sidebar
Top Navigation
Cards
Tables
Forms
Modals
Toast Notifications
```

Gym Owner sidebar:

```text
Dashboard
Members
Payments
Reports
Notifications

Admin
    Settings
    Membership Plans
```

Super Admin sidebar:

```text
Dashboard
Gyms
Subscriptions
Revenue
Settings
```

Mobile responsive design is required.

---

# 35. Member List UX

The Member page should have:

```text
Members

[ Search members... ]       [ Add Member ]

------------------------------------------------
Name     Phone     Plan     Expiry     Status
------------------------------------------------
John     XXXXX     Monthly  01 Sep     Active
Ali      XXXXX     Yearly   20 Aug     Expiring
Rahul    XXXXX     Monthly  01 Aug     Expired
------------------------------------------------
```

Actions:

```text
View
Edit
Payment
Delete
```

---

# 36. Delete Member Rule

Do not permanently delete a member immediately.

Implement soft deletion.

Example:

```json
{
  "deletedAt": "2026-08-20T10:00:00Z"
}
```

or:

```json
{
  "isDeleted": true
}
```

The member disappears from normal queries.

This will make future auditing/recovery easier.

---

# 37. Payment Rule

Never calculate historical revenue using the current membership plan price.

Use:

```text
payments.amount
```

for historical revenue.

Dashboard:

```text
Today's Collection
=
SUM(payment.amount WHERE paymentDate = today)
```

Monthly:

```text
Monthly Collection
=
SUM(payment.amount WHERE paymentDate is inside current month)
```

---

# 38. Referral System

Automatically generate:

```text
Referral Code
```

for every member.

For the PoC:

```text
Unique referral code
Discount percentage
```

Example:

```json
{
  "referralCode": "JOHN123",
  "discountPercentage": 10
}
```

Do not implement a complex referral tree initially.

---

# 39. Notification Engine

Create a service:

```text
NotificationService
```

It should be responsible for determining:

```text
Who needs a notification?
Why?
When?
Which notification type?
```

Example:

```text
Member expires in 7 days
        |
        v
NotificationService
        |
        v
MEMBERSHIP_EXPIRY_7_DAYS
```

For the PoC, simply generate in-app notifications.

Later add:

```text
WhatsApp
Email
SMS
```

without changing membership logic.

---

# 40. Seed Data

The application must start with realistic demo data.

Seed:

```text
1 Super Admin
2 Gym Owners
2 Gyms

10-20 Members per gym

Monthly
Quarterly
Half-Yearly
Yearly plans

Multiple payment records

Some active members
Some expiring members
Some expired members

Some notifications
```

This makes the dashboard immediately useful after deployment.

---

# 41. Demo Accounts

Create demo credentials.

Example:

```text
Super Admin

Email:
superadmin@gms.local

Password:
defined through environment variable
```

Gym Owner:

```text
owner@gms.local
```

The application should clearly identify the logged-in role.

---

# 42. POC Scope — MUST HAVE

The first version should contain ONLY:

### Authentication

- Login
- Logout
- Role-based access

### Gym Owner

- Dashboard
- Member CRUD
- Membership plans
- Manual payment entry
- Payment history
- Membership expiry status
- Basic notifications
- Basic reports
- Gym settings

### Super Admin

- Dashboard
- Gym list
- Gym status
- Subscription information
- Basic revenue/member metrics

### Storage

- JSON repository
- Seed data
- Repository abstraction

---

# 43. POC Scope — DO NOT BUILD YET

Do NOT build these initially:

```text
Razorpay
Stripe
WhatsApp API
Email automation
SMS
Google Form synchronization
Advanced analytics
AI chatbot
AI membership recommendations
Mobile application
Complex referral system
Multi-language support
Advanced audit logs
Complex billing
Microservices
Kubernetes
Separate Python backend
```

These should come later.

---

# 44. Phase 2

After the PoC works:

```text
PostgreSQL
        |
        v
Proper authentication
        |
        v
Google Forms integration
        |
        v
WhatsApp notifications
        |
        v
Payment gateway
        |
        v
Email notifications
```

---

# 45. Phase 3

Scale the SaaS:

```text
PostgreSQL
Redis
Background Jobs
Queue
Object Storage
WhatsApp API
Payment Gateway
Email Service
Analytics
Audit Logs
```

Potential architecture:

```text
Next.js
   |
   +---- PostgreSQL
   |
   +---- Redis
   |
   +---- Object Storage
   |
   +---- Notification Queue
             |
             +---- WhatsApp
             +---- Email
             +---- SMS
```

Only introduce these when actual scale requires them.

---

# 46. Important Design Principle

Keep the domain/business logic independent of the infrastructure.

For example:

```text
MembershipService
```

should not know whether data is stored in:

```text
JSON
PostgreSQL
MongoDB
```

It should only know:

```text
MemberRepository
MembershipPlanRepository
PaymentRepository
```

This is what allows the PoC to evolve into a real SaaS product.

---

# 47. Recommended Development Order

Implement in this exact order.

## Step 1

Create Next.js project.

```text
Next.js
TypeScript
Tailwind
App Router
```

## Step 2

Create folder structure.

## Step 3

Create TypeScript domain models.

```text
User
Gym
Member
Payment
MembershipPlan
Notification
```

## Step 4

Create Zod validation schemas.

## Step 5

Create repository interfaces.

## Step 6

Create JSON repository.

## Step 7

Create seed data.

## Step 8

Create authentication.

## Step 9

Create Gym Owner dashboard.

## Step 10

Create Member CRUD.

## Step 11

Create Membership Plan CRUD.

## Step 12

Create Payment functionality.

## Step 13

Create membership status calculation.

## Step 14

Create Notifications.

## Step 15

Create Reports.

## Step 16

Create Super Admin dashboard.

## Step 17

Create Gym subscription management.

## Step 18

Create responsive UI.

## Step 19

Add error handling and loading states.

## Step 20

Deploy to Vercel.

---

# 48. GitHub Copilot Development Rules

When generating code, follow these rules.

### Rule 1

Use TypeScript everywhere.

### Rule 2

Use Next.js App Router.

### Rule 3

Do not introduce Python.

### Rule 4

Do not introduce a database for the initial PoC.

### Rule 5

Do not directly access JSON files from React components.

### Rule 6

Do not directly access JSON files from API routes.

### Rule 7

Use repository interfaces.

### Rule 8

Keep business logic in service classes/functions.

### Rule 9

Every tenant-owned entity must have `gymId`.

### Rule 10

Never allow one Gym Owner to access another Gym's data.

### Rule 11

Use Zod for validation.

### Rule 12

Use environment variables for secrets.

### Rule 13

Never commit `.env.local`.

### Rule 14

Use reusable UI components.

### Rule 15

Avoid unnecessary abstractions.

### Rule 16

Do not create microservices.

### Rule 17

Do not over-engineer the PoC.

### Rule 18

Write code so PostgreSQL can replace JSON later.

---

# 49. Definition of Done

The PoC is complete when:

- A user can login.
- Super Admin sees Super Admin dashboard.
- Gym Owner sees Gym Owner dashboard.
- Gym Owner can create a member.
- Gym Owner can edit a member.
- Gym Owner can view a member.
- Gym Owner can delete/deactivate a member.
- Gym Owner can create membership plans.
- Gym Owner can edit membership plans.
- Gym Owner can record payments.
- Member payment history is visible.
- Membership expiry is calculated correctly.
- Dashboard metrics are calculated correctly.
- Notifications for expiring memberships are visible.
- Reports work for basic date ranges.
- Super Admin can see all gyms.
- Super Admin can see subscription information.
- Gym data is isolated by `gymId`.
- Data layer is abstracted behind repositories.
- Demo data is available.
- `.env.example` is available.
- Application runs locally.
- Application can be deployed to Vercel.
- No business logic depends directly on PostgreSQL.
- No business logic depends directly on the JSON storage implementation.

---

# 50. Final Architecture Recommendation

For this PoC, I recommend:

```text
                 ┌───────────────────────┐
                 │       VERCEL          │
                 │                       │
                 │      Next.js          │
                 │                       │
                 │ ┌───────────────────┐ │
                 │ │ React Frontend    │ │
                 │ └─────────┬─────────┘ │
                 │           │           │
                 │ ┌─────────▼─────────┐ │
                 │ │ API / Server      │ │
                 │ │ Actions           │ │
                 │ └─────────┬─────────┘ │
                 │           │           │
                 │ ┌─────────▼─────────┐ │
                 │ │ Services          │ │
                 │ └─────────┬─────────┘ │
                 │           │           │
                 │ ┌─────────▼─────────┐ │
                 │ │ Repository        │ │
                 │ │ Interfaces        │ │
                 │ └─────────┬─────────┘ │
                 └───────────┼───────────┘
                             │
                    ┌────────▼────────┐
                    │ JSON Storage    │
                    │                 │
                    │ Local: File     │
                    │ Vercel: Blob    │
                    └─────────────────┘


                  FUTURE

                    ┌──────────────┐
                    │ PostgreSQL   │
                    └──────────────┘

                    Replace only
                    repository layer
```

The key idea is:

**Next.js + TypeScript + Repository Pattern + JSON now + PostgreSQL later.**

Do not start with:

```text
React
+
FastAPI
+
PostgreSQL
+
Redis
+
Docker
+
Microservices
```

That would be unnecessary complexity for this PoC.

Start with one Next.js application, but structure it like a real SaaS application internally.

---

# 51. Suggested First Version Navigation

### Super Admin

```text
/login

/super-admin
/super-admin/gyms
/super-admin/subscriptions
```

### Gym Owner

```text
/login

/dashboard

/members
/members/new
/members/:id

/payments

/reports

/notifications

/admin/settings
/admin/membership-plans
```

This is enough to demonstrate the complete core business flow without building unnecessary features.

---

# 52. Core Business Flow

The main PoC flow should be:

```text
Gym Owner Login
       |
       v
Dashboard
       |
       v
Add Member
       |
       v
Select Membership Plan
       |
       v
Membership Created
       |
       v
Record Payment
       |
       v
Member Active
       |
       v
Membership Approaches Expiry
       |
       v
Notification Generated
       |
       v
Gym Owner Sees Notification
       |
       v
Member Makes Renewal Payment
       |
       v
New Membership Period
```

And the SaaS provider flow:

```text
Super Admin Login
       |
       v
Super Admin Dashboard
       |
       v
View All Gyms
       |
       +---- Active Gym
       |
       +---- Expiring Subscription
       |
       +---- Suspended Gym
       |
       v
Manage Subscription
```

That is the **minimum complete product loop** I would build first.