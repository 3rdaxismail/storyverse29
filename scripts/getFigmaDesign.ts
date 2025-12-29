/**
 * Fetch Figma design using API token
 * File: zuWEY4gNbhwescluD1WZAC
 * Node: 23-110
 */

const token = 'figd_14hFGWX8-8ohQkyTZxKbyMmxkl_Sb4FxCM5cz8fF';
const fileId = 'zuWEY4gNbhwescluD1WZAC';
const nodeId = '23-110';

async function fetchDesign() {
  try {
    console.log('🔍 Fetching Figma file...\n');

    // Fetch file with full depth
    const fileRes = await fetch(`https://api.figma.com/v1/files/${fileId}?depth=3`, {
      headers: { 'X-FIGMA-TOKEN': token },
    });

    if (!fileRes.ok) {
      throw new Error(`API Error: ${fileRes.status} ${fileRes.statusText}`);
    }

    const fileData = await fileRes.json();

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
      console.log('❌ Node not found');
      console.log('\n📄 Available nodes:');
      function listNodes(node: any, depth = 0) {
        if (depth > 2) return;
        const indent = '  '.repeat(depth);
        console.log(`${indent}${node.name} (${node.id})`);
        if (node.children) {
          node.children.forEach((child: any) => listNodes(child, depth + 1));
        }
      }
      listNodes(fileData.document);
      return;
    }

    console.log('✅ Node found!\n');
    console.log('📋 Node Details:');
    console.log(`   Name: ${targetNode.name}`);
    console.log(`   Type: ${targetNode.type}`);
    console.log(`   Size: ${targetNode.absoluteBoundingBox?.width}x${targetNode.absoluteBoundingBox?.height}`);

    if (targetNode.children) {
      console.log(`\n🧩 Child Components (${targetNode.children.length}):\n`);
      targetNode.children.forEach((child: any, idx: number) => {
        console.log(`   ${idx + 1}. ${child.name}`);
        console.log(`      - Type: ${child.type}`);
        if (child.absoluteBoundingBox) {
          console.log(`      - Size: ${child.absoluteBoundingBox.width}x${child.absoluteBoundingBox.height}`);
        }
        if (child.fills) {
          console.log(`      - Fill: ${JSON.stringify(child.fills[0])}`);
        }
        if (child.characters) {
          console.log(`      - Text: "${child.characters.substring(0, 50)}..."`);
        }
        if (child.children) {
          console.log(`      - Children: ${child.children.length}`);
          child.children.forEach((grandchild: any, gdx: number) => {
            console.log(`        ${gdx + 1}. ${grandchild.name} (${grandchild.type})`);
          });
        }
      });
    }

    // Get colors used
    console.log('\n🎨 Colors in design:');
    const colors = new Set<string>();
    function extractColors(node: any) {
      if (node.fills) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const c = fill.color;
            const hex = `#${Math.round(c.r * 255).toString(16).padStart(2, '0')}${Math.round(c.g * 255).toString(16).padStart(2, '0')}${Math.round(c.b * 255).toString(16).padStart(2, '0')}`.toUpperCase();
            colors.add(hex);
          }
        });
      }
      if (node.children) {
        node.children.forEach((child: any) => extractColors(child));
      }
    }
    extractColors(targetNode);
    Array.from(colors).forEach((color) => console.log(`   ${color}`));

    // Export as image
    console.log('\n📸 Exporting design...');
    const exportRes = await fetch(
      `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&format=png&scale=2`,
      {
        headers: { 'X-FIGMA-TOKEN': token },
      }
    );

    if (exportRes.ok) {
      const exportData = await exportRes.json();
      if (exportData.images[nodeId]) {
        console.log(`   PNG URL: ${exportData.images[nodeId]}`);
      }
    }

    console.log('\n✨ Design data loaded successfully!');
    console.log('\n📊 Full Node Structure:');
    console.log(JSON.stringify(targetNode, null, 2).substring(0, 2000) + '...');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

fetchDesign();
