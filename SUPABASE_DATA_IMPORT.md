# Supabase data import from existing JSON

This file contains SQL to insert the current JSON seed data into Supabase tables.

> Copy each block into Supabase SQL Editor and run it.
> If a table already contains data, use `DELETE` or `TRUNCATE` first.

---

## 1) Clean existing data (optional)

```sql
DELETE FROM public.notifications;
DELETE FROM public.payments;
DELETE FROM public."membershipPlans";
DELETE FROM public.members;
DELETE FROM public.users;
DELETE FROM public.gyms;
```

---

## 2) Insert gyms

```sql
INSERT INTO public.gyms (
  id,
  name,
  "ownerId",
  phone,
  email,
  address,
  currency,
  status,
  "subscriptionPlan",
  "subscriptionStartDate",
  "subscriptionEndDate",
  "paymentStatus",
  "subscriptionAmount",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'gym_001',
    'FitZone Gym',
    'user_001',
    '+919876543210',
    'fitzone@gms.local',
    '123 Main Street, Kozhikode, Kerala',
    'INR',
    'active',
    'yearly',
    '2026-01-01',
    '2026-12-31',
    'paid',
    12000,
    '2026-01-01T10:00:00Z',
    '2026-08-20T17:53:10.155Z'
  ),
  (
    'gym_002',
    'PowerHouse Fitness',
    'user_002',
    '+919876543211',
    'powerhouse@gms.local',
    '456 Park Road, Calicut, Kerala',
    'INR',
    'active',
    'half-yearly',
    '2026-03-01',
    '2026-08-31',
    'paid',
    7000,
    '2026-03-01T10:00:00Z',
    '2026-03-01T10:00:00Z'
  );
```

---

## 3) Insert users

```sql
INSERT INTO public.users (
  id,
  "gymId",
  name,
  email,
  "passwordHash",
  role,
  active,
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'user_super',
    NULL,
    'Super Admin',
    'superadmin@gms.local',
    '$2b$12$kpUwgMbqxa4O8ieJ3s4C0Ooj0BaHQc40r92HGbsywDvosZPE9yRqy',
    'SUPER_ADMIN',
    true,
    '2026-01-01T10:00:00Z',
    '2026-01-01T10:00:00Z'
  ),
  (
    'user_001',
    'gym_001',
    'Ali Hassan',
    'owner@gms.local',
    '$2b$12$m/fE2XD4Q9f.FvK1SwzHY.TdjHYuHZI.dKkZExZ1lDxfNByGjL1Dm',
    'GYM_OWNER',
    true,
    '2026-01-01T10:00:00Z',
    '2026-01-01T10:00:00Z'
  ),
  (
    'user_002',
    'gym_002',
    'Ravi Kumar',
    'owner2@gms.local',
    '$2b$12$v.NkYi5EcLFhLGSz5mNav.9ba5zbi/pvHP6Nqi.gT10qbDT9B5TTe',
    'GYM_OWNER',
    true,
    '2026-03-01T10:00:00Z',
    '2026-03-01T10:00:00Z'
  );
```

---

## 4) Insert members

```sql
INSERT INTO public.members (
  id,
  "gymId",
  name,
  gender,
  phone,
  email,
  address,
  "permanentAddress",
  "emergencyContact",
  weight,
  height,
  "medicalInfo",
  "membershipPlanId",
  "joiningDate",
  "membershipStartDate",
  "membershipEndDate",
  "referralCode",
  "isDeleted",
  "deletedAt",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'GYM001-M000001',
    'gym_001',
    'John Doe',
    'male',
    '+919876500001',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'plan_001',
    '2026-08-20',
    '2026-08-19',
    '2026-09-19',
    'JOHND89',
    false,
    NULL,
    '2026-08-19T00:00:00.000Z',
    '2026-08-19T00:00:00.000Z'
  ),
  (
    'GYM001-M000002',
    'gym_001',
    'Priya Nair',
    'female',
    '+919876500002',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'plan_002',
    '2026-08-20',
    '2026-06-14',
    '2026-09-14',
    'PRIYA26',
    false,
    NULL,
    '2026-06-14T00:00:00.000Z',
    '2026-06-14T00:00:00.000Z'
  ),
  (
    'GYM001-M000003',
    'gym_001',
    'Mohammed Ali',
    'male',
    '+919876500003',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'plan_003',
    '2026-04-19',
    '2026-04-19',
    '2026-10-19',
    'MOHAM97',
    false,
    NULL,
    '2026-04-19T00:00:00.000Z',
    '2026-04-19T00:00:00.000Z'
  );
```

> Add more member rows if you want to import the full JSON list; the current file has more records than shown in this sample. Use the same pattern for each record.

---

## 5) Insert membership plans

```sql
INSERT INTO public."membershipPlans" (
  id,
  "gymId",
  name,
  "durationMonths",
  price,
  active,
  "createdAt",
  "updatedAt"
)
VALUES
  ('plan_001', 'gym_001', 'Monthly', 1, 1500, true, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('plan_002', 'gym_001', 'Quarterly', 3, 4000, true, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('plan_003', 'gym_001', 'Half-Yearly', 6, 7500, true, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('plan_004', 'gym_001', 'Yearly', 12, 14000, true, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('plan_005', 'gym_002', 'Monthly', 1, 1200, true, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
  ('plan_006', 'gym_002', 'Quarterly', 3, 3200, true, '2026-03-01T10:00:00Z', '2026-08-22T17:08:50.750Z'),
  ('plan_007', 'gym_002', 'Yearly', 12, 11000, true, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z');
```

---

## 6) Insert notifications

```sql
INSERT INTO public.notifications (
  id,
  "gymId",
  "memberId",
  type,
  message,
  "scheduledAt",
  read,
  "createdAt"
)
VALUES
  (
    'notif_001',
    'gym_001',
    'GYM001-M000001',
    'MEMBERSHIP_EXPIRING_7_DAYS',
    'Your membership is expiring in 7 days.',
    '2026-08-20T10:00:00Z',
    false,
    '2026-08-20T10:00:00Z'
  );
```

---

## 7) Insert payments

```sql
INSERT INTO public.payments (
  id,
  "gymId",
  "memberId",
  "planId",
  amount,
  "paymentDate",
  "paymentType",
  notes,
  "createdAt"
)
VALUES
  (
    'pay_001',
    'gym_001',
    'GYM001-M000001',
    'plan_001',
    1500,
    '2026-08-20',
    'Cash',
    'Initial payment',
    '2026-08-20T10:00:00Z'
  );
```

---

## 8) Sessions table

```sql
CREATE TABLE IF NOT EXISTS public.sessions (
  id text PRIMARY KEY,
  user_data jsonb NOT NULL,
  expires_at bigint NOT NULL,
  created_at text NOT NULL DEFAULT now()::text
);
```

---

## 9) Optional: test query

```sql
SELECT * FROM public.gyms;
SELECT * FROM public.users;
SELECT * FROM public.members;
SELECT * FROM public."membershipPlans";
SELECT * FROM public.payments;
SELECT * FROM public.notifications;
```

---

## Notes

- If your Supabase schema uses snake_case column names instead of camelCase, adjust the SQL accordingly.
- The app currently expects camelCase property names in many repo methods, so these inserts are aligned to the app’s current structure.
- If you want, I can also provide a version that exports the full JSON file contents into a single SQL script automatically generated from the real files.
