# Storyverse Dashboard - Quick Reference Guide

## 📁 Files Location
- **Component:** `src/pages/app/DashboardPageNew.tsx`
- **Styles:** `src/pages/app/DashboardPageNew.module.css`
- **Implementation Guide:** `STORYVERSE_DASHBOARD_IMPLEMENTATION.md`

## 🎯 Component Structure

```
DashboardPageNew (Main Container)
├── Header (92px)
│   ├── Logo + Brand Text
│   ├── Notification Icon
│   └── Profile Avatar
├── Hero Section
│   └── "Craft the Epic. One Scene at a Time."
├── Stats Cards (2-column grid)
│   ├── Total Words: 4,635
│   └── Streak: 5 Days
├── Activity Heatmap
│   ├── Month Labels
│   ├── Dot Grid (7×3)
│   └── Activity Summary
├── Recent Activity Feed
│   ├── Activity Item 1 (🔥)
│   └── Activity Item 2 (👥)
├── Featured Story Card
│   ├── Cover Image (left)
│   ├── Story Details (middle)
│   ├── Accent Bar (right)
│   └── Heart Icon
└── Bottom Navigation (fixed)
    ├── Home 🏠
    ├── Folders 📁
    ├── Write ✍️ (active)
    ├── Community 👥
    └── Trending 🔥
```

## 🎨 Key CSS Classes

### Layout
- `.container` - Main 412px fixed-width container
- `.mainContent` - Scrollable main area with 80px bottom margin
- `.headerSection` - Header with border-bottom
- `.statsSection` - Grid layout for stat cards
- `.heatmapSection` - Card with heatmap
- `.activitySection` - Recent activity feed
- `.storyCard` - Featured story card
- `.bottomNav` - Fixed bottom navigation

### States
- `.active` - Applied to active nav button
- `.heatmapCell.active` - Applied to active heatmap dots
- `:hover` - Hover effects on interactive elements

## 🔧 CSS Variables (Complete Palette)

```css
/* Background */
--bg-primary: #0d0d0f

/* Cards */
--card-gradient: linear-gradient(136.197deg, rgb(43, 42, 48) 11.765%, rgb(35, 34, 39) 94.577%)
--card-border: #302d2d

/* Text */
--text-primary: #ffffff
--text-muted: #8c8b91
--text-accent-green: #a5b785

/* Navigation */
--nav-bg: #000000
--nav-icon-active-dot: #10b981

/* Fonts */
--font-primary: 'Noto Sans'
--font-serif: 'Noto Serif'
```

## 📊 Exact Measurements

### Fixed Dimensions
- **Container:** 412px width × 100vh height (mobile)
- **Header:** 412px × 92px
- **Hero:** Full width (27px padding)
- **Stats Cards:** 169px × 73px each (2 per row)
- **Heatmap:** 358px × 169px
- **Activity Feed:** 358px height variable
- **Story Card:** 358px × 150px
- **Bottom Nav:** 325px × 51px (fixed at bottom-19px)

### Padding/Margins
- **Header:** 34px top, 27px left/right
- **Hero:** 0 top/bottom, 27px left/right
- **Stats:** 0 top/bottom, 27px left/right, 20px gap
- **Cards:** 20px padding inside
- **Bottom Nav:** 19px from bottom, centered

## 🎯 Active Navigation State

```typescript
// Default active button is Write (index 2)
const [activeNav, setActiveNav] = useState(2);

// Renders with:
className={`${styles.navButton} ${activeNav === 2 ? styles.active : ''}`}

// Active button shows:
// - Olive-green background (#a5b785)
// - Two green dots below (6px each)
// - Positioned at bottom: -8px
```

## 🔄 Component State Management

```typescript
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [activeNav, setActiveNav] = useState(2); // Write is active
```

## 📦 Dependencies

- React (useState, useEffect)
- React Router (useNavigate)
- Firebase Auth (getCurrentUser, signOut)
- CSS Module (DashboardPageNew.module.css)

## 🚀 Usage

```tsx
import DashboardPageNew from '@/pages/app/DashboardPageNew';

// Use as:
<DashboardPageNew />

// Or from barrel export:
import { DashboardPage } from '@/pages/app/DashboardPageNew';
```

## 🎨 Typography Reference

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Brand Name | Noto Serif | 18px | 800 | #ffffff |
| Tagline | Noto Serif | 11px | 400 | #ffffff |
| Hero Text | Noto Serif | 22px | 900 | varies |
| Stat Value | Noto Sans | 25px | 400 | #ffffff |
| Stat Label | Noto Sans | 12px | 300 | #8c8b91 |
| Card Title | Noto Sans | 12px | 300 | #ffffff |
| Badges | Noto Sans | 8px | 400 | #8c8b91 |

## 🎯 Color Codes Quick Reference

| Purpose | Hex/RGB | Use Case |
|---------|---------|----------|
| Background | #0d0d0f | Page bg |
| Card Gradient | 136.197deg | Primary cards |
| Border | #302d2d | Card borders |
| Text Primary | #ffffff | Main text |
| Text Muted | #8c8b91 | Labels, secondary |
| Accent Green | #a5b785 | Highlights, nav active |
| Accent Pink | #ff0084 | Heart icon |
| Nav Background | #000000 | Bottom nav |
| Nav Active Dot | #10b981 | Active indicator |

## 🔍 Common Customizations

### Change Active Nav Button
```typescript
setActiveNav(0); // Change to Home
setActiveNav(1); // Change to Folders
setActiveNav(3); // Change to Community
setActiveNav(4); // Change to Trending
```

### Update Card Gradient
Modify CSS variables in `:root`:
```css
--card-gradient: linear-gradient(135deg, #color1 10%, #color2 90%);
```

### Adjust Heatmap Cells
Modify `grid-template-columns` in `.heatmapGrid`:
```css
grid-template-columns: repeat(7, 1fr); /* 7 columns = 7 days */
```

### Change Font Family
Update CSS variables:
```css
--font-primary: 'Your Font Name', sans-serif;
--font-serif: 'Your Serif Font', serif;
```

## ✅ Testing Checklist

- [ ] Header displays correctly with user initial
- [ ] Hero text shows with green accent
- [ ] Stats cards display side-by-side
- [ ] Heatmap renders with random active dots
- [ ] Story card shows all details
- [ ] Bottom nav highlights active button with green dots
- [ ] Logout functionality works
- [ ] Scrolling works smoothly
- [ ] Mobile viewport looks correct at 412px
- [ ] All colors match Figma design

## 📞 Support

For detailed implementation information, see:
- `STORYVERSE_DASHBOARD_IMPLEMENTATION.md` - Full guide
- `DashboardPageNew.tsx` - Component code with comments
- `DashboardPageNew.module.css` - All styling with variables

---

**Version:** 1.0  
**Last Updated:** December 28, 2025  
**Status:** Production Ready ✅
