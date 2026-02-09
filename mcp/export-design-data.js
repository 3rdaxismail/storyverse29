#!/usr/bin/env node

// Export complete design data from Figma file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileKey = process.argv[2];
const nodeId = process.argv[3];

if (!fileKey) {
  console.error("ERROR: Please provide a file key");
  process.exit(1);
}

const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

if (!FIGMA_API_TOKEN) {
  console.error("ERROR: FIGMA_API_TOKEN not set");
  process.exit(1);
}

// Extract design tokens
function extractTokens(data) {
  const tokens = {
    colors: new Set(),
    typography: {
      fontFamilies: new Set(),
      fontSizes: new Set(),
      fontWeights: new Set(),
      lineHeights: new Set(),
    },
    spacing: new Set(),
    borderRadius: new Set(),
    shadows: new Set(),
  };

  function traverse(node) {
    // Extract colors
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b } = fill.color;
          const opacity = fill.opacity !== undefined ? fill.opacity : 1;
          const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
          tokens.colors.add(color);
        }
      });
    }

    // Extract typography
    if (node.type === 'TEXT' && node.style) {
      if (node.style.fontFamily) tokens.typography.fontFamilies.add(node.style.fontFamily);
      if (node.style.fontSize) tokens.typography.fontSizes.add(node.style.fontSize);
      if (node.style.fontWeight) tokens.typography.fontWeights.add(node.style.fontWeight);
      if (node.style.lineHeightPx) tokens.typography.lineHeights.add(node.style.lineHeightPx);
    }

    // Extract spacing and sizing
    if (node.absoluteBoundingBox) {
      if (node.absoluteBoundingBox.width) tokens.spacing.add(Math.round(node.absoluteBoundingBox.width));
      if (node.absoluteBoundingBox.height) tokens.spacing.add(Math.round(node.absoluteBoundingBox.height));
    }

    // Extract border radius
    if (node.cornerRadius !== undefined) {
      tokens.borderRadius.add(node.cornerRadius);
    }

    // Extract effects (shadows)
    if (node.effects && Array.isArray(node.effects)) {
      node.effects.forEach(effect => {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
          tokens.shadows.add(JSON.stringify(effect));
        }
      });
    }

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child));
    }
  }

  // Start traversal
  if (data.document) {
    traverse(data.document);
  }

  // Convert Sets to Arrays for JSON
  return {
    colors: Array.from(tokens.colors),
    typography: {
      fontFamilies: Array.from(tokens.typography.fontFamilies),
      fontSizes: Array.from(tokens.typography.fontSizes).sort((a, b) => a - b),
      fontWeights: Array.from(tokens.typography.fontWeights).sort((a, b) => a - b),
      lineHeights: Array.from(tokens.typography.lineHeights).sort((a, b) => a - b),
    },
    spacing: Array.from(tokens.spacing).sort((a, b) => a - b),
    borderRadius: Array.from(tokens.borderRadius).sort((a, b) => a - b),
    shadows: Array.from(tokens.shadows).map(s => JSON.parse(s)),
  };
}

// Extract component structure
function extractComponents(data) {
  const components = [];
  const instances = [];

  function traverse(node, path = []) {
    const currentPath = [...path, node.name];
    
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        type: node.type,
        path: currentPath.join(' > '),
        properties: node.componentPropertyDefinitions || {},
        absoluteBoundingBox: node.absoluteBoundingBox,
      });
    }

    if (node.type === 'INSTANCE') {
      instances.push({
        id: node.id,
        name: node.name,
        componentId: node.componentId,
        path: currentPath.join(' > '),
      });
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child, currentPath));
    }
  }

  if (data.document) {
    traverse(data.document);
  }

  return { components, instances };
}

// Find specific node
function findNode(root, targetId) {
  if (root.id === targetId) return root;
  
  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNode(child, targetId);
      if (found) return found;
    }
  }
  
  return null;
}

console.log("Fetching Figma file data...\n");

fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
  headers: { "X-Figma-Token": FIGMA_API_TOKEN },
})
  .then(r => r.json())
  .then((data) => {
    if (data.error || data.status === 404) {
      throw new Error(data.error || "File not found");
    }

    console.log(`✓ File: ${data.name}`);
    console.log(`✓ Last Modified: ${new Date(data.lastModified).toLocaleString()}`);
    console.log(`✓ Version: ${data.version}\n`);

    // Extract design tokens
    const tokens = extractTokens(data);
    
    // Extract components
    const { components, instances } = extractComponents(data);

    // Find specific node if requested
    let targetNode = null;
    if (nodeId) {
      targetNode = findNode(data.document, nodeId);
      if (!targetNode) {
        console.warn(`⚠ Node ${nodeId} not found in document`);
      }
    }

    // Prepare export data
    const exportData = {
      meta: {
        fileName: data.name,
        fileKey: fileKey,
        version: data.version,
        lastModified: data.lastModified,
        exportedAt: new Date().toISOString(),
      },
      tokens,
      components,
      instances,
      targetNode: targetNode || null,
      fullDocument: data.document,
    };

    // Write to file
    const outputPath = path.join(__dirname, 'figma-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✓ Design data exported!`);
    console.log(`  File: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`  Colors: ${tokens.colors.length}`);
    console.log(`  Font Families: ${tokens.typography.fontFamilies.length}`);
    console.log(`  Font Sizes: ${tokens.typography.fontSizes.length}`);
    console.log(`  Components: ${components.length}`);
    console.log(`  Instances: ${instances.length}`);
    if (targetNode) {
      console.log(`  Target Node: ${targetNode.name} (${targetNode.type})`);
    }
  })
  .catch((error) => {
    console.error("\n✗ Export failed:", error.message);
    process.exit(1);
  });
