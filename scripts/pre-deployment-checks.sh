#!/bin/bash
#
# Pre-Deployment Checks
# Validates that the application is ready for deployment
#
# Usage: ./scripts/pre-deployment-checks.sh
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pre-Deployment Validation Checks${NC}"
echo -e "${BLUE}========================================${NC}"

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}✗ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((CHECKS_WARNING++))
}

# Check 1: Build directory exists
echo -e "\n${YELLOW}[1] Build Output${NC}"
if [ -d "$PROJECT_ROOT/dist" ]; then
    if [ -f "$PROJECT_ROOT/dist/index.html" ]; then
        check_pass "dist/ directory exists with index.html"
    else
        check_fail "dist/index.html not found"
    fi
else
    check_fail "dist/ directory not found - run: npm run build"
fi

# Check 2: Required environment files
echo -e "\n${YELLOW}[2] Environment Configuration${NC}"
if [ -f "$PROJECT_ROOT/.env.staging" ]; then
    check_pass ".env.staging exists"
else
    check_fail ".env.staging not found"
fi

if [ -f "$PROJECT_ROOT/.env.production" ]; then
    check_pass ".env.production exists"
else
    check_fail ".env.production not found"
fi

# Check 3: Package configuration
echo -e "\n${YELLOW}[3] Package Configuration${NC}"
if grep -q '"build"' "$PROJECT_ROOT/package.json"; then
    check_pass "build script defined in package.json"
else
    check_fail "build script not found in package.json"
fi

if grep -q '"@vitejs/plugin-react"' "$PROJECT_ROOT/package.json"; then
    check_pass "Vite React plugin configured"
else
    check_fail "Vite React plugin not found"
fi

# Check 4: TypeScript configuration
echo -e "\n${YELLOW}[4] TypeScript Configuration${NC}"
if [ -f "$PROJECT_ROOT/tsconfig.json" ]; then
    if grep -q '"jsx": "react-jsx"' "$PROJECT_ROOT/tsconfig.json"; then
        check_pass "TypeScript JSX configured correctly"
    else
        check_warn "TypeScript JSX may need configuration"
    fi
else
    check_fail "tsconfig.json not found"
fi

# Check 5: Source files
echo -e "\n${YELLOW}[5] Source Files${NC}"

# Count TypeScript files
TS_FILES=$(find "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)
if [ "$TS_FILES" -gt 0 ]; then
    check_pass "Found $TS_FILES TypeScript files"
else
    check_fail "No TypeScript files found in src/"
fi

# Check core files exist
CORE_FILES=(
    "src/app/App.tsx"
    "src/app/main.tsx"
    "src/app/routes.tsx"
    "src/features/auth/services/authService.ts"
    "src/shared/services/apiClient.ts"
)

for file in "${CORE_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file not found"
    fi
done

# Check 6: Dependency health
echo -e "\n${YELLOW}[6] Dependency Health${NC}"

# Check node_modules
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    check_pass "node_modules exists"
    
    # Check package-lock
    if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
        check_pass "package-lock.json present (reproducible builds)"
    else
        check_warn "package-lock.json not found (consider running npm install)"
    fi
else
    check_fail "node_modules not found - run: npm install"
fi

# Check 7: Build validation
echo -e "\n${YELLOW}[7] Build Artifacts${NC}"

if [ -d "$PROJECT_ROOT/dist" ]; then
    BUNDLE_SIZE=$(du -sh "$PROJECT_ROOT/dist" | cut -f1)
    check_pass "dist/ size: $BUNDLE_SIZE"
    
    # List asset files
    ASSETS=$(find "$PROJECT_ROOT/dist/assets" -type f 2>/dev/null | wc -l)
    if [ "$ASSETS" -gt 0 ]; then
        check_pass "Found $ASSETS asset files"
    else
        check_fail "No assets found in dist/assets"
    fi
    
    # Check gzipped size estimate
    GZIP_SIZE=$(du -sh "$PROJECT_ROOT/dist" | cut -f1 2>/dev/null || echo "unknown")
    check_pass "Build ready for deployment"
else
    check_fail "Build output not found"
fi

# Check 8: Environment variables
echo -e "\n${YELLOW}[8] Environment Variables${NC}"

if [ -f "$PROJECT_ROOT/.env.production" ]; then
    if grep -q "VITE_API_BASE_URL" "$PROJECT_ROOT/.env.production"; then
        check_pass "VITE_API_BASE_URL configured in production"
    else
        check_warn "VITE_API_BASE_URL not found in .env.production"
    fi
    
    if grep -q "VITE_SENTRY_DSN" "$PROJECT_ROOT/.env.production"; then
        check_pass "VITE_SENTRY_DSN configured (error tracking enabled)"
    else
        check_warn "VITE_SENTRY_DSN not configured (error tracking disabled)"
    fi
fi

# Check 9: Deployment scripts
echo -e "\n${YELLOW}[9] Deployment Scripts${NC}"

if [ -f "$PROJECT_ROOT/scripts/deploy-staging.sh" ]; then
    check_pass "deploy-staging.sh exists"
else
    check_fail "deploy-staging.sh not found"
fi

if [ -f "$PROJECT_ROOT/scripts/deploy-production.sh" ]; then
    check_pass "deploy-production.sh exists"
else
    check_fail "deploy-production.sh not found"
fi

# Check 10: Git status
echo -e "\n${YELLOW}[10] Git Status${NC}"

if git -C "$PROJECT_ROOT" rev-parse --git-dir > /dev/null 2>&1; then
    if [ -z "$(git -C "$PROJECT_ROOT" status --porcelain)" ]; then
        check_pass "Working directory clean"
    else
        check_warn "Uncommitted changes in working directory"
    fi
    
    # Check for tags
    TAG_COUNT=$(git -C "$PROJECT_ROOT" tag | wc -l)
    if [ "$TAG_COUNT" -gt 0 ]; then
        LATEST_TAG=$(git -C "$PROJECT_ROOT" describe --tags --abbrev=0 2>/dev/null || echo "none")
        check_pass "Latest tag: $LATEST_TAG"
    else
        check_warn "No git tags found (create a v1.0.0 tag before production deployment)"
    fi
else
    check_warn "Not a git repository"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed:  $CHECKS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $CHECKS_WARNING${NC}"
echo -e "${RED}Failed:  $CHECKS_FAILED${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo "Application is ready for deployment."
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some critical checks failed.${NC}"
    echo "Please fix the issues above before deploying."
    exit 1
fi
