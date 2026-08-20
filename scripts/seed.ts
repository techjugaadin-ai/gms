import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '..', 'data');

function write(file: string, data: unknown) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function id(prefix: string): string {
  return `${prefix}_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
}

async function main() {
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
  const ownerPassword = process.env.DEMO_GYM_OWNER_PASSWORD || 'Owner@123';

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const ownerHash = await bcrypt.hash(ownerPassword, 12);

  const now = new Date().toISOString();

  // Users
  const users = [
    {
      id: 'user_super',
      gymId: null,
      name: 'Super Admin',
      email: 'superadmin@gms.local',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      active: true,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'user_001',
      gymId: 'gym_001',
      name: 'Ali Hassan',
      email: 'owner@gms.local',
      passwordHash: ownerHash,
      role: 'GYM_OWNER',
      active: true,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'user_002',
      gymId: 'gym_002',
      name: 'Ravi Kumar',
      email: 'owner2@gms.local',
      passwordHash: ownerHash,
      role: 'GYM_OWNER',
      active: true,
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    },
  ];
  write('users.json', users);
  console.log('✓ users.json seeded');

  // Members for gym_001
  const memberNames = [
    ['John Doe', 'male'],
    ['Priya Nair', 'female'],
    ['Mohammed Ali', 'male'],
    ['Anjali Sharma', 'female'],
    ['Rahul Singh', 'male'],
    ['Fatima Zahra', 'female'],
    ['Arjun Menon', 'male'],
    ['Sneha Pillai', 'female'],
    ['Rohit Verma', 'male'],
    ['Deepika Rao', 'female'],
    ['Sanjay Gupta', 'male'],
    ['Meera Krishnan', 'female'],
    ['Talib Ahmad', 'male'],
    ['Divya Thomas', 'female'],
    ['Kiran Patel', 'male'],
  ] as [string, string][];

  const phones = [
    '+919876500001', '+919876500002', '+919876500003', '+919876500004', '+919876500005',
    '+919876500006', '+919876500007', '+919876500008', '+919876500009', '+919876500010',
    '+919876500011', '+919876500012', '+919876500013', '+919876500014', '+919876500015',
  ];

  const plans_gym1 = ['plan_001', 'plan_002', 'plan_003', 'plan_004'];
  const planDurations: Record<string, number> = {
    plan_001: 1, plan_002: 3, plan_003: 6, plan_004: 12,
    plan_005: 1, plan_006: 3, plan_007: 12,
  };
  const planPrices: Record<string, number> = {
    plan_001: 1500, plan_002: 4000, plan_003: 7500, plan_004: 14000,
    plan_005: 1200, plan_006: 3200, plan_007: 11000,
  };

  const today = new Date('2026-08-20');
  const members: unknown[] = [];
  const payments: unknown[] = [];

  const refCodes = new Set<string>();
  function genRef(name: string): string {
    let code = name.replace(/\s+/g, '').toUpperCase().slice(0, 5) + Math.floor(10 + Math.random() * 90);
    while (refCodes.has(code)) code = name.replace(/\s+/g, '').toUpperCase().slice(0, 5) + Math.floor(10 + Math.random() * 90);
    refCodes.add(code);
    return code;
  }

  // Distribute members: some active, some expiring, some expired
  const scenarios: Array<{ endOffset: number; planIdx: number }> = [
    { endOffset: 30, planIdx: 0 },  // active
    { endOffset: 25, planIdx: 1 },  // active
    { endOffset: 60, planIdx: 2 },  // active
    { endOffset: 5, planIdx: 0 },   // expiring soon
    { endOffset: 3, planIdx: 0 },   // expiring soon
    { endOffset: -5, planIdx: 0 },  // expired
    { endOffset: -10, planIdx: 1 }, // expired
    { endOffset: 90, planIdx: 3 },  // active (yearly)
    { endOffset: 15, planIdx: 0 },  // active
    { endOffset: -2, planIdx: 0 },  // expired
    { endOffset: 45, planIdx: 1 },  // active
    { endOffset: 7, planIdx: 0 },   // expiring soon
    { endOffset: -20, planIdx: 2 }, // expired
    { endOffset: 1, planIdx: 0 },   // expiring soon
    { endOffset: 20, planIdx: 0 },  // active
  ];

  let seq = 1;
  for (let i = 0; i < memberNames.length; i++) {
    const [name, gender] = memberNames[i];
    const scenario = scenarios[i];
    const planId = plans_gym1[scenario.planIdx];
    const dur = planDurations[planId];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + scenario.endOffset);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - dur);
    const joiningDate = i < 2 ? dateStr(today) : dateStr(startDate);

    const memberId = `GYM001-M${String(seq).padStart(6, '0')}`;
    seq++;

    members.push({
      id: memberId,
      gymId: 'gym_001',
      name,
      gender,
      phone: phones[i],
      membershipPlanId: planId,
      joiningDate,
      membershipStartDate: dateStr(startDate),
      membershipEndDate: dateStr(endDate),
      referralCode: genRef(name),
      isDeleted: false,
      createdAt: new Date(startDate).toISOString(),
      updatedAt: new Date(startDate).toISOString(),
    });

    // Record a payment for each member
    payments.push({
      id: id('pay'),
      gymId: 'gym_001',
      memberId,
      planId,
      amount: planPrices[planId],
      paymentDate: dateStr(startDate),
      paymentType: ['Cash', 'UPI', 'Card', 'Bank Transfer'][i % 4],
      createdAt: new Date(startDate).toISOString(),
    });
  }

  // Add a few payments in the last 7 days for the chart
  for (let d = 0; d < 7; d++) {
    const payDate = new Date(today);
    payDate.setDate(payDate.getDate() - d);
    if (d > 0) {
      payments.push({
        id: id('pay'),
        gymId: 'gym_001',
        memberId: `GYM001-M${String(1 + (d % 5)).padStart(6, '0')}`,
        planId: 'plan_001',
        amount: 1500 + d * 100,
        paymentDate: dateStr(payDate),
        paymentType: 'UPI',
        createdAt: payDate.toISOString(),
      });
    }
  }

  // Members for gym_002 (5 members)
  const gym2Members = [
    ['Vikram Nair', 'male'],
    ['Pooja Iyer', 'female'],
    ['Suresh Babu', 'male'],
    ['Lakshmi Devi', 'female'],
    ['Arun Kumar', 'male'],
  ] as [string, string][];

  for (let i = 0; i < gym2Members.length; i++) {
    const [name, gender] = gym2Members[i];
    const planId = i < 3 ? 'plan_005' : 'plan_006';
    const dur = planDurations[planId];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + [20, -3, 10, -15, 5][i]);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - dur);

    const memberId = `GYM002-M${String(i + 1).padStart(6, '0')}`;
    members.push({
      id: memberId,
      gymId: 'gym_002',
      name,
      gender,
      phone: `+9198765002${i + 1}`,
      membershipPlanId: planId,
      joiningDate: dateStr(startDate),
      membershipStartDate: dateStr(startDate),
      membershipEndDate: dateStr(endDate),
      referralCode: genRef(name),
      isDeleted: false,
      createdAt: new Date(startDate).toISOString(),
      updatedAt: new Date(startDate).toISOString(),
    });

    payments.push({
      id: id('pay'),
      gymId: 'gym_002',
      memberId,
      planId,
      amount: planPrices[planId],
      paymentDate: dateStr(startDate),
      paymentType: ['UPI', 'Cash', 'Card', 'UPI', 'Bank Transfer'][i],
      createdAt: new Date(startDate).toISOString(),
    });
  }

  write('members.json', members);
  console.log('✓ members.json seeded');

  write('payments.json', payments);
  console.log('✓ payments.json seeded');

  // Notifications
  const notifications: unknown[] = [];
  const gymMembers1 = members.filter((m: any) => m.gymId === 'gym_001');
  for (const m of gymMembers1 as any[]) {
    const endDate = new Date(m.membershipEndDate);
    const diffDays = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let type: string | null = null;
    let message: string | null = null;
    if (diffDays === 7) { type = 'MEMBERSHIP_EXPIRING_7_DAYS'; message = `${m.name}'s membership expires in 7 days`; }
    else if (diffDays === 3) { type = 'MEMBERSHIP_EXPIRING_3_DAYS'; message = `${m.name}'s membership expires in 3 days`; }
    else if (diffDays === 1) { type = 'MEMBERSHIP_EXPIRING_1_DAY'; message = `${m.name}'s membership expires tomorrow`; }
    else if (diffDays === 0) { type = 'MEMBERSHIP_EXPIRED_TODAY'; message = `${m.name}'s membership expired today`; }
    else if (diffDays === -2) { type = 'MEMBERSHIP_EXPIRED_2_DAYS'; message = `${m.name}'s membership expired 2 days ago`; }
    else if (diffDays === -7) { type = 'MEMBERSHIP_EXPIRED_7_DAYS'; message = `${m.name}'s membership expired 7 days ago`; }
    if (type && message) {
      notifications.push({
        id: id('notif'),
        gymId: 'gym_001',
        memberId: m.id,
        type,
        message,
        scheduledAt: now,
        read: false,
        createdAt: now,
      });
    }
  }
  write('notifications.json', notifications);
  console.log('✓ notifications.json seeded');

  console.log('\n🎉 Seed complete!');
  console.log(`\nDemo accounts:`);
  console.log(`  Super Admin: superadmin@gms.local / ${adminPassword}`);
  console.log(`  Gym Owner 1: owner@gms.local / ${ownerPassword}`);
  console.log(`  Gym Owner 2: owner2@gms.local / ${ownerPassword}`);
}

main().catch(console.error);
