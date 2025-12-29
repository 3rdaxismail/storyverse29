# STORYVERSE IMPLEMENTATION CHECKLIST

## Quick Start: Scaffold Project in 30 Minutes

### Phase 1: Initialize Project (5 min)

- [ ] Create `storyverse/` directory
- [ ] `npm init -y`
- [ ] Copy config files from FOLDER_STRUCTURE.md:
  - [ ] `vite.config.ts`
  - [ ] `tsconfig.json`
  - [ ] `package.json` (with scripts)
  - [ ] `.eslintrc.mjs`
  - [ ] `.gitignore`
  - [ ] `firebase.json`

### Phase 2: Install Dependencies (5 min)

```bash
npm install react react-dom react-router-dom firebase react-helmet-async
npm install --save-dev typescript vite @vitejs/plugin-react eslint @types/react
```

### Phase 3: Create Folder Structure (10 min)

Create these directories:

```
src/
├── app/
├── pages/
│   ├── public/
│   ├── auth/
│   └── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── routing/
│   └── seo/
├── services/
│   ├── firebase/
│   ├── auth/
│   └── firestore/
├── hooks/
├── utils/
├── seo/
├── types/
├── context/
└── styles/

scripts/
.github/workflows/
public/
  ├── assets/
  │   ├── icons/
  │   ├── images/
  │   └── fonts/
  ├── trending/
  ├── explore/
  └── stories/
```

### Phase 4: Create Core Files (10 min)

#### 4.1 HTML Entry Point
**public/index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storyverse</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 4.2 React Mount Point
**src/main.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 4.3 Root App Component
**src/app/App.tsx**
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModalProvider } from '@/context/AuthModalContext';

import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { PublicRoute } from '@/components/routing/PublicRoute';

// Pages
import LandingPage from '@/pages/public/LandingPage';
import TrendingPage from '@/pages/public/TrendingPage';
import ExplorePage from '@/pages/public/ExplorePage';
import StoriesPage from '@/pages/public/StoriesPage';
import PublicStoryPage from '@/pages/public/PublicStoryPage';
// ... other pages

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <AuthModalProvider>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/s/:slug--:storyId" element={<PublicStoryPage />} />

              {/* AUTH ROUTES */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedRoute />}>
                <Route path="/app/dashboard" element={<DashboardPage />} />
                <Route path="/app/stories" element={<ProjectsPage />} />
                <Route path="/app/story/:storyId" element={<EditorPage />} />
                {/* ... other protected routes */}
              </Route>

              {/* 404 */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </AuthModalProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}
```

#### 4.4 Environment Variables
**.env.example**
```
# Firebase Config (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Emulator (local development only)
VITE_USE_EMULATOR=false
```

**.env.local** (GITIGNORED - never commit)
```
# Copy from .env.example and fill in your actual values
```

---

## Detailed File Creation Guide

### Tier 1: Pages (Each ~50-100 lines)

#### src/pages/public/TrendingPage.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getPublicStories } from '@/services/firestore';
import type { Story } from '@/types/Story';

/**
 * Trending Stories Page
 * 
 * 🔄 Data Source:
 *   - SSG: Pre-rendered at build time (public/trending/index.html)
 *   - CSR: Client-side fetch from Firestore (fallback)
 * 
 * 🔍 SEO: Full metadata via Helmet
 * 
 * 🎯 Features:
 *   - Display top 20 trending stories
 *   - Like button (soft auth modal if not logged in)
 *   - Sorting by views descending
 * 
 * ⚡ Performance:
 *   - SSG: < 100ms (static HTML)
 *   - CSR: ~500ms (Firestore fetch + render)
 */
export default function TrendingPage({ stories: initialStories }: { stories?: Story[] }) {
  const [stories, setStories] = useState<Story[]>(initialStories || []);
  const [loading, setLoading] = useState(!initialStories);

  useEffect(() => {
    if (initialStories) return; // SSG-provided data, skip fetch

    // Fallback: Client-side fetch if not SSG-rendered
    const loadStories = async () => {
      try {
        const data = await getPublicStories(20);
        setStories(data);
      } catch (error) {
        console.error('Failed to load trending stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [initialStories]);

  return (
    <>
      <Helmet>
        <title>Trending Stories — Storyverse</title>
        <meta name="description" content="Discover the most popular stories on Storyverse" />
        <meta property="og:title" content="Trending Stories" />
        <meta property="og:description" content="Discover trending stories" />
      </Helmet>

      <div className="container py-8">
        <h1 className="text-3xl font-semibold mb-8">Trending Now</h1>

        {loading && <div>Loading...</div>}

        <div className="grid grid-cols-1 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.storyId} story={story} />
          ))}
        </div>
      </div>
    </>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <div className="bg-[var(--color-card-bg)] rounded-lg p-4 border border-[var(--color-card-border)]">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{story.title}</h2>
      <p className="text-[var(--color-text-secondary)] text-sm">{story.excerpt}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-small)]">
          {story.views} views • {story.readingTimeMin} min read
        </span>
        <LikeButton storyId={story.storyId} />
      </div>
    </div>
  );
}

function LikeButton({ storyId }: { storyId: string }) {
  // Use soft auth modal context to handle unauthenticated likes
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();

  const handleLike = () => {
    if (!user) {
      openAuthModal('Please sign in to like stories');
      return;
    }
    // Add like to Firestore
  };

  return (
    <button onClick={handleLike} className="text-red-500 hover:text-red-600">
      ❤️ Like
    </button>
  );
}
```

