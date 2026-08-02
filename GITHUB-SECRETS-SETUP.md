# GitHub Secrets Configuration Guide

**Purpose**: Set up GitHub repository secrets for automated deployments  
**Version**: 1.0  

---

## Quick Setup (5 minutes)

### Step 1: Create Azure Service Principal

Run this command with your Azure CLI:

```bash
# Replace with your subscription ID
SUBSCRIPTION_ID="12345678-1234-1234-1234-123456789012"

az ad sp create-for-rbac \
  --name "github-manufacturing-tracking" \
  --role "Contributor" \
  --scopes "/subscriptions/$SUBSCRIPTION_ID" \
  --json-auth
```

Output (save this JSON):
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subscriptionId": "12345678-1234-1234-1234-123456789012",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### Step 2: Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click: **New repository secret**
4. Add secrets from the tables below

---

## Required Secrets

### Azure Infrastructure

#### `AZURE_CREDENTIALS` (Required for both staging and production)
- **Value**: The entire JSON output from service principal creation above
- **Keep it secret**: This grants full access to your Azure subscription
- **Rotate periodically**: Consider regenerating quarterly
- **Never commit**: Use GitHub secrets, never check into git

Copy the entire JSON output above and paste into this field.

**Example**:
```json
{"clientId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx","clientSecret":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx","subscriptionId":"12345678-1234-1234-1234-123456789012","tenantId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",...}
```

#### `AZURE_RESOURCE_GROUP`
- **Value**: Your Azure resource group name
- **Example**: `manufacturing-rg`
- **How to find**: `az group list --query "[].name" -o tsv`

---

### Staging Deployment Secrets

#### `STAGING_APP_SERVICE_NAME`
- **Description**: Azure App Service name for staging
- **Example**: `manufacturing-tracking-staging`
- **How to find**: `az webapp list --resource-group manufacturing-rg --query "[].name" -o tsv`
- **Format**: lowercase, alphanumeric + hyphens only

#### `STAGING_APP_SERVICE_URL`
- **Description**: Full URL of staging App Service
- **Example**: `https://manufacturing-tracking-staging.azurewebsites.net`
- **Format**: `https://` + App Service name + `.azurewebsites.net`
- **Verify**: Should be accessible without errors in browser

#### `STAGING_API_BASE_URL`
- **Description**: Base URL for API calls in staging environment
- **Example**: `https://staging-api.yourdomain.com/api`
- **Format**: `https://` + domain + `/api`
- **Must be accessible** from Azure App Service (not localhost)
- **If using mock API**: Same as App Service URL + `/api`

#### `STAGING_SENTRY_DSN` (Optional but recommended)
- **Description**: Sentry Data Source Name for error tracking in staging
- **Example**: `https://xxxxxx@sentry.io/12345`
- **How to get**:
  1. Create project in Sentry (sentry.io)
  2. Select "React" as platform
  3. Copy DSN from settings
- **Can be empty**: If error tracking not needed in staging
- **Recommended**: For early detection of issues

---

### Production Deployment Secrets

#### `PRODUCTION_APP_SERVICE_NAME`
- **Description**: Azure App Service name for production
- **Example**: `manufacturing-tracking` or `manufacturing-tracking-prod`
- **How to find**: `az webapp list --resource-group manufacturing-rg --query "[].name" -o tsv`
- **Important**: This is the main production service

#### `PRODUCTION_APP_SERVICE_URL`
- **Description**: Full URL of production App Service
- **Example**: `https://manufacturing-tracking.azurewebsites.net`
- **Format**: `https://` + App Service name + `.azurewebsites.net`
- **Note**: This is typically the main domain or subdomain

#### `PRODUCTION_API_BASE_URL`
- **Description**: Base URL for API calls in production
- **Example**: `https://api.yourdomain.com/api`
- **Format**: `https://` + production domain + `/api`
- **Important**: Must point to production API backend
- **Not localhost**: Must be publicly accessible

