# Figma MCP Server Test Script
# This script tests the server with a sample file key

param(
    [Parameter(Mandatory=$false)]
    [string]$FileKey = ""
)

Write-Host "=== Figma MCP Server Test ===" -ForegroundColor Cyan
Write-Host ""

# Check for token
if (-not $env:FIGMA_API_TOKEN) {
    Write-Host "ERROR: FIGMA_API_TOKEN is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run setup-token.ps1 to configure your token:" -ForegroundColor Yellow
    Write-Host "  .\setup-token.ps1" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or set it manually:" -ForegroundColor Yellow
    Write-Host "  `$env:FIGMA_API_TOKEN='your-token-here'" -ForegroundColor Green
    Write-Host ""
    exit 1
}

Write-Host "✓ FIGMA_API_TOKEN is set" -ForegroundColor Green

# Validate token format (basic check)
if ($env:FIGMA_API_TOKEN.Length -lt 20) {
    Write-Host "⚠ Token seems too short. Make sure it's correct." -ForegroundColor Yellow
}

Write-Host "✓ Token length: $($env:FIGMA_API_TOKEN.Length) characters" -ForegroundColor Green
Write-Host ""

if ([string]::IsNullOrWhiteSpace($FileKey)) {
    Write-Host "To test reading a Figma file, provide a file key:" -ForegroundColor Yellow
    Write-Host "  .\test-server.ps1 -FileKey 'YOUR_FILE_KEY'" -ForegroundColor Green
    Write-Host ""
    Write-Host "To get the file key, copy it from your Figma URL:" -ForegroundColor White
    Write-Host "  https://www.figma.com/file/ABC123DEF456/My-Design" -ForegroundColor Gray
    Write-Host "  File key is: ABC123DEF456" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Testing server startup..." -ForegroundColor Yellow
Write-Host ""

# Try to start the server (it will wait for stdio input)
Write-Host "Starting MCP server (press Ctrl+C to stop)..." -ForegroundColor Cyan
Write-Host "If you see 'Figma MCP Server running on stdio', the server is working!" -ForegroundColor Green
Write-Host ""

node figma-server.js
