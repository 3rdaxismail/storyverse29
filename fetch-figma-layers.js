#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Figma credentials
const FIGMA_TOKEN = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';
const FILE_KEY = 'zuWEY4gNbhwescluD1WZAC';
const NODE_ID = '5-51'; // Preview node

/**
 * Recursively extract layer groups and their structure
 */
function extractLayerGroups(node, depth = 0, parent = null) {
  const layers = [];
  const indent = '  '.repeat(depth);

  if (node.type === 'GROUP' || node.type === 'FRAME' || node.type === 'COMPONENT') {
    const layer = {
      id: node.id,
      name: node.name,
      type: node.type,
      parent: parent,
      depth: depth,
      children: [],
    };

    // Add properties if they exist
    if (node.absoluteBoundingBox) {
      layer.bounds = node.absoluteBoundingBox;
    }
    if (node.fills && node.fills.length > 0) {
      layer.fills = node.fills;
    }
    if (node.strokes && node.strokes.length > 0) {
      layer.strokes = node.strokes;
    }

    layers.push(layer);

    // Process children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child) => {
        const childLayers = extractLayerGroups(
          child,
          depth + 1,
          node.name
        );
        layer.children.push(...childLayers);
        layers.push(...childLayers);
      });
    }
  } else if (node.children && Array.isArray(node.children)) {
    // Process children even if this node is not a group
    node.children.forEach((child) => {
      const childLayers = extractLayerGroups(child, depth, parent);
      layers.push(...childLayers);
    });
  }

  return layers;
}

/**
 * Fetch Figma file and extract layer structure
 */
async function fetchFigmaLayers() {
  console.log('🔄 Fetching Figma design layers...\n');

  try {
    // Fetch the entire file first
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
      headers: {
        'X-FIGMA-TOKEN': FIGMA_TOKEN,
      },
    });

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }

    const fileData = await fileResponse.json();
    console.log(`✅ File: ${fileData.name}\n`);

    // List all pages
    console.log(`📑 Available Pages (${fileData.document.children.length}):`);
    fileData.document.children.forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.name} (ID: ${page.id})`);
    });

    // Use the first page if Preview doesn't exist
    let targetPage = fileData.document.children.find(
      (page) => page.name === 'Preview'
    );
    
    if (!targetPage) {
      targetPage = fileData.document.children[0];
      console.log(`\n⚠️  Preview page not found, using first page: ${targetPage.name}`);
    }

    console.log(`\n📄 Using Page: ${targetPage.name}`);
    console.log(`\n🔍 Page contains ${targetPage.children?.length || 0} children\n`);

    // Extract layers from the page directly
    if (!targetPage.children || targetPage.children.length === 0) {
      console.log('No children found in page');
      process.exit(1);
    }

    const layers = [];
    targetPage.children.forEach((node) => {
      const extracted = extractLayerGroups(node);
      layers.push(...extracted);
    });

    // Print hierarchy
    console.log('📊 LAYER HIERARCHY:\n');
    targetPage.children.forEach((node) => {
      printLayerHierarchy(node, 0);
    });

    // Save to JSON
    const outputPath = path.join(
      process.cwd(),
      'figma-layers-export.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(layers, null, 2));
    console.log(`\n✅ Layers exported to: ${outputPath}`);

    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`   - Total layers: ${layers.length}`);
    console.log(`   - Groups/Frames: ${layers.filter(l => l.type === 'GROUP' || l.type === 'FRAME').length}`);
    console.log(`   - Components: ${layers.filter(l => l.type === 'COMPONENT').length}`);

    return layers;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Print layer hierarchy in a tree format
 */
function printLayerHierarchy(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const icon =
    node.type === 'GROUP'
      ? '📁'
      : node.type === 'FRAME'
        ? '📦'
        : node.type === 'COMPONENT'
          ? '🧩'
          : '📄';

  console.log(`${indent}${icon} ${node.name} (${node.type})`);

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child) => {
      printLayerHierarchy(child, depth + 1);
    });
  }
}

// Run the function
fetchFigmaLayers();