#### `PRODUCTION_SENTRY_DSN` (Highly recommended)
- **Description**: Sentry DSN for production error tracking
- **Example**: `https://xxxxxx@sentry.io/12346`
- **How to get**:
  1. Create separate production project in Sentry
  2. Select "React" as platform
  3. Copy DSN from settings
- **Critical**: Highly recommended for production monitoring
- **Separate from staging**: Use different project in Sentry

---

## Complete Secret Checklist

### Minimum Required (Staging Only)
```
☐ AZURE_CREDENTIALS
☐ AZURE_RESOURCE_GROUP
☐ STAGING_APP_SERVICE_NAME
☐ STAGING_APP_SERVICE_URL
☐ STAGING_API_BASE_URL
```

### Complete Setup (Staging + Production)
```
☐ AZURE_CREDENTIALS
☐ AZURE_RESOURCE_GROUP
☐ STAGING_APP_SERVICE_NAME
☐ STAGING_APP_SERVICE_URL
☐ STAGING_API_BASE_URL
☐ STAGING_SENTRY_DSN
☐ PRODUCTION_APP_SERVICE_NAME
☐ PRODUCTION_APP_SERVICE_URL
☐ PRODUCTION_API_BASE_URL
☐ PRODUCTION_SENTRY_DSN
```

---

## Adding Secrets to GitHub

### Via GitHub Web UI (Recommended for first setup)

1. **Navigate to secrets**:
   - Go to repository
   - Click **Settings** tab
   - Scroll left menu: **Secrets and variables** → **Actions**

2. **Add each secret**:
   - Click **New repository secret**
   - Name: (e.g., `STAGING_APP_SERVICE_NAME`)
   - Value: (paste the value)
   - Click **Add secret**

3. **Repeat** for all secrets in the checklist

### Via GitHub CLI (Faster for multiple secrets)

```bash
# Set current repo
gh repo set-default owner/repo

# Add staging secrets
gh secret set STAGING_APP_SERVICE_NAME --body "manufacturing-tracking-staging"
gh secret set STAGING_APP_SERVICE_URL --body "https://manufacturing-tracking-staging.azurewebsites.net"
gh secret set STAGING_API_BASE_URL --body "https://staging-api.yourdomain.com/api"
gh secret set STAGING_SENTRY_DSN --body "https://xxxxxx@sentry.io/12345"

# Add production secrets
gh secret set PRODUCTION_APP_SERVICE_NAME --body "manufacturing-tracking"
gh secret set PRODUCTION_APP_SERVICE_URL --body "https://manufacturing-tracking.azurewebsites.net"
gh secret set PRODUCTION_API_BASE_URL --body "https://api.yourdomain.com/api"
gh secret set PRODUCTION_SENTRY_DSN --body "https://xxxxxx@sentry.io/12346"

# Add Azure credentials (from file)
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set AZURE_RESOURCE_GROUP --body "manufacturing-rg"
```

---

## Verify Secrets Are Set

```bash
# List all secrets (values hidden)
gh secret list
```

Expected output:
```
AZURE_CREDENTIALS              Updated Sep 2, 2026
AZURE_RESOURCE_GROUP           Updated Sep 2, 2026
PRODUCTION_API_BASE_URL        Updated Sep 2, 2026
PRODUCTION_APP_SERVICE_NAME    Updated Sep 2, 2026
PRODUCTION_APP_SERVICE_URL     Updated Sep 2, 2026
PRODUCTION_SENTRY_DSN          Updated Sep 2, 2026
STAGING_API_BASE_URL           Updated Sep 2, 2026
STAGING_APP_SERVICE_NAME       Updated Sep 2, 2026
STAGING_APP_SERVICE_URL        Updated Sep 2, 2026
STAGING_SENTRY_DSN             Updated Sep 2, 2026
```

---

## Testing Secrets Configuration

### 1. Test GitHub Actions Workflow

Trigger a test deployment:

```bash
# Push to develop branch to trigger staging deployment
git push origin develop
```

