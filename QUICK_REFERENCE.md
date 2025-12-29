# STORYVERSE — QUICK REFERENCE CARD

## 🎯 3-Document System

| Document | Purpose | Length | When to Use |
|----------|---------|--------|------------|
| **STORYVERSE_ARCHITECTURE_CONSTITUTION.txt** | Binding architectural spec (sections 1-15) | 2,874 lines | Design decisions, rules, compliance, when stuck |
| **FOLDER_STRUCTURE.md** | Complete directory tree with comments | 796 lines | File organization, where code goes, naming |
| **IMPLEMENTATION_CHECKLIST.md** | Code templates, setup steps, examples | 600 lines | Start a feature, copy-paste code, local setup |

---

## 📂 Folder Quick Reference

```
src/
  ├── app/                    → Router, App.tsx, routes.tsx
  ├── pages/
  │   ├── public/            → /trending, /explore, /stories (SSG-eligible)
  │   ├── auth/              → /login, /signup (no SEO)
  │   └── app/               → /app/* (protected, no SEO)
  ├── components/
  │   ├── ui/                → Button, Card, Input, Modal (reusable)
  │   ├── layout/            → Header, BottomNav, Shells
  │   ├── routing/           → ProtectedRoute, PublicRoute (guards)
  │   └── seo/               → HeadMetadata, OpenGraphTags
  ├── services/
  │   ├── firebase/          → config.ts, init.ts (SDK)
  │   ├── auth/              → authService.ts (login, logout, register)
  │   ├── firestore/         → queries.ts, mutations.ts (Firestore ops)
  │   └── firebaseAdmin.ts   → ADMIN ONLY (SSG generation)
  ├── hooks/                 → useAuth, useStory, useDebounce
  ├── utils/                 → slugGenerator, validators, dateFormatter
  ├── seo/                   → helmetMetadata, jsonLdBuilder
  ├── types/                 → Story.ts, User.ts, common interfaces
  ├── context/               → AuthContext, AuthModalContext (global state)
  └── styles/                → tokens.css (design system), global.css

scripts/                      → generateTrendingPage.ts, buildUtils.ts
.github/workflows/            → ssg-trending.yml (GitHub Actions CI/CD)
public/                       → assets, robots.txt, sitemap.xml, SSG output
```

---

## 🔑 Key Files at a Glance

### Must-Have Config Files
```
package.json             → Dependencies, npm scripts
tsconfig.json            → TypeScript strict mode
vite.config.ts           → Build config, aliases
firebase.json            → Hosting config, cache headers
.eslintrc.mjs            → Architecture rules
.env.example             → Env var template (commit)
.env.local               → Secrets (GITIGNORED)
```

### Critical Service Files
```
src/services/firebase/config.ts          → SDK init (public API key OK)
src/services/firestore/queries.ts        → Read functions (all paginated)
src/services/firestore/mutations.ts      → Write functions (debounced)
src/services/firebaseAdmin.ts            → ADMIN ONLY (SSG scripts)
```

### Page Files (Public = SSG-Ready)
```
✅ src/pages/public/TrendingPage.tsx       → /trending (SSG NOW)
✅ src/pages/public/ExplorePage.tsx        → /explore (SSG NOW)
✅ src/pages/public/StoriesPage.tsx        → /stories (SSG NOW)
🟡 src/pages/public/PublicStoryPage.tsx    → /s/:slug--:storyId (CSR, Phase 2 SSG)
⚫ src/pages/public/LandingPage.tsx        → / (static CSR)

src/pages/auth/LoginPage.tsx               → /login (CSR only)
src/pages/app/DashboardPage.tsx            → /app/dashboard (protected)
```

### Guard & Routing
```
src/components/routing/ProtectedRoute.tsx  → Auth required (→ /login if not)
src/components/routing/PublicRoute.tsx     → Prevents double login (→ /dashboard if auth)
src/app/App.tsx                            → Router setup, nested routes
```

---

## ⚡ Common Commands

```bash
# Development
npm run dev                     # Start Vite dev server (localhost:5173)
npm run build                   # Build React app to dist/
npm run preview                 # Preview production build locally
npm run lint                    # Check TypeScript & ESLint

# SSG & Deployment
npm run ssg -- --page trending  # Generate /trending SSG locally
npm run ssg -- --page explore   # Generate /explore SSG locally
firebase deploy                 # Deploy everything
firebase deploy --only hosting  # Deploy only frontend
firebase deploy --only firestore:rules  # Deploy only rules

# Testing
npm test                        # Run tests (when added)
```

---

## 🏗️ Three-Tier Architecture (Quick Reference)

### Tier 1: Client Layer (UI)
- **Lives in:** `src/components/`, `src/pages/`, `src/hooks/`
- **Imports:** Other Tier 1 files + services (Tier 2)
- **❌ Cannot:** Import Firestore directly, have auth logic, hardcode colors
- **✅ Can:** Call services, use React Router, render components

### Tier 2: Data & Auth Layer (Backend)
- **Lives in:** `src/services/`
- **Exports:** Firestore queries, auth functions, config
- **Imports:** Firebase SDK only (never other services unless needed)
- **❌ Cannot:** Render UI, have business logic beyond data access
- **✅ Can:** Query Firestore, manage auth, handle timestamps

### Tier 3: Governance (Rules & Standards)
- **Lives in:** `src/styles/`, `src/types/`, config files
- **Contains:** Design tokens, TypeScript types, ESLint rules
- **Job:** Prevent violations, enforce consistency

---

## 🔐 Security Quick Rules

