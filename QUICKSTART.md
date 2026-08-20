# GMS Quick Start Guide

## 🚀 Get Running in 30 Seconds

```bash
cd gms
npm install
npm run seed
npm run dev
```

Server running at **http://localhost:3000** ✅

---

## 📝 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@gms.local` | `Admin@123` |
| Gym Owner 1 | `owner@gms.local` | `Owner@123` |
| Gym Owner 2 | `owner2@gms.local` | `Owner@123` |

Click "Demo Accounts" buttons on login page to auto-fill.

---

## 🎯 What You Get

### For Gym Owners
- 📊 **Dashboard** with KPIs, member stats, collection chart
- 👥 **Members** with full CRUD, search, status tracking
- 💰 **Payments** with multiple payment types, auto-extend membership
- 📈 **Reports** with date filters and collection metrics
- 🔔 **Notifications** with auto-generated expiry alerts
- ⚙️ **Settings** for gym info and membership plans

### For Super Admin
- 🏢 **Dashboard** with SaaS metrics (gyms, revenue, subscriptions)
- 🔧 **Gym Management** with suspend/activate and subscription renewal

---

## 📁 Key Files to Know

```
gms/
├── app/              # Pages and API routes
├── components/       # Reusable React components
├── lib/             # Services, repos, auth, validation
├── types/           # TypeScript domain models
├── data/            # JSON database files (seeded)
├── IMPLEMENTATION.md # Full architecture docs
├── TESTING.md       # Testing checklist
├── DEPLOYMENT.md    # Deploy to Vercel/Docker/AWS
├── API.md          # API endpoint reference
└── README.md        # (Your overview)
```

---

## ⚡ Common Tasks

### Verify App Works
```bash
npm run dev
# Visit http://localhost:3000
# Click login → use demo credentials
```

### Re-seed Demo Data
```bash
npm run seed
# ⚠️ Clears all data and restarts with demo dataset
```

### Build for Production
```bash
npm run build
npm start
# Runs optimized production build
```

### Run Tests
See `TESTING.md` for 70+ test scenarios

---

## 🔌 API Endpoints (Quick Reference)

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user

### Members
- `GET /api/members` — List
- `POST /api/members` — Create
- `GET /api/members/[id]` — Detail
- `PATCH /api/members/[id]` — Update
- `DELETE /api/members/[id]` — Delete

### Payments
- `GET /api/payments` — List
- `POST /api/payments` — Record payment

### Membership Plans
- `GET /api/membership-plans` — List
- `POST /api/membership-plans` — Create
- `PATCH /api/membership-plans/[id]` — Update
- `DELETE /api/membership-plans/[id]` — Deactivate

### Dashboard
- `GET /api/dashboard` — Owner KPIs
- `GET /api/admin/dashboard` — Super admin metrics

Full reference: See `API.md`

---

## 🗄️ Database (JSON Files)

Located in `data/`:
- `users.json` — Users with bcrypt-hashed passwords
- `gyms.json` — Gym accounts and subscriptions
- `members.json` — Member records (20 total)
- `membership-plans.json` — Pricing tiers (7 plans)
- `payments.json` — Transaction history
- `notifications.json` — Auto-generated expiry alerts

**Future:** Replace with PostgreSQL using same repository interface.

---

## 🔐 Auth Model

- **Session-based** using `sessionId` cookie
- **In-memory store** (replaceable with Redis/DB)
- **7-day expiration** per session
- **Automatic logout** on browser close (httpOnly cookie)
- **Passwords hashed** with bcryptjs (salt rounds: 12)

---

## 👥 Multi-Tenant Isolation

Every query scoped by `gymId` from authenticated user:
- Members, payments, plans, notifications isolated per gym
- Super admin can see all gyms
- Gym owner sees only their gym

**Result:** Complete data isolation without explicit filters.

---

## 📦 Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **Frontend** | React 19 | UI components |
| **Framework** | Next.js 16 | App router, API routes |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | Lucide React | Icons |
| **Validation** | Zod 4.4.3 | Schema validation |
| **Charts** | Recharts 3.10 | Data visualization |
| **Auth** | bcryptjs + sessions | Password + auth |
| **Database** | JSON files (→ PostgreSQL) | Pluggable storage |

---

## 🚀 Deployment (Pick One)

### Vercel (Easiest)
```bash
git push
# Auto-deploys from GitHub
# URL: https://gms-xxx.vercel.app
```

### Docker
```bash
docker build -t gms .
docker run -p 3000:3000 gms
```

### AWS EC2 / DigitalOcean
See `DEPLOYMENT.md` for step-by-step setup

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 already in use | Change: `npm run dev -- -p 3001` |
| "Cannot find module" errors | Run: `npm install` |
| Data not saving | Check `data/` folder is writable |
| Login fails | Verify `users.json` has hashed passwords |
| TypeScript errors | Run: `npm run build` to see all errors |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `IMPLEMENTATION.md` | Full architecture, patterns, entities |
| `TESTING.md` | 70+ test scenarios with step-by-step checks |
| `DEPLOYMENT.md` | Production deployment guides (Vercel, Docker, AWS) |
| `API.md` | All endpoints with request/response examples |
| `README.md` | Project overview |

---

## 🎓 Development Workflow

1. **Change code** in `app/`, `components/`, `lib/`
2. **Dev server auto-reloads** (HMR)
3. **TypeScript auto-checks** in background
4. **Browser DevTools** shows any runtime errors
5. **Console logs** in terminal

**Tip:** Keep browser DevTools open for errors.

---

## 🔗 Links

- **Local Dev:** http://localhost:3000
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Zod Validation:** https://zod.dev
- **Recharts:** https://recharts.org

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Server starts without errors (`npm run dev`)
- [ ] Can login with demo credentials
- [ ] Dashboard shows KPIs and chart
- [ ] Can create/edit/delete members
- [ ] Can record payments
- [ ] Notifications show membership alerts
- [ ] Super admin can view all gyms

If all pass → **System is ready to use!** ✅

---

## 💡 Next Steps

1. **Explore the code:** Start with `app/page.tsx` → `app/login/page.tsx` → `app/dashboard/page.tsx`
2. **Try features:** Use demo account to walk through all pages
3. **Check docs:** Read `IMPLEMENTATION.md` for full architecture
4. **Deploy:** Follow `DEPLOYMENT.md` for production
5. **Extend:** Add features by following existing patterns

---

## 🆘 Need Help?

1. Check `TESTING.md` for test scenarios
2. Check `API.md` for endpoint details
3. Check `IMPLEMENTATION.md` for architecture
4. Check `DEPLOYMENT.md` for deployment issues
5. Review TypeScript/browser errors

---

**Status:** ✅ **Production-Ready PoC**  
**Build:** ✅ Compiles successfully  
**Tests:** ✅ 70+ test scenarios available  
**Deploy:** ✅ Ready for Vercel/Docker/AWS  

**Ready to use!** 🎉
