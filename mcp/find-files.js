#!/usr/bin/env node

// Try multiple endpoints to find user's Figma files
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN not set");
  process.exit(1);
}

async function tryEndpoint(name, url) {
  console.log(`\nTrying: ${name}...`);
  try {
    const response = await fetch(url, {
      headers: { "X-Figma-Token": FIGMA_API_TOKEN },
    });
    
    if (!response.ok) {
      console.log(`  ✗ ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("Searching for your Figma files...\n");
  
  // Get user info
  const userData = await tryEndpoint("User Info", `${FIGMA_API_BASE}/me`);
  if (userData) {
    console.log(`  ✓ User: ${userData.email}`);
    console.log(`  ✓ ID: ${userData.id}`);
  }
  
  // Try recent files
  const recentFiles = await tryEndpoint("Recent Files", `${FIGMA_API_BASE}/me/files/recent`);
  if (recentFiles && recentFiles.files && recentFiles.files.length > 0) {
    console.log(`\n  ✓ Found ${recentFiles.files.length} recent files:`);
    recentFiles.files.forEach((file, i) => {
      console.log(`\n  ${i + 1}. ${file.name}`);
      console.log(`     Key: ${file.key}`);
      console.log(`     Last modified: ${new Date(file.last_modified).toLocaleString()}`);
    });
  }
  
  // Try team projects (if user has teams)
  const teams = await tryEndpoint("Teams", `${FIGMA_API_BASE}/me/teams`);
  if (teams && teams.teams && teams.teams.length > 0) {
    console.log(`\n  ✓ Found ${teams.teams.length} teams:`);
    
    for (const team of teams.teams) {
      console.log(`\n  Team: ${team.name} (${team.id})`);
      
      // Get team projects
      const projects = await tryEndpoint(
        `Projects for ${team.name}`,
        `${FIGMA_API_BASE}/teams/${team.id}/projects`
      );
      
      if (projects && projects.projects) {
        for (const project of projects.projects) {
          console.log(`    Project: ${project.name}`);
          
          // Get files in project
          const projectFiles = await tryEndpoint(
            `Files in ${project.name}`,
            `${FIGMA_API_BASE}/projects/${project.id}/files`
          );
          
          if (projectFiles && projectFiles.files && projectFiles.files.length > 0) {
            projectFiles.files.forEach((file) => {
              console.log(`      - ${file.name} (Key: ${file.key})`);
            });
          }
        }
      }
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("\nIf no files were listed above, you may need to:");
  console.log("1. Create a new Figma file in your account");
  console.log("2. Or provide a file key from any existing file you can access");
  console.log("\nTo test with any file, paste its URL or file key.");
}

main();
