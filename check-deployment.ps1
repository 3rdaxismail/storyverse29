# Pre-Deployment Verification Script
# Run this before deploying to catch common issues

Write-Host "Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0

# Check 1: Firebase config
Write-Host "1. Checking Firebase configuration..." -ForegroundColor Yellow
if (Test-Path "firebase.json") {
    $firebaseConfig = Get-Content "firebase.json" | ConvertFrom-Json
    if ($firebaseConfig.hosting.public -eq "dist") {
        Write-Host "   OK: Firebase hosting points to dist" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Firebase hosting NOT pointing to dist" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "   ERROR: firebase.json not found" -ForegroundColor Red
    $issues++
}

# Check 2: Package.json version
Write-Host "2. Checking package version..." -ForegroundColor Yellow
$package = Get-Content "package.json" | ConvertFrom-Json
Write-Host "   Info: Current version: $($package.version)" -ForegroundColor White
if ($package.version -match '^\d+\.\d+\.\d+$') {
    Write-Host "   OK: Version format valid" -ForegroundColor Green
} else {
    Write-Host "   Warning: Version format unusual" -ForegroundColor Yellow
}

# Check 3: Deploy scripts exist
Write-Host "3. Checking deployment scripts..." -ForegroundColor Yellow
if (Test-Path "deploy.ps1") {
    Write-Host "   OK: deploy.ps1 exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: deploy.ps1 missing" -ForegroundColor Red
    $issues++
}
if (Test-Path "deploy-full.ps1") {
    Write-Host "   OK: deploy-full.ps1 exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: deploy-full.ps1 missing" -ForegroundColor Red
    $issues++
}

# Check 4: Node modules installed
Write-Host "4. Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   OK: node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: node_modules missing" -ForegroundColor Red
    $issues++
}

# Check 5: Vite config has versioning
Write-Host "5. Checking build versioning..." -ForegroundColor Yellow
$viteConfig = Get-Content "vite.config.ts" -Raw
if ($viteConfig -match 'VITE_BUILD_VERSION') {
    Write-Host "   OK: Build versioning configured" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Build versioning missing" -ForegroundColor Red
    $issues++
}

# Check 6: Main.tsx has version logging
Write-Host "6. Checking version logging..." -ForegroundColor Yellow
$mainTsx = Get-Content "src/main.tsx" -Raw
if ($mainTsx -match 'BUILD_VERSION') {
    Write-Host "   OK: Version logging configured" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Version logging missing" -ForegroundColor Red
    $issues++
}

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
if ($issues -eq 0) {
    Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "Ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run: npm run deploy" -ForegroundColor Cyan
} else {
    Write-Host "ISSUES FOUND: $issues" -ForegroundColor Red
    Write-Host "Fix issues above before deploying" -ForegroundColor Yellow
}
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
