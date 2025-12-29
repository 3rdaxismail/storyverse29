const token = 'figd_14hFGWX8-8ohQkyTZxKbyMmxkl_Sb4FxCM5cz8fF';
const fileId = 'zuWEY4gNbhwescluD1WZAC';
const nodeId = '23-110';

(async () => {
  try {
    console.log('🔍 Fetching Figma design...\n');
    
    const response = await fetch(`https://api.figma.com/v1/files/${fileId}?depth=3`, {
      headers: { 'X-FIGMA-TOKEN': token }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    
    // Find node
    function findNode(node, targetId) {
      if (node.id === targetId) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      return null;
    }

    const targetNode = findNode(data.document, nodeId);
    
    if (!targetNode) {
      console.log('❌ Node not found');
      return;
    }

    console.log('✅ Node found!\n');
    console.log(`📋 ${targetNode.name} (${targetNode.type})`);
    console.log(`   Size: ${targetNode.absoluteBoundingBox?.width}x${targetNode.absoluteBoundingBox?.height}`);
    
    if (targetNode.children) {
      console.log(`\n🧩 Children (${targetNode.children.length}):\n`);
      targetNode.children.forEach((child, i) => {
        console.log(`${i+1}. ${child.name} (${child.type})`);
      });
    }
    
    console.log('\n✨ Design structure loaded!');
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
