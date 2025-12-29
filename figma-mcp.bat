@echo off
setlocal enabledelayedexpansion

REM Load .env.local if it exists
if exist ".env.local" (
    for /f "delims=" %%x in (.env.local) do (
        set "%%x"
    )
)

REM Launch figma-developer-mcp with FIGMA_API_KEY set
npx -y figma-developer-mcp@latest --stdio
