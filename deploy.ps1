# Storyverse Clean Deployment Script
# Ensures fresh builds always deploy to production

Write-Host "Storyverse Deployment Pipeline" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean old build
Write-Host "Step 1/5: Cleaning old build directory..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "OK: Old build removed" -ForegroundColor Green
} else {
    Write-Host "OK: No old build found" -ForegroundColor Green
}
Write-Host ""

# Step 2: Set build metadata
Write-Host "Step 2/5: Setting build metadata..." -ForegroundColor Yellow
$version = (Get-Content package.json | ConvertFrom-Json).version
$buildTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$env:VITE_BUILD_VERSION = $version
$env:VITE_BUILD_TIME = $buildTime
Write-Host "   Version: $version" -ForegroundColor White
Write-Host "   Build Time: $buildTime" -ForegroundColor White
Write-Host "OK: Build metadata set" -ForegroundColor Green
Write-Host ""

# Step 3: Build the application
Write-Host "Step 3/5: Building application..." -ForegroundColor Yellow
$env:VITE_BUILD_VERSION = $version
$env:VITE_BUILD_TIME = $buildTime
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Verify build output
Write-Host "Step 4/5: Verifying build output..." -ForegroundColor Yellow
if (-not (Test-Path "dist/index.html")) {
    Write-Host "ERROR: Build verification failed - index.html not found!" -ForegroundColor Red
    exit 1
}
$buildSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor White
Write-Host "OK: Build verified" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Firebase
Write-Host "Step 5/5: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Deployment successful" -ForegroundColor Green
Write-Host ""

# Success summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "   Version: $version" -ForegroundColor White
Write-Host "   Build Time: $buildTime" -ForegroundColor White
Write-Host "   Build Size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "Verification Steps:" -ForegroundColor Yellow
Write-Host "   1. Open your live site" -ForegroundColor White
Write-Host "   2. Open browser console (F12)" -ForegroundColor White
Write-Host "   3. Look for deployment info with:" -ForegroundColor White
Write-Host "      - Version: $version" -ForegroundColor Cyan
Write-Host "      - Build Time: $buildTime" -ForegroundColor Cyan
Write-Host "   4. If you see old version, hard refresh (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""
Write-Host "Service Worker Update:" -ForegroundColor Yellow
Write-Host "   First-time users may need ONE hard refresh" -ForegroundColor White
Write-Host "   Subsequent updates will be automatic" -ForegroundColor White
Write-Host ""
