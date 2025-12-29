# STORYVERSE FILE & FOLDER STRUCTURE
## Production-Grade Foundation for React + Firebase + SSG

```
storyverse/
│
├── 📄 README.md                          # Project overview, local setup guide
├── 📄 package.json                       # Dependencies, scripts, metadata
├── 📄 tsconfig.json                      # TypeScript strict mode
├── 📄 vite.config.ts                     # Vite build config, aliases
├── 📄 firebase.json                      # Firebase Hosting config, redirects
├── 📄 firestore.rules                    # Firestore security rules (CRITICAL)
├── 📄 firestore.indexes.json             # Firestore index configuration
├── 📄 .eslintrc.mjs                      # ESLint architectural rules
├── 📄 .gitignore                         # Git ignore patterns (node_modules, .env.local, dist, etc.)
├── 📄 .env.example                       # Template: required env vars (NO SECRETS)
│
├── 📂 src/                               # TIER 1: CLIENT LAYER (React app)
│   │
│   ├── 📂 app/                           # App shell & routing root
│   │   ├── 📄 App.tsx                    # Root component, Router setup, HelmetProvider
│   │   ├── 📄 routes.tsx                 # Route definitions (public, auth, protected)
│   │   └── 📄 index.ts                   # Export App
│   │
│   ├── 📂 pages/                         # Page-level components (route handlers)
│   │   │
│   │   ├── 📂 public/                    # SEO-CRITICAL PUBLIC PAGES (NO AUTH REQUIRED)
│   │   │   ├── 📄 LandingPage.tsx        # / (landing, marketing)
│   │   │   ├── 📄 TrendingPage.tsx       # /trending (SSG-ENABLED NOW ✅)
│   │   │   │                              # Marked with: // SSG: enabled
│   │   │   │                              # Hydrates after load, interactive
│   │   │   ├── 📄 ExplorePage.tsx        # /explore (SSG-ENABLED NOW ✅)
│   │   │   ├── 📄 StoriesPage.tsx        # /stories (SSG-ENABLED NOW ✅)
│   │   │   │
│   │   │   ├── 📄 PublicStoryPage.tsx    # /s/:slug--:storyId
│   │   │   │                              # Slug redirect logic + SEO metadata
│   │   │   │                              # CSR now, SSG per-story in Phase 2
│   │   │   ├── 📄 AuthorProfilePage.tsx  # /author/:username (public, Phase 2)
│   │   │   ├── 📄 AboutPage.tsx          # /about (static, CSR only)
│   │   │   ├── 📄 PrivacyPage.tsx        # /privacy (static, CSR only)
│   │   │   ├── 📄 TermsPage.tsx          # /terms (static, CSR only)
│   │   │   └── 📄 index.ts               # Export all public pages
│   │   │
│   │   ├── 📂 auth/                      # AUTHENTICATION PAGES (NO SEO, CSR ONLY)
│   │   │   ├── 📄 LoginPage.tsx          # /login
│   │   │   ├── 📄 SignupPage.tsx         # /signup
│   │   │   ├── 📄 ForgotPasswordPage.tsx # /forgot-password (future)
│   │   │   ├── 📄 VerifyEmailPage.tsx    # /verify-email (future)
│   │   │   ├── 📄 OtpPage.tsx            # /otp (future)
│   │   │   └── 📄 index.ts               # Export auth pages
│   │   │
│   │   ├── 📂 app/                       # PROTECTED APPLICATION PAGES (AUTH-REQUIRED)
│   │   │   ├── 📄 DashboardPage.tsx      # /app/dashboard (home feed)
│   │   │   ├── 📄 ProjectsPage.tsx       # /app/stories (user's stories list)
│   │   │   ├── 📄 CreateStoryPage.tsx    # /app/create (new story form, zero Firestore writes)
│   │   │   ├── 📄 EditorPage.tsx         # /app/story/:storyId (content editor, autosave)
│   │   │   ├── 📄 SettingsPage.tsx       # /app/settings (user settings, preferences)
│   │   │   ├── 📄 ProfilePage.tsx        # /app/profile (user profile)
│   │   │   └── 📄 index.ts               # Export app pages
│   │   │
│   │   └── 📄 index.ts                   # Re-export all page categories
│   │
│   ├── 📂 components/                    # Reusable UI components (TIER 1)
│   │   │
│   │   ├── 📂 ui/                        # Pure presentation components
│   │   │   ├── 📄 Button.tsx             # Button variants (primary, secondary, ghost)
│   │   │   ├── 📄 Card.tsx               # Card container (story cards, etc.)
│   │   │   ├── 📄 Input.tsx              # Text input with validation
│   │   │   ├── 📄 Modal.tsx              # Modal dialog (soft auth modal)
│   │   │   ├── 📄 Badge.tsx              # Genre/tag badges
│   │   │   ├── 📄 Spinner.tsx            # Loading indicator
│   │   │   ├── 📄 Icon.tsx               # Icon wrapper (SVG)
│   │   │   ├── 📄 Avatar.tsx             # User avatar
│   │   │   └── 📄 index.ts               # Export all UI components
│   │   │
│   │   ├── 📂 layout/                    # Layout & structural components
│   │   │   ├── 📄 Header.tsx             # Top navigation (logo, buttons)
│   │   │   ├── 📄 BottomNav.tsx          # Mobile bottom navigation bar
│   │   │   ├── 📄 Footer.tsx             # Footer (links, copyright)
│   │   │   ├── 📄 AppShell.tsx           # Wrapper for /app/* routes (header + bottom nav)
│   │   │   ├── 📄 PublicShell.tsx        # Wrapper for public routes (header + footer)
│   │   │   └── 📄 index.ts               # Export layouts
│   │   │
│   │   ├── 📂 routing/                   # Route guard components (TIER 1)
│   │   │   ├── 📄 ProtectedRoute.tsx     # Auth-required guard (→ /login if not auth)
│   │   │   ├── 📄 PublicRoute.tsx        # Auth-redirect guard (→ /app/dashboard if auth)
│   │   │   └── 📄 index.ts               # Export guards
│   │   │
│   │   ├── 📂 seo/                       # SEO-specific components
│   │   │   ├── 📄 HeadMetadata.tsx       # Helmet wrapper for story pages
│   │   │   ├── 📄 OpenGraphTags.tsx      # Social sharing tags
│   │   │   └── 📄 index.ts               # Export SEO components
│   │   │
│   │   └── 📄 index.ts                   # Re-export all component categories
│   │
│   ├── 📂 services/                      # TIER 2: DATA & AUTH LAYER
│   │   │
│   │   ├── 📂 firebase/                  # Firebase SDK initialization
│   │   │   ├── 📄 config.ts              # Firebase config (API key, etc.)
│   │   │   ├── 📄 init.ts                # Initialize Firebase app, emulator setup
│   │   │   └── 📄 index.ts               # Export db, auth instances
│   │   │
│   │   ├── 📂 auth/                      # Authentication service
│   │   │   ├── 📄 authService.ts         # register, login, logout, resetPassword
│   │   │   └── 📄 index.ts               # Export auth functions
│   │   │
│   │   ├── 📂 firestore/                 # Firestore queries & mutations
│   │   │   ├── 📄 queries.ts             # Read functions: getStoryById, getPublicStories, etc.
│   │   │   ├── 📄 mutations.ts           # Write functions: createStory, updateStory, publishStory
│   │   │   ├── 📄 likes.ts               # Like service: addLike, removeLike, getLikes
│   │   │   └── 📄 index.ts               # Export all Firestore functions
│   │   │
│   │   ├── 📄 firebaseAdmin.ts           # ADMIN SDK (SSG ONLY, NOT IN CLIENT BUILD)
│   │   │                                  # Import only in scripts/, never in React
│   │   │                                  # Used by SSG generation for build-time Firestore reads
│   │   │
│   │   └── 📄 index.ts                   # Re-export all services
│   │
│   ├── 📂 hooks/                         # Custom React hooks (TIER 1)
│   │   ├── 📄 useAuth.ts                 # Auth context hook (user, loading, logout)
│   │   ├── 📄 useStory.ts                # Story fetching hook (getStory, loading)
│   │   ├── 📄 useDebounce.ts             # Debounce hook (autosave, 2s delay)
│   │   ├── 📄 useLocalStorage.ts         # LocalStorage persistence
│   │   ├── 📄 useAuthModal.ts            # Soft auth modal context hook
│   │   └── 📄 index.ts                   # Export all hooks
│   │
│   ├── 📂 utils/                         # Utility functions (TIER 1)
│   │   ├── 📄 slugGenerator.ts           # generateSlug, isValidSlug, extractSlug
│   │   ├── 📄 dateFormatter.ts           # Format timestamps for display
│   │   ├── 📄 wordCount.ts               # Calculate word count (no diacritics)
│   │   ├── 📄 readingTime.ts             # Estimate reading time from word count
│   │   ├── 📄 validation.ts              # Email, title, slug validation
│   │   ├── 📄 characterCounter.ts        # Intl.Segmenter-based grapheme counting
│   │   └── 📄 index.ts                   # Export utilities
│   │
│   ├── 📂 seo/                           # SEO & metadata builders (TIER 1)
│   │   ├── 📄 helmetMetadata.ts          # Build Helmet tags for story pages
│   │   ├── 📄 jsonLdBuilder.ts           # Generate JSON-LD structured data
│   │   ├── 📄 ogTags.ts                  # Generate OpenGraph tags
│   │   └── 📄 index.ts                   # Export SEO builders
│   │
│   ├── 📂 types/                         # Shared TypeScript types (TIER 3)
│   │   ├── 📄 Story.ts                   # Story document type
│   │   ├── 📄 User.ts                    # User document type
│   │   ├── 📄 Chapter.ts                 # Chapter subcollection type
│   │   ├── 📄 Like.ts                    # Like document type
│   │   ├── 📄 common.ts                  # Common types (ID, Timestamp, etc.)
│   │   └── 📄 index.ts                   # Export all types
│   │
│   ├── 📂 context/                       # React Context providers (TIER 1)
│   │   ├── 📄 AuthContext.tsx            # Auth state provider
│   │   ├── 📄 AuthModalContext.tsx       # Soft auth modal state (global)
│   │   ├── 📄 ThemeContext.tsx           # Theme provider (future: light/dark)
│   │   └── 📄 index.ts                   # Export contexts
│   │
│   ├── 📂 styles/                        # Global styles (TIER 3)
│   │   ├── 📄 tokens.css                 # Design tokens: colors, fonts, sizes
│   │   │                                  # --color-bg-app, --color-text-primary, etc.
│   │   ├── 📄 global.css                 # Global resets, base styles
│   │   ├── 📄 typography.css             # Noto Sans / Serif font loading
│   │   └── 📄 animations.css             # CSS keyframes (loading spinner, etc.)
│   │
│   ├── 📄 main.tsx                       # React mount point (ReactDOM.createRoot)
│   │
│   └── 📄 vite-env.d.ts                  # Vite environment types
│
├── 📂 scripts/                           # SSG & build utilities (NOT in client build)
│   │
│   ├── 📄 generateTrendingPage.ts        # Main orchestrator for /trending SSG
│   │                                      # Fetches trending stories, renders HTML, writes files
│   │
│   ├── 📄 generateExplorePage.ts         # /explore page SSG (similar pattern)
│   │
│   ├── 📄 generateStoriesPage.ts         # /stories page SSG (similar pattern)
│   │
│   ├── 📄 fetchTrendingStories.ts        # Firestore query for trending stories
│   │                                      # Used by SSG scripts
│   │                                      # Pagination, sorting, limits
│   │
│   ├── 📄 buildUtils.ts                  # Shared SSG utilities
│   │                                      # renderPageToHTML, writeHTMLFile, etc.
│   │
│   ├── 📄 ssgConfig.ts                   # SSG configuration
│   │                                      # Cache headers, regeneration frequency, etc.
│   │
│   ├── 📄 build.ts                       # CLI entry point
│   │                                      # node scripts/build.ts --page trending
│   │
│   └── 📄 README.md                      # SSG script documentation
│                                          # How to run, test, debug locally
│
├── 📂 .github/                           # GitHub configuration
│   │
│   └── 📂 workflows/                     # GitHub Actions workflows
│       │
│       ├── 📄 ssg-trending.yml           # Scheduled: Generate /trending/index.html
│       │                                  # Trigger: Daily at 2 AM UTC (or hourly)
│       │                                  # Steps:
│       │                                  #   1. Checkout repo
│       │                                  #   2. npm install
│       │                                  #   3. npm run build (React build)
│       │                                  #   4. npm run ssg (SSG generation)
│       │                                  #   5. firebase deploy --only hosting
│       │
│       ├── 📄 ssg-explore.yml            # Scheduled: Generate /explore/index.html
│       │
│       ├── 📄 ssg-stories.yml            # Scheduled: Generate /stories/index.html
│       │
│       ├── 📄 test.yml                   # CI: TypeScript check, ESLint, tests
│       │                                  # Trigger: On push to main/dev
│       │
│       └── 📄 deploy-staging.yml         # Staging deployment
│                                          # Trigger: On PR approval
│
├── 📂 public/                            # Static assets & SSG output
│   │
│   ├── 📂 trending/                      # SSG output (generated at build time)
│   │   └── 📄 index.html                 # Pre-rendered /trending page
│   │                                      # Includes full HTML + SEO metadata
│   │                                      # React hydrates on load
│   │
│   ├── 📂 explore/                       # SSG output (generated at build time)
│   │   └── 📄 index.html                 # Pre-rendered /explore page
│   │
│   ├── 📂 stories/                       # SSG output (generated at build time)
│   │   └── 📄 index.html                 # Pre-rendered /stories page
│   │
│   ├── 📂 assets/                        # Static images, icons
│   │   ├── 📂 icons/                     # SVG icons
│   │   │   ├── 📄 home.svg
│   │   │   ├── 📄 projects.svg
│   │   │   ├── 📄 create.svg
│   │   │   ├── 📄 community.svg
│   │   │   ├── 📄 trending.svg
│   │   │   ├── 📄 profile.svg
│   │   │   ├── 📄 heart.svg
│   │   │   ├── 📄 close.svg
│   │   │   ├── 📄 back.svg
│   │   │   └── 📄 menu.svg
│   │   │
│   │   ├── 📂 images/                    # PNG/JPEG images
│   │   │   ├── 📄 logo.png               # Storyverse logo
│   │   │   ├── 📄 hero-illustration.svg  # Landing page hero
│   │   │   └── 📄 empty-state.svg        # Empty state illustration
│   │   │
│   │   └── 📂 fonts/                     # Noto Sans/Serif (if not CDN)
│   │       └── 📄 (preloaded fonts here)
│   │
│   ├── 📄 index.html                     # HTML template (Vite entry)
│   │                                      # <div id="root"></div> for React mount
│   │
│   ├── 📄 robots.txt                     # SEO: robots exclusion
│   │                                      # Disallow: /app/*, /login, /signup
│   │                                      # Allow: /trending, /explore, /stories
│   │
│   └── 📄 sitemap.xml                    # SEO: sitemap (generated at build time)
│                                          # Includes public pages only
│
├── 📂 tests/                             # (Optional) Integration tests
│   │
│   ├── 📂 integration/
│   │   ├── 📄 routing.test.ts            # Route guard tests
│   │   ├── 📄 firestore.test.ts          # Query/mutation tests
│   │   └── 📄 ssg.test.ts                # SSG generation tests
│   │
│   └── 📄 setup.ts                       # Test configuration
│
├── 📄 dist/                              # Build output (gitignored)
│   ├── 📄 index.html                     # Built HTML
│   ├── 📂 assets/                        # Bundled JS/CSS
│   ├── 📂 trending/                      # SSG-generated pages
│   └── ...
│
└── 📄 node_modules/                      # Dependencies (gitignored)
```

