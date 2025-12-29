# 🎭 Storyverse - Preview Landing Page Implementation

> **Where writers craft their epic**

This is a production-ready React + Vite + TypeScript implementation of the **Storyverse Preview Landing Page** extracted from Figma design.

## ✨ Features

- ✅ **Mobile-first design** (412px base width, responsive)
- ✅ **Fully typed TypeScript** (strict mode)
- ✅ **Reusable components** (Loader, PrimaryButton, SecondaryButton, PublicHeader)
- ✅ **Design tokens** extracted from Figma
- ✅ **Lottie animation support** for loader
- ✅ **SEO-optimized** with React Helmet
- ✅ **Zero business logic** in UI components
- ✅ **CSS Modules** for styling
- ✅ **Path aliases** for clean imports (`@/components`, etc.)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+ (or yarn/pnpm)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Start development server
npm run dev
```

The app will open at `http://localhost:5173`

## 📁 Project Structure

```
storyverse/
├── src/
│   ├── app/                    # App shell & routing
│   │   └── App.tsx             # Root component
│   ├── pages/
│   │   ├── public/
│   │   │   └── PreviewLandingPage.tsx   # / (Landing page)
│   │   └── index.ts
│   ├── components/
│   │   ├── ui/                 # Pure UI components
│   │   │   ├── Loader.tsx
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   └── index.ts
│   │   ├── layout/             # Layout components
│   │   │   ├── PublicHeader.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── tokens.ts           # Design tokens
│   │   ├── global.css          # Global styles
│   │   └── index.ts
│   ├── main.tsx                # React mount point
│   └── vite-env.d.ts
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── package.json
└── .eslintrc.mjs
```

## 🎨 Design System

All design tokens are extracted from Figma and defined in `src/styles/tokens.ts`:

### Colors
- **Accent**: `#A5B785` (green)
- **Background**: `#0D0D0F` (dark)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#8C8B91`

### Typography
- **Serif Font**: Noto Serif (headings)
- **Sans Font**: Noto Sans (body text)
- **Base Size**: 16px (mobile)

### Spacing
Defined as `spacing` object: `0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64`

### Border Radius
- `sm`: 4px
- `base`: 8px
- `lg`: 20px
- `xl`: 25px (buttons)

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 5173)

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Quality
npm run type-check       # Run TypeScript check
npm run lint             # Run ESLint

# Future
npm run ssg              # Generate static pages (Phase 2)
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | DOM rendering |
| `react-router-dom` | ^6.28.0 | Client routing |
| `react-helmet-async` | ^1.3.1 | SEO metadata |
| `lottie-web` | ^5.12.2 | Animation rendering |
| `firebase` | ^10.11.0 | Backend (Phase 2) |
| `vite` | ^5.4.10 | Build tool |
| `typescript` | ^5.6.3 | Type checking |

## 🧩 Components

### PreviewLandingPage
Main landing page component. Renders hero section with CTAs.

**Props**: None  
**Route**: `/`  
**Auth**: Not required  
**Features**:
- Hero headline & subheadline
- Get Started button (→ `/signup`)
- Account login button (→ `/login`)
- Optional loader overlay

```tsx
<PreviewLandingPage />
```

### PublicHeader
Reusable header for public pages.

**Props**: 
- `className?`: string

```tsx
<PublicHeader />
```

### PrimaryButton
Primary action button with green gradient.

**Props**:
- `children`: ReactNode
- `isLoading?`: boolean
- `leftIcon?`: ReactNode
- `rightIcon?`: ReactNode
- `fullWidth?`: boolean (default: true)
- `onClick?`: () => void
- Standard HTML button attributes

```tsx
<PrimaryButton onClick={handleClick} isLoading={false}>
  Get Started
</PrimaryButton>
```

### SecondaryButton
Secondary action button with dark gradient and border.

**Props**: Same as PrimaryButton

```tsx
<SecondaryButton onClick={handleClick}>
  I already have an account
</SecondaryButton>
```

