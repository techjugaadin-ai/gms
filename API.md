# GMS API Reference

## Base URL
- **Local:** `http://localhost:3000/api`
- **Production:** `https://your-domain.com/api`

All responses include `success` boolean and either `data` or `error` object.

---

## Authentication

### POST /auth/login
Login with email/password

**Request:**
```json
{
  "email": "owner@gms.local",
  "password": "Owner@123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "name": "Ali Hassan",
    "email": "owner@gms.local",
    "role": "GYM_OWNER",
    "gymId": "gym_001"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Status Code:** 200 (success) | 401 (auth failed) | 400 (validation)

---

### POST /auth/logout
Clear session and logout

**Request:** No body

**Response:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

**Status Code:** 200

---

### GET /auth/me
Get current authenticated user

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "name": "Ali Hassan",
    "email": "owner@gms.local",
    "role": "GYM_OWNER",
    "gymId": "gym_001"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Not authenticated"
  }
}
```

**Status Code:** 200 (success) | 401 (not logged in)

---

## Members

### GET /members
List all members for current gym

**Query Params (Optional):**
- `search` — Filter by name or phone
- `skip` — Pagination offset (default: 0)
- `limit` — Pagination limit (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "GYM001-M000001",
        "gymId": "gym_001",
        "name": "John Doe",
        "phone": "+919876543210",
        "email": "john@example.com",
        "gender": "male",
        "address": "123 Main St",
        "joiningDate": "2026-08-01",
        "membershipPlanId": "plan_001",
        "membershipStartDate": "2026-08-01",
        "membershipEndDate": "2026-09-01",
        "membershipStatus": "ACTIVE",
        "referralCode": "JOHN-XYZ123",
        "isDeleted": false,
        "createdAt": "2026-08-01T10:00:00Z",
        "updatedAt": "2026-08-20T15:30:00Z"
      }
    ],
    "total": 15
  }
}
```

**Status Code:** 200 | 401 (unauthorized)

---

### POST /members
Create new member

**Request:**
```json
{
  "name": "Jane Smith",
  "phone": "+919876543211",
  "email": "jane@example.com",
  "gender": "female",
  "address": "456 Oak Ave",
  "membershipPlanId": "plan_001",
  "joiningDate": "2026-08-20"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "GYM001-M000016",
    "gymId": "gym_001",
    "name": "Jane Smith",
    "phone": "+919876543211",
    "email": "jane@example.com",
    "gender": "female",
    "address": "456 Oak Ave",
    "joiningDate": "2026-08-20",
    "membershipPlanId": "plan_001",
    "membershipStartDate": "2026-08-20",
    "membershipEndDate": "2026-09-20",
    "membershipStatus": "ACTIVE",
    "referralCode": "JANE-ABC456",
    "isDeleted": false,
    "createdAt": "2026-08-20T15:45:00Z",
    "updatedAt": "2026-08-20T15:45:00Z"
  }
}
```

**Status Code:** 201 (created) | 400 (validation error) | 401 (unauthorized)

---

### GET /members/[id]
Get single member detail with payment history

**Response:**
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "GYM001-M000001",
      "name": "John Doe",
      "phone": "+919876543210",
      "membershipPlanId": "plan_001",
      "membershipEndDate": "2026-09-01",
      "membershipStatus": "ACTIVE"
    },
    "plan": {
      "id": "plan_001",
      "name": "Monthly",
      "durationMonths": 1,
      "price": 1500
    },
    "payments": [
      {
        "id": "pay_001",
        "amount": 1500,
        "paymentDate": "2026-08-20",
        "paymentType": "UPI",
        "createdAt": "2026-08-20T10:30:00Z"
      }
    ]
  }
}
```

**Status Code:** 200 | 404 (not found) | 401 (unauthorized)

---

### PATCH /members/[id]
Update member details

**Request:**
```json
{
  "name": "John Doe Updated",
  "phone": "+919876543220",
  "email": "john.new@example.com",
  "gender": "male",
  "address": "789 Pine St"
}
```

**Response:** Updated member object (same as POST /members)

**Status Code:** 200 | 400 (validation error) | 404 (not found) | 401 (unauthorized)

---

