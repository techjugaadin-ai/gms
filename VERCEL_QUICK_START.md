# 🚀 Vercel Deployment Quick Start

Your GMS app is ready for Vercel! Follow these 5 simple steps.

---

## Quick Steps (5 minutes)

### 1️⃣ Prepare Your Code
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2️⃣ Generate AUTH_SECRET
**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

Copy the result (you'll need it in step 3)

### 3️⃣ Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Search for `gym_system` repository
4. Select it and click "Import"
5. **Root Directory:** Select `gms/`
6. Click "Continue"

### 4️⃣ Add Environment Variables
Add these in the Vercel import dialog:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_NAME` | `GMS` |
| `AUTH_SECRET` | *(paste your generated secret)* |
| `STORAGE_MODE` | `blob` |
| `BLOB_TOKEN` | *(leave empty for now)* |
| `DEMO_ADMIN_PASSWORD` | `Admin@123` |
| `DEMO_GYM_OWNER_PASSWORD` | `Owner@123` |
| `DEMO_ADMIN_EMAIL` | `superadmin@gms.local` |
| `DEMO_GYM_OWNER_EMAIL` | `owner@gms.local` |

✅ Mark all as **Production**

### 5️⃣ Deploy
Click "Deploy" and wait 2-3 minutes for build to complete.

✨ **Your app is live!** You'll get a URL like: `https://gms-xxx.vercel.app`

---

## Set Up Blob Storage (Persistent Data)

After deployment succeeds:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Storage**
3. Click **Create** → **Blob**
4. Name it: `gms-data`
5. Copy the `BLOB_TOKEN`
6. Go back to **Settings** → **Environment Variables**
7. Update `BLOB_TOKEN` with the copied value
8. Go to **Deployments** and click **Redeploy**

✅ Done! Your data now persists.

---

## Test Your Deployment

1. Visit your Vercel URL: `https://gms-xxx.vercel.app`
2. Login with:
   - Email: `superadmin@gms.local`
   - Password: `Admin@123`
3. Try:
   - View dashboard
   - Create a member
   - Create a payment
   - Refresh page - data should persist!

---

## Key Files

| File | Purpose |
|------|---------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Detailed step-by-step guide |
| [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) | Comprehensive checklist |
| [.env.example](./.env.example) | Environment variables template |
| [vercel.json](./vercel.json) | Vercel configuration |

---

## Common Issues?

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm run build` locally to see errors |
| Env vars not loading | Make sure they're set in **Production** environment |
| Data not saving | Verify Blob Storage is enabled and `BLOB_TOKEN` is set |
| 502 errors | Check deployment logs in Vercel dashboard |

---

## Next Steps

- ✅ Monitor logs: Vercel Dashboard → Deployments
- ✅ Set custom domain: Settings → Domains
- ✅ Enable analytics: Analytics tab
- ✅ Migrate to database (optional): See DEPLOYMENT.md

---

## Need Help?

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete guide with all details and troubleshooting.

Happy deploying! 🎉
