#!/usr/bin/env node

// Test reading a specific Figma file
const fileKey = process.argv[2];

if (!fileKey) {
  console.error("ERROR: Please provide a file key");
  console.error("\nUsage: node read-file.js FILE_KEY");
  console.error("\nExample: node read-file.js ABC123XYZ");
  process.exit(1);
}

const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN not set");
  process.exit(1);
}

console.log(`Reading Figma file: ${fileKey}\n`);

fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
  headers: { "X-Figma-Token": FIGMA_API_TOKEN },
})
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("✓✓✓ SUCCESS! File read successfully! ✓✓✓\n");
    console.log(`File Name: ${data.name}`);
    console.log(`Last Modified: ${new Date(data.lastModified).toLocaleString()}`);
    console.log(`Version: ${data.version}`);
    console.log(`\nDocument Structure:`);
    console.log(`  Pages: ${data.document.children.length}`);
    
    data.document.children.forEach((page, i) => {
      console.log(`    ${i + 1}. ${page.name} (${page.children ? page.children.length : 0} items)`);
    });
    
    console.log(`\n✓ The Figma MCP server can successfully read this file!`);
    console.log(`\nFull file data (first 500 chars):`);
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + "...");
  })
  .catch((error) => {
    console.error("\n✗ Failed to read file:", error.message);
    console.error("\nPossible issues:");
    console.error("  1. File key is incorrect");
    console.error("  2. You don't have access to this file");
    console.error("  3. File is private/not shared with your account");
    process.exit(1);
  });