### DELETE /members/[id]
Soft delete member (marks as deleted, doesn't remove data)

**Response:**
```json
{
  "success": true,
  "data": { "message": "Member removed successfully" }
}
```

**Status Code:** 200 | 404 (not found) | 401 (unauthorized)

---

## Payments

### GET /payments
List all payments for current gym

**Query Params (Optional):**
- `skip` — Pagination offset
- `limit` — Pagination limit
- `startDate` — Filter from date (YYYY-MM-DD)
- `endDate` — Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_001",
        "gymId": "gym_001",
        "memberId": "GYM001-M000001",
        "planId": "plan_001",
        "amount": 1500,
        "paymentDate": "2026-08-20",
        "paymentType": "UPI",
        "notes": "Cash payment",
        "createdAt": "2026-08-20T10:30:00Z"
      }
    ],
    "total": 22,
    "totalAmount": 33000
  }
}
```

**Status Code:** 200 | 401 (unauthorized)

---

### POST /payments
Record new payment (auto-extends membership)

**Request:**
```json
{
  "memberId": "GYM001-M000001",
  "planId": "plan_001",
  "amount": 1500,
  "paymentDate": "2026-08-20",
  "paymentType": "UPI",
  "notes": "Renewal for August"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "pay_023",
      "memberId": "GYM001-M000001",
      "amount": 1500,
      "paymentDate": "2026-08-20",
      "paymentType": "UPI"
    },
    "membershipExtended": {
      "newEndDate": "2026-09-20",
      "durationMonths": 1
    }
  }
}
```

**Status Code:** 201 (created) | 400 (validation error) | 404 (member not found) | 401 (unauthorized)

---

## Membership Plans

### GET /membership-plans
List all plans for current gym

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan_001",
      "gymId": "gym_001",
      "name": "Monthly",
      "durationMonths": 1,
      "price": 1500,
      "active": true,
      "createdAt": "2026-08-01T10:00:00Z",
      "updatedAt": "2026-08-01T10:00:00Z"
    },
    {
      "id": "plan_002",
      "gymId": "gym_001",
      "name": "Quarterly",
      "durationMonths": 3,
      "price": 4000,
      "active": true,
      "createdAt": "2026-08-01T10:00:00Z",
      "updatedAt": "2026-08-01T10:00:00Z"
    }
  ]
}
```

**Status Code:** 200 | 401 (unauthorized)

---

### POST /membership-plans
Create new membership plan

**Request:**
```json
{
  "name": "Half-Yearly",
  "durationMonths": 6,
  "price": 7500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "plan_004",
    "gymId": "gym_001",
    "name": "Half-Yearly",
    "durationMonths": 6,
    "price": 7500,
    "active": true,
    "createdAt": "2026-08-20T15:45:00Z",
    "updatedAt": "2026-08-20T15:45:00Z"
  }
}
```

**Status Code:** 201 (created) | 400 (validation error) | 401 (unauthorized)

---

### PATCH /membership-plans/[id]
Update plan

**Request:**
```json
{
  "name": "Half-Yearly Updated",
  "price": 8000
}
```

**Response:** Updated plan object

**Status Code:** 200 | 400 (validation) | 404 (not found) | 401 (unauthorized)

---

### DELETE /membership-plans/[id]
Deactivate plan (sets `active: false`)

**Response:**
```json
{
  "success": true,
  "data": { "message": "Plan deactivated successfully" }
}
```

**Status Code:** 200 | 404 (not found) | 401 (unauthorized)

---

## Notifications

### GET /notifications
List notifications for current gym (unread first)

**Query Params (Optional):**
- `unreadOnly` — Filter unread only (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "unread": [
      {
        "id": "notif_001",
        "gymId": "gym_001",
        "memberId": "GYM001-M000001",
        "type": "MEMBERSHIP_EXPIRING_7_DAYS",
        "message": "John Doe's membership expires in 7 days",
        "scheduledAt": "2026-08-13T10:00:00Z",
        "read": false,
        "createdAt": "2026-08-13T10:00:00Z"
      }
    ],
    "read": [
      {
        "id": "notif_002",
        "type": "MEMBERSHIP_EXPIRED_2_DAYS",
        "message": "Jane Smith's membership expired 2 days ago",
        "read": true,
        "createdAt": "2026-08-10T10:00:00Z"
      }
    ],
    "unreadCount": 1
  }
}
```

**Status Code:** 200 | 401 (unauthorized)

---

### PATCH /notifications/[id]/read
Mark notification as read

**Response:**
```json
{
  "success": true,
  "data": { "message": "Notification marked as read" }
}
```

**Status Code:** 200 | 404 (not found) | 401 (unauthorized)

---

## Dashboard

### GET /dashboard
Get KPI data and metrics for gym owner dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalMembers": 15,
      "activeMembers": 11,
      "expiringMembers": 2,
      "expiredMembers": 2,
      "newMembersToday": 0,
      "newMembersThisMonth": 15,
      "todayCollection": 1500,
      "monthlyCollection": 33000,
      "pendingPayments": 2
    },
    "collectionChart": [
      { "date": "2026-08-14", "amount": 4500 },
      { "date": "2026-08-15", "amount": 3000 },
      { "date": "2026-08-16", "amount": 1500 },
      { "date": "2026-08-17", "amount": 0 },
      { "date": "2026-08-18", "amount": 4500 },
      { "date": "2026-08-19", "amount": 3000 },
      { "date": "2026-08-20", "amount": 1500 }
    ],
    "unreadNotifications": 1
  }
}
```

