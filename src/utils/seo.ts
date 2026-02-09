/**
 * SEO Utilities - Slug generation and metadata helpers for Storyverse
 */

/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A URL-safe slug
 */
export function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/--+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by appending ID
 * @param title - The title to convert
 * @param id - The unique ID to append
 * @returns A unique URL-safe slug
 */
export function generateUniqueSlug(title: string, id: string): string {
  const baseSlug = generateSlug(title);
  // Take first 8 chars of ID for uniqueness
  const shortId = id.substring(0, 8);
  return `${baseSlug}-${shortId}`;
}

/**
 * Extract ID from a unique slug
 * @param slug - The slug containing the ID
 * @returns The extracted ID or null
 */
export function extractIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  
  // Extract the last segment after the final hyphen (should be the ID prefix)
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  
  return parts[parts.length - 1];
}

/**
 * Generate excerpt from text content
 * @param text - The full text
 * @param maxLength - Maximum character length (default: 160 for meta description)
 * @returns Truncated excerpt
 */
export function generateExcerpt(text: string, maxLength: number = 160): string {
  if (!text) return '';
  
  const cleaned = text.trim().replace(/\s+/g, ' ');
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Truncate at word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Sanitize text for meta tags (remove HTML, special chars)
 * @param text - Text to sanitize
 * @returns Clean text safe for meta tags
 */
export function sanitizeForMeta(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Generate canonical URL
 * @param path - The path relative to the site root
 * @returns Full canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://storyverse.co.in';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Generate structured data for a story
 * @param story - Story data
 * @returns JSON-LD structured data
 */
export function generateStoryStructuredData(story: {
  title: string;
  excerpt: string;
  authorName: string;
  publishedDate: Date;
  updatedDate: Date;
  imageUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'headline': story.title,
    'description': story.excerpt,
    'author': {
      '@type': 'Person',
      'name': story.authorName
    },
    'datePublished': story.publishedDate.toISOString(),
    'dateModified': story.updatedDate.toISOString(),
    ...(story.imageUrl && { 'image': story.imageUrl })
  };
}

/**
 * Generate structured data for a poem
 * @param poem - Poem data
 * @returns JSON-LD structured data
 */
export function generatePoemStructuredData(poem: {
  title: string;
  text: string;
  authorName: string;
  publishedDate: Date;
  updatedDate: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@additionalType': 'Poem',
    'headline': poem.title,
    'text': generateExcerpt(poem.text),
    'author': {
      '@type': 'Person',
      'name': poem.authorName
    },
    'datePublished': poem.publishedDate.toISOString(),
    'dateModified': poem.updatedDate.toISOString()
  };
}

/**
 * Generate structured data for a user profile
 * @param user - User profile data
 * @returns JSON-LD structured data
 */
export function generateProfileStructuredData(user: {
  name: string;
  bio?: string;
  photoUrl?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': user.name,
    ...(user.bio && { 'description': user.bio }),
    ...(user.photoUrl && { 'image': user.photoUrl }),
    'url': user.url
  };
}