✅ **DO:**
- Use Firestore rules for access control (rules are the source of truth)
- Store secrets in .env.local (never commit)
- Use Firebase Auth for user identity
- Validate input on client (but don't trust it)
- Use React Helmet for SEO metadata

❌ **DON'T:**
- Check `user.isAdmin` in components and block UI (rules must enforce)
- Import Firestore in components (use services layer)
- Hardcode colors (use CSS tokens via var())
- Use `any` types in TypeScript (use strict mode)
- Skip Firestore rules thinking UI security is enough

---

## 📊 Firestore at a Glance

**Collections:**
- `users` → User accounts, preferences
- `stories` → Story documents (immutable: storyId, createdAt, authorId)
- `chapters` → Subcollection under stories (content chunks)
- `likes` → Like records (userId + storyId)

**Key Query Pattern (All Paginated):**
```typescript
// Read: Public stories
where('visibility', '==', 'public')
  .where('status', '==', 'published')
  .orderBy('updatedAt', 'desc')
  .limit(10)

// Write: Create story (only author can write)
// Rules enforce: context.auth.uid == request.resource.data.authorId
```

**Cost Safety (Spark Plan):**
- Query: 1 read operation per 10-20 docs fetched
- SSG: ~600/month (daily) to ~14,400/month (hourly)
- Free tier: 50,000 reads/month
- Status: ✅ Safe (1-28% usage)

---

## 🌐 Routing Map (Complete)

| Path | Component | Type | Auth | SEO | SSG |
|------|-----------|------|------|-----|-----|
| `/` | LandingPage | Public | ❌ | ✅ | ❌ |
| `/trending` | TrendingPage | Public | ❌ | ✅ | ✅ |
| `/explore` | ExplorePage | Public | ❌ | ✅ | ✅ |
| `/stories` | StoriesPage | Public | ❌ | ✅ | ✅ |
| `/s/:slug--:storyId` | PublicStoryPage | Public | ❌ | ✅ | 🟡 |
| `/login` | LoginPage | Auth | ❌ | ❌ | ❌ |
| `/signup` | SignupPage | Auth | ❌ | ❌ | ❌ |
| `/app/dashboard` | DashboardPage | App | ✅ | ❌ | ❌ |
| `/app/stories` | ProjectsPage | App | ✅ | ❌ | ❌ |
| `/app/story/:storyId` | EditorPage | App | ✅ | ❌ | ❌ |
| `/app/settings` | SettingsPage | App | ✅ | ❌ | ❌ |
| `/app/profile` | ProfilePage | App | ✅ | ❌ | ❌ |

Legend: Auth=Required, SEO=Has metadata, SSG=Pre-rendered (✅ now, 🟡 phase 2)

---

## 📖 Design Tokens (CSS Variables)

```css
/* Copy to src/styles/tokens.css */

:root {
  /* Colors */
  --color-bg-app: #151518;
  --color-card-bg: linear-gradient(114.246deg, #2b2a30 2%, #232227 100%);
  --color-text-primary: #ffffff;
  --color-text-secondary: #a5b785;
  --color-text-small: #8c8b91;

  /* Fonts */
  --font-sans: 'Noto Sans', system-ui, sans-serif;
  --font-serif: 'Noto Serif', georgia, serif;

  /* Sizes */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 23px;

  /* Lines */
  --line-height-tight: 1;
  --line-height-normal: 1.3;
}

/* Usage in components: */
.button {
  background-color: var(--color-card-bg);  /* ✅ Correct */
  color: var(--color-text-primary);
}

/* ❌ NEVER do this: */
.button {
  background-color: #2b2a30;               /* Wrong! Use token. */
  color: #ffffff;
}
```

---

## 🚀 Quick Start (5 Steps)

1. **Clone & setup**
   ```bash
   npm install
   cp .env.example .env.local
   # Fill in Firebase config
   ```

2. **Start dev**
   ```bash
   npm run dev
   ```

3. **Test routes**
   - http://localhost:5173 (landing)
   - http://localhost:5173/trending (trending)
   - http://localhost:5173/login (auth)

4. **Build & deploy**
   ```bash
   npm run build
   firebase deploy
   ```

5. **Set up CI/CD** (optional)
   - Create `.github/workflows/ssg-trending.yml`
   - Add `CI_FIREBASE_SERVICE_ACCOUNT` secret
   - Push to GitHub

---

## 📞 When to Check Each Document

| Problem | Check This |
|---------|-----------|
| "Where should I put this code?" | FOLDER_STRUCTURE.md |
| "I'm stuck on architectural rules" | CONSTITUTION Section 2 (principles) |
| "How do I create a new route?" | CONSTITUTION Section 4 (routing) |
| "What's the Firestore schema?" | CONSTITUTION Section 5 (data) |
| "I need a code template" | IMPLEMENTATION_CHECKLIST.md |
| "Are we breaking a rule?" | CONSTITUTION Section 9, 14 (rules) |
| "How do we handle SEO?" | CONSTITUTION Section 15, CHECKLIST (code) |
| "What about SSG?" | CONSTITUTION Section 13, FOLDER_STRUCTURE (scripts/) |

---

## ✅ Pre-Launch Checklist

Before deploying to production:

- [ ] All routes tested locally
- [ ] TypeScript builds without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Firestore rules deployed (and tested in staging)
- [ ] Environment variables set (Firebase config in production)
- [ ] GitHub Actions configured (SSG workflow)
- [ ] SSL certificate enabled (Firebase auto-provides)
- [ ] robots.txt configured (disallow /app/*, /login, /signup)
- [ ] sitemap.xml generated
- [ ] Mobile design tested (360px minimum)
- [ ] Dark mode colors verified (all tokens applied)
- [ ] Soft auth modal works (on like button click)
- [ ] CSR fallback tested (SSG pages work if JS disabled)

---

**Last Updated:** December 26, 2025
**Status:** Production-Ready
**Quality Level:** Interview-Grade
