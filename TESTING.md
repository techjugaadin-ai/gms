# GMS Testing Guide

## Pre-Testing Checklist

- [ ] Run `npm run seed` to populate demo data
- [ ] Run `npm run dev` to start server at http://localhost:3000
- [ ] Verify no console errors in browser DevTools

---

## Test Scenarios

### 1. Authentication & Sessions

#### Test 1.1: Super Admin Login
```
Email:    superadmin@gms.local
Password: Admin@123
Expected: Redirect to /super-admin
          Username shows "Super Admin" in sidebar
```

#### Test 1.2: Gym Owner Login
```
Email:    owner@gms.local
Password: Owner@123
Expected: Redirect to /dashboard
          Username shows "Ali Hassan" in sidebar
          Gym name "FitZone Gym" visible
```

#### Test 1.3: Invalid Credentials
```
Email:    owner@gms.local
Password: WrongPassword
Expected: Error toast: "Invalid email or password"
          Stay on login page
```

#### Test 1.4: Logout
```
Action:   Click "Sign out" in sidebar
Expected: Redirect to /login
          Session cleared
          Cannot access dashboard directly
```

---

### 2. Dashboard (Gym Owner)

#### Test 2.1: KPI Cards Display
```
Login as:  owner@gms.local
Navigate:  /dashboard
Expected:  ✓ Today's Collection card visible
           ✓ Monthly Collection card visible
           ✓ Total Members: 15
           ✓ Active members: 11
           ✓ Expired/dues members: 2
           ✓ Expiring soon members: 2
           ✓ New members today: 0
           ✓ New members this month: 15
```

#### Test 2.2: 7-Day Collection Chart
```
Navigate:  /dashboard (scroll down)
Expected:  ✓ Bar chart displays
           ✓ 7 bars for last 7 days
           ✓ All amounts > 0 (seeded data)
           ✓ Tooltip shows ₹ amount on hover
```

---

### 3. Members Management

#### Test 3.1: View Members List
```
Navigate:  /members
Expected:  ✓ Table displays 15 members
           ✓ Search by name works
           ✓ Search by phone works
           ✓ Status badges: Green (Active), Yellow (Expiring Soon), Red (Expired)
```

#### Test 3.2: Search & Filter
```
Search:    "John" → Enter
Expected:  ✓ Results filtered to John Doe
           ✓ Clear search shows all again
Search:    "+919876500001"
Expected:  ✓ Results filtered to single member
```

#### Test 3.3: Member Detail Page
```
Click:     Eye icon on any member
Expected:  ✓ Member detail page loads
           ✓ Name, phone, gender, referral code visible
           ✓ Current plan name displayed
           ✓ Membership start/end dates shown
           ✓ Payment history table below
           ✓ Payment history sorted by date (newest first)
```

#### Test 3.4: Add New Member
```
Click:     "Add Member" button
Expected:  ✓ Form loads with empty fields
           ✓ Date defaults to today
           ✓ Gender defaults to "Male"
Fill:      Name: "Test Member"
           Phone: "+919999999999"
           Plan: "Monthly - ₹1,500/1mo"
           Joining Date: (today)
Click:     "Add Member" button
Expected:  ✓ Success toast: "Member added successfully"
           ✓ Redirect to /members
           ✓ New member visible in list
```

#### Test 3.5: Edit Member
```
Click:     Edit (pencil) icon on any member
Expected:  ✓ Form pre-fills with current data
           ✓ All fields are editable
Change:    Name to "Updated Name"
Click:     "Save Changes"
Expected:  ✓ Success toast: "Member updated"
           ✓ Redirect to /members
           ✓ List shows updated name
```

#### Test 3.6: Delete Member
```
Click:     Delete (trash) icon on any member
Expected:  ✓ Confirmation modal appears
           ✓ Shows member name
Confirm:   Click "Remove" button
Expected:  ✓ Success toast: "Member removed"
           ✓ Member disappears from list
```

#### Test 3.7: Record Payment from Member Detail
```
Navigate:  Member detail page
Click:     Edit (pencil) button in payment history section
           OR click payment icon from members list
Expected:  ✓ Payment modal opens
           ✓ Member name pre-filled
           ✓ Current plan selected
           ✓ Amount auto-filled with plan price
Fill:      Change date to yesterday
           Change payment type to "UPI"
Click:     "Record Payment"
Expected:  ✓ Success toast: "Payment recorded"
           ✓ Payment appears in history
           ✓ Membership end date extended by plan duration
```

---

### 4. Payments Page

