# Figma Token Setup Script

Write-Host "=== Figma API Token Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need a Figma Personal Access Token to use this MCP server." -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps to get your token:" -ForegroundColor White
Write-Host "  1. Go to: https://www.figma.com/settings" -ForegroundColor Green
Write-Host "  2. Scroll down to 'Personal Access Tokens'" -ForegroundColor Green
Write-Host "  3. Click 'Generate new token'" -ForegroundColor Green
Write-Host "  4. Give it a name (e.g., 'MCP Server')" -ForegroundColor Green
Write-Host "  5. Copy the token" -ForegroundColor Green
Write-Host ""

$token = Read-Host "Paste your Figma token here (it will be hidden)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host ""
    Write-Host "No token provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting token..." -ForegroundColor Yellow

# Set for current session
$env:FIGMA_API_TOKEN = $token

# Set permanently for user
try {
    [System.Environment]::SetEnvironmentVariable('FIGMA_API_TOKEN', $token, 'User')
    Write-Host "✓ Token set for current session" -ForegroundColor Green
    Write-Host "✓ Token saved permanently (restart terminals to use in new sessions)" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run the MCP server with: .\start-figma-mcp.ps1" -ForegroundColor Cyan
} catch {
    Write-Host "✓ Token set for current session only" -ForegroundColor Yellow
    Write-Host "  (You may need administrator privileges to set it permanently)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To set it manually in each session, use:" -ForegroundColor White
    Write-Host "  `$env:FIGMA_API_TOKEN='$token'" -ForegroundColor Green
}

Write-Host ""
