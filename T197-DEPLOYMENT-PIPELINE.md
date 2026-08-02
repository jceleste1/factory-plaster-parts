# T197: Deployment Pipeline Configuration

**Status**: ✅ COMPLETE  
**Created**: 2026-08-02  

---

## 📋 Overview

This document describes the complete deployment pipeline infrastructure for the Manufacturing Tracking System, including GitHub Actions workflows and bash scripts for manual deployment.

---

## 🔧 Deployment Methods

### Method 1: GitHub Actions (Recommended)
- **Staging**: Automatic deployment on push to `develop` or `staging` branch
- **Production**: Manual workflow dispatch with approval gates
- **Advantage**: Full CI/CD automation, integrated testing, audit trail

### Method 2: Manual Deployment Scripts
- **Staging**: `./scripts/deploy-staging.sh`
- **Production**: `./scripts/deploy-production.sh`
- **Advantage**: Direct control, works offline, suitable for emergencies

### Method 3: Azure CLI
- Direct deployment using `az webapp` commands
- Suitable for custom deployments
- See environment section below

---

## 📂 Files Created

### GitHub Actions Workflows
```
.github/workflows/
├── deploy-staging.yml    # Staging deployment pipeline
└── deploy-production.yml # Production deployment pipeline (with approval gates)
```

### Deployment Scripts
```
scripts/
├── deploy-staging.sh           # Manual staging deployment
├── deploy-production.sh        # Manual production deployment (requires approval)
└── pre-deployment-checks.sh    # Pre-flight validation
```

---

## 🚀 GitHub Actions Workflows

### `deploy-staging.yml`

**Trigger**: 
- Push to `develop` or `staging` branch
- Manual workflow dispatch

**Steps**:
1. Checkout code
2. Install dependencies
3. Run linter (non-blocking)
4. Build application (uses VITE_API_BASE_URL from staging environment)
5. Run tests (non-blocking)
6. Verify build output
7. Deploy to App Service staging slot
8. Verify deployment health check

**Required Secrets**:
```
STAGING_API_BASE_URL              # e.g., https://staging-api.example.com/api
STAGING_SENTRY_DSN                # Sentry error tracking DSN
AZURE_CREDENTIALS                 # Azure service principal JSON
STAGING_APP_SERVICE_NAME          # e.g., manufacturing-tracking-staging
STAGING_APP_SERVICE_URL           # e.g., https://manufacturing-tracking-staging.azurewebsites.net
```

---

### `deploy-production.yml`

**Trigger**:
- Push with tag matching `v*.*.*` (semantic versioning)
- Manual workflow dispatch with version input

**Steps**:
1. Validate version format (v1.0.0)
2. **APPROVAL GATE** - Requires environment administrator approval
3. Checkout specific version tag
4. Build application (production optimized)
5. Run tests
6. Verify build output
7. Deploy to App Service
8. Health check (30 attempts, 10s intervals)
9. Smoke tests (homepage, auth routes)
10. Record deployment metadata

**Features**:
- Manual approval gate (production environment)
- Pre-deployment validation
- Post-deployment smoke tests
- Health check with retry logic
- Build artifact retention (30 days)
- Deployment summary in workflow logs

**Required Secrets**:
```
PRODUCTION_API_BASE_URL           # e.g., https://api.example.com/api
PRODUCTION_SENTRY_DSN             # Sentry error tracking DSN
AZURE_CREDENTIALS                 # Azure service principal JSON
PRODUCTION_APP_SERVICE_NAME       # e.g., manufacturing-tracking
PRODUCTION_APP_SERVICE_URL        # e.g., https://manufacturing-tracking.azurewebsites.net
```

---

## 💻 Manual Deployment Scripts

### `deploy-staging.sh`

**Usage**:
```bash
./scripts/deploy-staging.sh
```

**Requirements**:
- Azure CLI installed and authenticated
- dist/ build directory exists
- .env.staging configured

**Process**:
1. Pre-flight checks (build exists, env files present)
2. Verify Azure login
3. Verify resource group and App Service exist
4. Load environment variables from .env.staging
5. Create deployment zip from dist/
6. Deploy via `az webapp deployment source config-zip`
7. Wait for service readiness (30 attempts)
8. Report deployment URL

