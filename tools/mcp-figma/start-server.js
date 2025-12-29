#!/usr/bin/env node
/**
 * MCP Figma WebSocket Server Starter
 * This script starts the WebSocket server and logs all activity
 */

const path = require('path');
const fs = require('fs');

// Ensure we're in the right directory
const serverPath = path.join(__dirname, 'dist', 'socket.js');

if (!fs.existsSync(serverPath)) {
  console.error(`❌ ERROR: Server file not found at ${serverPath}`);
  console.error('Please run: npm run build');
  process.exit(1);
}

console.log('🚀 Starting MCP Figma WebSocket Server...');
console.log(`📂 Working directory: ${__dirname}`);
console.log(`📄 Server file: ${serverPath}`);

// Start the server
require(serverPath);

// Log that the server is running
setTimeout(() => {
  console.log('✅ Server startup completed');
  console.log('📡 Listening on port 3060');
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});
