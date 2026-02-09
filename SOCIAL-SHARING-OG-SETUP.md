# Social Media Sharing - Open Graph Implementation

## Current Status ✅

**Basic Open Graph tags added** to [index.html](index.html):
- Default OG image, title, description for homepage
- Works for general Storyverse links
- Twitter Card support included

## Limitation ⚠️

**Dynamic story/poem previews NOT yet working** because:

Social media crawlers (WhatsApp, Facebook, Twitter) don't execute JavaScript, so they can't see content loaded dynamically by React. They only read the initial HTML.

When you share:
- https://storyverse.co.in/story/view/story_123
- https://storyverse.co.in/poem/view/poem_456

They currently show the **default** Storyverse info, not the specific story/poem details.

## Solution: Firebase Cloud Functions 🔥

I've prepared Cloud Functions code that will:
1. Intercept story/poem URLs
2. Fetch the story/poem data from Firestore
3. Generate HTML with dynamic OG tags (cover image, title, synopsis)
4. Serve it to social media crawlers

### Files Created:
- [functions/src/index.ts](functions/src/index.ts) - Cloud Functions for dynamic meta tags
- [functions/package.json](functions/package.json) - Dependencies
- [functions/tsconfig.json](functions/tsconfig.json) - TypeScript config

## To Enable Dynamic Previews:

### Step 1: Upgrade Firebase Plan

Your project **requires Blaze (pay-as-you-go) plan** to use Cloud Functions.

1. Visit: https://console.firebase.google.com/project/storyverse-830fc/usage/details
2. Upgrade to Blaze plan
3. Cloud Functions pricing: https://firebase.google.com/pricing
   - First 2 million invocations/month are FREE
   - Very low cost for typical usage

### Step 2: Update firebase.json

After upgrading, update [firebase.json](firebase.json):

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/story/view/*",
        "function": "storyMeta"
      },
      {
        "source": "/poem/view/*",
        "function": "poemMeta"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    ...
  }
}
```

### Step 3: Deploy Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy
```

## How It Works

1. User shares story URL on WhatsApp/Facebook
2. Social media crawler requests the URL
3. **Cloud Function intercepts** the request
4. Function fetches story data from Firestore
5. Function generates HTML with:
   - `og:title`: Story title
   - `og:description`: Synopsis or first 160 characters
   - `og:image`: Cover image URL
   - `og:author`: Author name
6. Crawler sees the dynamic content and shows rich preview!
7. Regular users are redirected to the React app

## Testing

After deployment, test with:
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

Paste your story URL and verify the preview shows:
- ✅ Story cover image
- ✅ Story title
- ✅ Synopsis/preview text
- ✅ Author name

## Cost Estimate

For a typical creative writing platform:
- **Free tier**: 2M function invocations/month
- **Average usage**: ~10,000 shares/month = Well within free tier
- **Bandwidth**: First 5GB/month free
- **Likely monthly cost**: $0 (unless viral)

## Fallback

If you don't upgrade to Blaze plan:
- Homepage shares show default OG tags ✅
- Story/poem shares show default OG tags (not ideal)
- App still works perfectly for all other features
- Only social previews are generic instead of dynamic
