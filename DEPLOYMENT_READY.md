# RDS Schema Fix - Deployment Ready

## Summary

All RDS schema mismatch issues have been resolved. The application has been tested locally with Docker connecting to RDS and all endpoints are working correctly.

## Changes Made

### 1. Schema Fixes
- ✅ Removed duplicate `avatar_url` column in Profile model
- ✅ Added `MatchingProfileImage` model to match RDS table
- ✅ Removed duplicate `/healthz` endpoint in main.py
- ✅ Removed invalid SQLAlchemy relationships (Category.posts, Subcategory.posts) that had no FK support

### 2. Phone Authentication
- ✅ Added `PHONE_AUTH_ENABLED` feature flag (default: false)
- ✅ Disabled phone auth endpoints with 501 responses when flag is false
- ✅ Added stub `sms_service` module for import compatibility
- ✅ Added phone auth schemas (PhoneVerificationRequest, PhoneVerificationConfirm, UserRegistrationStep1)
- ✅ Fixed `/api/auth/me` to use `display_name` instead of non-existent `nickname` field
- ✅ Simplified `/api/auth/register` to email-only registration

### 3. Safety Features
- ✅ Added `RUN_MIGRATIONS` flag to start.sh (default: false) for safer deployments
- ✅ Made `Base.metadata.create_all` conditional (only for SQLite, not RDS)
- ✅ Created schema verification script (`backend/scripts/verify_schema.py`)

### 4. Matching Profile Fixes
- ✅ Removed `avatar_url` references from matching.py (column doesn't exist in MatchingProfile)

## Local Testing Results

✅ **Health Check**: `GET /healthz` → `{"status":"ok"}`
✅ **API Health**: `GET /api/health` → `{"status":"ok","db":"ok"}`
✅ **Login**: `POST /api/auth/token` → Returns valid JWT token
✅ **User Info**: `GET /api/auth/me` → Returns user data correctly
✅ **Schema Verification**: Only `alembic_version` table difference (expected)

## Test Credentials

- Email: `testuser001@example.com`
- Password: `Testpass123!`

## Next Steps for Deployment

### 1. Build and Push to ECR

```bash
# Tag the image
cd backend
docker build -t rainbow-community-api:prod-v13 .

# Authenticate to ECR
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com

# Tag for ECR
docker tag rainbow-community-api:prod-v13 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:prod-v13

# Push to ECR
docker push 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:prod-v13
```

### 2. Update App Runner

Update the App Runner service to use the new image:
- Image: `192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:prod-v13`
- Ensure environment variables are set:
  - `DATABASE_URL`: (already configured)
  - `SECRET_KEY`: (already configured)
  - `ADMIN_SECRET`: (already configured)
  - `CORS_ORIGINS`: (already configured)
  - `RUN_MIGRATIONS`: `false` (important!)
  - `PHONE_AUTH_ENABLED`: `false` (optional, defaults to false)

### 3. Verify App Runner Deployment

After deployment, verify:
```bash
# Health check
curl https://7cjpf7nunm.ap-northeast-1.awsapprunner.com/healthz

# API health
curl https://7cjpf7nunm.ap-northeast-1.awsapprunner.com/api/health

# Login test
curl -X POST 'https://7cjpf7nunm.ap-northeast-1.awsapprunner.com/api/auth/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=testuser001@example.com&password=Testpass123!'
```

### 4. Frontend Deployment to Netlify

The frontend is already configured with the correct API URL:
- Production API: `https://7cjpf7nunm.ap-northeast-1.awsapprunner.com`

Deploy to Netlify:
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

Or use Netlify CLI:
```bash
netlify deploy --prod --dir=dist
```

### 5. End-to-End Testing

After both backend and frontend are deployed:
1. Visit https://carat-rainbow-community.netlify.app
2. Test login with `testuser001@example.com` / `Testpass123!`
3. Test matching search functionality
4. Verify all features work correctly

## Environment Variables Reference

### Backend (App Runner)
```
DATABASE_URL=postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
SECRET_KEY=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5
ADMIN_SECRET=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5
CORS_ORIGINS=http://localhost:5173,https://carat-rainbow-community.netlify.app,https://beautiful-sunburst-ba98c9.netlify.app
RUN_MIGRATIONS=false
PHONE_AUTH_ENABLED=false
```

### Frontend (Netlify)
```
VITE_API_URL=https://7cjpf7nunm.ap-northeast-1.awsapprunner.com
```

## Commits Made

1. `4b19d7d` - fix: resolve RDS schema mismatch issues in routers and add safety flags
2. `a6bc490` - fix: add missing phone auth schemas for import compatibility
3. `6a73b98` - fix: add sms_service stub module for import compatibility
4. `23a8934` - fix: remove Category and Subcategory relationships from Post model
5. `294d7ca` - fix: remove Subcategory.posts relationship (no FK support in Post table)

All commits have been pushed to branch `25-11-3`.

## Schema Verification

Run the schema verification script anytime to check for mismatches:
```bash
cd backend
export DATABASE_URL="postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
python3 scripts/verify_schema.py
```

Expected output: Only `alembic_version` table difference (this is normal).
