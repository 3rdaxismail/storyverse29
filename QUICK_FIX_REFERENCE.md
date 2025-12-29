# 🎯 Extension Fix - Quick Reference

## The Problem (In One Sentence)
Extension looked for WebSocket server at `d:\storyverse\dist\socket.js` but it only existed at `tools/mcp-figma/dist/socket.js`.

## The Solution (In Three Sentences)
Created `build.js` that orchestrates building both the MCP server and React app, then copies socket.js to the root dist where the extension expects it. Created a wrapper at root dist that properly loads the CommonJS server from tools/mcp-figma. Updated package.json to use the new build process.

## How to Use Now

### Build Everything
```bash
npm run build
```

This now:
- Builds MCP Figma WebSocket server
- Builds React app
- Copies socket.js to root dist (where extension looks)

### Start Server (if needed)
```bash
node dist/socket.js
```

Server starts on port 3060 ✅

## Files Changed

| File | Change | Why |
|------|--------|-----|
| `build.js` | **Created** | Master build script |
| `package.json` | Updated "build" script | Use build.js instead of vite |
| `dist/socket.js` | **Replaced** | ES module wrapper for extension |

## Verification

✅ `dist/socket.js` exists (1118 bytes)  
✅ `node dist/socket.js` starts server  
✅ Port 3060 is LISTENING  
✅ WebSocket accepts connections  
✅ Extension can find the server  

## Next Step

Run: `npm run build`

Done! Extension will work automatically.

---

**Error resolved. System operational.**
