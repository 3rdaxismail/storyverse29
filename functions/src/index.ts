/**
 * Firebase Cloud Functions for Storyverse
 * Provides dynamic Open Graph meta tags for story/poem sharing
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Helper to strip HTML tags from content
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// Helper to truncate text
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Get first few lines of content
function getPreview(content: string, maxLength: number = 160): string {
  const stripped = stripHtml(content);
  return truncate(stripped, maxLength);
}

/**
 * Story metadata endpoint - serves HTML with dynamic OG tags
 */
export const storyMeta = functions.https.onRequest(async (req, res) => {
  const storyId = req.path.split('/').pop() || '';
  
  try {
    const storyDoc = await db.collection('stories').doc(storyId).get();
    
    if (!storyDoc.exists) {
      res.status(404).send('Story not found');
      return;
    }
    
    const story = storyDoc.data();
    const title = story?.title || 'Untitled Story';
    const synopsis = story?.synopsis || getPreview(story?.content || '', 160);
    const coverImage = story?.coverImage || 'https://storyverse.co.in/dashboard-image.png';
    const authorName = story?.authorName || 'Anonymous';
    const url = `https://storyverse.co.in/story/view/${storyId}`;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title} - Storyverse</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${synopsis}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${synopsis}">
    <meta property="og:image" content="${coverImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Storyverse">
    <meta property="article:author" content="${authorName}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${synopsis}">
    <meta property="twitter:image" content="${coverImage}">
    
    <!-- Redirect to actual page -->
    <meta http-equiv="refresh" content="0; url=${url}">
    <script>window.location.href = "${url}";</script>
</head>
<body>
    <p>Redirecting to <a href="${url}">${title}</a>...</p>
</body>
</html>`;
    
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Poem metadata endpoint - serves HTML with dynamic OG tags
 */
export const poemMeta = functions.https.onRequest(async (req, res) => {
  const poemId = req.path.split('/').pop() || '';
  
  try {
    const poemDoc = await db.collection('poems').doc(poemId).get();
    
    if (!poemDoc.exists) {
      res.status(404).send('Poem not found');
      return;
    }
    
    const poem = poemDoc.data();
    const title = poem?.title || 'Untitled Poem';
    const preview = poem?.synopsis || getPreview(poem?.content || '', 160);
    const coverImage = poem?.coverImage || 'https://storyverse.co.in/dashboard-image.png';
    const authorName = poem?.authorName || 'Anonymous';
    const url = `https://storyverse.co.in/poem/view/${poemId}`;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title} - Storyverse</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${preview}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${preview}">
    <meta property="og:image" content="${coverImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Storyverse">
    <meta property="article:author" content="${authorName}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${preview}">
    <meta property="twitter:image" content="${coverImage}">
    
    <!-- Redirect to actual page -->
    <meta http-equiv="refresh" content="0; url=${url}">
    <script>window.location.href = "${url}";</script>
</head>
<body>
    <p>Redirecting to <a href="${url}">${title}</a>...</p>
</body>
</html>`;
    
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  } catch (error) {
    console.error('Error fetching poem:', error);
    res.status(500).send('Internal server error');
  }
});
