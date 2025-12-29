# Quick Start: MCP Figma WebSocket Server

## ⚡ Start Server Now

### Option A: VS Code Task (Recommended)
1. Open any file in VS Code
2. Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
3. Select **"MCP Figma: Start WebSocket Server"**
4. Server starts on **port 3060**

### Option B: Terminal Command
```bash
cd d:\storyverse\tools\mcp-figma
npm run dev
```

### Option C: Direct Node
```bash
cd d:\storyverse\tools\mcp-figma
node dist/socket.js
```

## ✅ Verify Server is Running

Open a new terminal and run:
```bash
cd d:\storyverse\tools\mcp-figma
node test-connection.js
```

Expected output:
```
✅ WebSocket connection SUCCESSFUL!
📡 Connected to ws://localhost:3060
```

## 📊 Server Status

Once running, the server will output:
```
🚀 Starting MCP Figma WebSocket server on port 3060...
✅ MCP Figma WebSocket server is listening on port 3060
```

## 🔧 Configuration

The extension automatically knows:
- **Port**: 3060
- **Host**: localhost
- **Protocol**: ws:// (WebSocket)
- **Auto Start**: Enabled in VS Code settings

## ❌ Troubleshooting

### Server won't start?
```bash
# Check if port is already in use
Get-NetTCPConnection -LocalPort 3060

# Kill any existing process
Stop-Process -Name node -Force
```

### Connection refused?
```bash
# Rebuild TypeScript
cd d:\storyverse\tools\mcp-figma
npm run build
npm run dev
```

### Check logs
The server prints all connection attempts:
- `🔗 Client connected`
- `📨 Message received`
- `❌ Error: [error details]`

---

**All systems operational. WebSocket ready to accept connections on port 3060.**
