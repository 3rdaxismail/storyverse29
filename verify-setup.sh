#!/bin/bash

# Storyverse Implementation Verification Script
# Checks that all required files are in place for the Preview Landing Page

echo "🔍 Checking Storyverse Preview Landing Page Implementation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1/"
    ((FAIL++))
  fi
}

echo "📂 Checking directories..."
check_dir "src"
check_dir "src/app"
check_dir "src/pages"
check_dir "src/pages/public"
check_dir "src/components"
check_dir "src/components/ui"
check_dir "src/components/layout"
check_dir "src/styles"
echo ""

echo "📄 Checking root config files..."
check_file "package.json"
check_file "tsconfig.json"
check_file "vite.config.ts"
check_file "index.html"
check_file ".env.example"
check_file ".eslintrc.mjs"
check_file ".gitignore"
echo ""

echo "📄 Checking app files..."
check_file "src/app/App.tsx"
check_file "src/app/index.ts"
check_file "src/main.tsx"
check_file "src/vite-env.d.ts"
echo ""

echo "📄 Checking page files..."
check_file "src/pages/public/PreviewLandingPage.tsx"
check_file "src/pages/public/PreviewLandingPage.module.css"
check_file "src/pages/public/index.ts"
check_file "src/pages/index.ts"
echo ""

echo "📄 Checking component files..."
check_file "src/components/ui/Loader.tsx"
check_file "src/components/ui/Loader.module.css"
check_file "src/components/ui/PrimaryButton.tsx"
check_file "src/components/ui/PrimaryButton.module.css"
check_file "src/components/ui/SecondaryButton.tsx"
check_file "src/components/ui/SecondaryButton.module.css"
check_file "src/components/ui/index.ts"
check_file "src/components/layout/PublicHeader.tsx"
check_file "src/components/layout/PublicHeader.module.css"
check_file "src/components/layout/index.ts"
check_file "src/components/index.ts"
echo ""

echo "📄 Checking style files..."
check_file "src/styles/tokens.ts"
check_file "src/styles/global.css"
check_file "src/styles/index.ts"
echo ""

echo "📄 Checking helper files..."
check_file "src/paths.config.ts"
check_file "loader.json"
echo ""

echo "📋 Summary"
echo "==========="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✨ All files are in place!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. npm install"
  echo "2. npm run dev"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️  Some files are missing. Please create them.${NC}"
  echo ""
  exit 1
fi