### Loader
Animated loader overlay using Lottie.

**Props**:
- `isVisible?`: boolean (default: false) - Controls visibility
- `size?`: 'sm' | 'md' | 'lg' (default: 'md')
- `message?`: string - Optional loading message

```tsx
<Loader isVisible={isLoading} message="Loading your story..." />
```

## 🎯 Design Tokens Usage

```tsx
import { colors, gradients, typography, spacing, borderRadius } from '@/styles/tokens';

// Colors
colors.accent           // #A5B785
colors.background       // #0D0D0F
colors.textPrimary      // #FFFFFF

// Gradients
gradients.heroBg        // Hero section gradient
gradients.cardBg        // Card background
gradients.accentGradient // Button gradient

// Typography
typography.fontSerif    // "Noto Serif"
typography.fontSans     // "Noto Sans"
typography.sizes.lg     // 16px

// Spacing
spacing[8]              // 8px
spacing[24]             // 24px

// Border Radius
borderRadius.xl         // 25px
```

## 🔌 Path Aliases

Clean imports throughout the app:

```tsx
// Instead of:
import { Button } from '../../../components/ui/Button';

// Use:
import { Button } from '@/components/ui/Button';
```

### Available Aliases
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@styles/*` → `src/styles/*`
- `@utils/*` → `src/utils/*`
- `@hooks/*` → `src/hooks/*`
- `@services/*` → `src/services/*`
- `@types/*` → `src/types/*`

## 🎨 Styling Approach

### CSS Modules
All components use CSS Modules for scoped styling:

```tsx
import styles from './Component.module.css';

export const Component = () => (
  <div className={styles.container}>
    ...
  </div>
);
```

### Global Styles
Global resets and typography in `src/styles/global.css`:
- Font imports from Google Fonts
- HTML/body resets
- Scrollbar styling

## 🚦 Routing

Currently implemented:
- `/` → PreviewLandingPage (public, static)

Future routes (placeholders):
- `/login` → LoginPage (auth)
- `/signup` → SignupPage (auth)
- `/app/dashboard` → DashboardPage (protected)

## 📱 Responsive Design

Mobile-first approach:
- **Base**: 412px (mobile)
- **Tablet**: 768px
- **Desktop**: 1024px
- **Wide**: 1280px

All components scale gracefully. See CSS media queries in module stylesheets.

## 🔒 TypeScript

Strict mode enabled:
- `strict: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`

All components are fully typed with React.FC<Props> pattern.

## 🧪 Testing (Future)

Test files will be added to `tests/` folder:
- Unit tests for components
- Integration tests for routing
- E2E tests for user flows

```bash
npm run test
```

## 🚀 Build & Deploy

### Production Build

```bash
npm run build
```

Creates optimized bundle in `dist/`:
- Minified JS/CSS
- Manual chunk splitting (vendor, firebase)
- Source maps included

### Preview Production Build

```bash
npm run preview
```

Serves production build locally for testing.

## 🔗 Environment Variables

Create `.env.local` from `.env.example`:

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=xxx
# ... other Firebase config

VITE_APP_NAME=Storyverse
VITE_APP_ENV=development
```

Access in code:

```tsx
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

## ⚠️ Important Notes

1. **No business logic** in UI components
2. **All styles are scoped** via CSS Modules
3. **Design tokens** must be used instead of magic values
4. **TypeScript strict mode** is non-negotiable
5. **Loader** is optional—only show when explicitly needed
6. **Path aliases** must be used for imports

## 📚 Resources

- [Vite Docs](https://vitejs.dev)
- [React 19 Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [React Router v6](https://reactrouter.com)
- [React Helmet](https://github.com/nfl/react-helmet-async)
- [Lottie Web](https://airbnb.io/lottie/web.html)

## 📝 License

MIT © Storyverse Team

## 👥 Contributing

See STORYVERSE_ARCHITECTURE_CONSTITUTION.txt for architectural rules and contributing guidelines.

---

**Last Updated**: December 2025  
**Status**: Ready for development ✅
