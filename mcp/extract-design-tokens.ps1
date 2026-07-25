# Extract Design Tokens from Figma
$fileKey = 'hGphC3Bq9sx5G84wU3ZUKe'
$token = 'REDACTED'  # Use environment variable: $env:FIGMA_TOKEN
$headers = @{ 'X-Figma-Token' = $token }

Write-Host "Fetching Figma file..." -ForegroundColor Cyan

# Fetch the file
$file = Invoke-RestMethod -Uri "https://api.figma.com/v1/files/$fileKey" -Headers $headers

# Helper function to convert RGBA to CSS format
function ConvertTo-RGBA {
    param($color)
    $r = [Math]::Round($color.r * 255)
    $g = [Math]::Round($color.g * 255)
    $b = [Math]::Round($color.b * 255)
    $a = if ($color.a) { $color.a } else { 1 }
    return "rgba($r, $g, $b, $a)"
}

# Extract colors and fonts
$colors = @{}
$fonts = @{}

# Function to traverse nodes
function Get-DesignTokens {
    param($node)
    
    if (-not $node) { return }
    
    # Extract fills (colors)
    if ($node.fills) {
        foreach ($fill in $node.fills) {
            if ($fill.type -eq 'SOLID' -and $fill.color -and $node.name) {
                $colorName = $node.name -replace '[^a-zA-Z0-9]', '_' -replace '_+', '_'
                $colorValue = ConvertTo-RGBA -color $fill.color
                if (-not $colors.ContainsKey($colorName)) {
                    $colors[$colorName] = $colorValue
                    Write-Host "  Color: $colorName = $colorValue" -ForegroundColor Green
                }
            }
        }
    }
    
    # Extract text styles
    if ($node.type -eq 'TEXT' -and $node.style -and $node.name) {
        $fontName = $node.name -replace '[^a-zA-Z0-9]', '_' -replace '_+', '_'
        if (-not $fonts.ContainsKey($fontName)) {
            $fonts[$fontName] = @{
                fontFamily = $node.style.fontFamily
                fontSize = $node.style.fontSize
                fontWeight = $node.style.fontWeight
                lineHeight = if ($node.style.lineHeightPx) { $node.style.lineHeightPx } else { $node.style.lineHeightPercent }
                letterSpacing = $node.style.letterSpacing
            }
            Write-Host "  Font: $fontName" -ForegroundColor Yellow
        }
    }
    
    # Recurse into children
    if ($node.children) {
        foreach ($child in $node.children) {
            Get-DesignTokens -node $child
        }
    }
}

Write-Host "`nExtracting design tokens..." -ForegroundColor Cyan
Get-DesignTokens -node $file.document

# Also check for color styles in the file
Write-Host "`nProcessing styles..." -ForegroundColor Cyan
if ($file.styles) {
    foreach ($styleKey in $file.styles.PSObject.Properties.Name) {
        $style = $file.styles.$styleKey
        if ($style.styleType -eq 'FILL') {
            Write-Host "  Found color style: $($style.name)" -ForegroundColor Magenta
        } elseif ($style.styleType -eq 'TEXT') {
            Write-Host "  Found text style: $($style.name)" -ForegroundColor Magenta
        }
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Colors found: $($colors.Count)" -ForegroundColor Green
Write-Host "Fonts found: $($fonts.Count)" -ForegroundColor Yellow

# Generate TypeScript tokens file
$tsContent = @"
// Design tokens extracted from Figma
// Source: Storyverse Design System
// File: https://www.figma.com/design/hGphC3Bq9sx5G84wU3ZUKe/
// DO NOT MODIFY MANUALLY - Regenerate from Figma

export const colors = {
"@

foreach ($key in $colors.Keys | Sort-Object) {
    $value = $colors[$key]
    $tsContent += "`n  $key`: '$value',"
}

$tsContent += @"

} as const;

export const typography = {
"@

foreach ($key in $fonts.Keys | Sort-Object) {
    $font = $fonts[$key]
    $tsContent += "`n  $key`: {"
    $tsContent += "`n    fontFamily: '$($font.fontFamily)',"
    $tsContent += "`n    fontSize: $($font.fontSize),"
    $tsContent += "`n    fontWeight: $($font.fontWeight),"
    if ($font.lineHeight) {
        $tsContent += "`n    lineHeight: $($font.lineHeight),"
    }
    if ($font.letterSpacing) {
        $tsContent += "`n    letterSpacing: $($font.letterSpacing),"
    }
    $tsContent += "`n  },"
}

$tsContent += @"

} as const;

export type ColorToken = typeof colors[keyof typeof colors];
export type TypographyToken = typeof typography[keyof typeof typography];
"@

# Save to file
$outputPath = "d:\storyverse\src\theme\figma-tokens.ts"
$tsContent | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "`nTokens saved to: $outputPath" -ForegroundColor Green

# Also save JSON version
$jsonData = @{
    colors = $colors
    fonts = $fonts
}
$jsonData | ConvertTo-Json -Depth 10 | Out-File -FilePath "d:\storyverse\mcp\extracted-tokens.json" -Encoding UTF8
Write-Host "JSON data saved to: d:\storyverse\mcp\extracted-tokens.json" -ForegroundColor Green
