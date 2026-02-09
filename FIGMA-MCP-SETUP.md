# Figma MCP Server Setup

## Overview

This Figma MCP server provides direct integration with Figma's API, allowing you to:
- Read Figma file content (pages, frames, components, layers)
- Export images from Figma files
- Retrieve comments
- Access specific nodes

## Prerequisites

1. **Node.js** - Required to run the MCP server
2. **Figma Personal Access Token** - Get it from [Figma Settings](https://www.figma.com/settings)
   - Go to Settings → Account → Personal Access Tokens
   - Click "Generate new token"
   - Give it a name and copy the token

## Quick Start

### Step 1: Set Your Figma API Token

**Option A: Set Environment Variable (Recommended)**

In PowerShell:
```powershell
$env:FIGMA_API_TOKEN='your-token-here'
```

To set it permanently:
```powershell
[System.Environment]::SetEnvironmentVariable('FIGMA_API_TOKEN', 'your-token-here', 'User')
```

**Option B: Edit mcp.json**

Edit [src/mcp.json](src/mcp.json) and replace `YOUR_FIGMA_TOKEN_HERE` with your actual token.

### Step 2: Install Dependencies

Navigate to the mcp directory and install dependencies:
```powershell
cd mcp
npm install
```

### Step 3: Start the Server

#### Option 1: Using the Start Script
```powershell
.\start-figma-mcp.ps1
```

#### Option 2: Manual Start
```powershell
cd mcp
node figma-server.js
```

## Cursor/VS Code Configuration

Add this to your MCP client settings:

**For Cursor**: Settings → Features → MCP → Edit Config

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["d:\\storyverse\\mcp\\figma-server.js"],
      "env": {
        "FIGMA_API_TOKEN": "your-actual-token-here"
      }
    }
  }
}
```

**Important**: Replace `d:\\storyverse` with your actual project path, and replace `your-actual-token-here` with your Figma token.

## Available Tools

Once connected, you can use these tools:

### 1. get_figma_file
Get the complete content of a Figma file.
```
Parameters:
- file_key: The Figma file key from the URL (figma.com/file/FILE_KEY/...)
```

### 2. get_figma_file_nodes
Get specific nodes from a Figma file.
```
Parameters:
- file_key: The Figma file key
- node_ids: Comma-separated node IDs (e.g., "1:5,1:6")
```

### 3. get_figma_images
Export images from Figma.
```
Parameters:
- file_key: The Figma file key
- node_ids: Comma-separated node IDs
- format: png, jpg, svg, or pdf (default: png)
- scale: Scale factor 1-4 (default: 1)
```

### 4. get_figma_comments
Get all comments from a Figma file.
```
Parameters:
- file_key: The Figma file key
```

## Testing the Connection

1. Start the server using the script or manually
2. You should see: "Figma MCP Server running on stdio"
3. In your MCP client (Cursor/VS Code), the server should appear as connected
4. Try using the `get_figma_file` tool with a file key from your Figma account

## Troubleshooting

### "FIGMA_API_TOKEN environment variable is required"
- Make sure you've set the environment variable or added it to the mcp.json config
- Restart your terminal/editor after setting the environment variable

### "Figma API error (403)"
- Your token is invalid or expired
- Generate a new token from Figma settings

### "Figma API error (404)"  
- The file_key is incorrect
- Make sure you're using the correct part of the Figma URL

### Server won't start
- Check that Node.js is installed: `node --version`
- Make sure dependencies are installed: `cd mcp && npm install`
- Check for syntax errors in figma-server.js

## Finding Your File Key

From a Figma URL like:
```
https://www.figma.com/file/ABC123DEF456/My-Design-File
```

The file key is: `ABC123DEF456`

## Example Usage

Once the server is running and connected to your MCP client, you can ask:
- "Get the content of Figma file ABC123DEF456"
- "Export the logo from my Figma file as PNG"
- "Show me all comments in this Figma file"

The MCP client will use the appropriate tools to fulfill these requests.
```
[INFO] Connected to Figma socket server
```

If you see connection errors, make sure the socket server is running.

## Stopping the Servers

To stop the socket server:

```powershell
# Find the process
netstat -ano | findstr :3055

# Kill it
Stop-Process -Id <PID> -Force
```

Or close the PowerShell window running the socket server.

## Next Steps

1. Make sure the socket server is running (already done! ✓)
2. Configure the MCP server in Cursor settings (use the JSON config above)
3. Install the Figma plugin that communicates with this server
4. Start using Figma commands in Cursor!

## Additional Notes

- The socket server must be running for the MCP integration to work
- You can add the start script to your system startup if you want it to run automatically
- The `src/mcp.json` file is a local configuration reference
