#!/bin/bash
#
# Staging Deployment Script
# Deploys the application to Azure App Service (staging slot)
#
# Usage: ./scripts/deploy-staging.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/dist"
ENV_FILE="$PROJECT_ROOT/.env.staging"
APP_SERVICE_NAME="${STAGING_APP_SERVICE_NAME:-manufacturing-tracking-staging}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-manufacturing-rg}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Manufacturing Tracking - Staging Deploy${NC}"
echo -e "${BLUE}========================================${NC}"

# Pre-flight checks
echo -e "\n${YELLOW}[1/6] Running pre-flight checks...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ Error: $ENV_FILE not found${NC}"
    exit 1
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠ Build directory not found, building application...${NC}"
    cd "$PROJECT_ROOT"
    npm run build
else
    echo -e "${GREEN}✓ Build directory exists${NC}"
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}✗ Error: dist/index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-flight checks passed${NC}"

# Azure login check
echo -e "\n${YELLOW}[2/6] Verifying Azure authentication...${NC}"

if ! az account show &>/dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Azure, prompting for login...${NC}"
    az login
fi

CURRENT_USER=$(az account show --query "user.name" -o tsv)
echo -e "${GREEN}✓ Authenticated as: $CURRENT_USER${NC}"

# Verify Azure resources
echo -e "\n${YELLOW}[3/6] Verifying Azure resources...${NC}"

if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
    echo -e "${RED}✗ Error: Resource group '$RESOURCE_GROUP' not found${NC}"
    echo "Please create the resource group or set AZURE_RESOURCE_GROUP environment variable"
    exit 1
fi

if ! az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    echo -e "${RED}✗ Error: App Service '$APP_SERVICE_NAME' not found in '$RESOURCE_GROUP'${NC}"
    echo "Please create the App Service or set STAGING_APP_SERVICE_NAME environment variable"
    exit 1
fi

echo -e "${GREEN}✓ Azure resources verified${NC}"

# Load environment variables
echo -e "\n${YELLOW}[4/6] Loading environment configuration...${NC}"

export $(cat "$ENV_FILE" | xargs)

echo -e "${GREEN}✓ Environment variables loaded from $ENV_FILE${NC}"

# Deploy to App Service
echo -e "\n${YELLOW}[5/6] Deploying to Azure App Service...${NC}"

echo "Deploying to: $APP_SERVICE_NAME (slot: staging)"
echo "Resource group: $RESOURCE_GROUP"

# Create temporary zip for deployment
DEPLOY_ZIP="/tmp/staging-deploy-$(date +%s).zip"
cd "$BUILD_DIR"
zip -r -q "$DEPLOY_ZIP" .
DEPLOY_SIZE=$(du -h "$DEPLOY_ZIP" | cut -f1)
echo "Deployment package: $DEPLOY_SIZE"

# Deploy zip file
az webapp deployment source config-zip \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --file "$DEPLOY_ZIP" \
    --slot staging

# Cleanup
rm -f "$DEPLOY_ZIP"

echo -e "${GREEN}✓ Deployment uploaded${NC}"

# Verify deployment
echo -e "\n${YELLOW}[6/6] Verifying deployment...${NC}"

STAGING_URL=$(az webapp show \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "hostNames[0]" \
    -o tsv)

STAGING_URL="https://$STAGING_URL"

echo "Waiting for service to be ready..."

for i in {1..30}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Service is ready (HTTP $HTTP_CODE)${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Service failed to respond after 30 attempts${NC}"
        exit 1
    fi
    
    echo "  Attempt $i/30: HTTP $HTTP_CODE - retrying in 10s..."
    sleep 10
done

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ STAGING DEPLOYMENT SUCCESSFUL${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "URL: $STAGING_URL"
echo "App Service: $APP_SERVICE_NAME"
echo "Slot: staging"
echo "Deployment Time: $(date)"
echo ""
echo "Next steps:"
echo "  1. Test the staging environment at: $STAGING_URL"
echo "  2. Verify all features are working"
echo "  3. Run smoke tests"
echo "  4. If successful, proceed to production deployment"
echo ""
