/**
 * Generate Dynamic Sitemap for Storyverse
 * Fetches all public stories and poems from Firestore and generates sitemap.xml
 * 
 * Run: npm run sitemap
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf8'));
} catch (error) {
  console.log('⚠️  No serviceAccountKey.json found - using default credentials');
  console.log('💡 Tip: Download from Firebase Console > Project Settings > Service Accounts');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Try to use Application Default Credentials
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>https://storyverse.co.in/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Pages -->
  <url>
    <loc>https://storyverse.co.in/trending</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://storyverse.co.in/community</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Auth Pages -->
  <url>
    <loc>https://storyverse.co.in/login</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://storyverse.co.in/signup</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

`;

  try {
    // Fetch all Trending stories
    console.log('📚 Fetching Trending stories...');
    const storiesSnapshot = await db.collection('stories')
      .where('privacy', '==', 'Trending')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();

    console.log(`Found ${storiesSnapshot.size} trending stories`);
    
    storiesSnapshot.forEach(doc => {
      const story = doc.data();
      const lastmod = story.updatedAt?.toDate?.()?.toISOString().split('T')[0] || currentDate;
      
      sitemap += `  <!-- Story: ${story.title} -->
  <url>
    <loc>https://storyverse.co.in/story/view/${doc.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
    });

    // Fetch all Trending poems
    console.log('📝 Fetching Trending poems...');
    const poemsSnapshot = await db.collection('poems')
      .where('privacy', '==', 'Trending')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();

    console.log(`Found ${poemsSnapshot.size} trending poems`);
    
    poemsSnapshot.forEach(doc => {
      const poem = doc.data();
      const lastmod = poem.updatedAt?.toDate?.()?.toISOString().split('T')[0] || currentDate;
      
      sitemap += `  <!-- Poem: ${poem.title} -->
  <url>
    <loc>https://storyverse.co.in/poem/view/${doc.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
    });

    sitemap += `</urlset>`;

    // Write to public folder
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${storiesSnapshot.size + poemsSnapshot.size + 5}`);
    console.log(`   - Core pages: 5`);
    console.log(`   - Stories: ${storiesSnapshot.size}`);
    console.log(`   - Poems: ${poemsSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

generateSitemap();
