import fs from 'fs';

const FIGMA_TOKEN = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';
const FILE_KEY = 'zuWEY4gNbhwescluD1WZAC';
const DASHBOARD_FRAME_ID = '5:51';

async function extractDashboardComponents() {
  console.log('📊 EXTRACTING DASHBOARD COMPONENTS\n');
  console.log('🔗 Fetching Dashboard frame details...\n');

  try {
    // Get file with specific node ID
    const response = await fetch(
      `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${DASHBOARD_FRAME_ID}`,
      {
        headers: { 'X-Figma-Token': FIGMA_TOKEN }
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const dashboardNode = data.nodes[DASHBOARD_FRAME_ID]?.document;

    if (!dashboardNode) {
      console.error('❌ Dashboard frame not found');
      return;
    }

    console.log(`✅ Dashboard Frame: ${dashboardNode.name}`);
    console.log(`📐 Size: ${dashboardNode.absoluteBoundingBox.width} × ${dashboardNode.absoluteBoundingBox.height}px\n`);

    const components = [];
    const componentTypes = {
      FRAME: [],
      GROUP: [],
      COMPONENT: [],
      COMPONENT_SET: [],
      TEXT: [],
      RECTANGLE: [],
      VECTOR: [],
      ELLIPSE: [],
      IMAGE: [],
      BOOLEAN_OPERATION: [],
      OTHER: []
    };

    // Recursively extract all children
    function processChildren(node, level = 0) {
      if (!node.children) return;

      for (const child of node.children) {
        const indent = '  '.repeat(level);
        const type = child.type;
        
        // Categorize by type
        if (componentTypes[type]) {
          componentTypes[type].push(child.name);
        } else {
          componentTypes.OTHER.push(child.name);
        }

        // Store key components
        const component = {
          name: child.name,
          id: child.id,
          type: child.type,
          level: level,
          props: {}
        };

        if (child.absoluteBoundingBox) {
          component.props.bounds = {
            x: child.absoluteBoundingBox.x,
            y: child.absoluteBoundingBox.y,
            w: child.absoluteBoundingBox.width,
            h: child.absoluteBoundingBox.height
          };
        }

        if (child.fills && child.fills.length > 0) {
          component.props.fills = child.fills.map(f => ({
            type: f.type,
            color: f.color || f.imageRef
          }));
        }

        if (child.strokes && child.strokes.length > 0) {
          component.props.strokes = child.strokes.map(s => ({
            type: s.type,
            color: s.color
          }));
        }

        if (child.characters) {
          component.props.text = child.characters.substring(0, 100);
        }

        if (child.componentId) {
          component.props.componentId = child.componentId;
        }

        components.push(component);

        // Recurse for nested elements
        if (child.type === 'GROUP' || child.type === 'FRAME' || child.type === 'COMPONENT') {
          processChildren(child, level + 1);
        }
      }
    }

    processChildren(dashboardNode);

    // Print summary
    console.log('📦 COMPONENT BREAKDOWN:\n');
    console.log(`   Total Components: ${components.length}\n`);
    
    for (const [type, names] of Object.entries(componentTypes)) {
      if (names.length > 0) {
        console.log(`   ${type}: ${names.length}`);
        if (names.length <= 10) {
          names.forEach(name => console.log(`      • ${name}`));
        } else {
          names.slice(0, 5).forEach(name => console.log(`      • ${name}`));
          console.log(`      ... and ${names.length - 5} more`);
        }
        console.log();
      }
    }

    // Find key components by name pattern
    console.log('🎯 KEY COMPONENTS DETECTED:\n');
    
    const patterns = {
      '🎨 Cards': /card-/i,
      '📝 Text': /^text-/i,
      '🖼️ Icons': /icon-/i,
      '👤 Profile': /profile|avatar/i,
      '📱 Header': /header|top-bar/i,
      '📊 Stats': /stat|metric|count/i,
      '📖 Story': /story/i,
      '🔔 Notification': /notif|alert|badge/i
    };

    for (const [category, pattern] of Object.entries(patterns)) {
      const matches = components
        .filter(c => pattern.test(c.name))
        .map(c => `${c.name} (${c.type})`);
      
      if (matches.length > 0) {
        console.log(`${category}:`);
        matches.slice(0, 8).forEach(m => console.log(`   • ${m}`));
        if (matches.length > 8) {
          console.log(`   ... and ${matches.length - 8} more`);
        }
        console.log();
      }
    }

    // Export detailed data
    const exportData = {
      dashboard: {
        name: dashboardNode.name,
        id: DASHBOARD_FRAME_ID,
        size: {
          width: dashboardNode.absoluteBoundingBox.width,
          height: dashboardNode.absoluteBoundingBox.height
        }
      },
      metadata: {
        totalComponents: components.length,
        exportedAt: new Date().toISOString()
      },
      componentsSummary: {
        byType: componentTypes,
        total: Object.values(componentTypes).reduce((sum, arr) => sum + arr.length, 0)
      },
      components: components
    };

    fs.writeFileSync('dashboard-components-detailed.json', JSON.stringify(exportData, null, 2));
    console.log('💾 Exported: dashboard-components-detailed.json');

    return exportData;

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

await extractDashboardComponents();
