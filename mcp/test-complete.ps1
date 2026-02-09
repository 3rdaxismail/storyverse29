# Complete Figma MCP Server Test
# This script tests everything and can read an actual Figma file

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = $env:FIGMA_API_TOKEN,
    
    [Parameter(Mandatory=$false)]
    [string]$FileKey = ""
)

Write-Host "`n=== Figma MCP Server - Complete Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check token
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "❌ No Figma API token found!`n" -ForegroundColor Red
    Write-Host "Please provide your token in one of these ways:" -ForegroundColor Yellow
    Write-Host "`nOption 1: Pass as parameter" -ForegroundColor White
    Write-Host "  .\test-complete.ps1 -Token 'your-token'" -ForegroundColor Green
    Write-Host "`nOption 2: Set environment variable" -ForegroundColor White
    Write-Host "  `$env:FIGMA_API_TOKEN='your-token'" -ForegroundColor Green
    Write-Host "  .\test-complete.ps1" -ForegroundColor Green
    Write-Host "`nOption 3: Run setup script" -ForegroundColor White
    Write-Host "  .\setup-token.ps1" -ForegroundColor Green
    Write-Host ""
    exit 1
}

# Set the token for child processes
$env:FIGMA_API_TOKEN = $Token

Write-Host "✓ Token found ($($Token.Length) characters)" -ForegroundColor Green
Write-Host ""

# Step 2: Validate server can start
Write-Host "Test 1: Validating server can start..." -ForegroundColor Yellow
$validateResult = node validate.js 2>&1
if ($LASTEXITCODE -eq 0 -or $validateResult -match "All basic tests passed") {
    Write-Host "✓ Server initialization OK" -ForegroundColor Green
} else {
    Write-Host "❌ Server validation failed" -ForegroundColor Red
    Write-Host $validateResult
    exit 1
}
Write-Host ""

# Step 3: Test Figma API connection
Write-Host "Test 2: Testing Figma API connection..." -ForegroundColor Yellow
$apiTestResult = node test-figma-api.js 2>&1
if ($apiTestResult -match "Token is valid") {
    Write-Host "✓ Figma API connection successful" -ForegroundColor Green
    Write-Host "  $($apiTestResult | Select-String 'User:' | Select-Object -First 1)" -ForegroundColor Gray
} else {
    Write-Host "❌ Figma API connection failed" -ForegroundColor Red
    Write-Host $apiTestResult
    Write-Host "`nPlease check your token at: https://www.figma.com/settings" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 4: Test file reading (if file key provided)
if (![string]::IsNullOrWhiteSpace($FileKey)) {
    Write-Host "Test 3: Testing Figma file reading..." -ForegroundColor Yellow
    Write-Host "  File Key: $FileKey" -ForegroundColor Gray
    
    # Create a test request
    $testScript = @"
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const fileKey = '$FileKey';

fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { 'X-Figma-Token': FIGMA_API_TOKEN }
})
.then(r => r.json())
.then(data => {
    if (data.name) {
        console.log('✓ Successfully read file:', data.name);
        console.log('  Pages:', data.document.children.length);
        console.log('  Last modified:', new Date(data.lastModified).toLocaleString());
    } else if (data.err || data.status === 404) {
        console.log('✗ File not found or no access');
    } else {
        console.log('✗ Unexpected response');
    }
})
.catch(err => console.log('✗ Error:', err.message));
"@
    
    $testScript | node
    Write-Host ""
} else {
    Write-Host "Test 3: Skipped (no file key provided)" -ForegroundColor Gray
    Write-Host "  To test file reading, run:" -ForegroundColor Yellow
    Write-Host "    .\test-complete.ps1 -FileKey 'YOUR_FILE_KEY'" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓✓✓ SETUP COMPLETE! ✓✓✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Figma MCP server is ready to use!" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure in your MCP client (see FIGMA-MCP-SETUP.md)" -ForegroundColor White
Write-Host "2. Start the server with: .\start-figma-mcp.ps1" -ForegroundColor White
Write-Host "3. Use the tools to read Figma files!" -ForegroundColor White
Write-Host ""
