# SEO Configuration Guide for Storyverse

## 🔒 Canonical Domain Rule

**The ONLY production domain for Storyverse is:**
```
https://storyverse.co.in
```

This domain is **already purchased and live**. All SEO configuration MUST use this domain exclusively.

## ⚙️ Environment Configuration

The canonical domain is configured in `.env`:

```env
VITE_APP_URL=https://storyverse.co.in
```

This environment variable is the **single source of truth** for all SEO-related URLs.

## ✅ Files Updated for SEO Compliance

### 1. Environment Variables
- **`.env`** - Contains `VITE_APP_URL=https://storyverse.co.in`

### 2. Core SEO Utilities
- **`src/utils/seo.ts`** - All URL generation functions use `storyverse.co.in` as fallback
  - `generateCanonicalUrl()` - Generates canonical URLs
  - Structured data helpers for stories, poems, and profiles

### 3. SEO Components
- **`src/components/seo/SEOHead.tsx`** - Dynamic meta tags component
  - Uses `VITE_APP_URL` for all absolute URLs
  - Generates Open Graph and Twitter Card meta tags
  - Injects structured data (JSON-LD)

### 4. Public Pages (SEO-Optimized)
- **`src/pages/public/PublicStoryPage.tsx`** - `/story/:slug`
- **`src/pages/public/PublicPoemPage.tsx`** - `/poem/:slug`
- **`src/pages/public/PublicUserProfilePage.tsx`** - `/user/:username`

All use `generateCanonicalUrl()` for proper canonical tags.

### 5. Sitemap Generator
- **`scripts/generate-sitemap.mjs`** - Generates `public/sitemap.xml`
  - Uses `VITE_APP_URL` environment variable
  - Fallback to `storyverse.co.in`
  - Run with: `npm run sitemap`

### 6. Robots.txt
- **`public/robots.txt`** - Search engine directives
  - Sitemap URL points to `https://storyverse.co.in/sitemap.xml`
  - Allows indexing of `/story/`, `/poem/`, `/user/`
  - Disallows private areas like `/editor/`, `/dashboard/`

## 📋 SEO Checklist

Ensure these are all configured correctly:

- [x] `VITE_APP_URL` set to `https://storyverse.co.in` in `.env`
- [x] Canonical URLs use `storyverse.co.in`
- [x] Open Graph `og:url` tags use `storyverse.co.in`
- [x] Open Graph `og:image` tags use absolute URLs with `storyverse.co.in`
- [x] Twitter Card tags use `storyverse.co.in`
- [x] Sitemap entries use `storyverse.co.in`
- [x] Robots.txt sitemap URL uses `storyverse.co.in`
- [x] Structured data (JSON-LD) uses proper URLs

## 🚀 Deployment Workflow

### 1. Generate Sitemap (Before Each Deploy)
```bash
npm run sitemap
```

This will:
- Connect to Firestore
- Fetch all public stories, poems, and user profiles
- Generate `public/sitemap.xml` with `storyverse.co.in` URLs

### 2. Build for Production
```bash
npm run build
```

The build process will:
- Use environment variables from `.env`
- Bundle all SEO optimizations
- Include sitemap in the `dist/` folder

### 3. Deploy to Firebase
```bash
npm run deploy:full
# or
firebase deploy
```

This deploys to Firebase Hosting, which should be configured to serve at `storyverse.co.in`.

## 🌐 Public Routes (Indexable)

These routes are accessible without authentication and optimized for SEO:

| Route | Example | Status |
|-------|---------|--------|
| `/story/:slug` | `/story/the-garden-of-paradise-story_17` | ✅ Live |
| `/poem/:slug` | `/poem/moonlight-dreams-poem_9a7b` | ✅ Live |
| `/user/:username` | `/user/JohnDoe` | ✅ Live |

Each route includes:
- Dynamic title and meta description
- Canonical URL
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Structured data (Schema.org JSON-LD)

## 🔍 Google Search Console Setup

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add `storyverse.co.in` as a new property
   - Verify ownership (via Firebase hosting or DNS)

2. **Submit Sitemap**
   - In Search Console, go to Sitemaps
   - Submit: `https://storyverse.co.in/sitemap.xml`

3. **Monitor Indexing**
   - Check "Coverage" tab for indexing status
   - Fix any errors reported
   - Request indexing for important pages

## ⚠️ Critical Rules

### ❌ FORBIDDEN

- **DO NOT** use `*.web.app` as canonical URLs
- **DO NOT** use `*.firebaseapp.com` for SEO
- **DO NOT** mix domains in meta tags
- **DO NOT** create multiple canonical URLs for the same content

### ✅ ALWAYS

- **ALWAYS** use `https://storyverse.co.in` for SEO
- **ALWAYS** generate sitemap before deploying
- **ALWAYS** test meta tags with tools like:
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - [Google Rich Results Test](https://search.google.com/test/rich-results)

## 🧪 Testing SEO Implementation

### Test Canonical URLs
```bash
# Check if pages render with correct canonical tags
curl -s https://storyverse.co.in/story/example-slug | grep "canonical"
```

### Validate Sitemap
```bash
# Check sitemap is accessible
curl https://storyverse.co.in/sitemap.xml
```

### Test Social Sharing
1. Share a story URL on WhatsApp/Facebook
2. Verify correct title, description, and image preview appear
3. Check that URL shows as `storyverse.co.in`

## 📝 Quick Reference

**Environment Variable:**
```env
VITE_APP_URL=https://storyverse.co.in
```

**Sitemap Generation:**
```bash
npm run sitemap
```

**Deployment:**
```bash
npm run deploy:full
```

**Canonical Domain:**
```
https://storyverse.co.in
```

---

**Remember:** One domain, one source of truth → `storyverse.co.in` 🔒
