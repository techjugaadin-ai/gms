# ✅ Vercel Deployment Checklist

Use this checklist to ensure your GMS app is ready for Vercel deployment.

---

## 🔧 Pre-Deployment Setup

### Local Environment
- [ ] `npm install` - All dependencies installed
- [ ] `npm run build` - Build completes without errors
- [ ] `npm start` - App runs in production mode at http://localhost:3000
- [ ] Demo login works (superadmin@gms.local / Admin@123)
- [ ] Can create test data (members, payments)
- [ ] `.next/` folder exists after build

### Git Repository
- [ ] Git repository initialized: `git status`
- [ ] Remote origin points to GitHub: `git remote -v`
- [ ] All changes committed: `git status` shows clean working tree
- [ ] Latest changes pushed to main branch: `git push origin main`

### Configuration Files
- [ ] `vercel.json` exists in project root
- [ ] `.env.example` contains all required variables
- [ ] `.env.production` created with template values
- [ ] `.env.local` has development values (NOT in git)
- [ ] `.gitignore` properly configured (env files excluded)
- [ ] `next.config.ts` is production-ready

---

## 🌐 Vercel Account Setup

- [ ] Vercel account created: https://vercel.com
- [ ] GitHub connected to Vercel
- [ ] Can see `gym_system` repository in Vercel

---

## 🔑 Environment Variables Prepared

Generate and have ready:

### AUTH_SECRET
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

Copy the generated secret: `_________________________________`

### BLOB_TOKEN
Note: Get this after creating Blob Storage in Vercel
Temporary placeholder: `(will get after deployment)`

---

## 📋 Deployment Steps Checklist

### Step 1: Verify Repository
- [ ] Visit https://github.com/yourusername/gym_system
- [ ] Confirm code is up-to-date
- [ ] Clone URL ready: https://github.com/yourusername/gym_system.git

### Step 2: Vercel Import
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Search and select `gym_system`
- [ ] Configure Project Settings:
  - [ ] Root Directory: `gms/`
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `npm install`

### Step 3: Add Environment Variables
In Vercel Import dialog, add:

- [ ] `NEXT_PUBLIC_APP_NAME` = `GMS`
- [ ] `AUTH_SECRET` = `<your generated secret>`
- [ ] `STORAGE_MODE` = `blob`
- [ ] `BLOB_TOKEN` = `(empty for now)`
- [ ] `DEMO_ADMIN_PASSWORD` = `Admin@123`
- [ ] `DEMO_GYM_OWNER_PASSWORD` = `Owner@123`
- [ ] `DEMO_ADMIN_EMAIL` = `superadmin@gms.local`
- [ ] `DEMO_GYM_OWNER_EMAIL` = `owner@gms.local`

Mark all as **Production** environment

### Step 4: Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (should be 2-3 minutes)
- [ ] Confirm deployment is successful (green checkmark)
- [ ] Copy your Vercel URL

Your deployment URL: `https://gms-________________.vercel.app`

---

## 🗄️ Vercel Blob Storage Setup

After initial deployment succeeds:

### Create Blob Storage
- [ ] Go to Project → Settings → Storage
- [ ] Click "Create" → "Blob"
- [ ] Name: `gms-data`
- [ ] Click "Create"
- [ ] Copy the generated `BLOB_TOKEN`

### Update Environment Variables
- [ ] Go to Project → Settings → Environment Variables
- [ ] Find `BLOB_TOKEN` variable
- [ ] Paste the token value
- [ ] Click "Save"
- [ ] Go to Deployments → Click "Redeploy" on latest deployment
- [ ] Wait for redeploy to complete

---

## ✅ Post-Deployment Testing

### Connectivity
- [ ] Vercel deployment URL is accessible
- [ ] Page loads without 502/504 errors
- [ ] No console errors in browser DevTools

### Functionality
- [ ] Can login with demo credentials
  - Email: superadmin@gms.local
  - Password: Admin@123
- [ ] Dashboard loads with data
- [ ] Can create a new member
- [ ] Can create a new payment
- [ ] Can navigate between pages

### Data Persistence
- [ ] Create a test member
- [ ] Refresh the page - data still present
- [ ] Close browser, reopen URL - data still present
- [ ] Verify in Vercel → Storage → Blob that data files exist

### Error Handling
- [ ] Check Vercel Deployments → Logs for errors
- [ ] Browser console has no errors
- [ ] All API routes responding correctly

---

## 🔒 Security Checklist

- [ ] `AUTH_SECRET` is securely stored in Vercel (not in code)
- [ ] `BLOB_TOKEN` is securely stored in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] `.env.production` file exists (template values only)
- [ ] No secrets in git history: `git log --all --source -- '*.env*'` shows nothing sensitive
- [ ] Vercel Security Headers configured (in next.config.ts)

---

## 🚀 Performance Verification

- [ ] Vercel Analytics dashboard shows deployment
- [ ] Response times are under 1 second
- [ ] No 5xx server errors in logs
- [ ] Database/Blob operations working smoothly

---

## 📱 Multi-Environment Setup (Optional)

If you want to set up preview/staging:

- [ ] Create `preview` branch from `main`
- [ ] Push to GitHub
- [ ] Vercel auto-creates preview deployment
- [ ] Configure separate environment variables for preview
- [ ] Test new features in preview before merging to main

---

## 🔄 Rollback Plan

If deployment has issues:

- [ ] Note the working deployment number
- [ ] Go to Vercel → Deployments
- [ ] Find the previous working deployment
- [ ] Click "..." → "Promote to Production"
- [ ] Or redeploy from git: `git revert` and push

---

## 📞 Troubleshooting Quick Reference

### Build Fails
```bash
# Clean and rebuild locally
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Missing
- Check Vercel Dashboard → Settings → Environment Variables
- Ensure Production environment is selected
- Click "Redeploy" after changes

### Data Not Persisting
- Verify `STORAGE_MODE=blob` in Vercel env vars
- Verify `BLOB_TOKEN` is set and valid
- Check Vercel → Storage → Blob for data files
- Check deployment logs for errors

### Auth Errors
- Regenerate `AUTH_SECRET`: `openssl rand -base64 32`
- Update in Vercel env vars
- Redeploy

### 502/504 Errors
- Check deployment logs: Vercel → Deployments → select deployment → Logs
- Verify all dependencies installed: `npm list`
- Try Redeploy

---

## 📚 Documentation Links

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [.env.example](./.env.example) - Environment variables template
- [Vercel Docs](https://vercel.com/docs) - Official documentation
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying) - Next.js guide

---

## ✨ Success! 

Once all checkboxes are complete, your GMS app is live on Vercel! 🎉

Monitor at:
- **App URL:** https://gms-xxx.vercel.app
- **Dashboard:** https://vercel.com/dashboard
- **Logs:** Project → Deployments → View Logs

