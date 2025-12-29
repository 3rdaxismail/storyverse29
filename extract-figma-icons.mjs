#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Figma credentials
const FIGMA_TOKEN = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';
const FILE_KEY = 'zuWEY4gNbhwescluD1WZAC';

// Node IDs from group-header-actions
const NODES_TO_EXTRACT = {
  'logo-storyverse': '5:85', // The logo vector
  'btn-inbox-icon': '5:84', // The inbox button icon group
  'indicator-unread': '231:19', // Unread badge
};

/**
 * Fetch SVG export from Figma API
 */
async function fetchSVGExport(nodeId) {
  try {
    const params = new URLSearchParams({
      ids: nodeId,
      format: 'svg',
    });

    const response = await fetch(
      `https://api.figma.com/v1/images/${FILE_KEY}?${params}`,
      {
        headers: {
          'X-FIGMA-TOKEN': FIGMA_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }

    const data = await response.json();
    return data.images[nodeId];
  } catch (error) {
    console.error(`Error fetching SVG for ${nodeId}:`, error.message);
    return null;
  }
}

/**
 * Download file from URL
 */
async function downloadFile(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const svgContent = await response.text();
    fs.writeFileSync(outputPath, svgContent);
    console.log(`✅ Downloaded: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error downloading file:`, error.message);
    return false;
  }
}

/**
 * Fetch node data to get vector path information
 */
async function fetchNodeData(nodeIds) {
  try {
    const params = new URLSearchParams({
      ids: nodeIds.join(','),
    });

    const response = await fetch(
      `https://api.figma.com/v1/files/${FILE_KEY}/nodes?${params}`,
      {
        headers: {
          'X-FIGMA-TOKEN': FIGMA_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.nodes;
  } catch (error) {
    console.error('Error fetching node data:', error.message);
    return null;
  }
}

/**
 * Create SVG from vector data
 */
function createSVGFromVector(name, data) {
  // Create a basic SVG structure
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
  <!-- ${name} from Figma group-header-actions -->
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Vector content to be populated from Figma data -->
  </g>
</svg>`;
  
  return svg;
}

/**
 * Main extraction function
 */
async function extractIcons() {
  console.log('🎨 Extracting icons and logos from group-header-actions...\n');

  const outputDir = path.join(__dirname, 'src', 'assets', 'icons', 'figma');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  try {
    // Fetch node data first
    console.log('🔄 Fetching node data from Figma...');
    const nodeIds = Object.values(NODES_TO_EXTRACT);
    const nodeData = await fetchNodeData(nodeIds);

    if (!nodeData) {
      throw new Error('Failed to fetch node data');
    }

    console.log('✅ Node data fetched\n');

    // Extract each icon
    const extractedFiles = {};

    for (const [name, nodeId] of Object.entries(NODES_TO_EXTRACT)) {
      console.log(`\n📥 Extracting: ${name} (ID: ${nodeId})`);

      // Get SVG export URL
      const svgUrl = await fetchSVGExport(nodeId);

      if (svgUrl) {
        const fileName = `${name}.svg`;
        const filePath = path.join(outputDir, fileName);

        const success = await downloadFile(svgUrl, filePath);
        
        if (success) {
          extractedFiles[name] = {
            file: fileName,
            path: path.relative(__dirname, filePath),
            nodeId: nodeId,
            url: svgUrl,
          };
        }
      } else {
        console.log(`⚠️  Could not extract SVG URL for ${name}, creating template...`);
        
        const nodeInfo = nodeData[nodeId]?.document;
        const templateSvg = createSVGFromVector(name, nodeInfo);
        const fileName = `${name}-template.svg`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, templateSvg);
        console.log(`✅ Created template: ${filePath}`);
        
        extractedFiles[name] = {
          file: fileName,
          path: path.relative(__dirname, filePath),
          nodeId: nodeId,
          isTemplate: true,
        };
      }
    }

    // Create index file
    console.log('\n\n📝 Creating icon index...');
    const indexContent = `// Auto-generated index for Figma extracted icons
// From group-header-actions

${Object.entries(extractedFiles).map(([name, info]) => {
  const importName = name.split('-').map((word, i) => 
    i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  return `import ${importName} from './${info.file}';`;
}).join('\n')}

export {
${Object.entries(extractedFiles).map(([name]) => {
  const importName = name.split('-').map((word, i) => 
    i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  return `  ${importName},`;
}).join('\n')}
};

export const icons = {
${Object.entries(extractedFiles).map(([name]) => {
  const importName = name.split('-').map((word, i) => 
    i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  return `  ${name}: ${importName},`;
}).join('\n')}
};
`;

    const indexPath = path.join(outputDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`✅ Created: ${path.relative(__dirname, indexPath)}`);

    // Create summary document
    console.log('\n📋 Creating summary document...');
    const summaryContent = `# Extracted Icons from group-header-actions

## Extraction Date
${new Date().toLocaleString()}

## Figma Source
- **File**: zuWEY4gNbhwescluD1WZAC (Preview)
- **Group**: group-header-actions (ID: 231:12)
- **Layer**: Dashboard

## Extracted Assets

${Object.entries(extractedFiles).map(([name, info]) => `### ${name}
- **File**: \`${info.file}\`
- **Path**: \`${info.path}\`
- **Node ID**: \`${info.nodeId}\`
- **URL**: ${info.url ? `[View on Figma](${info.url})` : 'Template'}
${info.isTemplate ? '- **Status**: Template (requires manual SVG editing)' : '- **Status**: Extracted from Figma'}
`).join('\n')}

## Usage

### Import All Icons
\`\`\`typescript
import { logoStoryverse, btnInboxIcon, indicatorUnread } from '@/assets/icons/figma';
\`\`\`

### Import Specific Icon
\`\`\`typescript
import logoStoryverse from '@/assets/icons/figma/logo-storyverse.svg';
\`\`\`

### Use in Component
\`\`\`tsx
import { logoStoryverse } from '@/assets/icons/figma';

export function Header() {
  return (
    <img src={logoStoryverse} alt="Storyverse" width="36" height="36" />
  );
}
\`\`\`

## Icon Specifications

### Logo (logo-storyverse)
- **Type**: Vector
- **Purpose**: Brand logo/mark
- **Recommended Size**: 36×36px
- **Color**: #9dbb7d (Green accent)

### Inbox Button Icon (btn-inbox-icon)
- **Type**: Vector Group
- **Purpose**: Notification/message icon
- **Recommended Size**: 20×20px
- **Color**: #eaeaea (Light gray)

### Unread Indicator (indicator-unread)
- **Type**: Ellipse
- **Purpose**: Badge for unread count
- **Recommended Size**: 8×8px or variable
- **Color**: #ff4444 (Red)

## Next Steps

1. Review extracted SVG files
2. Adjust viewBox if needed
3. Update color variables to use CSS variables
4. Test in HeaderFromFigma component
5. Optimize SVG for web

## Files Created

${Object.entries(extractedFiles).map(([name, info]) => `- \`${info.path}\``).join('\n')}
- \`${path.relative(__dirname, indexPath)}\` (Index file)
`;

    const summaryPath = path.join(__dirname, 'FIGMA_ICONS_EXTRACTION_SUMMARY.md');
    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`✅ Created: FIGMA_ICONS_EXTRACTION_SUMMARY.md`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EXTRACTION COMPLETE!\n');
    console.log(`📁 Output Directory: ${outputDir}\n`);
    console.log('📦 Extracted Files:');
    Object.entries(extractedFiles).forEach(([name, info]) => {
      console.log(`   ✅ ${info.file}`);
    });
    console.log('\n📝 Summary: FIGMA_ICONS_EXTRACTION_SUMMARY.md');
    console.log('📄 Index: src/assets/icons/figma/index.ts');
    console.log('='.repeat(60));

    return extractedFiles;
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    process.exit(1);
  }
}

// Run extraction
extractIcons();
