# GMS Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Deploy to Vercel](#deploy-to-vercel)
4. [Vercel Blob Storage Setup](#vercel-blob-storage-setup)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Initial Setup
```bash
cd gms
npm install
npm run seed
npm run dev
```

Server runs at http://localhost:3000

Use the demo credentials:
- **Admin:** superadmin@gms.local / Admin@123
- **Gym Owner:** owner@gms.local / Owner@123

---

## Production Build

### Build & Test Locally
```bash
npm run build
npm start
```

This creates an optimized production build in `.next/` directory.

### Environment Variables for Production

Create or update `.env.production` with:
```env
NEXT_PUBLIC_APP_NAME=GMS
AUTH_SECRET=<generate with: openssl rand -base64 32>
STORAGE_MODE=blob
BLOB_TOKEN=<your Vercel Blob token>
```

**Generate AUTH_SECRET:**
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

---

## Deploy to Vercel - Step by Step

### ✅ Prerequisites
- [GitHub account](https://github.com) with your code pushed
- [Vercel account](https://vercel.com) (free or paid)
- Generated `AUTH_SECRET` value
- Node.js 18+ locally

### 📋 Step 1: Verify Local Build Works
```bash
npm run build
npm start
```
✓ Confirm the build completes without errors

### 📋 Step 2: Prepare Repository
```bash
# Commit all changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 📋 Step 3: Create/Login to Vercel Account
1. Visit https://vercel.com
2. Click "Sign Up" or "Sign In"
3. Choose "GitHub" authentication
4. Authorize Vercel to access your repositories

### 📋 Step 4: Import Project
1. Go to [Vercel Dashboard](https://vercel.app/dashboard)
2. Click "Add New..." → "Project"
3. Search for `gym_system` repository
4. Click "Import"
5. In the configuration:
   - **Root Directory:** Select `gms/` (important!)
   - **Framework Preset:** Should auto-detect "Next.js"
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### 📋 Step 5: Configure Environment Variables
Before deploying, set up environment variables:

1. In Vercel Import page, click "Environment Variables"
2. Add these variables:
   ```
   NEXT_PUBLIC_APP_NAME = GMS
   AUTH_SECRET = <your generated secret>
   STORAGE_MODE = blob
   BLOB_TOKEN = <leave empty for now>
   ```
   - **Production:** Check the production checkbox for all variables

3. Click "Deploy" to build and deploy

### 📋 Step 6: Set Up Vercel Blob Storage
After initial deployment succeeds:

1. Go to your **Project Settings** → **Storage** tab
2. Click "Create" → "Blob"
3. Name it: `gms-data`
4. Click "Create"
5. Copy the `BLOB_TOKEN` value shown
6. Go back to **Settings** → **Environment Variables**
7. Update `BLOB_TOKEN` with the copied token value
8. Redeploy with "Redeploy" button

### 📋 Step 7: Test the Deployment
1. Visit your Vercel deployment URL (usually https://gms-xxx.vercel.app)
2. Login with demo credentials:
   - Email: `superadmin@gms.local`
   - Password: `Admin@123`
3. Test basic functionality:
   - Create a member
   - Create a payment
   - View dashboard

---

## Vercel Blob Storage Setup

### What is Vercel Blob?
Vercel Blob provides persistent file storage for serverless functions. Since your app uses JSON file storage, we use Blob to persist data.

### Setup Instructions

1. **Enable Blob Storage:**
   - Project Settings → Storage → Create Blob
   - Name: `gms-data`
   - Copy the token

2. **Add to Environment Variables:**
   ```
   STORAGE_MODE=blob
   BLOB_TOKEN=<your-token>
   ```

3. **Data Persistence:**
   - All JSON data files are stored in Vercel Blob
   - Data persists across deployments
   - No additional configuration needed in code

### Blob Storage Cost
- Free tier: 1,000 reads/month, 100 writes/month
- Paid: $0.50 per 1M reads, $5 per 1M writes
- Check [Vercel Pricing](https://vercel.com/pricing/storage) for details

---

## Alternative: Use a Database

For production apps, consider migrating to a database:

### PostgreSQL (Recommended)
```bash
# Install Postgres client
npm install @vercel/postgres

# Set environment variable
DATABASE_URL=postgres://...
```

### MongoDB
```bash
npm install mongodb

# Set environment variable
MONGODB_URI=mongodb+srv://...
```

---

## Deployment URLs

After deployment, you'll get a URL like:
- **Production:** `https://gms-xxx.vercel.app`
- **Branch previews:** `https://gms-branch-name.vercel.app`

### Custom Domain
1. Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## CI/CD Pipeline

### Automatic Deployments
- **Main branch → Production:** Every push to `main` deploys to production
- **Other branches → Preview:** Every push creates a preview URL
- **Pull Requests:** Automatic preview deployment for PR reviews

### Disable Auto-Deploy
1. Project Settings → Git
2. Uncheck "Automatically deploy when pushing to main"

---

## Environment Variable Management

### Accessing in Code
```typescript
// Server-side (API routes, server components)
const secret = process.env.AUTH_SECRET;
const token = process.env.BLOB_TOKEN;

// Client-side (must start with NEXT_PUBLIC_)
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

### Secrets vs Public Variables
- `NEXT_PUBLIC_*` → Visible in browser (use only for non-sensitive data)
- Regular env vars → Only available on server (use for secrets)

---

## Troubleshooting

### Build Fails with "Cannot find module"
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Check Vercel dashboard: Settings → Environment Variables
- Ensure variables are set for Production environment
- Redeploy after adding/updating variables

### Data Not Persisting
1. Verify `STORAGE_MODE=blob` is set
2. Verify `BLOB_TOKEN` is valid
3. Check Vercel Storage: Project → Storage → Blob
4. Check deployment logs: Project → Deployments → Logs

### "AUTH_SECRET" Error
```bash
# Generate new secret
openssl rand -base64 32

# Update in Vercel dashboard
# Redeploy
```

### 502 Bad Gateway Errors
1. Check deployment logs
2. Verify all required environment variables are set
3. Redeploy with "Redeploy" button

---

## Post-Deployment Checklist

- [ ] Deployment URL is accessible
- [ ] Login works with demo credentials
- [ ] Can create new members
- [ ] Can create new payments
- [ ] Data persists after page reload
- [ ] Admin dashboard shows correct metrics
- [ ] No 500 errors in browser console
- [ ] Vercel Storage shows data in Blob

---

## Rollback

If deployment has issues:

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"
4. Or redeploy with previous working commit

---

## Monitoring & Analytics

### View Deployment Logs
1. Vercel Dashboard → Deployments
2. Click on a deployment
3. View build logs and runtime logs

### Performance Analytics
- Vercel Dashboard → Analytics
- Monitor request counts, response times
- Check error rates

### Application Monitoring
Add error tracking (optional):
```bash
npm install @sentry/nextjs
```

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Vercel CLI](https://vercel.com/docs/vercel-cli)

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]
```

### Build & Run Image
```bash
docker build -t gms:latest .
docker run -p 3000:3000 \
  -e AUTH_SECRET=<generated> \
  -e STORAGE_MODE=blob \
  -e BLOB_TOKEN=<token> \
  gms:latest
```

---

## Deploy to AWS EC2

### 1. Launch EC2 Instance
- Ubuntu 22.04 LTS
- t3.medium (2 vCPU, 4GB RAM)
- Security group: Allow 80, 443, 22

### 2. SSH & Install Dependencies
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 3. Clone & Setup
```bash
# Clone repo
git clone https://github.com/your-org/gym_system.git
cd gym_system/gms

# Install dependencies
npm ci --production

# Build
npm run build

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_APP_NAME=GMS
AUTH_SECRET=$(openssl rand -base64 32)
STORAGE_MODE=json
EOF
```

### 4. Start with PM2
```bash
# Start app
pm2 start "npm start" --name "gms"

# Configure startup
pm2 startup
pm2 save
```

### 5. Setup Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Create config
sudo cat > /etc/nginx/sites-available/gms << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/gms /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 6. Setup SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

**App now runs at:** `https://your-domain.com`

---

## Deploy to DigitalOcean App Platform

### 1. Prepare Code
```bash
# Ensure .git exists
git init
git add .
git commit -m "Ready for deployment"
```

### 2. Connect GitHub
- Log in to DigitalOcean
- Go to Apps
- Click "Create App"
- Select GitHub repository
- Select `gms` directory

### 3. Configure
- Framework: Node.js
- Build: `npm run build`
- Start: `npm start`
- Add environment variables (AUTH_SECRET, STORAGE_MODE, etc.)

### 4. Deploy
- Click "Create Resources"
- Wait for deployment
- App runs automatically on DigitalOcean domain

---

## Database Migration (Future)

When moving from JSON to PostgreSQL:

### 1. Setup PostgreSQL
```bash
# Local development
brew install postgresql
createdb gms_dev

# Production (AWS RDS, DigitalOcean)
# Create via cloud provider dashboard
```

### 2. Create Migrations
```bash
npm install prisma
npx prisma init

# Edit schema.prisma with models
# (mirrors our TypeScript types)
```

### 3. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Update Repository
- Create `PostgresRepository` implementing same interfaces
- Update service layer to use new repo
- No changes needed to controllers/routes (DI pattern)

### 5. Data Migration
```bash
# Export JSON data
node scripts/export-json.js > backup.json

# Import to PostgreSQL
npx prisma db seed
```

---

## Monitoring & Logging

### Local
```bash
# Check memory usage
npm run dev

# View browser console (F12)
# View server terminal output
```

### Vercel
- Dashboard → Overview → "Deployments"
- Click deployment → "Logs"
- Search by date/message

### EC2 / Docker
```bash
# PM2
pm2 logs gms
pm2 monit

# Docker
docker logs container-id -f
docker stats
```

---

## Backup Strategy

### Local JSON Files
```bash
# Daily backup
0 2 * * * cp -r /app/data /backups/data-$(date +\%Y\%m\%d)

# Keep last 30 days
find /backups -mtime +30 -delete
```

### Vercel Blob
- Automatically replicated
- Access via Vercel dashboard

### PostgreSQL
```bash
# Daily dump
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql

# Upload to S3
aws s3 cp /backups/db-*.sql s3://your-bucket/backups/
```

---

## Scaling

### Current (MVP)
- Single server
- JSON file storage
- ~100 gyms max
- ~10k members

### Phase 2 (PostgreSQL)
- Add Redis for caching
- Implement database connection pooling
- ~1000 gyms
- ~100k members

### Phase 3 (Distributed)
- Microservices (payments, notifications)
- Load balancer
- Multiple servers
- CDN for static assets
- ~10k+ gyms

---

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 24
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Health Checks

### API Endpoint
```bash
# Add to api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
}
```

### Monitor
```bash
# Check every 5 minutes
*/5 * * * * curl -f https://your-domain.com/api/health || notify

# Uptime monitoring
# Use: Uptime Robot, Pingdom, or similar
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version (24+), run `npm ci` |
| App crashes | Check ENV vars, check free disk space |
| Slow queries | Enable database indexing, add caching |
| High memory | Implement pagination, use connection pooling |
| Auth not working | Verify AUTH_SECRET, check cookies enabled |
| Data loss | Implement backup strategy (see above) |

---

## Rollback

### Vercel
- Dashboard → "Deployments"
- Find previous deployment
- Click "..." → "Promote to Production"

### Docker / Self-hosted
```bash
# Tag releases
git tag v1.0.0
git push origin v1.0.0

# Deploy specific version
docker pull gms:v1.0.0
docker run gms:v1.0.0
```

---

## Security Checklist

- [ ] Change `AUTH_SECRET` to random value
- [ ] Setup HTTPS/SSL certificate
- [ ] Enable CORS properly
- [ ] Rate limit API endpoints
- [ ] Sanitize user inputs (Zod does this)
- [ ] Use strong password policy
- [ ] Enable database backups
- [ ] Monitor for suspicious access
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use environment variables (not hardcoded)

---

## Performance Optimization

### Next.js
```bash
npm run build
```
Generates optimized production build with:
- Code splitting
- Image optimization
- Automatic compression

### Caching Headers
```typescript
// Add to API routes
response.headers.set('Cache-Control', 'public, max-age=60');
```

### Database Indexes
```sql
-- After migrating to PostgreSQL
CREATE INDEX idx_members_gym ON members(gymId);
CREATE INDEX idx_payments_date ON payments(paymentDate);
```

---

## Cost Estimation

| Service | Usage | Cost/Month |
|---------|-------|-----------|
| Vercel | 1 app | $20 (Pro) |
| Vercel Blob | 100GB | $5 |
| PostgreSQL | 5GB | $15 (DigitalOcean) |
| Email/SMS | 1000 msgs | $10 |
| **Total** | | **$50** |

---

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Zod Docs](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
