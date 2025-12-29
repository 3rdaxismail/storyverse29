const fileKey = 'ANcQmXcFFJNmLJQR5UOanT';
const token = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';
const nodeId = '4311-6';

async function fetchFigmaNode() {
  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
      {
        headers: { 'X-FIGMA-TOKEN': token }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract node details
    const node = data.nodes[nodeId]?.document;
    
    if (!node) {
      console.log('Node not found. Available keys:', Object.keys(data.nodes));
      console.log('Full response:', JSON.stringify(data, null, 2));
    } else {
      console.log(JSON.stringify({
        name: node.name,
        type: node.type,
        children: node.children ? node.children.map(c => ({
          name: c.name,
          type: c.type,
          fills: c.fills,
          text: c.characters,
          fontSize: c.fontSize,
          fontFamily: c.fontFamily,
          fontWeight: c.fontWeight,
        })) : [],
      }, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchFigmaNode();