**Environment Variables**:
```bash
STAGING_APP_SERVICE_NAME=manufacturing-tracking-staging  # Default
AZURE_RESOURCE_GROUP=manufacturing-rg                   # Default
```

---

### `deploy-production.sh`

**Usage**:
```bash
./scripts/deploy-production.sh v1.0.0
```

**Requirements**:
- Azure CLI installed and authenticated
- Build verified with pre-deployment checks
- Version tag must be provided (e.g., v1.0.0)
- Manual approval (requires user to type 'yes')

**Features**:
- Approval gate (user confirmation required)
- Git tag validation
- Backup of current production settings
- Health check with extended timeout
- Smoke tests after deployment
- Detailed rollback instructions

**Process**:
1. Validate version format
2. Pre-flight checks
3. **APPROVAL GATE** - Require user confirmation (type 'yes')
4. Azure authentication
5. Verify production resources
6. Create backup at `.backups/prod-YYYYMMDD-HHMMSS-vX.X.X/`
7. Deploy to production App Service
8. Wait for service readiness (extended timeout)
9. Run smoke tests
10. Report deployment status with rollback instructions

**Backup Location**:
```
.backups/
└── prod-20260802-154230-v1.0.0/
    └── app-settings.json         # Saved application settings
```

---

### `pre-deployment-checks.sh`

**Usage**:
```bash
./scripts/pre-deployment-checks.sh
```

**Checks Performed**:
1. ✓ Build directory exists with index.html
2. ✓ Environment files (.env.staging, .env.production)
3. ✓ Package.json build script configured
4. ✓ TypeScript configuration valid
5. ✓ Core source files present
6. ✓ Dependencies installed (node_modules)
7. ✓ Build artifacts present and size acceptable
8. ✓ Environment variables configured
9. ✓ Deployment scripts exist
10. ✓ Git status clean

**Output**:
- Detailed pass/fail/warning for each check
- Summary count of issues
- Exit code 0 if ready for deployment, 1 if issues found

---

## 🔑 GitHub Secrets Configuration

### Step 1: Create Azure Service Principal

```bash
az ad sp create-for-rbac \
  --name manufacturing-tracking-deploy \
  --role contributor \
  --scopes /subscriptions/{subscription-id}
```

This returns:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx"
}
```

### Step 2: Add Secrets to GitHub Repository

1. Go to: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

**For Staging**:
- `STAGING_API_BASE_URL`: `https://staging-api.yourdomain.com/api`
- `STAGING_SENTRY_DSN`: `https://xxxxx@sentry.io/xxxxx`
- `STAGING_APP_SERVICE_NAME`: `manufacturing-tracking-staging`
- `STAGING_APP_SERVICE_URL`: `https://manufacturing-tracking-staging.azurewebsites.net`

**For Production**:
- `PRODUCTION_API_BASE_URL`: `https://api.yourdomain.com/api`
- `PRODUCTION_SENTRY_DSN`: `https://xxxxx@sentry.io/xxxxx`
- `PRODUCTION_APP_SERVICE_NAME`: `manufacturing-tracking`
- `PRODUCTION_APP_SERVICE_URL`: `https://manufacturing-tracking.azurewebsites.net`

**For Azure** (both):
- `AZURE_CREDENTIALS`: Paste entire JSON from service principal creation
- `AZURE_RESOURCE_GROUP`: `manufacturing-rg` (or your resource group name)

---

## 📖 Deployment Workflows

### Staging Deployment Flow

```
Push to develop/staging branch
    ↓
GitHub Actions triggered
    ↓
Build & Test
    ↓
Deploy to staging slot
    ↓
Health check (30s)
    ↓
Deployment complete
    ↓
Manual testing in staging
```

**Time**: ~5-10 minutes

### Production Deployment Flow

```
Create and push v1.0.0 tag
    ↓
GitHub Actions triggered
    ↓
Build & Test
    ↓
Await approval
    ↓
Approval received
    ↓
Deploy to production
    ↓
Health check (extended)
    ↓
Smoke tests
    ↓
Deployment complete
    ↓
Monitor error tracking
```

**Time**: ~10-15 minutes (plus approval wait time)

---

## 🧪 Testing the Deployment Pipeline

