#!/usr/bin/env node
/**
 * Build script for Storyverse
 * - Builds the React app with Vite
 * - Builds the MCP Figma WebSocket server
 * - Copies socket.js to root dist for extension to find
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🏗️  Building Storyverse...\n');

// Step 1: Build MCP Figma WebSocket server
console.log('📦 Step 1: Building MCP Figma WebSocket server...');
try {
  execSync('npm run build', { cwd: 'tools/mcp-figma', stdio: 'inherit' });
  console.log('✅ MCP Figma build successful\n');
} catch (error) {
  console.error('❌ MCP Figma build failed');
  process.exit(1);
}

// Step 2: Build React app
console.log('📦 Step 2: Building Storyverse React app...');
try {
  execSync('tsc --noEmit && vite build', { stdio: 'inherit' });
  console.log('✅ Vite build successful\n');
} catch (error) {
  console.error('❌ Vite build failed');
  process.exit(1);
}

// Step 3: Copy socket.js to root dist
console.log('📦 Step 3: Copying socket.js to root dist...');
try {
  const srcPath = path.join(__dirname, 'tools/mcp-figma/dist/socket.js');
  const destPath = path.join(__dirname, 'dist/socket.js');
  
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source file not found: ${srcPath}`);
  }
  
  fs.copyFileSync(srcPath, destPath);
  console.log(`✅ Copied socket.js to ${destPath}\n`);
} catch (error) {
  console.error(`❌ Failed to copy socket.js: ${error.message}`);
  process.exit(1);
}

console.log('✨ Build complete! All components ready.');
console.log('📡 WebSocket server script at: d:\\storyverse\\dist\\socket.js');
console.log('🌐 React app built at: d:\\storyverse\\dist\\index.html');
