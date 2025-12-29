/**
 * Quick test script to fetch Figma file content via WebSocket
 * File ID: zuWEY4gNbhwescluD1WZAC
 */

import { figmaClient } from './src/services/figma/figmaWebSocket';

async function viewFigmaFile() {
  const fileId = 'zuWEY4gNbhwescluD1WZAC'; // From the URL
  
  try {
    console.log('🔗 Connecting to Figma WebSocket server...');
    await figmaClient.connect();
    console.log('✅ Connected!\n');

    console.log('📁 Fetching file info...');
    const fileInfo = await figmaClient.getFileInfo(fileId);
    console.log('File Info:', JSON.stringify(fileInfo, null, 2));

    console.log('\n🖼️  Fetching images...');
    const images = await figmaClient.getImages(fileId);
    console.log(`Found ${images?.length || 0} images`);
    if (images && images.length > 0) {
      console.log('Images:', JSON.stringify(images.slice(0, 3), null, 2)); // First 3
    }

    console.log('\n📄 Fetching pages...');
    const pages = fileInfo.pages || [];
    console.log(`File has ${pages.length} pages:`);
    pages.forEach((page: any) => {
      console.log(`  - ${page.name} (ID: ${page.id})`);
    });

    if (pages.length > 0) {
      console.log(`\n📖 Fetching first page content...`);
      const pageContent = await figmaClient.getPage(fileId, pages[0].id);
      console.log('Page Content:', JSON.stringify(pageContent, null, 2).substring(0, 500) + '...');
    }

    console.log('\n✨ File content loaded successfully!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    figmaClient.disconnect();
    process.exit(0);
  }
}

viewFigmaFile();