#### Test 4.1: View Payment History
```
Navigate:  /payments
Expected:  ✓ Table displays all payments
           ✓ Sorted by date (newest first)
           ✓ Shows: Date, Member, Plan, Amount, Type
           ✓ Amount in green with ₹ symbol
           ✓ Payment type badge (color-coded)
```

#### Test 4.2: Record Payment from Payments Page
```
Click:     "Record Payment" button
Expected:  ✓ Modal opens
           ✓ Dropdown to select member
Select:    Any member
Expected:  ✓ Form appears with fields
           ✓ Amount auto-fills with plan price
Fill:      Leave defaults, change only payment type
Click:     "Record Payment"
Expected:  ✓ Success toast
           ✓ Modal closes
           ✓ New payment in list
           ✓ Member in list now has updated end date
```

#### Test 4.3: Verify Payment Updates Membership
```
Navigate:  /members
Find:      Member whose payment was just recorded
Expected:  ✓ Membership end date is 1 month from today (if monthly plan)
           ✓ Status badge changed to "Active" (if was expired)
```

---

### 5. Reports Page

#### Test 5.1: View Monthly Report
```
Navigate:  /reports
Default:   Filter is "This Month"
Expected:  ✓ Collection total matches sum of all payments in month
           ✓ Member stats: Total, Active, Expired counts visible
           ✓ Payments table shows only this month's payments
           ✓ "Expiring Soon" section shows members expiring in 7 days
```

#### Test 5.2: Date Filters
```
Click:     "Today" filter
Expected:  ✓ Collection shows only today's payments (0 or low amount)
           ✓ Payments table updates
Click:     "This Week"
Expected:  ✓ Collection for last 7 days shown
Click:     "Custom"
Expected:  ✓ Date pickers appear
           ✓ Can select custom range
Select:    Start: Aug 10, End: Aug 15
Expected:  ✓ Collection for that range calculated
           ✓ Payments table filtered
```

#### Test 5.3: Expiring Soon Section
```
Filter:    Any filter
Expected:  ✓ "Expiring Soon" section shows members with ≤7 days left
           ✓ Each has Yellow "Expiring Soon" badge
           ✓ Shows name, plan, expiry date
```

---

### 6. Notifications

#### Test 6.1: View Notifications
```
Navigate:  /notifications
Expected:  ✓ Unread section at top
           ✓ Read section below
           ✓ Each notification shows: message, date/time
           ✓ Sample messages reference member names
Example:   "John Doe's membership expires in 7 days"
```

#### Test 6.2: Mark as Read
```
Click:     Check icon on any unread notification
Expected:  ✓ Notification moves to Read section
           ✓ Icon updates
           ✓ Notification bell badge count decreases
```

#### Test 6.3: Notification Bell Badge
```
Navigate:  Any page with top nav
Check:     Bell icon in top right corner
Expected:  ✓ Badge shows unread count (if > 0)
           ✓ Badge disappears when count is 0
Click:     Bell icon
Expected:  ✓ Navigates to /notifications
```

---

### 7. Admin Settings (Gym Owner)

#### Test 7.1: View Gym Settings
```
Navigate:  /admin/settings
Expected:  ✓ Form pre-fills with current gym data:
           ✓ Gym Name: "FitZone Gym"
           ✓ Phone: "+919876543210"
           ✓ Email: "fitzone@gms.local"
           ✓ Address: "123 Main Street, Kozhikode, Kerala"
           ✓ Currency: "INR"
```

#### Test 7.2: Update Settings
```
Change:    Gym Name to "Updated Gym Name"
Change:    Currency to "USD"
Click:     "Save Settings"
Expected:  ✓ Success toast: "Settings saved"
           ✓ Values persist on page reload
Navigate:  /dashboard
Expected:  ✓ Gym name in sidebar updates
```

---

### 8. Membership Plans Admin

#### Test 8.1: View Plans
```
Navigate:  /admin/membership-plans
Expected:  ✓ Table shows all plans for this gym
           ✓ Shows: Plan name, duration, price, status
           ✓ FitZone Gym should have 4 plans:
             - Monthly: 1mo, ₹1,500, Active
             - Quarterly: 3mo, ₹4,000, Active
             - Half-Yearly: 6mo, ₹7,500, Active
             - Yearly: 12mo, ₹14,000, Active
```

#### Test 8.2: Create New Plan
```
Click:     "New Plan" button
Expected:  ✓ Modal opens
Fill:      Plan Name: "2-Month Trial"
           Duration: 2
           Price: 2500
Click:     "Create"
Expected:  ✓ Success toast: "Plan created"
           ✓ Modal closes
           ✓ New plan in table
           ✓ Plan used immediately when adding members
```

