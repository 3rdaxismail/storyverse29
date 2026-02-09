#!/usr/bin/env node

// List user's Figma files
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN not set");
  process.exit(1);
}

console.log("Fetching your Figma files...\n");

// Get user info first
fetch(`${FIGMA_API_BASE}/me`, {
  headers: { "X-Figma-Token": FIGMA_API_TOKEN },
})
  .then((r) => r.json())
  .then((userData) => {
    console.log(`User: ${userData.email}`);
    console.log(`User ID: ${userData.id}\n`);
    
    // Try to get recent files (this might fail if user has no team)
    return fetch(`${FIGMA_API_BASE}/me/files/recent`, {
      headers: { "X-Figma-Token": FIGMA_API_TOKEN },
    });
  })
  .then((r) => r.json())
  .then((data) => {
    if (data.files && data.files.length > 0) {
      console.log(`Found ${data.files.length} recent files:\n`);
      data.files.slice(0, 5).forEach((file, i) => {
        console.log(`${i + 1}. ${file.name}`);
        console.log(`   Key: ${file.key}`);
        console.log(`   URL: https://www.figma.com/file/${file.key}/`);
        console.log("");
      });
    } else {
      console.log("No recent files found or unable to access team files.");
      console.log("\nPlease provide a file key from any Figma file you can access:");
      console.log("1. Open the file in Figma");
      console.log("2. Copy the key from the URL");
      console.log("   https://www.figma.com/file/FILE_KEY/...");
    }
  })
  .catch((error) => {
    console.log("Could not fetch file list (this is normal for personal accounts)");
    console.log("\nPlease provide a file key manually:");
    console.log("1. Open any Figma file you have access to");
    console.log("2. Copy the key from the URL");
  });
