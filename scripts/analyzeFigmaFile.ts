/**
 * Figma API client to fetch design file
 * File ID: zuWEY4gNbhwescluD1WZAC
 * Node ID: 23-110
 */

async function fetchFigmaFile() {
  const fileId = 'zuWEY4gNbhwescluD1WZAC';
  const nodeId = '23-110';

  // Get token from environment or use a placeholder
  const token = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN;

  if (!token) {
    console.log('⚠️  No Figma token found.');
    console.log('Please set FIGMA_TOKEN environment variable or authenticate first.\n');
    console.log('To get your token:');
    console.log('1. Go to https://figma.com/settings/tokens');
    console.log('2. Create a new token');
    console.log('3. Set: $env:FIGMA_TOKEN = "your-token"');
    return;
  }

  try {
    console.log(`📁 Fetching file: ${fileId}`);
    console.log(`🎯 Node ID: ${nodeId}\n`);

    // Fetch file metadata
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
      headers: {
        'X-FIGMA-TOKEN': token,
      },
    });

    if (!fileResponse.ok) {
      throw new Error(`API error: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    const fileData = await fileResponse.json();
    console.log('✅ File fetched successfully!\n');

    // Extract design information
    console.log('📊 File Information:');
    console.log(`   Name: ${fileData.name}`);
    console.log(`   Last Modified: ${fileData.lastModified}`);
    console.log(`   Pages: ${fileData.document.children?.length || 0}\n`);

    // Find the specific node
    const findNode = (node: any, targetId: string): any => {
      if (node.id === targetId) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const targetNode = findNode(fileData.document, nodeId);

    if (targetNode) {
      console.log('✨ Node found!\n');
      console.log('📋 Node Details:');
      console.log(`   Type: ${targetNode.type}`);
      console.log(`   Name: ${targetNode.name}`);
      console.log(`   Size: ${targetNode.absoluteBoundingBox?.width}x${targetNode.absoluteBoundingBox?.height}`);

      if (targetNode.children) {
        console.log(`   Children: ${targetNode.children.length}`);
        console.log('\n   Child Components:');
        targetNode.children.forEach((child: any, idx: number) => {
          console.log(`     ${idx + 1}. ${child.name} (${child.type})`);
        });
      }

      // Get component info
      if (targetNode.componentId) {
        console.log(`\n   Component ID: ${targetNode.componentId}`);
        
        const compResponse = await fetch(
          `https://api.figma.com/v1/files/${fileId}/components/${targetNode.componentId}`,
          {
            headers: {
              'X-FIGMA-TOKEN': token,
            },
          }
        );

        if (compResponse.ok) {
          const compData = await compResponse.json();
          console.log('   Component Details:');
          console.log(`     - ${compData.description || 'No description'}`);
        }
      }

      // Export as image
      console.log('\n📸 Exporting as image...');
      const exportResponse = await fetch(
        `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&format=svg`,
        {
          headers: {
            'X-FIGMA-TOKEN': token,
          },
        }
      );

      if (exportResponse.ok) {
        const exportData = await exportResponse.json();
        if (exportData.images[nodeId]) {
          console.log(`   SVG URL: ${exportData.images[nodeId]}`);
        }
      }
    } else {
      console.log(`❌ Node ${nodeId} not found in file`);
      console.log('\n📄 Available pages and components:');
      
      const listNodes = (node: any, depth = 0) => {
        const indent = '  '.repeat(depth);
        if (node.id === 'document') {
          if (node.children) {
            node.children.forEach((child: any) => listNodes(child, depth));
          }
        } else {
          console.log(`${indent}${node.name} (${node.id}) - ${node.type}`);
          if (node.children && depth < 3) {
            node.children.forEach((child: any) => listNodes(child, depth + 1));
          }
        }
      };

      listNodes(fileData.document);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

fetchFigmaFile();