#### Test 8.3: Edit Plan
```
Click:     Edit (pencil) icon on any plan
Expected:  ✓ Modal opens with plan details pre-filled
Change:    Price to 3000
Click:     "Save"
Expected:  ✓ Success toast: "Plan updated"
           ✓ New price in table
```

#### Test 8.4: Deactivate Plan
```
Click:     Delete (trash) icon on an active plan
Expected:  ✓ Success toast: "Plan deactivated"
           ✓ Status badge changes to "Inactive"
Note:      Inactive plans cannot be used for new members
```

---

### 9. Super Admin Dashboard

#### Test 9.1: View SaaS Metrics
```
Login as:  superadmin@gms.local
Navigate:  /super-admin
Expected:  ✓ Total Gyms: 2
           ✓ Active Gyms: 2
           ✓ Suspended Gyms: 0
           ✓ Total Members: 20 (15 + 5)
           ✓ Total Revenue: ₹26,500 (sum of subscription amounts)
           ✓ Paid Gyms: 2
           ✓ Pending Payments: 0
           ✓ Subscriptions expiring soon: 0 or 1
           ✓ Expired subscriptions: 0
```

---

### 10. Super Admin Gyms Management

#### Test 10.1: View All Gyms
```
Navigate:  /super-admin/gyms
Expected:  ✓ Table shows all 2 gyms
           ✓ Shows: Name, email, subscription plan, expiry date, payment status, status
```

#### Test 10.2: Suspend Gym
```
Click:     Ban icon on "FitZone Gym"
Expected:  ✓ Status changes to "Suspended"
           ✓ Success toast
Navigate:  /super-admin/gyms
Expected:  ✓ Gym still visible but badge is red "Suspended"
Login as:  owner@gms.local (owner of suspended gym)
Expected:  ✓ Can still login
           ✓ Can still see dashboard (but might show warning)
           ✓ Cannot create new members or records? (depends on biz rule)
```

#### Test 10.3: Activate Gym
```
Click:     Check icon on suspended gym
Expected:  ✓ Status changes to "Active"
           ✓ Success toast
```

#### Test 10.4: Renew Subscription
```
Click:     Refresh icon on any gym
Expected:  ✓ Modal opens
           ✓ Form with fields:
             - Plan: "yearly" (pre-filled)
             - Start Date: (today, pre-filled)
             - End Date: (empty)
             - Amount: (pre-filled with gym's amount)
             - Payment Status: "paid"
Fill:      End Date: Aug 20, 2027 (1 year from start)
Click:     "Update"
Expected:  ✓ Success toast: "Subscription updated"
           ✓ Gym's expiry date updates in table
           ✓ Payment status shows "Paid" (green badge)
```

---

## Performance Checklist

- [ ] Dashboard loads in < 2 seconds
- [ ] Members list with 15+ items loads quickly (no lag)
- [ ] Search filters members instantly (< 100ms)
- [ ] Navigation between pages is smooth
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No console errors after seeding

---

## Browser Compatibility

Test in:
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

---

## Mobile Responsiveness

- [ ] Login page responsive on 375px mobile
- [ ] Dashboard cards stack on mobile
- [ ] Members table horizontal scroll on mobile
- [ ] Sidebar collapses to mobile menu
- [ ] All modals work on mobile
- [ ] Touch interactions work (no hover-only features)

---

## Data Integrity Checks

After running tests:

1. **Backup data files**
```bash
cp -r data/ data.backup/
```

2. **Verify seed data**
   - [ ] users.json has 3 users with hashed passwords
   - [ ] gyms.json has 2 gyms
   - [ ] members.json has 20 members (15 + 5)
   - [ ] payments.json has 22 payments (1 per member + 7 recent)
   - [ ] All dates are valid ISO 8601 format
   - [ ] No null/undefined in required fields

3. **Verify business rules**
   - [ ] Member end dates extend correctly after payment
   - [ ] Notifications generated for expiring/expired members
   - [ ] Cannot delete non-existent resources (404)
   - [ ] Cannot update gyms from wrong owner
   - [ ] Super admin cannot see gym-specific data

---

## Bug Report Template

If you find issues:

```
Title: [Component] Brief description

Steps to Reproduce:
1. Login as X
2. Navigate to Y
3. Click Z
4. Observe error

Expected: What should happen
Actual: What actually happened
Error: [Console error stack if any]

Browser: Chrome 120
Device: MacBook Pro
```

---

## Sign-Off Checklist

- [ ] All 10 test scenarios pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Data persists across refresh
- [ ] Session expires appropriately
- [ ] All error messages clear and helpful
