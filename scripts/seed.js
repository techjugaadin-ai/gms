const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');

function write(file, data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

function genId(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
}

async function main() {
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
  const ownerPassword = process.env.DEMO_GYM_OWNER_PASSWORD || 'Owner@123';

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const ownerHash = await bcrypt.hash(ownerPassword, 12);
  const now = new Date().toISOString();

  const users = [
    { id: 'user_super', gymId: null, name: 'Super Admin', email: 'superadmin@gms.local', passwordHash: adminHash, role: 'SUPER_ADMIN', active: true, createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' },
    { id: 'user_001', gymId: 'gym_001', name: 'Ali Hassan', email: 'owner@gms.local', passwordHash: ownerHash, role: 'GYM_OWNER', active: true, createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' },
    { id: 'user_002', gymId: 'gym_002', name: 'Ravi Kumar', email: 'owner2@gms.local', passwordHash: ownerHash, role: 'GYM_OWNER', active: true, createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  ];
  write('users.json', users);
  console.log('✓ users.json seeded');

  const memberNames = [
    ['John Doe', 'male'], ['Priya Nair', 'female'], ['Mohammed Ali', 'male'],
    ['Anjali Sharma', 'female'], ['Rahul Singh', 'male'], ['Fatima Zahra', 'female'],
    ['Arjun Menon', 'male'], ['Sneha Pillai', 'female'], ['Rohit Verma', 'male'],
    ['Deepika Rao', 'female'], ['Sanjay Gupta', 'male'], ['Meera Krishnan', 'female'],
    ['Talib Ahmad', 'male'], ['Divya Thomas', 'female'], ['Kiran Patel', 'male'],
  ];

  const planDurations = { plan_001: 1, plan_002: 3, plan_003: 6, plan_004: 12, plan_005: 1, plan_006: 3, plan_007: 12 };
  const planPrices = { plan_001: 1500, plan_002: 4000, plan_003: 7500, plan_004: 14000, plan_005: 1200, plan_006: 3200, plan_007: 11000 };
  const plans_gym1 = ['plan_001', 'plan_002', 'plan_003', 'plan_004'];

  const today = new Date('2026-08-20');
  const members = [];
  const payments = [];
  const refCodes = new Set();

  function genRef(name) {
    let code = name.replace(/\s+/g, '').toUpperCase().slice(0, 5) + Math.floor(10 + Math.random() * 90);
    while (refCodes.has(code)) code = name.replace(/\s+/g, '').toUpperCase().slice(0, 5) + Math.floor(10 + Math.random() * 90);
    refCodes.add(code);
    return code;
  }

  const scenarios = [
    { endOffset: 30, planIdx: 0 }, { endOffset: 25, planIdx: 1 }, { endOffset: 60, planIdx: 2 },
    { endOffset: 5, planIdx: 0 }, { endOffset: 3, planIdx: 0 }, { endOffset: -5, planIdx: 0 },
    { endOffset: -10, planIdx: 1 }, { endOffset: 90, planIdx: 3 }, { endOffset: 15, planIdx: 0 },
    { endOffset: -2, planIdx: 0 }, { endOffset: 45, planIdx: 1 }, { endOffset: 7, planIdx: 0 },
    { endOffset: -20, planIdx: 2 }, { endOffset: 1, planIdx: 0 }, { endOffset: 20, planIdx: 0 },
  ];

  for (let i = 0; i < memberNames.length; i++) {
    const [name, gender] = memberNames[i];
    const scenario = scenarios[i];
    const planId = plans_gym1[scenario.planIdx];
    const dur = planDurations[planId];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + scenario.endOffset);
    const startDate = addMonths(endDate, -dur);
    const joiningDate = i < 2 ? dateStr(today) : dateStr(startDate);
    const memberId = `GYM001-M${String(i + 1).padStart(6, '0')}`;

    members.push({
      id: memberId, gymId: 'gym_001', name, gender,
      phone: `+9198765000${String(i + 1).padStart(2, '0')}`,
      membershipPlanId: planId, joiningDate,
      membershipStartDate: dateStr(startDate),
      membershipEndDate: dateStr(endDate),
      referralCode: genRef(name),
      isDeleted: false,
      createdAt: new Date(startDate).toISOString(),
      updatedAt: new Date(startDate).toISOString(),
    });

    payments.push({
      id: genId('pay'), gymId: 'gym_001', memberId,
      planId, amount: planPrices[planId],
      paymentDate: dateStr(startDate),
      paymentType: ['Cash', 'UPI', 'Card', 'Bank Transfer'][i % 4],
      createdAt: new Date(startDate).toISOString(),
    });
  }

  // Recent payments for chart
  for (let d = 1; d < 7; d++) {
    const payDate = new Date(today);
    payDate.setDate(payDate.getDate() - d);
    payments.push({
      id: genId('pay'), gymId: 'gym_001',
      memberId: `GYM001-M${String(1 + (d % 5)).padStart(6, '0')}`,
      planId: 'plan_001', amount: 1500 + d * 150,
      paymentDate: dateStr(payDate), paymentType: 'UPI',
      createdAt: payDate.toISOString(),
    });
  }

  // Gym 2 members
  const gym2Members = [
    ['Vikram Nair', 'male'], ['Pooja Iyer', 'female'], ['Suresh Babu', 'male'],
    ['Lakshmi Devi', 'female'], ['Arun Kumar', 'male'],
  ];
  for (let i = 0; i < gym2Members.length; i++) {
    const [name, gender] = gym2Members[i];
    const planId = i < 3 ? 'plan_005' : 'plan_006';
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + [20, -3, 10, -15, 5][i]);
    const startDate = addMonths(endDate, -planDurations[planId]);
    const memberId = `GYM002-M${String(i + 1).padStart(6, '0')}`;
    members.push({
      id: memberId, gymId: 'gym_002', name, gender,
      phone: `+9198765200${i + 1}`,
      membershipPlanId: planId, joiningDate: dateStr(startDate),
      membershipStartDate: dateStr(startDate),
      membershipEndDate: dateStr(endDate),
      referralCode: genRef(name),
      isDeleted: false,
      createdAt: new Date(startDate).toISOString(),
      updatedAt: new Date(startDate).toISOString(),
    });
    payments.push({
      id: genId('pay'), gymId: 'gym_002', memberId,
      planId, amount: planPrices[planId],
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
  const notifications = [];
  const gym1Members = members.filter((m) => m.gymId === 'gym_001');
  for (const m of gym1Members) {
    const endDate = new Date(m.membershipEndDate);
    const diffDays = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const rules = [
      { offset: 7, type: 'MEMBERSHIP_EXPIRING_7_DAYS', msg: `${m.name}'s membership expires in 7 days` },
      { offset: 3, type: 'MEMBERSHIP_EXPIRING_3_DAYS', msg: `${m.name}'s membership expires in 3 days` },
      { offset: 1, type: 'MEMBERSHIP_EXPIRING_1_DAY', msg: `${m.name}'s membership expires tomorrow` },
      { offset: 0, type: 'MEMBERSHIP_EXPIRED_TODAY', msg: `${m.name}'s membership expired today` },
      { offset: -2, type: 'MEMBERSHIP_EXPIRED_2_DAYS', msg: `${m.name}'s membership expired 2 days ago` },
      { offset: -7, type: 'MEMBERSHIP_EXPIRED_7_DAYS', msg: `${m.name}'s membership expired 7 days ago` },
    ];
    for (const rule of rules) {
      if (diffDays === rule.offset) {
        notifications.push({ id: genId('notif'), gymId: 'gym_001', memberId: m.id, type: rule.type, message: rule.msg, scheduledAt: now, read: false, createdAt: now });
      }
    }
  }
  write('notifications.json', notifications);
  console.log('✓ notifications.json seeded');

  console.log('\n🎉 Seed complete!');
  console.log(`  Super Admin:  superadmin@gms.local / ${adminPassword}`);
  console.log(`  Gym Owner 1:  owner@gms.local / ${ownerPassword}`);
  console.log(`  Gym Owner 2:  owner2@gms.local / ${ownerPassword}`);
}

main().catch(console.error);
