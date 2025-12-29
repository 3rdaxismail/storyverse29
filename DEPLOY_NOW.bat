@echo off
echo ============================================
echo STORYVERSE GITHUB DEPLOYMENT
echo ============================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/3] Installing Git...
    echo.
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    
    echo.
    echo Git installed! Please CLOSE this window and run this file again as administrator.
    echo.
    pause
    exit
)

echo [1/3] Git is installed ✓
echo.

REM Prompt for GitHub username
set /p GITHUB_USER="Enter your GitHub username: "
echo.

REM Configure Git if needed
git config --global user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    set /p GIT_NAME="Enter your name for Git: "
    git config --global user.name "%GIT_NAME%"
)

git config --global user.email >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    set /p GIT_EMAIL="Enter your email for Git: "
    git config --global user.email "%GIT_EMAIL%"
)

echo [2/3] Preparing repository...
echo.

REM Initialize and prepare repository
if not exist ".git" (
    git init
    echo Repository initialized ✓
)

REM Add all files
git add .
echo Files staged ✓

REM Create commit
git commit -m "Initial commit - Complete Storyverse dashboard"
echo Commit created ✓

REM Remove existing remote if any
git remote remove origin 2>nul

REM Add remote
git remote add origin https://github.com/%GITHUB_USER%/storyverse.git
echo Remote added ✓

REM Set main branch
git branch -M main
echo Branch set to main ✓

echo.
echo [3/3] Pushing to GitHub...
echo You will be prompted for authentication
echo.

REM Push to GitHub
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo ✓ DEPLOYMENT SUCCESSFUL!
    echo ============================================
    echo.
    echo Next steps:
    echo 1. Enable GitHub Pages:
    echo    https://github.com/%GITHUB_USER%/storyverse/settings/pages
    echo    Source: Select 'GitHub Actions'
    echo.
    echo 2. Add Figma API Secret:
    echo    https://github.com/%GITHUB_USER%/storyverse/settings/secrets/actions
    echo    Name: VITE_FIGMA_API_TOKEN
    echo    Value: figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD
    echo.
    echo 3. Wait 2-3 minutes for deployment
    echo.
    echo 4. Visit your site:
    echo    https://%GITHUB_USER%.github.io/storyverse/
    echo.
) else (
    echo.
    echo ============================================
    echo ✗ PUSH FAILED
    echo ============================================
    echo.
    echo Common solutions:
    echo 1. Make sure repository 'storyverse' exists on GitHub
    echo    Create at: https://github.com/new
    echo.
    echo 2. Check your GitHub username is correct: %GITHUB_USER%
    echo.
    echo 3. You may need a Personal Access Token
    echo    Generate at: https://github.com/settings/tokens
    echo.
)

echo.
pause
