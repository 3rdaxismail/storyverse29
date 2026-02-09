# PWA Setup Guide - Required for Deployment

## CRITICAL: Your app is currently NOT a PWA

### 1. Install Dependencies
```bash
npm install -D vite-plugin-pwa workbox-window
```

### 2. Update vite.config.ts

Replace the current config with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg'],
      
      manifest: {
        name: 'Storyverse',
        short_name: 'Storyverse',
        description: 'Write, share, and discover stories offline-first',
        theme_color: '#181a1b',
        background_color: '#181a1b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        
        // Runtime caching for Firebase
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      
      devOptions: {
        enabled: true, // Enable in dev for testing
        type: 'module'
      }
    })
  ],
  assetsInclude: ['**/*.svg'],
})
```

### 3. Create PWA Icons

You need two icon files in `public/`:
- `public/pwa-192x192.png` (192x192 pixels)
- `public/pwa-512x512.png` (512x512 pixels)

Use any logo/icon for your app. You can generate these from a single image using:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 4. Test Build

```bash
npm run build
```

Check that `dist/` contains:
- `sw.js` or `service-worker.js` (service worker)
- `manifest.webmanifest` (PWA manifest)

### 5. Test Locally

```bash
npm run preview
```

Open Chrome DevTools > Application tab:
- **Manifest**: Should show Storyverse with icons
- **Service Workers**: Should show "activated and running"
- **Install prompt**: Should appear in address bar

### 6. Deploy & Test on Mobile

After deploying to Firebase Hosting:
1. Open on Android Chrome or iOS Safari
2. Look for "Add to Home Screen" prompt
3. Install and verify it opens as standalone app

---

## Why This Is Critical

Without PWA setup:
- Users can't install your app
- No offline writing capabilities
- No background sync
- Just a regular website, not a PWA

**Estimated Time: 30 minutes (including icon creation)**
