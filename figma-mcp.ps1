# Load environment variables from .env.local
$envFile = Join-Path (Split-Path $PSCommandPath) ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Launch figma-developer-mcp
& npx -y figma-developer-mcp@latest --stdio