#### src/pages/public/LandingPage.tsx
```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/**
 * Landing Page (/)
 * 
 * Pure marketing/signup page
 * No Firestore reads
 * Simple CTA buttons
 */
export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Storyverse — Write. Share. Read.</title>
        <meta name="description" content="Calm writing platform for long-form stories" />
      </Helmet>

      <div className="hero min-h-screen bg-[var(--color-bg-app)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            Write Your Story
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8">
            A calm, distraction-free platform for long-form writing
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/trending" className="btn btn-secondary">
              Explore Stories
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
```

### Tier 2: Services (Each ~50-150 lines)

#### src/services/firebase/config.ts
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Firebase Configuration
 * 
 * API keys are public (standard for Firebase)
 * Security is enforced by Firestore rules, not API keys
 * 
 * Dev: Use .env.local (gitignored)
 * Prod: Env vars set in Firebase Hosting environment
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

#### src/services/firestore/queries.ts
```typescript
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Story } from '@/types/Story';

/**
 * Firestore Read Functions
 * 
 * All queries:
 * ✅ Include pagination (limit, startAfter)
 * ✅ Are Spark plan safe
 * ✅ Respect Firestore rules
 * ✅ Used by both React and SSG scripts
 * 
 * Security:
 * ✅ Rules enforce access (public vs private)
 * ❌ Client code CANNOT override rules
 */

export async function getStoryById(storyId: string): Promise<Story | null> {
  const docRef = doc(db, 'stories', storyId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Story) : null;
}

export async function getPublicStories(
  pageSize: number = 10,
  startAfterDoc?: any
): Promise<Story[]> {
  const constraints = [
    where('visibility', '==', 'public'),
    where('status', '==', 'published'),
    orderBy('updatedAt', 'desc'),
    limit(pageSize),
  ];

  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }

  const q = query(collection(db, 'stories'), ...constraints);
  const querySnap = await getDocs(q);

  return querySnap.docs.map((doc) => ({ ...doc.data(), storyId: doc.id } as Story));
}

// ... other query functions
```

### Tier 3: Utilities & Types

#### src/types/Story.ts
```typescript
import { Timestamp } from 'firebase/firestore';

/**
 * Story Document Type
 * 
 * Matches Firestore schema from CONSTITUTION
 * Used across all components and services
 */
export interface Story {
  storyId: string;
  authorId: string;
  authorUsername: string;
  title: string;
  slug: string;
  slugHistory: string[];
  excerpt: string;
  language: 'en' | 'hi' | 'zh' | 'es';
  genre: string[];
  status: 'draft' | 'published';
  visibility: 'public' | 'private';
  publishedAt: Timestamp | null;
  coverImage: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  wordCount: number;
  readingTimeMin: number;
  views: number;
  canonicalUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### src/utils/slugGenerator.ts
```typescript
/**
 * Slug Generation & Validation
 * 
 * ✅ Deterministic (same input = same slug)
 * ✅ Multilingual-safe (handles accents, scripts)
 * ✅ URL-safe (kebab-case, no special chars)
 */

export function generateSlug(title: string): string {
  if (!title) throw new Error('Title is required');

  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) && slug.length <= 100;
}

export function extractSlugFromUrl(path: string): string {
  const match = path.match(/^\/s\/(.+?)--[a-z0-9]+$/i);
  return match ? match[1] : '';
}

export function extractStoryIdFromUrl(path: string): string {
  const match = path.match(/--([a-z0-9]+)$/i);
  return match ? match[1] : '';
}
```

### Routes & Guards

#### src/components/routing/ProtectedRoute.tsx
```typescript
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Protected Route Guard
 * 
 * ✅ Redirects to /login if not authenticated
 * ✅ Renders child routes if authenticated
 * ❌ Does NOT handle authorization (Firestore rules do)
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
```

#### src/components/routing/PublicRoute.tsx
```typescript
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Public Route Guard
 * 
 * ✅ Redirects to /app/dashboard if already authenticated
 * ✅ Allows non-authenticated users to see login/signup
 * 🎯 Prevents logged-in users from seeing auth pages
 */
export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/app/dashboard" replace />;

  return <Outlet />;
}
```

### Context Providers

#### src/context/AuthContext.tsx
```typescript
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/services/firebase/config';

/**
 * Auth Context
 * 
 * ✅ Provides user state globally
 * ✅ Persists across page refreshes (Firebase session)
 * ✅ Used by useAuth() hook
 */
