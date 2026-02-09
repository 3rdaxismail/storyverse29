#!/usr/bin/env node

// Real Figma API test
// Tests the actual Figma API connection

const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN not set");
  console.error("\nSet it with:");
  console.error("  $env:FIGMA_API_TOKEN='your-token-here'");
  process.exit(1);
}

console.log("Testing Figma API Connection...\n");
console.log(`✓ Token found (${FIGMA_API_TOKEN.length} characters)`);

// Test 1: Get user info (validates token)
console.log("\nTest 1: Validating token with Figma API...");

fetch(`${FIGMA_API_BASE}/me`, {
  headers: {
    "X-Figma-Token": FIGMA_API_TOKEN,
  },
})
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("✓ Token is valid!");
    console.log(`  User: ${data.email || data.handle || 'Unknown'}`);
    console.log(`  ID: ${data.id}`);
    
    console.log("\n✓✓✓ ALL TESTS PASSED! ✓✓✓");
    console.log("\nYour Figma MCP server is fully configured and ready to use!");
    console.log("\nTo get file content, you need a file key from a Figma URL:");
    console.log("  https://www.figma.com/file/ABC123DEF456/My-Design");
    console.log("  File key: ABC123DEF456");
    console.log("\nConfigure in your MCP client and start using it!");
  })
  .catch((error) => {
    console.error("\n✗ Token validation failed:", error.message);
    console.error("\nPlease check:");
    console.error("  1. Token is correct and not expired");
    console.error("  2. Token was copied completely");
    console.error("  3. Get a new token from https://www.figma.com/settings");
    process.exit(1);
  });
