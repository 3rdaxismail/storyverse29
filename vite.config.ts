import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png', 'storyverse-icon.svg'],
      
      // Inject service worker registration script
      injectRegister: 'auto',
      
      manifest: {
        name: 'Storyverse',
        short_name: 'Storyverse',
        description: 'Write, share, and discover stories offline-first',
        theme_color: '#2F3640',
        background_color: '#2F3640',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'storyverse-icon.svg',
            sizes: '1024x1024',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        
        // Clean up old caches on activation
        cleanupOutdatedCaches: true,
        
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
        
        // Runtime caching for Firebase Storage (images)
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
        ],
        
        // Skip caching Firestore/Auth API calls (let Firebase SDK handle offline)
        navigateFallback: null
      },
      
      devOptions: {
        enabled: true, // Enable in dev for testing
        type: 'module'
      }
    })
  ],
  assetsInclude: ['**/*.svg'],
})
