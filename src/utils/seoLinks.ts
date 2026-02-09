/**
 * SEO Link Integration Guide
 * 
 * Use these helpers to generate SEO-friendly links throughout Storyverse
 */

import { generateUniqueSlug } from './seo';

/**
 * Generate a public story URL
 * @param storyTitle - The story title
 * @param storyId - The story ID
 * @returns Public story URL path
 * 
 * @example
 * ```tsx
 * import { getPublicStoryUrl } from '@/utils/seoLinks';
 * 
 * // In your component:
 * const storyUrl = getPublicStoryUrl(story.storyTitle, story.id);
 * navigate(storyUrl); // /story/the-dark-forest-a1b2c3d4
 * 
 * // Or for external sharing:
 * const fullUrl = `${window.location.origin}${storyUrl}`;
 * ```
 */
export function getPublicStoryUrl(storyTitle: string, storyId: string): string {
  const slug = generateUniqueSlug(storyTitle, storyId);
  return `/story/${slug}`;
}

/**
 * Generate a public poem URL
 * @param poemTitle - The poem title
 * @param poemId - The poem ID
 * @returns Public poem URL path
 * 
 * @example
 * ```tsx
 * import { getPublicPoemUrl } from '@/utils/seoLinks';
 * 
 * const poemUrl = getPublicPoemUrl(poem.title, poem.id);
 * navigate(poemUrl); // /poem/whispers-in-the-wind-b2c3d4e5
 * ```
 */
export function getPublicPoemUrl(poemTitle: string, poemId: string): string {
  const slug = generateUniqueSlug(poemTitle, poemId);
  return `/poem/${slug}`;
}

/**
 * Generate a public user profile URL
 * @param username - The user's display name
 * @returns Public profile URL path
 * 
 * @example
 * ```tsx
 * import { getPublicUserUrl } from '@/utils/seoLinks';
 * 
 * const profileUrl = getPublicUserUrl(user.displayName);
 * navigate(profileUrl); // /user/JohnDoe
 * ```
 */
export function getPublicUserUrl(username: string): string {
  return `/user/${encodeURIComponent(username)}`;
}

/**
 * Generate a shareable URL for a story
 * @param storyTitle - The story title
 * @param storyId - The story ID
 * @param baseUrl - Optional base URL (defaults to window.location.origin)
 * @returns Full shareable URL
 * 
 * @example
 * ```tsx
 * import { getShareableStoryUrl } from '@/utils/seoLinks';
 * 
 * const shareUrl = getShareableStoryUrl(story.storyTitle, story.id);
 * // https://storyverse.app/story/the-dark-forest-a1b2c3d4
 * 
 * // Copy to clipboard
 * navigator.clipboard.writeText(shareUrl);
 * 
 * // Or share via Web Share API
 * navigator.share({
 *   title: story.storyTitle,
 *   url: shareUrl
 * });
 * ```
 */
export function getShareableStoryUrl(
  storyTitle: string, 
  storyId: string,
  baseUrl?: string
): string {
  const base = baseUrl || window.location.origin;
  const slug = generateUniqueSlug(storyTitle, storyId);
  return `${base}/story/${slug}`;
}

/**
 * Generate a shareable URL for a poem
 * @param poemTitle - The poem title
 * @param poemId - The poem ID
 * @param baseUrl - Optional base URL (defaults to window.location.origin)
 * @returns Full shareable URL
 */
export function getShareablePoemUrl(
  poemTitle: string, 
  poemId: string,
  baseUrl?: string
): string {
  const base = baseUrl || window.location.origin;
  const slug = generateUniqueSlug(poemTitle, poemId);
  return `${base}/poem/${slug}`;
}

/**
 * Generate a shareable URL for a user profile
 * @param username - The user's display name
 * @param baseUrl - Optional base URL (defaults to window.location.origin)
 * @returns Full shareable URL
 */
export function getShareableUserUrl(username: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/user/${encodeURIComponent(username)}`;
}

/**
 * Check if content is publicly accessible (for SEO)
 * @param privacy - Privacy setting
 * @param status - Publication status (optional, for stories)
 * @returns Whether content should be indexed
 */
export function isPubliclyAccessible(
  privacy: string,
  status?: 'draft' | 'published'
): boolean {
  const isPublicPrivacy = ['Open access', 'Trending'].includes(privacy);
  const isPublished = !status || status === 'published';
  return isPublicPrivacy && isPublished;
}

/**
 * Generate Open Graph meta tags object
 * @param params - Meta tag parameters
 * @returns Meta tags object for social sharing
 * 
 * @example
 * ```tsx
 * import { generateOGMetaTags } from '@/utils/seoLinks';
 * 
 * const ogTags = generateOGMetaTags({
 *   title: story.storyTitle,
 *   description: story.excerptBody,
 *   image: story.coverImageUrl,
 *   url: getShareableStoryUrl(story.storyTitle, story.id),
 *   type: 'article'
 * });
 * ```
 */
export function generateOGMetaTags(params: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'profile';
}) {
  const { title, description, image, url, type = 'website' } = params;
  
  return {
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:type': type,
    'og:site_name': 'Storyverse',
    ...(image && { 'og:image': image }),
  };
}
