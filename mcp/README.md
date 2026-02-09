# Figma MCP Server

This directory contains a Model Context Protocol (MCP) server that integrates with Figma's API.

## Quick Setup

### 1. Get Your Figma Token

Run the setup script:
```powershell
.\setup-token.ps1
```

Or get your token manually:
1. Go to https://www.figma.com/settings
2. Scroll to "Personal Access Tokens"
3. Click "Generate new token"
4. Copy the token

### 2. Set the Token

**Option A: Use the setup script** (recommended)
```powershell
.\setup-token.ps1
```

**Option B: Set manually**
```powershell
$env:FIGMA_API_TOKEN='your-token-here'
```

### 3. Test the Server

```powershell
.\test-server.ps1
```

If you see "Figma MCP Server running on stdio" - success! ✓

### 4. Use with MCP Client

Configure in your MCP client (Cursor, VS Code, etc.):

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["d:\\storyverse\\mcp\\figma-server.js"],
      "env": {
        "FIGMA_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Files

- `figma-server.js` - Main MCP server implementation
- `setup-token.ps1` - Interactive script to set up your Figma token
- `test-server.ps1` - Test script to verify server functionality
- `package.json` - Node.js dependencies

## Available Tools

Once connected, the server provides:

1. **get_figma_file** - Get complete file content
2. **get_figma_file_nodes** - Get specific nodes
3. **get_figma_images** - Export images
4. **get_figma_comments** - Get file comments

## Troubleshooting

**Server won't start:**
- Make sure Node.js is installed
- Run `npm install` in this directory

**Authentication errors:**
- Check your token is valid
- Regenerate token from Figma settings

**Can't find file:**
- Verify the file key from the Figma URL
- Format: `https://www.figma.com/file/{FILE_KEY}/...`
