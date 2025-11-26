# Production Deployment Guide - Render

## Prerequisites

- Render account (https://render.com)
- GitHub repository connected to Render
- Stripe account (for payments)
- Domain name (optional)

## Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configuration:
   - **Name**: `training1-db`
   - **Database**: `training1`
   - **User**: `training1`
   - **Region**: Choose closest to your users
   - **Plan**: Choose based on needs (Starter plan for development)
3. Click **Create Database**
4. **Save the connection details:**
   - Internal Database URL (for backend service)
   - External Database URL (for local access)

**Note:** If using external database (not Render's), whitelist these Render outbound IPs:
- `74.220.48.0/24`
- `74.220.56.0/24`

## Step 2: Create Redis Instance

1. Go to Render Dashboard → **New** → **Redis**
2. Configuration:
   - **Name**: `training1-redis`
   - **Region**: Same as database
   - **Plan**: Choose based on needs
3. Click **Create Redis**
4. **Save the connection URL** (Internal Redis URL)

## Step 3: Set Up Typesense Cloud

Option A: **Typesense Cloud** (Recommended)
1. Go to https://cloud.typesense.org
2. Create account and new cluster
3. Configuration:
   - **Cluster Name**: `training1-search`
   - **Region**: Choose closest region
   - **Plan**: Choose based on needs
4. **Save credentials:**
   - Host URL
   - API Key
   - Port (usually 443)

Option B: **Self-host Typesense on Render**
1. Use Docker service on Render
2. See `render-typesense.yaml` configuration

## Step 4: Set Up Object Storage (S3)

Option A: **AWS S3** (Recommended)
1. Create S3 bucket: `training1-production`
2. Enable CORS
3. Create IAM user with S3 access
4. Save Access Key and Secret

Option B: **Render Disks** (Limited, not recommended for production)
- Use persistent disks for file storage

## Step 5: Deploy Backend Service

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configuration:
   - **Name**: `training1-backend`
   - **Region**: Same as database
   - **Branch**: `main` or `master`
   - **Root Directory**: `Training1-Backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Choose based on needs (Starter or Standard)

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

```bash
# Application
NODE_ENV=production
PORT=4000
LOG_LEVEL=info

# Database (use Internal Database URL from Step 1)
DATABASE_URL=<your-postgres-internal-url>

# Redis (use Internal Redis URL from Step 2)
REDIS_URL=<your-redis-internal-url>

# S3 Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=<your-aws-access-key>
S3_SECRET_KEY=<your-aws-secret-key>
S3_BUCKET=training1-production
S3_REGION=us-east-1

# CORS (your frontend URL)
CORS_ORIGIN_FRONTEND=https://training1.onrender.com,https://yourdomain.com

# Authentication (GENERATE SECURE SECRETS!)
JWT_SECRET=<generate-strong-random-string-64-chars>
JWT_EXPIRES_IN=7d
SESSION_SECRET=<generate-strong-random-string-64-chars>

# OAuth
OIDC_GOOGLE_CLIENT_ID=<your-google-client-id>
OIDC_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
OIDC_MICROSOFT_CLIENT_ID=<your-microsoft-client-id>
OIDC_MICROSOFT_CLIENT_SECRET=<your-microsoft-client-secret>
OIDC_REDIRECT_URI=https://your-backend-url.onrender.com/v1/auth/callback/oidc

# Email (use SendGrid, Mailgun, or AWS SES)
SMTP_URL=smtp://smtp.sendgrid.net:587
SMTP_FROM=noreply@yourdomain.com

# SMS
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>

# Stripe
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>

# Typesense
TYPESENSE_HOST=<your-typesense-host>
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=<your-typesense-api-key>

# AI Services
ELEVENLABS_API_KEY=<your-elevenlabs-key>
OPENAI_API_KEY=<your-openai-key>

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_LIVE_SESSIONS=true
ENABLE_PROCTORING=true
```

5. Click **Create Web Service**

## Step 6: Deploy Frontend Service

1. Go to Render Dashboard → **New** → **Static Site** or **Web Service**
2. Connect your GitHub repository
3. Configuration:
   - **Name**: `training1-frontend`
   - **Branch**: `main` or `master`
   - **Root Directory**: `Training1-Frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.next` (for Next.js)
   - **Plan**: Choose based on needs

4. **Environment Variables**:

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com

# Application
NEXT_PUBLIC_APP_NAME=Training1
NEXT_PUBLIC_APP_URL=https://training1.onrender.com

# Authentication
NEXTAUTH_URL=https://training1.onrender.com
NEXTAUTH_SECRET=<generate-strong-random-string>

# OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MICROSOFT_CLIENT_ID=<your-microsoft-client-id>
MICROSOFT_CLIENT_SECRET=<your-microsoft-client-secret>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<your-ga-id>
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>

# CDN
NEXT_PUBLIC_CDN_URL=https://your-s3-bucket.s3.amazonaws.com

# Feature Flags
NEXT_PUBLIC_ENABLE_LIVE_SESSIONS=true
NEXT_PUBLIC_ENABLE_PROCTORING=true
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
```

5. Click **Create Static Site**

## Step 7: Deploy Background Workers

1. Go to Render Dashboard → **New** → **Background Worker**
2. Configuration:
   - **Name**: `training1-workers`
   - **Root Directory**: `Training1-Backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node dist/jobs/workers/index.js`
   - **Environment**: Use same environment variables as backend

3. Click **Create Background Worker**

## Step 8: Run Database Migration

1. Go to your Backend service → **Shell**
2. Run migration:
```bash
npx prisma migrate deploy
```

3. (Optional) Seed initial data:
```bash
npx prisma db seed
```

## Step 9: Configure Domain (Optional)

1. In your Frontend/Backend service settings
2. Go to **Settings** → **Custom Domain**
3. Add your domain (e.g., `api.yourdomain.com` for backend)
4. Update DNS records as instructed
5. Update CORS and environment variables with new domain

## Step 10: Set Up Monitoring

1. **Render Dashboard**: Monitor logs, metrics, health
2. **Sentry** (optional): Error tracking
3. **LogDNA/Datadog** (optional): Advanced logging

## Security Checklist

- ✅ Generate strong random secrets for JWT and sessions
- ✅ Enable CORS only for your frontend domain
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS (automatic on Render)
- ✅ Set up database backups
- ✅ Enable rate limiting
- ✅ Review and restrict API keys/permissions

## Cost Estimation (Render)

- **PostgreSQL**: $7/mo (Starter) - $95/mo (Professional)
- **Redis**: $10/mo (Starter) - $200/mo (Professional)
- **Backend Service**: $7/mo (Starter) - $85/mo (Pro)
- **Frontend**: Free (Static) or $7/mo (Web Service)
- **Workers**: $7/mo (Starter) - $85/mo (Pro)

**Minimum Monthly**: ~$31/mo (Starter tier)
**Recommended Production**: ~$100-200/mo (Standard tier)

## Post-Deployment

1. Test all endpoints
2. Verify database connectivity
3. Test file uploads to S3
4. Test email/SMS notifications
5. Monitor error logs
6. Set up alerts for downtime

## Useful Commands

```bash
# View logs
render logs <service-name>

# SSH into service
render shell <service-name>

# Restart service
render restart <service-name>

# Run migration
render shell training1-backend
npx prisma migrate deploy
```