Monitor the workflow:
- Go to **Actions** tab in GitHub
- Click **Deploy to Staging** workflow
- Check if build succeeds

If it fails, check the error message for missing secrets.

### 2. Manual Secret Verification

Create a test workflow (`.github/workflows/test-secrets.yml`):

```yaml
name: Test Secrets
on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check secrets
        run: |
          echo "AZURE_CREDENTIALS: ${{ secrets.AZURE_CREDENTIALS && '✓ SET' || '✗ MISSING' }}"
          echo "AZURE_RESOURCE_GROUP: ${{ secrets.AZURE_RESOURCE_GROUP && '✓ SET' || '✗ MISSING' }}"
          echo "STAGING_APP_SERVICE_NAME: ${{ secrets.STAGING_APP_SERVICE_NAME && '✓ SET' || '✗ MISSING' }}"
          echo "STAGING_APP_SERVICE_URL: ${{ secrets.STAGING_APP_SERVICE_URL && '✓ SET' || '✗ MISSING' }}"
          echo "STAGING_API_BASE_URL: ${{ secrets.STAGING_API_BASE_URL && '✓ SET' || '✗ MISSING' }}"
          echo "PRODUCTION_APP_SERVICE_NAME: ${{ secrets.PRODUCTION_APP_SERVICE_NAME && '✓ SET' || '✗ MISSING' }}"
          echo "PRODUCTION_APP_SERVICE_URL: ${{ secrets.PRODUCTION_APP_SERVICE_URL && '✓ SET' || '✗ MISSING' }}"
          echo "PRODUCTION_API_BASE_URL: ${{ secrets.PRODUCTION_API_BASE_URL && '✓ SET' || '✗ MISSING' }}"
```

---

## Security Best Practices

### ✓ Do

- ✓ Use GitHub's built-in secrets manager
- ✓ Rotate `AZURE_CREDENTIALS` quarterly
- ✓ Use separate Azure service principals for staging and production
- ✓ Restrict service principal permissions to specific resource groups
- ✓ Use different Sentry projects for staging and production
- ✓ Audit secret access in GitHub audit logs
- ✓ Enable branch protection rules
- ✓ Require approval for production deployments

### ✗ Don't

- ✗ Don't commit secrets to git (ever)
- ✗ Don't share Azure credentials via email
- ✗ Don't use the same secrets for staging and production
- ✗ Don't store secrets in .env files in repository
- ✗ Don't use overly permissive IAM roles
- ✗ Don't hardcode API keys or tokens in workflows
- ✗ Don't reuse secrets across multiple projects

---

## Troubleshooting

### "API_BASE_URL is not defined"
- Check: `STAGING_API_BASE_URL` or `PRODUCTION_API_BASE_URL` is set
- Verify: No leading/trailing spaces
- Test: Value is accessible via `curl https://...`

### "Cannot login to Azure"
- Check: `AZURE_CREDENTIALS` is properly formatted JSON
- Verify: Service principal still exists: `az ad app list`
- Renew: Create new service principal if expired

### "App Service not found"
- Check: `STAGING_APP_SERVICE_NAME` or `PRODUCTION_APP_SERVICE_NAME` matches
- Verify: `az webapp list --resource-group <group>`
- Ensure: App Service is in the correct resource group

### "Deployment hangs at health check"
- Check: App Service is started: `az webapp start --name <name> --resource-group <group>`
- Verify: `VITE_API_BASE_URL` is accessible from Azure
- Check: Firewall rules not blocking App Service

---

## Support

Need help? Check:
1. **GitHub documentation**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
2. **Azure documentation**: https://learn.microsoft.com/azure/azure-resource-manager/templates/
3. **Deployment logs**: Go to **Actions** tab and check workflow logs
4. **App Service logs**: `az webapp log tail --name <name> --resource-group <group>`

---

**Last Updated**: 2026-08-02  
**Status**: ✅ Ready for configuration
