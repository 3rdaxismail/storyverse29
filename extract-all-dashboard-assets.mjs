import fs from 'fs';
import path from 'path';

const FIGMA_TOKEN = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';
const FILE_KEY = 'zuWEY4gNbhwescluD1WZAC';
const DASHBOARD_FRAME_ID = '5:51';

// Asset directory
const ASSETS_DIR = './src/assets/dashboard';
const ICONS_DIR = path.join(ASSETS_DIR, 'icons');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');

// Create directories
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

console.log('🎨 EXTRACTING ALL DASHBOARD ASSETS FROM FIGMA\n');

// Define all assets we need to extract based on the dashboard design
const assetsToExtract = [
  // Header/Logo
  { id: '5:85', name: 'logo-storyverse', type: 'svg', dir: 'icons' },
  { id: '231:14', name: 'logo-storyverse-full', type: 'svg', dir: 'icons' },
  
  // Navigation Icons (bottom nav)
  { name: 'icon-home', type: 'svg', dir: 'icons', search: 'home' },
  { name: 'icon-folder', type: 'svg', dir: 'icons', search: 'folder' },
  { name: 'icon-write', type: 'svg', dir: 'icons', search: 'write' },
  { name: 'icon-community', type: 'svg', dir: 'icons', search: 'community' },
  { name: 'icon-trending', type: 'svg', dir: 'icons', search: 'trending' },
  
  // Header Icons
  { id: '5:84', name: 'icon-inbox', type: 'svg', dir: 'icons' },
  { name: 'icon-notifications', type: 'svg', dir: 'icons', search: 'notification' },
  
  // Story/Activity Icons
  { name: 'icon-activity-trends', type: 'svg', dir: 'icons', search: 'activity-trends' },
  { name: 'icon-activity-forum', type: 'svg', dir: 'icons', search: 'forum' },
  { name: 'icon-likes', type: 'svg', dir: 'icons', search: 'likes' },
  { name: 'icon-comments', type: 'svg', dir: 'icons', search: 'comments' },
  { name: 'icon-delete', type: 'svg', dir: 'icons', search: 'delete' },
  
  // Metadata Icons
  { name: 'icon-privacy', type: 'svg', dir: 'icons', search: 'privacy' },
  { name: 'icon-age-group', type: 'svg', dir: 'icons', search: 'age' },
  { name: 'icon-chapters', type: 'svg', dir: 'icons', search: 'chapters' },
  { name: 'icon-characters', type: 'svg', dir: 'icons', search: 'characters' },
  { name: 'icon-locations', type: 'svg', dir: 'icons', search: 'locations' },
  { name: 'icon-dialogues', type: 'svg', dir: 'icons', search: 'dialogues' },
  
  // Stats Icons
  { name: 'icon-streak', type: 'svg', dir: 'icons', search: 'streak' },
  { name: 'icon-words', type: 'svg', dir: 'icons', search: 'words' },
  
  // Indicators
  { name: 'indicator-unread', type: 'svg', dir: 'icons', search: 'unread' },
  { name: 'indicator-badge', type: 'svg', dir: 'icons', search: 'badge' },
];

