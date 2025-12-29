import https from 'https';
import { writeFileSync } from 'fs';

const FIGMA_TOKEN = 'figd_14hFGWX8-8ohQkyTZxKbyMmxkl_Sb4FxCM5cz8fF';
const FILE_ID = 'zuWEY4gNbhwescluD1WZAC';
const NODE_ID = '23:110'; // Corrected format with colon

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  strokes?: any[];
  fills?: any[];
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  characters?: string;
  effects?: any[];
  blendMode?: string;
  constraints?: any;
  [key: string]: any;
}

interface FigmaFile {
  document: FigmaNode;
  components: any;
}

function fetchFigmaFile(): Promise<FigmaFile> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/files/${FILE_ID}`,
      method: 'GET',
      headers: {
        'X-FIGMA-TOKEN': FIGMA_TOKEN,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function findNodeById(node: FigmaNode, id: string): FigmaNode | null {
  if (node.id === id) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      const result = findNodeById(child, id);
      if (result) return result;
    }
  }

  return null;
}

function extractColor(paint: any): string | null {
  if (!paint || !paint.color) return null;
  const { r, g, b, a } = paint.color;
  const toHex = (val: number) => Math.round(val * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a < 1 ? `${hex}${toHex(a)}` : hex;
}

function analyzeNode(node: FigmaNode, depth: number = 0): any {
  const analysis: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // Add dimensions only if they're meaningful
  if (node.width !== undefined && node.height !== undefined) {
    analysis.dimensions = {
      x: node.x || 0,
      y: node.y || 0,
      width: node.width,
      height: node.height,
    };
  }

  // Extract colors from fills
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    analysis.fills = node.fills
      .filter((fill: any) => fill.type === 'SOLID')
      .map((fill: any) => ({
        color: extractColor(fill),
        opacity: fill.opacity || 1,
      }));
  }

  // Extract strokes
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    analysis.strokes = node.strokes
      .filter((stroke: any) => stroke.type === 'SOLID')
      .map((stroke: any) => ({
        color: extractColor(stroke),
        opacity: stroke.opacity || 1,
        width: node.strokeWeight || 1,
      }));
  }

  // Extract typography
  if (node.fontFamily) {
    analysis.typography = {
      fontFamily: node.fontFamily,
      fontSize: node.fontSize || null,
      fontWeight: node.fontWeight || 400,
      letterSpacing: node.letterSpacing || 0,
      lineHeight: node.lineHeightPx || null,
      textAlign: node.textAlignHorizontal || 'LEFT',
    };
  }

  // Extract text content
  if (node.characters) {
    analysis.textContent = node.characters;
  }

  // Extract layout info
  if (node.layoutMode) {
    analysis.layout = {
      mode: node.layoutMode,
      spacing: node.itemSpacing || 0,
      padding: node.paddingLeft
        ? {
            top: node.paddingTop,
            right: node.paddingRight,
            bottom: node.paddingBottom,
            left: node.paddingLeft,
          }
        : null,
    };
  }

  // Extract corner radius
  if (node.cornerRadius !== undefined) {
    analysis.cornerRadius = node.cornerRadius;
  }

  // Extract opacity
  if (node.opacity !== undefined && node.opacity < 1) {
    analysis.opacity = node.opacity;
  }

  // Analyze children
  if (node.children && node.children.length > 0) {
    analysis.childrenCount = node.children.length;
    analysis.children = node.children.map((child: FigmaNode) => analyzeNode(child, depth + 1));
  }

  return analysis;
}

function listAllNodes(node: FigmaNode, path: string = ''): void {
  const indent = '  '.repeat(path.split('/').length - 1);
  console.log(`${indent}${node.name} (${node.id})`);

  if (node.children) {
    node.children.forEach((child) => {
      listAllNodes(child, `${path}/${node.name}`);
    });
  }
}

async function main() {
  try {
    console.log('🔍 Fetching Figma file...');
    const figmaFile = await fetchFigmaFile();

    console.log('\n📄 Available nodes:');
    listAllNodes(figmaFile.document);

    console.log(`\n🔎 Finding node with ID: ${NODE_ID}`);
    const targetNode = findNodeById(figmaFile.document, NODE_ID);

    if (!targetNode) {
      console.error(`❌ Node with ID ${NODE_ID} not found in the document`);
      process.exit(1);
    }

    console.log(`✅ Found: "${targetNode.name}" (${targetNode.type})`);
    console.log('\n📊 Analyzing node structure...');
    const analysis = analyzeNode(targetNode);

    // Save the analysis to a file
    const outputPath = 'd:/storyverse/figma-analysis.json';
    writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

    console.log(`\n✅ Analysis complete!`);
    console.log(`💾 Output saved to: ${outputPath}`);
    console.log('\n📋 Node Summary:');
    console.log(`   Name: ${targetNode.name}`);
    console.log(`   Type: ${targetNode.type}`);
    console.log(`   Children: ${targetNode.children?.length || 0}`);
    console.log('\n🎨 Full Analysis:');
    console.log(JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
