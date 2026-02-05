/**
 * Generate PWA icons from Storyverse logo SVG
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
];

async function generateIcons() {
  const svgPath = join(__dirname, 'src', 'assets', 'Logo storyverse.svg');
  const svgBuffer = await readFile(svgPath);
  
  console.log('🎨 Generating PWA icons from Storyverse logo...\n');

  for (const { name, size } of sizes) {
    const outputPath = join(__dirname, 'public', name);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${name} (${size}x${size})`);
  }
  
  console.log('\n✨ All icons generated successfully!');
}

generateIcons().catch(console.error);