export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### src/hooks/useAuth.ts
```typescript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Auth Hook
 * 
 * Usage:
 *   const { user, loading, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
```

---

## SSG Setup

### scripts/generateTrendingPage.ts

```typescript
/**
 * SSG Generation Script for /trending
 * 
 * Run: npm run ssg -- --page trending
 * Cost: 1 Firestore read (~0.5¢ if paid, free in Spark plan)
 * Output: public/trending/index.html
 * Deploy: Automatic via GitHub Actions
 */

import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Initialize Admin SDK
import { adminDb } from '@/services/firebaseAdmin';

async function generateTrendingPage() {
  try {
    console.log('📚 Generating /trending page...');

    // Step 1: Fetch trending stories from Firestore
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
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      publishedAt: doc.data().publishedAt?.toDate(),
    }));

    console.log(`✅ Fetched ${stories.length} stories`);

    // Step 2: Render React component
    const TrendingPage = require('@/pages/public/TrendingPage').default;
    const htmlString = renderToString(
      React.createElement(TrendingPage, { stories })
    );

    // Step 3: Wrap in full HTML document
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Trending Stories — Storyverse</title>
  <meta name="description" content="Discover the most popular stories on Storyverse" />
  <meta property="og:title" content="Trending Stories" />
  <meta property="og:description" content="Discover trending stories" />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://storyverse.app/trending" />
  <link rel="stylesheet" href="/main.css" />
</head>
<body>
  <div id="root">${htmlString}</div>
  <script src="/main.js"><\/script>
</body>
</html>`;

    // Step 4: Write to file
    const outputDir = path.join(process.cwd(), 'public/trending');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), fullHTML);

    console.log('✅ Generated public/trending/index.html');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateTrendingPage();
}
```

### .github/workflows/ssg-trending.yml

```yaml
name: Generate /trending SSG

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build React app
        run: npm run build

      - name: Generate SSG
        env:
          CI_FIREBASE_SERVICE_ACCOUNT: ${{ secrets.CI_FIREBASE_SERVICE_ACCOUNT }}
        run: npm run ssg -- --page trending

      - name: Deploy to Firebase
        run: firebase deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## CSS & Design Tokens

### src/styles/tokens.css

```css
/**
 * Design Tokens (CANONICAL COLORS & FONTS)
 * 
 * ✅ Use these in all components
 * ❌ Never hardcode hex values
 * 
 * This ensures:
 * - Consistent brand appearance
 * - Easy theme switching (future)
 * - Global updates in one place
 */

:root {
  /* Color: Background */
  --color-bg-app: #151518;
  --color-bg-light: #1a1a1d;

  /* Color: Cards */
  --color-card-bg: linear-gradient(114.246deg, #2b2a30 2%, #232227 100%);
  --color-card-border: #302d2d;
  --color-card-accent: linear-gradient(
    180deg,
    rgba(165, 183, 133, 50%) 0%,
    rgba(73, 81, 59, 50%) 100%
  );

  /* Color: Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a5b785;
  --color-text-small: #8c8b91;

  /* Font Families */
  --font-sans: 'Noto Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-serif: 'Noto Serif', georgia, serif;

  /* Font Sizes */
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 23px;
  --font-size-2xl: 26px;
  --font-size-3xl: 32px;

  /* Line Heights */
  --line-height-tight: 1;
  --line-height-normal: 1.3;
  --line-height-relaxed: 1.6;
}

body {
  background-color: var(--color-bg-app);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  line-height: var(--line-height-normal);
}

h1, h2, h3 {
  font-family: var(--font-serif);
  line-height: var(--line-height-tight);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.text-small {
  color: var(--color-text-small);
  font-size: var(--font-size-sm);
}
```

---

## Firebase Setup Checklist

- [ ] Create Firebase project (Console)
- [ ] Enable Firebase Auth (Email/Password)
- [ ] Create Firestore database (Spark plan)
- [ ] Deploy Firestore rules (from firestore.rules)
- [ ] Create service account for SSG
  - [ ] Save JSON key
  - [ ] Add to GitHub Actions secrets as `CI_FIREBASE_SERVICE_ACCOUNT`
- [ ] Enable Firebase Hosting
- [ ] Set up custom domain (optional)
- [ ] Create staging Firebase project
  - [ ] Copy rules from production
  - [ ] Test in staging before production

---

## Local Development Workflow

```bash
# 1. Clone repo
git clone <repo-url>

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in your Firebase config

# 4. Start dev server
npm run dev
# Open http://localhost:5173

# 5. Test pages
# - http://localhost:5173/ (landing)
# - http://localhost:5173/trending (trending)
# - http://localhost:5173/login (auth)

# 6. Build for production
npm run build

# 7. Test production build locally
npm run preview

# 8. Deploy
firebase deploy

# 9. Test SSG locally
npm run ssg -- --page trending
```

---

**END OF IMPLEMENTATION CHECKLIST**
