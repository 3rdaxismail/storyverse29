# Storyverse GitHub Deployment Script
# Run this with: Right-click -> Run with PowerShell (as Administrator)

Write-Host "🚀 Storyverse GitHub Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Keep window open on error
$ErrorActionPreference = "Continue"

# Check if Git is installed
Write-Host "Checking for Git..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "❌ Git not found. Installing Git..." -ForegroundColor Red
    Write-Host ""
    
    # Try winget first
    try {
        $installResult = winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Git installed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  IMPORTANT: Git has been installed but requires a new terminal session." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Please do the following:" -ForegroundColor White
            Write-Host "  1. Close this window" -ForegroundColor White
            Write-Host "  2. Right-click 'deploy-to-github.ps1' again" -ForegroundColor White
            Write-Host "  3. Select 'Run with PowerShell'" -ForegroundColor White
            Write-Host ""
            Write-Host "Git will be available in the new session." -ForegroundColor Green
            Write-Host ""
            Write-Host "Press any key to close this window..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 0
        } else {
            throw "Installation failed"
        }
    } catch {
        Write-Host "❌ Automatic installation failed." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Git manually:" -ForegroundColor Yellow
        Write-Host "  1. Visit: https://git-scm.com/download/win" -ForegroundColor White
        Write-Host "  2. Download and run the installer" -ForegroundColor White
        Write-Host "  3. After installation, run this script again" -ForegroundColor White
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

Write-Host "✅ Git is installed" -ForegroundColor Green
Write-Host ""

# Get GitHub username
Write-Host "📝 GitHub Account Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
$username = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username cannot be empty" -ForegroundColor Red
    exit 1
}

# Ask if repository exists
Write-Host ""
$repoExists = Read-Host "Have you created the 'storyverse' repository on GitHub? (y/n)"

if ($repoExists -ne 'y') {
    Write-Host ""
    Write-Host "⚠️  Please create the repository first:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "   2. Repository name: storyverse" -ForegroundColor White
    Write-Host "   3. Visibility: Public (or Private)" -ForegroundColor White
    Write-Host "   4. DON'T check 'Initialize with README'" -ForegroundColor White
    Write-Host "   5. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key when done, then run this script again..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Navigate to project directory
$projectPath = "D:\storyverse"
Set-Location $projectPath

Write-Host ""
Write-Host "📦 Preparing repository..." -ForegroundColor Cyan

# Initialize Git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Configure Git user if not set
$gitUser = git config user.name
$gitEmail = git config user.email

if ([string]::IsNullOrWhiteSpace($gitUser)) {
    $name = Read-Host "Enter your name for Git commits"
    git config user.name "$name"
}

if ([string]::IsNullOrWhiteSpace($gitEmail)) {
    $email = Read-Host "Enter your email for Git commits"
    git config user.email "$email"
}

Write-Host ""
Write-Host "📋 Adding files..." -ForegroundColor Cyan
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add files" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Files added" -ForegroundColor Green

Write-Host ""
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
git commit -m "Initial commit - Complete Storyverse dashboard with Figma design"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Commit failed or no changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Adding remote repository..." -ForegroundColor Cyan
$repoUrl = "https://github.com/$username/storyverse.git"

# Remove existing remote if it exists
git remote remove origin 2>$null

git remote add origin $repoUrl
Write-Host "✅ Remote added: $repoUrl" -ForegroundColor Green

Write-Host ""
Write-Host "🌿 Setting main branch..." -ForegroundColor Cyan
git branch -M main
Write-Host "✅ Branch set to main" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "⚠️  You will be prompted for GitHub authentication" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Push failed. Common solutions:" -ForegroundColor Red
    Write-Host "   1. Make sure the repository 'storyverse' exists on GitHub" -ForegroundColor White
    Write-Host "   2. Check your GitHub username is correct: $username" -ForegroundColor White
    Write-Host "   3. You may need to authenticate with a Personal Access Token" -ForegroundColor White
    Write-Host "      Generate one at: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Enable GitHub Pages:" -ForegroundColor Yellow
Write-Host "   → Go to: https://github.com/$username/storyverse/settings/pages" -ForegroundColor White
Write-Host "   → Source: Select 'GitHub Actions'" -ForegroundColor White
Write-Host ""
Write-Host "2. Add Figma API Secret:" -ForegroundColor Yellow
Write-Host "   → Go to: https://github.com/$username/storyverse/settings/secrets/actions" -ForegroundColor White
Write-Host "   → Click 'New repository secret'" -ForegroundColor White
Write-Host "   → Name: VITE_FIGMA_API_TOKEN" -ForegroundColor White
Write-Host "   → Value: figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD" -ForegroundColor White
Write-Host ""
Write-Host "3. Wait 2-3 minutes for deployment" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Visit your live site:" -ForegroundColor Yellow
Write-Host "   → https://$username.github.io/storyverse/" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Deployment script completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
