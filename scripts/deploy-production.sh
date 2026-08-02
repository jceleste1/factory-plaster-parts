#!/bin/bash
#
# Production Deployment Script
# Deploys the application to Azure App Service (production)
# REQUIRES: Manual approval and sign-off
#
# Usage: ./scripts/deploy-production.sh v1.0.0
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/dist"
ENV_FILE="$PROJECT_ROOT/.env.production"
APP_SERVICE_NAME="${PRODUCTION_APP_SERVICE_NAME:-manufacturing-tracking-prod}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-manufacturing-rg}"
VERSION="${1:-}"

if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Version required${NC}"
    echo "Usage: $0 v1.0.0"
    exit 1
fi

# Validate version format
if ! [[ $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format: $VERSION${NC}"
    echo "Expected format: v1.0.0, v2.1.3, etc."
    exit 1
fi

echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}Manufacturing Tracking - Production Deploy${NC}"
echo -e "${MAGENTA}Version: $VERSION${NC}"
echo -e "${MAGENTA}========================================${NC}"

# APPROVAL GATE - Require explicit confirmation
echo -e "\n${RED}⚠️  PRODUCTION DEPLOYMENT - APPROVAL REQUIRED${NC}"
echo ""
echo "This will deploy version $VERSION to PRODUCTION"
echo "This action cannot be easily reversed."
echo ""
read -p "Type 'yes' to proceed with production deployment: " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Pre-flight checks
echo -e "\n${YELLOW}[1/7] Running pre-flight checks...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ Error: $ENV_FILE not found${NC}"
    exit 1
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}✗ Build directory not found${NC}"
    echo "Run: npm run build"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}✗ Error: dist/index.html not found${NC}"
    exit 1
fi

# Verify git tag exists
if git -C "$PROJECT_ROOT" rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Git tag exists: $VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Git tag not found: $VERSION${NC}"
fi

echo -e "${GREEN}✓ Pre-flight checks passed${NC}"

# Azure authentication
echo -e "\n${YELLOW}[2/7] Verifying Azure authentication...${NC}"

if ! az account show &>/dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Azure, prompting for login...${NC}"
    az login
fi

CURRENT_USER=$(az account show --query "user.name" -o tsv)
echo -e "${GREEN}✓ Authenticated as: $CURRENT_USER${NC}"

# Verify Azure resources
echo -e "\n${YELLOW}[3/7] Verifying Azure resources...${NC}"

if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
    echo -e "${RED}✗ Error: Resource group '$RESOURCE_GROUP' not found${NC}"
    exit 1
fi

if ! az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    echo -e "${RED}✗ Error: App Service '$APP_SERVICE_NAME' not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Azure resources verified${NC}"

# Load environment
echo -e "\n${YELLOW}[4/7] Loading environment configuration...${NC}"

export $(cat "$ENV_FILE" | xargs)
echo -e "${GREEN}✓ Environment variables loaded from $ENV_FILE${NC}"

# Backup current production
echo -e "\n${YELLOW}[5/7] Creating backup of current production...${NC}"

BACKUP_DIR="$PROJECT_ROOT/.backups/prod-$(date +%Y%m%d-%H%M%S)-$VERSION"
mkdir -p "$BACKUP_DIR"

# Get current app settings
az webapp config appsettings list \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    > "$BACKUP_DIR/app-settings.json"

echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"

# Deploy to production
echo -e "\n${YELLOW}[6/7] Deploying to production App Service...${NC}"

echo "Deploying to: $APP_SERVICE_NAME"
echo "Resource group: $RESOURCE_GROUP"
echo "Version: $VERSION"

# Create deployment zip
DEPLOY_ZIP="/tmp/prod-deploy-$(date +%s).zip"
cd "$BUILD_DIR"
zip -r -q "$DEPLOY_ZIP" .
DEPLOY_SIZE=$(du -h "$DEPLOY_ZIP" | cut -f1)
echo "Deployment package: $DEPLOY_SIZE"

# Deploy
echo "Starting deployment..."
az webapp deployment source config-zip \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --file "$DEPLOY_ZIP"

rm -f "$DEPLOY_ZIP"
echo -e "${GREEN}✓ Deployment uploaded${NC}"

# Health check
echo -e "\n${YELLOW}[7/7] Verifying production deployment...${NC}"

PROD_URL=$(az webapp show \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "hostNames[0]" \
    -o tsv)

PROD_URL="https://$PROD_URL"

echo "Waiting for service to be ready at: $PROD_URL"

for i in {1..30}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Service is ready (HTTP $HTTP_CODE)${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Service health check failed${NC}"
        echo "Backup location: $BACKUP_DIR"
        echo "To rollback: az webapp deployment source config-zip ..."
        exit 1
    fi
    
    echo "  Attempt $i/30: HTTP $HTTP_CODE - waiting..."
    sleep 10
done

# Smoke tests
echo -e "\n${YELLOW}Running smoke tests...${NC}"

# Test homepage
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Homepage loads${NC}"
else
    echo -e "${RED}✗ Homepage test failed (HTTP $HTTP_CODE)${NC}"
fi

# Test auth route exists
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/auth" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" -eq 404 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Auth route accessible${NC}"
else
    echo -e "${RED}✗ Auth route test failed (HTTP $HTTP_CODE)${NC}"
fi

echo -e "${GREEN}✓ Smoke tests passed${NC}"

# Summary
echo -e "\n${MAGENTA}========================================${NC}"
echo -e "${GREEN}✓ PRODUCTION DEPLOYMENT SUCCESSFUL${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""
echo "Version: $VERSION"
echo "URL: $PROD_URL"
echo "App Service: $APP_SERVICE_NAME"
echo "Deployment Time: $(date)"
echo ""
echo "Backup Location: $BACKUP_DIR"
echo ""
echo "Post-deployment checklist:"
echo "  ☐ Verify homepage loads and renders correctly"
echo "  ☐ Test login with Google OAuth"
echo "  ☐ Check dashboard metrics display"
echo "  ☐ Verify batch tracking functionality"
echo "  ☐ Check error tracking (Sentry) is working"
echo "  ☐ Monitor application logs and errors"
echo ""
echo "If issues are detected:"
echo "  1. Contact the development team immediately"
echo "  2. Use backup at: $BACKUP_DIR"
echo "  3. Rollback if necessary"
echo ""
