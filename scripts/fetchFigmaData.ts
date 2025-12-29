/**
 * Fetch Figma Design Data
 * Uses environment variable: FIGMA_TOKEN
 * Fetches design data from Figma file
 */

const token = process.env.FIGMA_TOKEN || 'figd_muZm5N792nIbsF7LX7LiUJzAz83C5nh_DApL6RM_';
const fileId = process.env.FIGMA_FILE_ID || 'zuWEY4gNbhwescluD1WZAC';
const nodeId = process.env.FIGMA_NODE_ID || '23-110';

async function fetchFigmaData() {
  try {
    console.log('🔍 Fetching Figma Design Data\n');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   File ID: ${fileId}`);
    console.log(`   Node ID: ${nodeId}\n`);

    // Fetch file with components
    const fileRes = await fetch(`https://api.figma.com/v1/files/${fileId}?depth=3`, {
      headers: { 'X-FIGMA-TOKEN': token },
    });

    if (!fileRes.ok) {
      throw new Error(`API Error: ${fileRes.status} ${fileRes.statusText}`);
    }

    const fileData = await fileRes.json();
    console.log('✅ File fetched successfully\n');

    // Helper to find node by ID
    function findNode(node: any, targetId: string): any {
      if (node.id === targetId) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      return null;
    }

    const targetNode = findNode(fileData.document, nodeId);

    if (!targetNode) {
      console.log('❌ Node not found in file\n');
      console.log('📄 Available top-level nodes:');
      function listNodes(node: any, depth = 0) {
        if (depth > 3) return;
        const indent = '  '.repeat(depth);
        console.log(`${indent}📌 ${node.name} (${node.id})`);
        if (node.children && depth < 2) {
          node.children.forEach((child: any) => listNodes(child, depth + 1));
        }
      }
      if (fileData.document.children) {
        fileData.document.children.forEach((child: any) => listNodes(child, 0));
      }
      return;
    }

    // Display node information
    console.log('📋 Node Details:');
    console.log(`   Name: ${targetNode.name}`);
    console.log(`   Type: ${targetNode.type}`);
    if (targetNode.absoluteBoundingBox) {
      console.log(`   Size: ${targetNode.absoluteBoundingBox.width}x${targetNode.absoluteBoundingBox.height}px`);
      console.log(`   Position: (${targetNode.absoluteBoundingBox.x}, ${targetNode.absoluteBoundingBox.y})`);
    }

    // Display child components
    if (targetNode.children && targetNode.children.length > 0) {
      console.log(`\n🧩 Child Elements (${targetNode.children.length}):`);
      targetNode.children.forEach((child: any, idx: number) => {
        console.log(`\n   ${idx + 1}. ${child.name}`);
        console.log(`      Type: ${child.type}`);
        if (child.absoluteBoundingBox) {
          console.log(`      Size: ${child.absoluteBoundingBox.width}x${child.absoluteBoundingBox.height}px`);
        }
        if (child.visible === false) {
          console.log(`      Visibility: Hidden`);
        }
        if (child.fills && child.fills.length > 0) {
          console.log(`      Fills: ${child.fills.length}`);
        }
        if (child.strokes && child.strokes.length > 0) {
          console.log(`      Strokes: ${child.strokes.length}`);
        }
        if (child.effects && child.effects.length > 0) {
          console.log(`      Effects: ${child.effects.length}`);
        }
        if (child.characters) {
          const text = child.characters.substring(0, 40).replace(/\n/g, ' ');
          console.log(`      Text: "${text}${child.characters.length > 40 ? '...' : ''}"`);
        }
        if (child.children && child.children.length > 0) {
          console.log(`      Nested children: ${child.children.length}`);
        }
      });
    }

    // Extract colors
    console.log('\n🎨 Colors Used:');
    const colors = new Map<string, number>();
    
    function extractColors(node: any) {
      if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const c = fill.color;
            const hex = `#${Math.round(c.r * 255).toString(16).padStart(2, '0')}${Math.round(c.g * 255).toString(16).padStart(2, '0')}${Math.round(c.b * 255).toString(16).padStart(2, '0')}`.toUpperCase();
            colors.set(hex, (colors.get(hex) || 0) + 1);
          }
        });
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => extractColors(child));
      }
    }
    
    extractColors(targetNode);
    if (colors.size > 0) {
      Array.from(colors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([color, count]) => {
          console.log(`   ${color} (used ${count} time${count > 1 ? 's' : ''})`);
        });
    } else {
      console.log('   No solid colors found');
    }

    // Export as image
    console.log('\n📸 Exporting as Image:');
    const exportRes = await fetch(
      `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&format=png&scale=2`,
      {
        headers: { 'X-FIGMA-TOKEN': token },
      }
    );

    if (exportRes.ok) {
      const exportData = await exportRes.json();
      if (exportData.images && exportData.images[nodeId]) {
        console.log(`   ✅ PNG URL: ${exportData.images[nodeId]}`);
      }
    }

    console.log('\n✨ Design data loaded successfully!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

fetchFigmaData();
