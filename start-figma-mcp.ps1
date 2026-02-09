# Start Figma MCP Server Script
# This script sets up and starts the Figma MCP server

Write-Host "=== Figma MCP Server Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if FIGMA_API_TOKEN is set
if (-not $env:FIGMA_API_TOKEN) {
    Write-Host "ERROR: FIGMA_API_TOKEN environment variable is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set your Figma personal access token first:" -ForegroundColor Yellow
    Write-Host "  1. Get your token from: https://www.figma.com/settings (Personal Access Tokens)" -ForegroundColor White
    Write-Host "  2. Set it in PowerShell: " -ForegroundColor White
    Write-Host "     `$env:FIGMA_API_TOKEN='your-token-here'" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or set it permanently:" -ForegroundColor Yellow
    Write-Host "     [System.Environment]::SetEnvironmentVariable('FIGMA_API_TOKEN', 'your-token-here', 'User')" -ForegroundColor Green
    Write-Host ""
    exit 1
}

Write-Host "✓ FIGMA_API_TOKEN is set" -ForegroundColor Green
Write-Host ""

# Navigate to the mcp directory
$mcpDir = Join-Path $PSScriptRoot "mcp"
Set-Location $mcpDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting Figma MCP Server..." -ForegroundColor Green
Write-Host "The server will communicate via stdio (stdin/stdout)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To use this server, configure it in your MCP client settings." -ForegroundColor Yellow
Write-Host ""

# Start the server
node figma-server.js
