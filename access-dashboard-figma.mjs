#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Figma credentials
const FIGMA_TOKEN = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';

// Known Figma file key (from context)
const FILE_KEY = 'zuWEY4gNbhwescluD1WZAC';

/**
 * Search for a file by name using Figma API
 */
async function searchFigmaFile(fileName) {
  console.log(`🔍 Searching for Figma file: "${fileName}"\n`);

  try {
    // First, let's get the file info
    const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
      headers: {
        'X-FIGMA-TOKEN': FIGMA_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const fileData = await response.json();

    console.log(`✅ File Found: ${fileData.name}`);
    console.log(`📄 File ID: ${fileData.key}`);
    console.log(`📅 Last Modified: ${new Date(fileData.lastModified).toLocaleString()}`);
    console.log(`📊 Version: ${fileData.version}\n`);

    // List all pages and their frames
    console.log('📑 PAGES & FRAMES:');
    console.log('━'.repeat(60));

    fileData.document.children.forEach((page, pageIndex) => {
      console.log(`\n📄 Page ${pageIndex + 1}: ${page.name}`);

      if (page.children && page.children.length > 0) {
        page.children.forEach((frame, frameIndex) => {
          const icon = frame.type === 'FRAME' ? '📦' : '📁';
          console.log(`   ${icon} [${frameIndex + 1}] ${frame.name} (${frame.type})`);
          
          if (frame.id) {
            console.log(`       ID: ${frame.id}`);
          }
        });
      }
    });

    // Search for "Dashboard" frame
    console.log('\n' + '━'.repeat(60));
    console.log('\n🔎 SEARCHING FOR "Dashboard" FRAME...\n');

    let dashboardFrame = null;
    let dashboardPageIndex = -1;

    for (let i = 0; i < fileData.document.children.length; i++) {
      const page = fileData.document.children[i];
      if (page.children) {
        const found = page.children.find(
          (child) => child.name.toLowerCase().includes('dashboard')
        );
        if (found) {
          dashboardFrame = found;
          dashboardPageIndex = i;
          break;
        }
      }
    }

    if (dashboardFrame) {
      console.log('✅ DASHBOARD FRAME FOUND!\n');
      console.log(`📦 Name: ${dashboardFrame.name}`);
      console.log(`📍 Page: ${fileData.document.children[dashboardPageIndex].name}`);
      console.log(`🆔 Frame ID: ${dashboardFrame.id}`);
      console.log(`📐 Type: ${dashboardFrame.type}`);
      console.log(`📏 Size: ${dashboardFrame.absoluteBoundingBox?.width || 'N/A'} × ${dashboardFrame.absoluteBoundingBox?.height || 'N/A'}px`);

      // Fetch detailed dashboard frame data
      console.log('\n' + '━'.repeat(60));
      console.log('\n📊 FETCHING DASHBOARD FRAME DETAILS...\n');

      const nodeResponse = await fetch(
        `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${dashboardFrame.id}`,
        {
          headers: {
            'X-FIGMA-TOKEN': FIGMA_TOKEN,
          },
        }
      );

      if (nodeResponse.ok) {
        const nodeData = await nodeResponse.json();
        const dashboardNode = nodeData.nodes[dashboardFrame.id];

        if (dashboardNode && dashboardNode.document) {
          const doc = dashboardNode.document;
          console.log(`✅ Dashboard Frame Data Retrieved`);
          console.log(`   Total Children: ${doc.children ? doc.children.length : 0}`);

          // Extract and list all components
          if (doc.children) {
            console.log('\n📦 DASHBOARD COMPONENTS:');
            doc.children.slice(0, 20).forEach((child, i) => {
              const icon = child.type === 'GROUP' ? '📁' : child.type === 'FRAME' ? '📦' : '📄';
              console.log(`   ${icon} [${i + 1}] ${child.name} (${child.type})`);
            });

            if (doc.children.length > 20) {
              console.log(`   ... and ${doc.children.length - 20} more`);
            }
          }
        }
      }

      // Create a summary export
      console.log('\n' + '━'.repeat(60));
      console.log('\n💾 CREATING DASHBOARD FILE EXPORT...\n');

      const summaryData = {
        file: fileData.name,
        fileKey: fileData.key,
        dashboard: {
          name: dashboardFrame.name,
          id: dashboardFrame.id,
          page: fileData.document.children[dashboardPageIndex].name,
          bounds: dashboardFrame.absoluteBoundingBox,
        },
        metadata: {
          lastModified: fileData.lastModified,
          version: fileData.version,
          exportedAt: new Date().toISOString(),
        },
      };

      const exportPath = path.join(__dirname, 'dashboard-figma-metadata.json');
      fs.writeFileSync(exportPath, JSON.stringify(summaryData, null, 2));
      console.log(`✅ Exported: dashboard-figma-metadata.json`);

      return summaryData;
    } else {
      console.log('⚠️  Dashboard frame not found in current file');
      console.log('\nAvailable frames:');
      fileData.document.children.forEach((page) => {
        if (page.children) {
          page.children.forEach((frame) => {
            console.log(`   - ${frame.name}`);
          });
        }
      });
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run search
searchFigmaFile('Dashboard 29 12 25');
