# WebSocket Server - Troubleshooting Tree

## Quick Diagnosis

Start here if you have an issue:

```
Is extension showing WebSocket status?
├─ NO → Check: Is "sethford.mcp-figma-extension" installed?
│        └─ Install from VS Code Extensions marketplace
│
└─ YES → Does it show "RUNNING"?
   ├─ YES → ✅ SUCCESS! Server is working
   │        └─ Skip to "Testing Connection" section
   │
   └─ NO (shows "STOPPED") → Continue below...
```

---

## Symptom: WebSocket Shows "Stopped"

### Step 1: Verify Server isn't Already Running
```powershell
Get-Process node | Where-Object {$_.CommandLine -like "*socket*"}
```

**If found**: Kill it
```powershell
Stop-Process -Name node -Force
```

**If not found**: Continue to Step 2

---

### Step 2: Check Port 3060 Isn't Blocked
```powershell
Get-NetTCPConnection -LocalPort 3060 -ErrorAction SilentlyContinue
```

**If something is listening**: Kill it
```powershell
# Get the PID from output above, then:
Stop-Process -Id <PID> -Force
```

**If nothing found**: Continue to Step 3

---

### Step 3: Rebuild TypeScript
```bash
cd d:\storyverse\tools\mcp-figma
npm run build
```

**Expected Output**:
```
> mcp-figma@1.0.0 build
> tsc
```

**If error appears**: Note the error and continue

**If success**: Continue to Step 4

---

### Step 4: Start Server Manually
```bash
cd d:\storyverse\tools\mcp-figma
npm run dev
```

**Expected Output**:
```
🚀 Starting MCP Figma WebSocket server on port 3060...
✅ MCP Figma WebSocket server is listening on port 3060
```

**If different output**: Jump to "Error Messages" section below

**If correct output**: Continue to Step 5

---

### Step 5: Test Connection
Open **NEW terminal** and run:
```bash
cd d:\storyverse\tools\mcp-figma
node test-connection.js
```

**Expected Output**:
```
✅ WebSocket connection SUCCESSFUL!
```

**If "FAILED"**: Jump to "Connection Refused" section below

**If "SUCCESSFUL"**: ✅ SERVER IS WORKING!

---

### Step 6: Verify VS Code Configuration
Check `.vscode/settings.json`:

```json
{
  "mcpFigma.websocketPort": 3060,
  "mcpFigma.autoStartWebSocket": true
}
```

**If missing or wrong**: Fix the settings

**If correct**: Stop server (Ctrl+C) and **restart VS Code**

---

## Common Error Messages

### Error: "Port already in use"
```
listen EADDRINUSE: address already in use :::3060
```

**Solution**:
```bash
# Find what's using it
Get-NetTCPConnection -LocalPort 3060

# Kill it
Stop-Process -Id <PID> -Force

# Try again
npm run dev
```

---

### Error: "EACCES: permission denied"
```
Error: EACCES: permission denied, bind 0.0.0.0:3060
```

**Solution**:
- Run as Administrator: Right-click PowerShell → "Run as Administrator"
- Or use a different port (1024+) and update settings.json

---

### Error: "Cannot find module 'ws'"
```
Cannot find module 'ws'
```

**Solution**:
```bash
cd d:\storyverse\tools\mcp-figma
npm install
npm run build
npm run dev
```

---

### Error: "Cannot find module 'dist/socket.js'"
```
Error: Cannot find module 'D:\storyverse\dist\socket.js'
```

**Solution**:
```bash
cd d:\storyverse\tools\mcp-figma
npm run build
```

(Make sure you're in the `tools/mcp-figma` directory)

---

### Error: "ECONNREFUSED"
```
✅ WebSocket connection FAILED!
Error code: ECONNREFUSED
```

**This means server isn't listening!**

**Solution**:
1. Check server is actually running: `Get-Process node`
2. Rebuild: `npm run build`
3. Start fresh: Kill all node, then `npm run dev`
4. Check for error messages in server output

---

## Testing Connection

### Method 1: Automated Test
```bash
cd d:\storyverse\tools\mcp-figma
node test-connection.js
```

**Expected**: ✅ Success  
**If failed**: Server isn't listening (check server output)

---

### Method 2: Check Port is Listening
```powershell
Get-NetTCPConnection -LocalPort 3060 | Select-Object State, OwningProcess
```

**Expected Output**:
```
State  OwningProcess
-----  --------- 
Listen 12345
```

**If "Listen" shown**: Server is listening ✅  
**If nothing returned**: Server isn't running ❌

---

### Method 3: Check Node Process
```bash
Get-Process node -ErrorAction SilentlyContinue
```

**Expected**: Node process exists with ID from port check  
**If empty**: Server not running, start with `npm run dev`

---

## Decision Tree for "Server Won't Start"

```
Server exits immediately after starting?
├─ YES → Missing dependencies
│        └─ Fix: cd tools/mcp-figma && npm install && npm run build
│
Port shows in listening but connection refused?
├─ YES → TypeScript rebuild needed
│        └─ Fix: npm run build
│
Error message in output?
├─ YES → Check "Error Messages" section above
│        └─ Use specific solution for your error
│
No output at all?
├─ YES → Path issue or file missing
│        └─ Verify: dist/socket.js exists
│        └─ Try: npm run build
│
Otherwise?
└─ Create issue with server output
```

---

## Complete Restart Procedure

If everything fails:

```bash
# 1. Kill all node processes
Stop-Process -Name node -Force

# 2. Navigate to server
cd d:\storyverse\tools\mcp-figma

# 3. Clean build
npm run build

# 4. Check dependencies
npm install

# 5. Rebuild again
npm run build

# 6. Start server
npm run dev

# 7. In NEW terminal, test
node test-connection.js
```

Expected result: ✅ Server running and accepting connections

---

## When to Restart VS Code

After completing the "Troubleshooting Tree", restart VS Code:

1. Close VS Code completely
2. Wait 5 seconds
3. Reopen VS Code
4. Extension should detect running server
5. Status should show "Running"

---

## Power User Checklist

- [ ] Node.js v20+ installed?
- [ ] npm modules installed? (`npm install` in tools/mcp-figma)
- [ ] TypeScript built? (`npm run build` shows no errors)
- [ ] Server starts? (`npm run dev` shows listening message)
- [ ] Connection works? (`node test-connection.js` shows SUCCESS)
- [ ] Port 3060 free? (`Get-NetTCPConnection -LocalPort 3060` empty)
- [ ] Settings correct? (`mcpFigma.websocketPort` = 3060)
- [ ] Extension installed? (sethford.mcp-figma-extension)

---

## Still Stuck?

Check these files for clues:

1. **Server output** (in terminal where you ran `npm run dev`)
   - Look for error messages
   - Look for "listening" confirmation

2. **VS Code Output panel** (View → Output)
   - Select "MCP Figma" from dropdown
   - Check for extension errors

3. **Settings** (`.vscode/settings.json`)
   - Verify port is 3060
   - Verify autoStart is true

4. **Server code** (`tools/mcp-figma/dist/socket.js`)
   - Check it has `port: 3060` (line 7)

---

**Last Resort**: Provide these when asking for help:
```bash
# Run each and save output:
node -v
npm -v
cd d:\storyverse\tools\mcp-figma
npm run build 2>&1
npm run dev 2>&1  # (wait 3 seconds then Ctrl+C)
node test-connection.js 2>&1
```

---

*Generated: December 28, 2025*  
*WebSocket Server v1.0 - Fully Functional*