**Status Code:** 200 | 401 (unauthorized)

---

## Gym Settings

### GET /gym
Get current gym details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "gym_001",
    "name": "FitZone Gym",
    "ownerId": "user_001",
    "phone": "+919876543210",
    "email": "fitzone@gms.local",
    "address": "123 Main Street, Kozhikode, Kerala",
    "currency": "INR",
    "status": "active",
    "subscriptionPlan": "yearly",
    "subscriptionStartDate": "2026-01-01",
    "subscriptionEndDate": "2027-01-01",
    "paymentStatus": "paid",
    "subscriptionAmount": 50000,
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-01T10:00:00Z"
  }
}
```

**Status Code:** 200 | 401 (unauthorized)

---

### PATCH /gym
Update gym settings

**Request:**
```json
{
  "name": "FitZone Gym Updated",
  "phone": "+919876543220",
  "email": "fitzone.new@gms.local",
  "address": "456 New Street",
  "currency": "USD"
}
```

**Response:** Updated gym object

**Status Code:** 200 | 400 (validation) | 401 (unauthorized)

---

## Super Admin Routes (Requires SUPER_ADMIN role)

### GET /admin/dashboard
Super admin SaaS metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGyms": 2,
    "activeGyms": 2,
    "suspendedGyms": 0,
    "totalMembers": 20,
    "totalRevenue": 100000,
    "paidGyms": 2,
    "pendingPayments": 0,
    "expiringSubscriptions": 0,
    "expiredSubscriptions": 0
  }
}
```

**Status Code:** 200 | 401 (unauthorized) | 403 (forbidden - not super admin)

---

### GET /admin/gyms
List all gyms

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gym_001",
      "name": "FitZone Gym",
      "ownerId": "user_001",
      "email": "fitzone@gms.local",
      "status": "active",
      "subscriptionEndDate": "2027-01-01",
      "paymentStatus": "paid",
      "subscriptionAmount": 50000
    }
  ]
}
```

**Status Code:** 200 | 401 (unauthorized) | 403 (forbidden)

---

### PATCH /admin/gyms/[id]/status
Suspend or activate gym

**Request:**
```json
{
  "status": "suspended"  // or "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "message": "Gym status updated to suspended" }
}
```

**Status Code:** 200 | 400 (validation) | 404 (not found) | 403 (forbidden)

---

### PATCH /admin/gyms/[id]/subscription
Renew subscription

**Request:**
```json
{
  "subscriptionPlan": "yearly",
  "subscriptionStartDate": "2026-08-20",
  "subscriptionEndDate": "2027-08-20",
  "paymentStatus": "paid",
  "subscriptionAmount": 50000
}
```

**Response:**
```json
{
  "success": true,
  "data": { "message": "Subscription updated successfully" }
}
```

**Status Code:** 200 | 400 (validation) | 404 (not found) | 403 (forbidden)

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | No permission |
| VALIDATION_ERROR | 400 | Invalid input |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

Currently: No rate limiting (apply in Phase 2 with middleware)

Future:
- 1000 requests/hour per IP
- 10000 requests/hour per authenticated user
- Returns `429 Too Many Requests` when exceeded

---

## Authentication Headers

All requests except `/auth/login` and `/auth/logout` require:
- **Method:** Session cookie (automatic with browser)
- **Header:** `Cookie: sessionId=...` (set by login)
- **Automatic on same domain** (no manual header needed)

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@gms.local",
    "password": "Owner@123"
  }' \
  -c cookies.txt

# Get members (using cookie)
curl http://localhost:3000/api/members -b cookies.txt

# Create member (using cookie)
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Member",
    "phone": "+919999999999",
    "membershipPlanId": "plan_001",
    "joiningDate": "2026-08-20",
    "gender": "male"
  }'
```

---

## Pagination

List endpoints support pagination:

```
GET /members?skip=0&limit=10
```

Responses include:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 45,
    "skip": 0,
    "limit": 10
  }
}
```

---

## Filtering & Search

Supported on endpoints:

- `GET /members?search=john` → Search name/phone
- `GET /payments?startDate=2026-08-01&endDate=2026-08-31` → Date range
- `GET /notifications?unreadOnly=true` → Unread only

