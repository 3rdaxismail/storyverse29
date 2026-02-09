#!/usr/bin/env node

// Detailed analysis of Figma file structure
const fileKey = process.argv[2];

if (!fileKey) {
  console.error("ERROR: Please provide a file key");
  process.exit(1);
}

const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

function analyzeNode(node, depth = 0) {
  const indent = "  ".repeat(depth);
  const childCount = node.children ? node.children.length : 0;
  const childText = childCount > 0 ? ` (${childCount} children)` : '';
  
  console.log(`${indent}${node.type}: "${node.name}"${childText}`);
  
  // Show additional details for certain types
  if (node.type === 'TEXT') {
    console.log(`${indent}  └─ Text: "${node.characters?.substring(0, 50) || 'N/A'}"`);
  }
  if (node.fills && node.fills.length > 0 && node.fills[0].type === 'SOLID') {
    const fill = node.fills[0];
    if (fill.color) {
      console.log(`${indent}  └─ Fill: rgba(${Math.round(fill.color.r*255)}, ${Math.round(fill.color.g*255)}, ${Math.round(fill.color.b*255)}, ${fill.opacity || 1})`);
    }
  }
  
  if (node.children && depth < 3) { // Limit depth to avoid too much output
    node.children.forEach(child => analyzeNode(child, depth + 1));
  } else if (node.children && node.children.length > 0) {
    console.log(`${indent}  └─ ... ${node.children.length} more items (depth limit reached)`);
  }
}

fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
  headers: { "X-Figma-Token": FIGMA_API_TOKEN },
})
  .then(r => r.json())
  .then((data) => {
    console.log("\n" + "=".repeat(60));
    console.log("FIGMA FILE ANALYSIS");
    console.log("=".repeat(60));
    console.log(`\nFile: ${data.name}`);
    console.log(`Last Modified: ${new Date(data.lastModified).toLocaleString()}`);
    console.log(`Version: ${data.version}`);
    console.log(`\n${"=".repeat(60)}`);
    console.log("DOCUMENT STRUCTURE");
    console.log("=".repeat(60) + "\n");
    
    // Count total elements
    let totalElements = 0;
    function countElements(node) {
      totalElements++;
      if (node.children) {
        node.children.forEach(countElements);
      }
    }
    countElements(data.document);
    
    console.log(`Total elements in file: ${totalElements}\n`);
    
    // Analyze each page
    data.document.children.forEach((page, i) => {
      console.log(`\n${"─".repeat(60)}`);
      console.log(`PAGE ${i + 1}: "${page.name}"`);
      console.log(`${"─".repeat(60)}\n`);
      
      if (page.children && page.children.length > 0) {
        console.log(`Top-level items: ${page.children.length}\n`);
        page.children.forEach((child, idx) => {
          console.log(`[${idx + 1}]`);
          analyzeNode(child, 1);
          if (idx < page.children.length - 1) console.log("");
        });
      } else {
        console.log("(Empty page)");
      }
    });
    
    console.log(`\n${"=".repeat(60)}`);
    console.log("✓ Analysis complete!");
    console.log("=".repeat(60) + "\n");
  })
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
