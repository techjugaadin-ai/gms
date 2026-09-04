INSERT INTO public.gyms ("id", "name", "ownerId", "phone", "email", "address", "currency", "status", "subscriptionPlan", "subscriptionStartDate", "subscriptionEndDate", "paymentStatus", "subscriptionAmount", "createdAt", "updatedAt") VALUES

('gym_001', 'FitZone Gym', 'user_001', '+919876543210', 'fitzone@gms.local', '123 Main Street, Kozhikode, Kerala', 'INR', 'active', 'yearly', '2026-01-01', '2026-12-31', 'paid', 12000, '2026-01-01T10:00:00Z', '2026-08-20T17:53:10.155Z'),
('gym_002', 'PowerHouse Fitness', 'user_002', '+919876543211', 'powerhouse@gms.local', '456 Park Road, Calicut, Kerala', 'INR', 'active', 'half-yearly', '2026-03-01', '2026-08-31', 'paid', 7000, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z');



INSERT INTO public.users ("id", "gymId", "name", "email", "passwordHash", "role", "active", "createdAt", "updatedAt") VALUES

('user_super', NULL, 'Super Admin', 'superadmin@gms.local', '$2b$12$kpUwgMbqxa4O8ieJ3s4C0Ooj0BaHQc40r92HGbsywDvosZPE9yRqy', 'SUPER_ADMIN', TRUE, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
('user_001', 'gym_001', 'Ali Hassan', 'owner@gms.local', '$2b$12$m/fE2XD4Q9f.FvK1SwzHY.TdjHYuHZI.dKkZExZ1lDxfNByGjL1Dm', 'GYM_OWNER', TRUE, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
('user_002', 'gym_002', 'Ravi Kumar', 'owner2@gms.local', '$2b$12$v.NkYi5EcLFhLGSz5mNav.9ba5zbi/pvHP6Nqi.gT10qbDT9B5TTe', 'GYM_OWNER', TRUE, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z');



INSERT INTO public.members ("id", "gymId", "name", "gender", "phone", "email", "address", "permanentAddress", "emergencyContact", "weight", "height", "medicalInfo", "membershipPlanId", "joiningDate", "membershipStartDate", "membershipEndDate", "referralCode", "isDeleted", "deletedAt", "createdAt", "updatedAt") VALUES

('GYM001-M000001', 'gym_001', 'John Doe', 'male', '+919876500001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-08-20', '2026-08-19', '2026-09-19', 'JOHND89', FALSE, NULL, '2026-08-19T00:00:00.000Z', '2026-08-19T00:00:00.000Z'),
('GYM001-M000002', 'gym_001', 'Priya Nair', 'female', '+919876500002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_002', '2026-08-20', '2026-06-14', '2026-09-14', 'PRIYA26', FALSE, NULL, '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),
('GYM001-M000003', 'gym_001', 'Mohammed Ali', 'male', '+919876500003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_003', '2026-04-19', '2026-04-19', '2026-10-19', 'MOHAM97', FALSE, NULL, '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z'),
('GYM001-M000004', 'gym_001', 'Anjali Sharma', 'female', '+919876500004', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-07-25', '2026-07-25', '2026-08-25', 'ANJAL11', FALSE, NULL, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z'),
('GYM001-M000005', 'gym_001', 'Rahul Singh', 'male', '+919876500005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-07-23', '2026-07-23', '2026-08-23', 'RAHUL17', FALSE, NULL, '2026-07-23T00:00:00.000Z', '2026-07-23T00:00:00.000Z'),
('GYM001-M000006', 'gym_001', 'Fatima Zahra', 'female', '+919876500006', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-07-15', '2026-07-15', '2026-08-15', 'FATIM27', FALSE, NULL, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('GYM001-M000007', 'gym_001', 'Arjun Menon', 'male', '+919876500007', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_002', '2026-05-10', '2026-05-10', '2026-08-10', 'ARJUN28', FALSE, NULL, '2026-05-10T00:00:00.000Z', '2026-05-10T00:00:00.000Z'),
('GYM001-M000008', 'gym_001', 'Sneha Pillai', 'female', '+919876500008', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_004', '2025-11-18', '2025-11-18', '2026-11-18', 'SNEHA99', FALSE, NULL, '2025-11-18T00:00:00.000Z', '2025-11-18T00:00:00.000Z'),
('GYM001-M000009', 'gym_001', 'Rohit Verma', 'male', '+919876500009', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-08-04', '2026-08-04', '2026-09-04', 'ROHIT54', FALSE, NULL, '2026-08-04T00:00:00.000Z', '2026-08-04T00:00:00.000Z'),
('GYM001-M000010', 'gym_001', 'Deepika Rao', 'female', '+919876500010', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-07-18', '2026-07-18', '2026-08-18', 'DEEPI93', FALSE, NULL, '2026-07-18T00:00:00.000Z', '2026-07-18T00:00:00.000Z'),
('GYM001-M000011', 'gym_001', 'Sanjay Gupta', 'male', '+919876500011', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_002', '2026-07-04', '2026-07-04', '2026-10-04', 'SANJA80', FALSE, NULL, '2026-07-04T00:00:00.000Z', '2026-07-04T00:00:00.000Z'),
('GYM001-M000012', 'gym_001', 'Meera Krishnan', 'female', '+919876500012', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-07-27', '2026-07-27', '2026-08-27', 'MEERA93', FALSE, NULL, '2026-07-27T00:00:00.000Z', '2026-07-27T00:00:00.000Z'),
('GYM001-M000013', 'gym_001', 'Talib Ahmad', 'male', '+919876500013', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_003', '2026-01-31', '2026-01-31', '2026-07-31', 'TALIB80', FALSE, NULL, '2026-01-31T00:00:00.000Z', '2026-01-31T00:00:00.000Z'),
('GYM001-M000014', 'gym_001', 'Divya Thomas', 'female', '+919876500014', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_002', '2026-07-21', '2026-07-21', '2026-11-21', 'DIVYA35', FALSE, NULL, '2026-07-21T00:00:00.000Z', '2026-08-20T20:20:27.049Z'),
('GYM001-M000015', 'gym_001', 'Kiran Patel', 'male', '+919876500015', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_001', '2026-08-09', '2026-08-09', '2026-09-09', 'KIRAN22', FALSE, NULL, '2026-08-09T00:00:00.000Z', '2026-08-09T00:00:00.000Z'),
('GYM002-M000001', 'gym_002', 'Vikram Nair', 'male', '+91987652001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_005', '2026-08-09', '2026-08-09', '2026-09-09', 'VIKRA18', FALSE, NULL, '2026-08-09T00:00:00.000Z', '2026-08-09T00:00:00.000Z'),
('GYM002-M000002', 'gym_002', 'Pooja Iyer', 'female', '+91987652002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_005', '2026-07-17', '2026-07-17', '2026-08-17', 'POOJA57', FALSE, NULL, '2026-07-17T00:00:00.000Z', '2026-07-17T00:00:00.000Z'),
('GYM002-M000003', 'gym_002', 'Suresh Babu', 'male', '+91987652003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_005', '2026-07-30', '2026-07-30', '2026-08-30', 'SURES86', FALSE, NULL, '2026-07-30T00:00:00.000Z', '2026-07-30T00:00:00.000Z'),
('GYM002-M000004', 'gym_002', 'Lakshmi Devi', 'female', '+91987652004', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_006', '2026-05-05', '2026-05-05', '2026-08-05', 'LAKSH21', FALSE, NULL, '2026-05-05T00:00:00.000Z', '2026-05-05T00:00:00.000Z'),
('GYM002-M000005', 'gym_002', 'Arun Kumar', 'male', '+91987652005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'plan_006', '2026-05-25', '2026-05-25', '2026-08-25', 'ARUNK80', FALSE, NULL, '2026-05-25T00:00:00.000Z', '2026-05-25T00:00:00.000Z');



INSERT INTO public."membershipPlans" ("id", "gymId", "name", "durationMonths", "price", "active", "createdAt", "updatedAt") VALUES

('plan_001', 'gym_001', 'Monthly', 1, 1500, TRUE, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
('plan_002', 'gym_001', 'Quarterly', 3, 4000, TRUE, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
('plan_003', 'gym_001', 'Half-Yearly', 6, 7500, TRUE, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
('plan_004', 'gym_001', 'Yearly', 12, 14000, TRUE, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
('plan_005', 'gym_002', 'Monthly', 1, 1200, TRUE, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
('plan_006', 'gym_002', 'Quarterly', 3, 3200, TRUE, '2026-03-01T10:00:00Z', '2026-08-22T17:08:50.750Z'),
('plan_007', 'gym_002', 'Yearly', 12, 11000, TRUE, '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z');



INSERT INTO public.payments ("id", "gymId", "memberId", "planId", "amount", "paymentDate", "paymentType", "notes", "createdAt") VALUES

('pay_54c220bdff3d', 'gym_001', 'GYM001-M000001', 'plan_001', 1500, '2026-08-19', 'Cash', NULL, '2026-08-19T00:00:00.000Z'),
('pay_063d136b1c75', 'gym_001', 'GYM001-M000002', 'plan_002', 4000, '2026-06-14', 'UPI', NULL, '2026-06-14T00:00:00.000Z'),
('pay_e263599b8a6e', 'gym_001', 'GYM001-M000003', 'plan_003', 7500, '2026-04-19', 'Card', NULL, '2026-04-19T00:00:00.000Z'),
('pay_074f977c1d97', 'gym_001', 'GYM001-M000004', 'plan_001', 1500, '2026-07-25', 'Bank Transfer', NULL, '2026-07-25T00:00:00.000Z'),
('pay_f36adb785f0f', 'gym_001', 'GYM001-M000005', 'plan_001', 1500, '2026-07-23', 'Cash', NULL, '2026-07-23T00:00:00.000Z'),
('pay_266eb2fdcf82', 'gym_001', 'GYM001-M000006', 'plan_001', 1500, '2026-07-15', 'UPI', NULL, '2026-07-15T00:00:00.000Z'),
('pay_523ba5eaa29b', 'gym_001', 'GYM001-M000007', 'plan_002', 4000, '2026-05-10', 'Card', NULL, '2026-05-10T00:00:00.000Z'),
('pay_8a53f624a548', 'gym_001', 'GYM001-M000008', 'plan_004', 14000, '2025-11-18', 'Bank Transfer', NULL, '2025-11-18T00:00:00.000Z'),
('pay_66e018025372', 'gym_001', 'GYM001-M000009', 'plan_001', 1500, '2026-08-04', 'Cash', NULL, '2026-08-04T00:00:00.000Z'),
('pay_7be62ba548fe', 'gym_001', 'GYM001-M000010', 'plan_001', 1500, '2026-07-18', 'UPI', NULL, '2026-07-18T00:00:00.000Z'),
('pay_21603a962965', 'gym_001', 'GYM001-M000011', 'plan_002', 4000, '2026-07-04', 'Card', NULL, '2026-07-04T00:00:00.000Z'),
('pay_7b48e884dd5c', 'gym_001', 'GYM001-M000012', 'plan_001', 1500, '2026-07-27', 'Bank Transfer', NULL, '2026-07-27T00:00:00.000Z'),
('pay_c5375ea1ed32', 'gym_001', 'GYM001-M000013', 'plan_003', 7500, '2026-01-31', 'Cash', NULL, '2026-01-31T00:00:00.000Z'),
('pay_7a13e5e1c43f', 'gym_001', 'GYM001-M000014', 'plan_001', 1500, '2026-07-21', 'UPI', NULL, '2026-07-21T00:00:00.000Z'),
('pay_4c68cd0b65c4', 'gym_001', 'GYM001-M000015', 'plan_001', 1500, '2026-08-09', 'Card', NULL, '2026-08-09T00:00:00.000Z'),
('pay_3e7bb886a5ef', 'gym_001', 'GYM001-M000002', 'plan_001', 1650, '2026-08-19', 'UPI', NULL, '2026-08-19T00:00:00.000Z'),
('pay_836738f5cb48', 'gym_001', 'GYM001-M000003', 'plan_001', 1800, '2026-08-18', 'UPI', NULL, '2026-08-18T00:00:00.000Z'),
('pay_752e7ed6bf95', 'gym_001', 'GYM001-M000004', 'plan_001', 1950, '2026-08-17', 'UPI', NULL, '2026-08-17T00:00:00.000Z'),
('pay_00d6669e519b', 'gym_001', 'GYM001-M000005', 'plan_001', 2100, '2026-08-16', 'UPI', NULL, '2026-08-16T00:00:00.000Z'),
('pay_0449957c16bd', 'gym_001', 'GYM001-M000001', 'plan_001', 2250, '2026-08-15', 'UPI', NULL, '2026-08-15T00:00:00.000Z'),
('pay_9f7e53fc798d', 'gym_001', 'GYM001-M000002', 'plan_001', 2400, '2026-08-14', 'UPI', NULL, '2026-08-14T00:00:00.000Z'),
('pay_6c8f419a9afc', 'gym_002', 'GYM002-M000001', 'plan_005', 1200, '2026-08-09', 'UPI', NULL, '2026-08-09T00:00:00.000Z'),
('pay_b4ca9f3227bf', 'gym_002', 'GYM002-M000002', 'plan_005', 1200, '2026-07-17', 'Cash', NULL, '2026-07-17T00:00:00.000Z'),
('pay_34babace4dd2', 'gym_002', 'GYM002-M000003', 'plan_005', 1200, '2026-07-30', 'Card', NULL, '2026-07-30T00:00:00.000Z'),
('pay_82caf81d7b58', 'gym_002', 'GYM002-M000004', 'plan_006', 3200, '2026-05-05', 'UPI', NULL, '2026-05-05T00:00:00.000Z'),
('pay_9a37528bba61', 'gym_002', 'GYM002-M000005', 'plan_006', 3200, '2026-05-25', 'Bank Transfer', NULL, '2026-05-25T00:00:00.000Z'),
('pay_6c07805e572f', 'gym_001', 'GYM001-M000014', 'plan_002', 4000, '2026-08-20', 'UPI', '', '2026-08-20T20:20:27.047Z');



INSERT INTO public.notifications ("id", "gymId", "memberId", "type", "message", "scheduledAt", "read", "createdAt") VALUES

('notif_5433b2e728e2', 'gym_001', 'GYM001-M000010', 'MEMBERSHIP_EXPIRED_2_DAYS', 'Deepika Rao''s membership expired 2 days ago', '2026-08-20T18:28:18.766Z', TRUE, '2026-08-20T18:28:18.766Z'),
('notif_a6e848c993f3', 'gym_001', 'GYM001-M000012', 'MEMBERSHIP_EXPIRING_7_DAYS', 'Meera Krishnan''s membership expires in 7 days', '2026-08-20T18:28:18.766Z', TRUE, '2026-08-20T18:28:18.766Z'),
('notif_672512d04361', 'gym_001', 'GYM001-M000014', 'MEMBERSHIP_EXPIRING_1_DAY', 'Divya Thomas''s membership expires tomorrow', '2026-08-20T18:28:18.766Z', TRUE, '2026-08-20T18:28:18.766Z'),
('notif_c0444e239f3a', 'gym_001', 'GYM001-M000004', 'MEMBERSHIP_EXPIRING_3_DAYS', 'Anjali Sharma''s membership expires in 3 days', '2026-08-22T17:28:29.939Z', TRUE, '2026-08-22T11:20:12.874Z'),
('notif_bf5122494d13', 'gym_001', 'GYM001-M000005', 'MEMBERSHIP_EXPIRING_1_DAY', 'Rahul Singh''s membership expires tomorrow', '2026-08-22T17:28:29.939Z', TRUE, '2026-08-22T11:20:12.874Z'),
('notif_ff3ff2347cf4', 'gym_001', 'GYM001-M000006', 'MEMBERSHIP_EXPIRED_7_DAYS', 'Fatima Zahra''s membership expired 7 days ago', '2026-08-22T17:28:29.939Z', FALSE, '2026-08-22T11:20:12.874Z'),
('notif_0ea39f93efac', 'gym_002', 'GYM002-M000005', 'MEMBERSHIP_EXPIRING_3_DAYS', 'Arun Kumar''s membership expires in 3 days', '2026-08-22T17:23:07.990Z', FALSE, '2026-08-22T11:51:14.409Z'),
('notif_95a30e123908', 'gym_001', 'GYM001-M000009', 'MEMBERSHIP_EXPIRED_TODAY', 'Rohit Verma''s membership expired today', '2026-09-03T19:25:49.550Z', FALSE, '2026-09-03T19:25:24.987Z');

