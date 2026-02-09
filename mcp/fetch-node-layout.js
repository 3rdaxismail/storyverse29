#!/usr/bin/env node

// Fetch specific node with all layout properties
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileKey = process.argv[2];
const nodeId = process.argv[3];

if (!fileKey || !nodeId) {
  console.error("ERROR: Please provide file key and node ID");
  process.exit(1);
}

const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN not set");
  process.exit(1);
}

function analyzeLayout(node, depth = 0) {
  const indent = "  ".repeat(depth);
  const output = [];
  
  // Basic info
  output.push(`${indent}[${node.type}] "${node.name}" (id: ${node.id})`);
  
  // Bounding box
  if (node.absoluteBoundingBox) {
    const box = node.absoluteBoundingBox;
    output.push(`${indent}  Position: x=${box.x}, y=${box.y}`);
    output.push(`${indent}  Size: w=${box.width}, h=${box.height}`);
  }
  
  // Auto-layout properties
  if (node.layoutMode) {
    output.push(`${indent}  Layout Mode: ${node.layoutMode}`);
    if (node.primaryAxisSizingMode) output.push(`${indent}  Primary Sizing: ${node.primaryAxisSizingMode}`);
    if (node.counterAxisSizingMode) output.push(`${indent}  Counter Sizing: ${node.counterAxisSizingMode}`);
    if (node.itemSpacing !== undefined) output.push(`${indent}  Item Spacing: ${node.itemSpacing}px`);
    if (node.paddingLeft !== undefined) output.push(`${indent}  Padding: L=${node.paddingLeft} R=${node.paddingRight} T=${node.paddingTop} B=${node.paddingBottom}`);
    if (node.primaryAxisAlignItems) output.push(`${indent}  Primary Align: ${node.primaryAxisAlignItems}`);
    if (node.counterAxisAlignItems) output.push(`${indent}  Counter Align: ${node.counterAxisAlignItems}`);
  }
  
  // Typography for text nodes
  if (node.type === 'TEXT' && node.style) {
    output.push(`${indent}  Font: ${node.style.fontFamily} ${node.style.fontWeight}`);
    output.push(`${indent}  Size: ${node.style.fontSize}px`);
    output.push(`${indent}  Line Height: ${node.style.lineHeightPx}px`);
    if (node.characters) output.push(`${indent}  Text: "${node.characters.substring(0, 50)}${node.characters.length > 50 ? '...' : ''}"`);
  }
  
  // Fills (colors)
  if (node.fills && node.fills.length > 0 && node.fills[0].type === 'SOLID') {
    const fill = node.fills[0];
    if (fill.color) {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      const a = fill.opacity !== undefined ? fill.opacity : 1;
      output.push(`${indent}  Fill: rgba(${r}, ${g}, ${b}, ${a})`);
    }
  }
  
  // Corner radius
  if (node.cornerRadius !== undefined) {
    output.push(`${indent}  Corner Radius: ${node.cornerRadius}px`);
  }
  
  // Children
  if (node.children && node.children.length > 0) {
    output.push(`${indent}  Children: ${node.children.length}`);
    node.children.forEach(child => {
      output.push(...analyzeLayout(child, depth + 1));
    });
  }
  
  return output;
}

console.log("Fetching specific node from Figma...\n");

// Fetch with nodes parameter to get specific node
fetch(`${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${nodeId}`, {
  headers: { "X-Figma-Token": FIGMA_API_TOKEN },
})
  .then(r => r.json())
  .then((data) => {
    if (data.error || data.err) {
      throw new Error(data.error || data.err);
    }

    const nodeData = data.nodes[nodeId];
    if (!nodeData || !nodeData.document) {
      throw new Error(`Node ${nodeId} not found`);
    }

    console.log("═══════════════════════════════════════════════════");
    console.log("FIGMA LAYOUT MAP - PIXEL-AUTHORITATIVE SOURCE");
    console.log("═══════════════════════════════════════════════════\n");
    
    const layoutMap = analyzeLayout(nodeData.document);
    console.log(layoutMap.join('\n'));
    
    console.log("\n═══════════════════════════════════════════════════");
    console.log("LAYOUT EXPORT COMPLETE");
    console.log("═══════════════════════════════════════════════════\n");
    
    // Save detailed JSON
    const outputPath = path.join(__dirname, 'figma-node-70-2.json');
    fs.writeFileSync(outputPath, JSON.stringify(nodeData.document, null, 2));
    console.log(`✓ Full node data saved to: ${outputPath}`);
  })
  .catch((error) => {
    console.error("\n✗ Fetch failed:", error.message);
    process.exit(1);
  });
