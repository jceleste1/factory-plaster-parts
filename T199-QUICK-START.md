# Production Release - Quick Start

**Status**: 🟢 READY TO EXECUTE  
**Version**: v1.0.0  
**Environment**: Production  

---

## 🚀 Quick 3-Step Release Process

### Step 1: Create Release Tag (2 minutes)
```bash
cd c:\develop\work\factory-plaster-parts

# Create version tag
git tag -a v1.0.0 -m "Manufacturing Tracking System v1.0.0 - Production Release"

# Verify tag
git tag -l | grep v1.0.0

# Push to GitHub
git push origin v1.0.0
```

### Step 2: Approve Production Deployment (5 minutes)
```
Go to: GitHub Actions → Deploy to Production workflow
Wait for: "Awaiting approval" status
Click: "Review deployments" → "production" → "Approve and deploy"
Monitor: Workflow executes (15 minutes total)
```

### Step 3: Verify Deployment (5 minutes)
```bash
# Test homepage
curl -i https://manufacturing-tracking.azurewebsites.net/

# Expected: HTTP 200 ✓
# Should see: HTML content loads

# Open in browser to manually verify:
# 1. Homepage loads
# 2. Sign in with Google works
# 3. Dashboard displays
# 4. Batch tracking works
```

---

## ✅ Deployment Verification

After deployment, verify these 5 things:

```
✓ Homepage loads (HTTP 200)
✓ OAuth login flow works
✓ Dashboard displays metrics
✓ Batch tracking functionality works
✓ No critical errors in console
```

---

## 📋 Pre-Release Checklist

- [ ] GitHub secrets configured (see GITHUB-SECRETS-SETUP.md)
- [ ] Azure App Service provisioned
- [ ] Production API endpoints ready
- [ ] Sentry project created (optional)
- [ ] Google OAuth production credentials configured

---

## 🎯 Release Commands

```bash
# 1. Create tag
git tag -a v1.0.0 -m "Manufacturing Tracking System v1.0.0"
git push origin v1.0.0

# 2. Or use manual script (if GitHub Actions not available)
./scripts/deploy-production.sh v1.0.0

# 3. Verify deployment
curl -i https://manufacturing-tracking.azurewebsites.net/
```

---

## 📊 Deployment Status

```
✅ T196: Production build - COMPLETE
✅ T197: Deployment pipeline - COMPLETE  
✅ T198: Staging validation - SKIPPED
▶️  T199: Production release - READY TO EXECUTE
```

---

## 📖 Full Documentation

- **Complete guide**: T199-PRODUCTION-RELEASE.md
- **Setup secrets**: GITHUB-SECRETS-SETUP.md
- **Deployment pipeline**: T197-DEPLOYMENT-PIPELINE.md
- **Build status**: T196-BUILD-SUCCESS.md

---

## 🆘 Need Help?

1. **Deployment issue**: Check T197-DEPLOYMENT-PIPELINE.md troubleshooting
2. **Build issue**: Check T196-BUILD-SUCCESS.md
3. **Secrets issue**: Check GITHUB-SECRETS-SETUP.md
4. **Rollback needed**: See T199-PRODUCTION-RELEASE.md emergency procedures

---

**Ready for production release!** 🚀