### 1. Test Pre-Deployment Checks
```bash
./scripts/pre-deployment-checks.sh
```

Expected output: ✓ All critical checks passed!

### 2. Test Staging Deployment (Dry Run)
```bash
# Verify environment first
cat .env.staging

# Run pre-checks
./scripts/pre-deployment-checks.sh

# If successful, deploy
./scripts/deploy-staging.sh
```

### 3. Verify Staging Deployment
```bash
# Test homepage
curl -i https://manufacturing-tracking-staging.azurewebsites.net/

# Check health
curl -i https://manufacturing-tracking-staging.azurewebsites.net/health

# Test OAuth redirects
curl -I https://manufacturing-tracking-staging.azurewebsites.net/auth/callback
```

### 4. Tag for Production Release
```bash
# Create version tag
git tag -a v1.0.0 -m "Production Release v1.0.0"

# Push tag to trigger production workflow
git push origin v1.0.0
```

### 5. Monitor Production Deployment
- Go to: Actions tab → deploy-production.yml
- Monitor workflow progress
- Approve deployment when prompted
- Check deployment summary

---

## 🚨 Troubleshooting

### Staging Deployment Fails

1. Check pre-deployment checks:
   ```bash
   ./scripts/pre-deployment-checks.sh
   ```

2. Verify Azure authentication:
   ```bash
   az account show
   ```

3. Check resource exists:
   ```bash
   az webapp show --name manufacturing-tracking-staging --resource-group manufacturing-rg
   ```

4. View deployment logs:
   ```bash
   az webapp log tail --name manufacturing-tracking-staging --resource-group manufacturing-rg
   ```

### Production Deployment Blocked

1. Ensure version format is correct: `v1.0.0` (not `1.0.0`)
2. Verify GitHub environment "production" has approvers configured
3. Check Azure credentials haven't expired
4. View GitHub Actions logs for detailed error

### Health Check Timeouts

1. Verify App Service is running:
   ```bash
   az webapp show --name manufacturing-tracking --resource-group manufacturing-rg \
     --query "state" -o tsv
   ```

2. Check App Service logs:
   ```bash
   az webapp log tail --name manufacturing-tracking --resource-group manufacturing-rg
   ```

3. Increase timeout in deployment script if needed (currently 30 attempts × 10s = 5 minutes)

---

## 📋 Environment Configuration

### Development (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ERROR_TRACKING_ENABLED=false
VITE_LOG_LEVEL=debug
```

### Staging (.env.staging)
```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api
VITE_ERROR_TRACKING_ENABLED=true
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_LOG_LEVEL=info
VITE_GOOGLE_OAUTH_CLIENT_ID=your-staging-client-id
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_ERROR_TRACKING_ENABLED=true
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_LOG_LEVEL=warn
VITE_GOOGLE_OAUTH_CLIENT_ID=your-production-client-id
```

---

## ✅ Deployment Checklist

### Before Staging Deployment
- [ ] Code reviewed and merged to develop
- [ ] All tests passing locally
- [ ] Pre-deployment checks pass: `./scripts/pre-deployment-checks.sh`
- [ ] Environment variables updated in .env.staging
- [ ] API endpoints accessible from Azure
- [ ] Sentry project created (optional)

### Before Production Deployment
- [ ] Staging deployment verified and tested
- [ ] All features working in staging
- [ ] Release notes prepared
- [ ] Version tag created: `git tag -a v1.0.0 -m "..."`
- [ ] Team notified
- [ ] Rollback procedure reviewed
- [ ] Error tracking configured (Sentry)

### After Production Deployment
- [ ] Homepage loads and renders
- [ ] OAuth login works
- [ ] Dashboard displays metrics
- [ ] Batch tracking functionality works
- [ ] Error tracking logs appear in Sentry
- [ ] Monitor application logs for errors
- [ ] Stakeholder sign-off obtained

---

## 📞 Support

For deployment issues:
1. Check GitHub Actions workflow logs
2. Review error tracking dashboard (Sentry)
3. Check Azure App Service logs:
   ```bash
   az webapp log tail --name manufacturing-tracking --resource-group manufacturing-rg
   ```
4. Review deployment scripts output

---

**Status**: ✅ T197 Complete  
**Next Step**: T198 - Staging Deployment Validation