async function fetchDashboardNodes() {
  console.log('📥 Fetching dashboard frame data...\n');
  
  const response = await fetch(
    `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${DASHBOARD_FRAME_ID}`,
    { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
  );
  
  const data = await response.json();
  const dashboardNode = data.nodes[DASHBOARD_FRAME_ID]?.document;
  
  if (!dashboardNode) {
    throw new Error('Dashboard frame not found');
  }
  
  return dashboardNode;
}

async function findNodesByName(node, searchName, results = []) {
  if (node.name && node.name.toLowerCase().includes(searchName.toLowerCase())) {
    results.push({ id: node.id, name: node.name });
  }
  
  if (node.children) {
    for (const child of node.children) {
      await findNodesByName(child, searchName, results);
    }
  }
  
  return results;
}

async function getAllNodeIds(node, results = []) {
  results.push({ id: node.id, name: node.name, type: node.type });
  
  if (node.children) {
    for (const child of node.children) {
      await getAllNodeIds(child, results);
    }
  }
  
  return results;
}

async function exportAsset(nodeId, fileName, format = 'svg') {
  try {
    console.log(`   Exporting: ${fileName}.${format} (Node: ${nodeId})`);
    
    const imageResponse = await fetch(
      `https://api.figma.com/v1/images/${FILE_KEY}?ids=${nodeId}&format=${format}&scale=2`,
      { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
    );
    
    const imageData = await imageResponse.json();
    
    if (imageData.err) {
      console.log(`   ⚠️  Error: ${imageData.err}`);
      return false;
    }
    
    const imageUrl = imageData.images[nodeId];
    
    if (!imageUrl) {
      console.log(`   ⚠️  No image URL returned`);
      return false;
    }
    
    const imageFileResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageFileResponse.arrayBuffer());
    
    return buffer;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    // Fetch dashboard structure
    const dashboardNode = await fetchDashboardNodes();
    
    // Get all nodes for reference
    const allNodes = await getAllNodeIds(dashboardNode);
    console.log(`📊 Total nodes in dashboard: ${allNodes.length}\n`);
    
    // Find and extract vector/icon nodes
    const vectorNodes = allNodes.filter(n => 
      n.type === 'VECTOR' || 
      n.type === 'BOOLEAN_OPERATION' || 
      n.type === 'GROUP' && n.name.toLowerCase().includes('icon')
    );
    
    console.log(`🎯 Found ${vectorNodes.length} potential icon nodes\n`);
    console.log('📦 EXTRACTING ASSETS:\n');
    
    let successCount = 0;
    let failCount = 0;
    
    // Extract known assets by ID
    const knownAssets = [
      { id: '5:85', name: 'logo-storyverse', dir: ICONS_DIR },
      { id: '5:84', name: 'btn-inbox-icon', dir: ICONS_DIR },
      { id: '231:12', name: 'group-header-actions', dir: ICONS_DIR },
    ];
    
    for (const asset of knownAssets) {
      console.log(`\n📌 ${asset.name}`);
      const buffer = await exportAsset(asset.id, asset.name, 'svg');
      
      if (buffer) {
        const filePath = path.join(asset.dir, `${asset.name}.svg`);
        fs.writeFileSync(filePath, buffer);
        console.log(`   ✅ Saved to: ${filePath}`);
        successCount++;
      } else {
        failCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Extract all vector icons
    console.log(`\n\n🔍 EXTRACTING ALL VECTOR ICONS:\n`);
    
    for (const node of vectorNodes.slice(0, 30)) { // Limit to first 30
      const safeName = node.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      console.log(`\n📌 ${node.name} → ${safeName}.svg`);
      const buffer = await exportAsset(node.id, safeName, 'svg');
      
      if (buffer) {
        const filePath = path.join(ICONS_DIR, `${safeName}.svg`);
        fs.writeFileSync(filePath, buffer);
        console.log(`   ✅ Saved`);
        successCount++;
      } else {
        failCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Export profile and cover images as PNG
    console.log(`\n\n🖼️  EXTRACTING IMAGES:\n`);
    
    const imageNodes = allNodes.filter(n => 
      n.name.toLowerCase().includes('img') || 
      n.name.toLowerCase().includes('profile') ||
      n.name.toLowerCase().includes('cover')
    );
    
    for (const node of imageNodes.slice(0, 5)) {
      const safeName = node.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      console.log(`\n📌 ${node.name} → ${safeName}.png`);
      const buffer = await exportAsset(node.id, safeName, 'png');
      
      if (buffer) {
        const filePath = path.join(IMAGES_DIR, `${safeName}.png`);
        fs.writeFileSync(filePath, buffer);
        console.log(`   ✅ Saved`);
        successCount++;
      } else {
        failCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Create asset index
    const indexContent = `// Dashboard Assets - Auto-generated
// Icons
${fs.readdirSync(ICONS_DIR)
  .filter(f => f.endsWith('.svg'))
  .map(f => {
    const name = f.replace('.svg', '').replace(/-([a-z])/g, (_, l) => l.toUpperCase());
    return `export { default as ${name} } from './icons/${f}';`;
  })
  .join('\n')}

// Images
${fs.readdirSync(IMAGES_DIR)
  .filter(f => f.endsWith('.png'))
  .map(f => {
    const name = f.replace('.png', '').replace(/-([a-z])/g, (_, l) => l.toUpperCase());
    return `export { default as ${name} } from './images/${f}';`;
  })
  .join('\n')}
`;
    
    fs.writeFileSync(path.join(ASSETS_DIR, 'index.ts'), indexContent);
    
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ EXTRACTION COMPLETE`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📁 Assets saved to: ${ASSETS_DIR}`);
    console.log(`📄 Index file: ${ASSETS_DIR}/index.ts`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