---

## 📋 KEY FILES (WITH BRIEF PURPOSE COMMENTS)

### ROOT CONFIG FILES

#### `package.json`
```json
{
  "name": "storyverse",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "ssg": "node scripts/build.ts",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "deploy": "firebase deploy"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.x.x",
    "firebase": "^10.x.x",
    "react-helmet-async": "^1.x.x"
  },
  "devDependencies": {
    "typescript": "^5.x.x",
    "vite": "^5.x.x",
    "@vitejs/plugin-react": "^4.x.x",
    "eslint": "^8.x.x"
  }
}
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
  },
});
```

#### `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/s/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      },
      {
        "source": "/trending/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

#### `.eslintrc.mjs`
```javascript
// Enforce architectural rules
// - No direct Firestore imports in components (use services)
// - No auth logic in UI (use context)
// - No hardcoded colors (use CSS tokens)
// - No 'any' types (strict TypeScript)
export default [
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['firebase/firestore', 'firebase/auth'],
          message: 'Import from services layer instead',
        },
      ],
    },
  },
];
```

---

### SRC/APP TIER (ROOT)

#### `src/app/App.tsx`
```typescript
/**
 * Root application component
 * - HelmetProvider for SEO metadata
 * - Router with nested route guards
 * - AuthProvider at root
 * - AuthModalProvider for soft auth modal
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
// ... route definitions
```

---

### SRC/SERVICES TIER (Firestore & Auth)

#### `src/services/firebase/config.ts`
```typescript
/**
 * Firebase SDK initialization config
 * IMPORTANT: API keys are exposed in frontend code (expected for Firebase)
 * Firestore rules enforce all security, not API keys
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

#### `src/services/firestore/queries.ts`
```typescript
/**
 * READ-ONLY Firestore queries (all paginated, all limited)
 * Used by React components and SSG scripts
 * 
 * Key functions:
 * - getStoryById(storyId)
 * - getPublicStories(limit, startAfter)
 * - getUserStories(userId, limit, startAfter)
 * - getAuthorPublicStories(authorId, limit, startAfter)
 * 
 * All queries respect Firestore rules:
 * - Public stories readable by anyone
 * - Private stories readable by author only
 * - Rules enforce access, not UI
 */
```

#### `src/services/firebaseAdmin.ts`
```typescript
/**
 * ADMIN SDK (BUILD-TIME ONLY)
 * 
 * ⚠️  NEVER import in React components
 * ⚠️  ONLY used by scripts/ for SSG generation
 * ⚠️  Requires CI_FIREBASE_SERVICE_ACCOUNT env var (GitHub Actions secret)
 * 
 * Used by:
 * - scripts/generateTrendingPage.ts
 * - scripts/fetchTrendingStories.ts
 * - scripts/build.ts
 * 
 * NOT bundled in client build (tree-shaken by esbuild)
 */
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.CI_FIREBASE_SERVICE_ACCOUNT || '{}'
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const adminDb = admin.firestore();
```

---

### SRC/UTILS TIER (Helpers)

#### `src/utils/slugGenerator.ts`
```typescript
/**
 * Deterministic slug generation
 * - kebab-case format
 * - Multilingual support (English, Hindi, Mandarin, Spanish)
 * - NFC normalization
 * - URL-safe
 * 
 * Functions:
 * - generateSlug(title) → string
 * - isValidSlug(slug) → boolean
 * - extractSlugFromUrl(path) → string
 * - extractStoryIdFromUrl(path) → string
 */
export function generateSlug(title: string): string {
  // Trim, lowercase, normalize, remove accents, replace spaces
  // Max 100 chars
}
```

---

### SRC/HOOKS TIER (Custom Hooks)

#### `src/hooks/useAuth.ts`
```typescript
/**
 * Auth context hook
 * 
 * Returns: { user, loading, error, logout }
 * 
 * Usage:
 * const { user, loading } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) return <Navigate to="/login" />;
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be in AuthProvider');
  return context;
}
```

---

### SCRIPTS TIER (SSG)

#### `scripts/generateTrendingPage.ts`
```typescript
/**
 * SSG Generation for /trending page
 * 
 * Steps:
 * 1. Initialize Firebase Admin SDK
 * 2. Query Firestore: trending stories (top 20, orderBy views desc)
 * 3. Render TrendingPage component to HTML string
 * 4. Wrap in full HTML document with SEO metadata
 * 5. Write to public/trending/index.html
 * 6. Ready for Firebase Hosting deployment
 * 
 * Cost: 1 Firestore read per build (free tier safe)
 * Frequency: Daily (or hourly for high traffic)
 * Cache: 1 hour (Cache-Control header in firebase.json)
 * 
 * Output: public/trending/index.html
 *   - Full HTML document
 *   - SEO metadata (title, description, OpenGraph, JSON-LD)
 *   - React root <div id="root">...</div> with initial content
 *   - <script src="/main.js"> for hydration
 */
import { adminDb } from '@/services/firebaseAdmin';
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import path from 'path';

async function generateTrendingPage() {
  try {
    // Step 1: Query trending stories
    const snapshot = await adminDb
      .collection('stories')
      .where('visibility', '==', 'public')
      .where('status', '==', 'published')
      .orderBy('views', 'desc')
      .limit(20)
      .get();

    const stories = snapshot.docs.map((doc) => ({
      ...doc.data(),
      storyId: doc.id,
    }));

    // Step 2: Render component
    const TrendingPage = require('@/pages/public/TrendingPage').default;
    const htmlString = renderToString(
      React.createElement(TrendingPage, { stories })
    );

    // Step 3: Wrap in document
    const fullHTML = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Trending Stories — Storyverse</title>
        <!-- Full SEO metadata -->
      </head>
      <body>
        <div id="root">${htmlString}</div>
        <script src="/main.js"><\/script>
      </body>
      </html>
    `;

    // Step 4: Write file
    const outputDir = path.join(__dirname, '../public/trending');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), fullHTML);

    console.log('✅ Generated /trending/index.html');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateTrendingPage();
```

---

### .GITHUB/WORKFLOWS TIER

#### `.github/workflows/ssg-trending.yml`
```yaml
# SSG Generation for /trending
# Trigger: Daily at 2 AM UTC (or custom schedule)
# Cost: 1 Firestore read per run (free tier safe)

name: Generate /trending SSG

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run build
      
      - env:
          CI_FIREBASE_SERVICE_ACCOUNT: ${{ secrets.CI_FIREBASE_SERVICE_ACCOUNT }}
        run: npm run ssg -- --page trending
      
      - run: firebase deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 📊 STRUCTURE RATIONALE

### Why This Layout?

#### Tier-Based Separation
- **Tier 1 (Presentation):** `src/components`, `src/pages`, `src/hooks`
  - Contains NO direct Firestore imports
  - Calls services layer only
  - Pure React logic

- **Tier 2 (Data & Auth):** `src/services/`
  - Firestore queries & mutations
  - Auth service
  - Firebase config
  - Admin SDK (build-time only)

- **Tier 3 (Governance):** `src/styles/`, `src/types/`, ESLint, TypeScript
  - Design tokens (colors, fonts, sizes)
  - Shared types
  - Architectural rules

#### Public Pages Are Explicit
```
src/pages/public/
├── TrendingPage.tsx       // ✅ SSG-enabled NOW
├── ExplorePage.tsx        // ✅ SSG-enabled NOW
├── StoriesPage.tsx        // ✅ SSG-enabled NOW
├── PublicStoryPage.tsx    // 🟡 CSR now, SSG Phase 2
├── LandingPage.tsx        // ⚫ Static CSR only
└── ...
```
Each page clearly marked with SSG status.

#### SSG is Reversible
```
scripts/                   // SSG generation (NOT in client bundle)
├── generateTrendingPage.ts
├── fetchTrendingStories.ts
├── buildUtils.ts
└── build.ts
```
Remove `scripts/` folder and CI job → back to pure CSR instantly.

#### No Architectural Coupling
- Admin SDK isolated in `src/services/firebaseAdmin.ts`
- Never imported in React
- Tree-shaken by bundler
- Pages work identically with or without SSG

---

## 🔒 SECURITY & COMPLIANCE

### TypeScript Strict Mode
- All files checked with `strict: true`
- No implicit `any` types
- Safe type narrowing required

### ESLint Rules
```
❌ No direct Firebase imports in components
❌ No hardcoded colors (#FF0000) → use CSS tokens
❌ No business logic in UI
```

### Firestore Rules (firestore.rules)
- Enforce all access control
- Public stories readable by anyone
- Private stories readable by author only
- NO TRUST CLIENT

### Auth is Never Required to Read Public Pages
```typescript
// ✅ Correct: No auth required
<Route path="/trending" element={<TrendingPage />} />

// ❌ Wrong: Auth gate on public page
<Route element={<ProtectedRoute />}>
  <Route path="/trending" element={<TrendingPage />} />
</Route>
```

---

## 📈 SCALABILITY

### Spark Plan Safety
- Firestore reads: ~600/month (daily SSG) or ~14,400/month (hourly)
- Spark plan: 50,000 free reads/month
- Usage: 1.2% - 28.8% of free tier
- ✅ Safe margin, no paid upgrades needed

### Future-Ready
- SSG can expand to 100+ pages without cost increases
- GitHub Actions: 2,000 free minutes/month
- Static hosting: unlimited bandwidth
- Firestore: scales to millions of documents

---

## 🎯 NEXT STEPS

1. **Create this structure** in your workspace
2. **Install dependencies:** `npm install`
3. **Configure Firebase:** `.env.local` with your project details
4. **Start dev server:** `npm run dev`
5. **Test routes:** Navigate to `/trending`, `/explore`, etc.
6. **Build & deploy:** `npm run build && firebase deploy`
7. **Set up SSG:** Create `.github/workflows/ssg-trending.yml`
8. **Test SSG locally:** `npm run ssg -- --page trending`

---

**END OF FOLDER STRUCTURE DOCUMENTATION**
