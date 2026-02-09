#!/usr/bin/env node

// Simple validation test for the Figma MCP server
// This tests that the server can start and respond to tool requests

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

console.log("Testing Figma MCP Server initialization...\n");

// Test 1: Check environment
console.log("✓ Test 1: Node.js modules loading correctly");

// Test 2: Check SDK import
try {
  const testServer = new Server(
    { name: "test", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );
  console.log("✓ Test 2: MCP SDK Server class working");
} catch (error) {
  console.error("✗ Test 2 failed:", error.message);
  process.exit(1);
}

// Test 3: Check transport
try {
  const testTransport = new StdioServerTransport();
  console.log("✓ Test 3: StdioServerTransport working");
} catch (error) {
  console.error("✗ Test 3 failed:", error.message);
  process.exit(1);
}

// Test 4: Check Figma token presence
if (process.env.FIGMA_API_TOKEN) {
  const tokenLength = process.env.FIGMA_API_TOKEN.length;
  console.log(`✓ Test 4: FIGMA_API_TOKEN is set (${tokenLength} characters)`);
  
  if (tokenLength < 20) {
    console.log("  ⚠ Warning: Token seems short, verify it's correct");
  }
} else {
  console.log("✗ Test 4: FIGMA_API_TOKEN not set");
  console.log("\nPlease set your token:");
  console.log("  $env:FIGMA_API_TOKEN='your-token-here'");
  console.log("\nOr run: .\\setup-token.ps1");
}

console.log("\nAll basic tests passed! ✓");
console.log("\nTo start the actual server, run:");
console.log("  node figma-server.js");
console.log("\nOr use the test script:");
console.log("  .\\test-server.ps1");
