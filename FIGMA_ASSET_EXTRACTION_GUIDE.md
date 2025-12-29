# Figma Asset Extraction Guide - Storyverse Dashboard

**Design File:** https://www.figma.com/design/zuWEY4gNbhwescluD1WZAC/Preview?node-id=5-51&m=dev

---

## 📁 Asset Directory Structure

```
src/
├── assets/
│   ├── icons/
│   │   ├── logo-icon.svg
│   │   ├── monitor-icon.svg
│   │   ├── notepad-icon.svg
│   │   ├── flame-icon.svg
│   │   ├── home-icon.svg
│   │   ├── folder-icon.svg
│   │   ├── write-icon.svg (or "T" with background)
│   │   ├── people-icon.svg
│   │   ├── trending-icon.svg
│   │   ├── heart-icon.svg
│   │   ├── bookmark-icon.svg
│   │   ├── comment-icon.svg
│   │   ├── share-icon.svg
│   │   ├── eye-icon.svg
│   │   ├── private-lock-icon.svg
│   │   ├── trash-icon.svg
│   │   └── search-icon.svg
│   └── images/
│       ├── profile-avatar.png
│       ├── story-cover-midnight.jpg
│       └── story-cover-midnight@2x.jpg
└── styles/
    └── design-tokens.css
```

---

## 🎯 Header Assets (Node: 5:45-5:90)

### 1. Logo Icon
**Node ID:** 5:60  
**Name:** `logo-icon.svg`  
**Dimensions:** 22.244px × 29.408px  
**Color:** White (#ffffff) with border accent  
**Export Settings:**
- Format: SVG
- Compression: SVG (default)
- Include "stroke" attribute
- Path: `src/assets/icons/logo-icon.svg`

**Usage:**
```tsx
<img 
  src="/assets/icons/logo-icon.svg" 
  alt="Storyverse"
  width="22.244"
  height="29.408"
/>
```

### 2. Monitor/Notification Icon
**Node ID:** 5:84  
**Name:** `monitor-icon.svg`  
**Dimensions:** ~24px × 24px  
**Color:** Gray (#6b7280) with red notification dot overlay  
**Export Settings:**
- Format: SVG
- Remove notification dot (we'll add it dynamically)
- Path: `src/assets/icons/monitor-icon.svg`

**Usage:**
```tsx
<div className="relative">
  <img 
    src="/assets/icons/monitor-icon.svg" 
    alt="Notifications"
    width="24"
    height="24"
  />
  <div className="absolute w-2 h-2 bg-[var(--accent-pink)] rounded-full" 
       style={{ top: '-4px', right: '-4px' }}
  />
</div>
```

### 3. Profile Avatar Image
**Node ID:** 5:55  
**Name:** `profile-avatar.png`  
**Dimensions:** 29px × 29px  
**Format:** PNG with transparency or JPG  
**Export Settings:**
- Resolution: 2x (export at 58px × 58px)
- Include alpha channel
- Path: `src/assets/images/profile-avatar.png`

**Alternative:** Use user initials in gradient circle (current implementation)

---

## 📊 Stats Cards Assets (Node: 5:91-5:110)

### 4. Notepad Icon
**Node ID:** 5:100  
**Name:** `notepad-icon.svg`  
**Dimensions:** ~20px × 20px  
**Color:** Gray (#9ca3af)  
**Export Settings:**
- Format: SVG
- Path: `src/assets/icons/notepad-icon.svg`

**Usage in Stats Card 1:**
```tsx
<img src="/assets/icons/notepad-icon.svg" alt="Words" width="20" height="20" />
```

### 5. Flame Icon
**Node ID:** 5:105  
**Name:** `flame-icon.svg`  
**Dimensions:** ~20px × 20px  
**Color:** Orange (#fb923c)  
**Export Settings:**
- Format: SVG
- Path: `src/assets/icons/flame-icon.svg`

**Usage in Stats Card 2:**
```tsx
<img src="/assets/icons/flame-icon.svg" alt="Streak" width="20" height="20" />
```

---

## 🗓️ Heatmap Assets (Node: 5:115-5:210)

### Critical: Calendar Heatmap Structure

**Overall Container:**
- Width: 358px
- Height: 169px
- Grid Type: Calendar grid (7 rows × 31 columns max)

**Month Sections:**
1. **January (5 weeks = 35 days max)**
   - Columns: ~95px
   - Rows: 7 (Sun-Sat)
   - Grid Position: Left section

2. **February (4 weeks = 28/29 days)**
   - Columns: ~95px
   - Rows: 7 (Sun-Sat)
   - Grid Position: Middle section

3. **March (5 weeks = 35 days max)**
   - Columns: ~95px
   - Rows: 7 (Sun-Sat)
   - Grid Position: Right section

**Dot Specifications:**
- **Inactive dot:** #2a2a2a (dark gray)
- **Active dot:** #ffffff (white)
- **Size:** 5px diameter
- **Gap:** 5px between dots
- **Border Radius:** 50% (circular)

**No Figma Assets Needed:** Heatmap is generated programmatically with CSS custom properties

---

## 🔄 Activity Feed Icons (Node: 5:220-5:240)

### 6. Flame Icon (Activity)
Already extracted (see #5)

### 7. People Icon
**Node ID:** 5:230  
**Name:** `people-icon.svg`  
**Dimensions:** ~20px × 20px  
**Color:** Gray (#6b7280)  
**Export Settings:**
- Format: SVG
- Path: `src/assets/icons/people-icon.svg`

---

## 📖 Story Card Assets (Node: 5:250-5:320)

### 8. Story Cover Image
**Node ID:** 5:280  
**Name:** `story-cover-midnight.jpg`  
**Dimensions:** 83.452px × 148px  
**Format:** JPG or WebP  
**Export Settings:**
- Resolution: 2x (export at 166.9px × 296px)
- Compression: Optimized for web (85% quality)
- Include both formats: JPG and WebP
- Path: `src/assets/images/story-cover-midnight.jpg`

**Description:** Midnight cityscape with bokeh lights, dark moody atmosphere

**Fallback:** Gradient placeholder if image unavailable

### 9. Engagement Icons (Heart, Bookmark, Comment, Share, Eye)

**Heart Icon**
- **Node ID:** 5:290
- **Name:** `heart-icon.svg`
- **Dimensions:** 16px × 16px
- **Color:** Pink (#ff0084)
- **Path:** `src/assets/icons/heart-icon.svg`

**Bookmark Icon**
- **Node ID:** 5:295
- **Name:** `bookmark-icon.svg`
- **Dimensions:** 12px × 16px
- **Color:** Gray (#6b7280)
- **Path:** `src/assets/icons/bookmark-icon.svg`

**Comment Icon**
- **Node ID:** 5:300
- **Name:** `comment-icon.svg`
- **Dimensions:** 14px × 14px
- **Color:** Gray (#6b7280)
- **Path:** `src/assets/icons/comment-icon.svg`

**Eye Icon**
- **Node ID:** 5:305
- **Name:** `eye-icon.svg`
- **Dimensions:** 16px × 12px
- **Color:** Gray (#6b7280)
- **Path:** `src/assets/icons/eye-icon.svg`

**Share Icon**
- **Node ID:** 5:310
- **Name:** `share-icon.svg`
- **Dimensions:** 14px × 14px
- **Color:** Gray (#6b7280)
- **Path:** `src/assets/icons/share-icon.svg`

### 10. Trash/Delete Icon
**Node ID:** 5:315  
**Name:** `trash-icon.svg`  
**Dimensions:** 12px × 14px  
**Color:** Gray (#6b7280)  
**Path:** `src/assets/icons/trash-icon.svg`

### 11. Private Lock Icon
**Node ID:** 5:325  
**Name:** `private-lock-icon.svg`  
**Dimensions:** 10px × 12px  
**Color:** Gray (#6b7280)  
**Path:** `src/assets/icons/private-lock-icon.svg`

---

## 🧭 Bottom Navigation Icons (Node: 5:330-5:380)

### 12. Home Icon
**Node ID:** 5:335  
**Name:** `home-icon.svg`  
**Dimensions:** 20px × 20px  
**Color:** Gray inactive, white active  
**Path:** `src/assets/icons/home-icon.svg`

### 13. Folder Icon
**Node ID:** 5:340  
**Name:** `folder-icon.svg`  
**Dimensions:** 20px × 20px  
**Color:** Gray inactive, white active  
**Path:** `src/assets/icons/folder-icon.svg`

### 14. Write/Text Icon
**Node ID:** 5:345  
**Name:** `write-icon.svg` or `text-icon.svg`  
**Dimensions:** 20px × 20px  
**Color:** Gray inactive, olive-green (#a5b785) active  
**Special:** Center icon with olive-green background when active  
**Path:** `src/assets/icons/write-icon.svg`

### 15. People/Community Icon
**Node ID:** 5:350  
**Name:** `community-icon.svg`  
**Dimensions:** 20px × 20px  
**Color:** Gray inactive, white active  
**Path:** `src/assets/icons/community-icon.svg`

### 16. Trending Icon
**Node ID:** 5:355  
**Name:** `trending-icon.svg`  
**Dimensions:** 20px × 20px  
**Color:** Gray inactive, white active  
**Path:** `src/assets/icons/trending-icon.svg`

---

## ✅ SVG Export Best Practices

### Standard Settings for All SVGs
```
1. Format: SVG (not PNG)
2. Dimensions: Export at actual size (no scaling)
3. Compression: Default SVG compression enabled
4. Include: All strokes, fills, groups
5. Exclude: Comments, metadata
6. Naming: kebab-case (icon-name.svg)
```

### SVG Optimization (After Export)
```bash
# Install svgo globally
npm install -g svgo

# Optimize all SVGs
svgo src/assets/icons/*.svg --multipass

# Output will remove:
# - Unnecessary metadata
# - Unnecessary groups
# - Unused attributes
# - Decimal precision beyond needed
```

---

## 🎨 Color References in SVGs

When exporting SVGs, ensure colors are one of these:

```
- White: #ffffff
- Gray: #6b7280, #8c8b91, #9ca3af
- Olive Green: #a5b785
- Pink: #ff0084
- Orange: #fb923c
- Teal: #10b981
- Dark Gray: #2a2a2a
```

---

## 📦 Export Manifest

| # | Asset | Node ID | Type | Size | Format | Path |
|---|-------|---------|------|------|--------|------|
| 1 | Logo Icon | 5:60 | SVG | 22.244×29.408px | SVG | `icons/logo-icon.svg` |
| 2 | Monitor Icon | 5:84 | SVG | 24×24px | SVG | `icons/monitor-icon.svg` |
| 3 | Profile Avatar | 5:55 | Image | 29×29px | PNG 2x | `images/profile-avatar.png` |
| 4 | Notepad Icon | 5:100 | SVG | 20×20px | SVG | `icons/notepad-icon.svg` |
| 5 | Flame Icon | 5:105 | SVG | 20×20px | SVG | `icons/flame-icon.svg` |
| 6 | People Icon | 5:230 | SVG | 20×20px | SVG | `icons/people-icon.svg` |
| 7 | Story Cover | 5:280 | Image | 83.452×148px | JPG 2x + WebP | `images/story-cover-midnight.jpg` |
| 8 | Heart Icon | 5:290 | SVG | 16×16px | SVG | `icons/heart-icon.svg` |
| 9 | Bookmark Icon | 5:295 | SVG | 12×16px | SVG | `icons/bookmark-icon.svg` |
| 10 | Comment Icon | 5:300 | SVG | 14×14px | SVG | `icons/comment-icon.svg` |
| 11 | Eye Icon | 5:305 | SVG | 16×12px | SVG | `icons/eye-icon.svg` |
| 12 | Share Icon | 5:310 | SVG | 14×14px | SVG | `icons/share-icon.svg` |
| 13 | Trash Icon | 5:315 | SVG | 12×14px | SVG | `icons/trash-icon.svg` |
| 14 | Lock Icon | 5:325 | SVG | 10×12px | SVG | `icons/private-lock-icon.svg` |
| 15 | Home Icon | 5:335 | SVG | 20×20px | SVG | `icons/home-icon.svg` |
| 16 | Folder Icon | 5:340 | SVG | 20×20px | SVG | `icons/folder-icon.svg` |
| 17 | Write Icon | 5:345 | SVG | 20×20px | SVG | `icons/write-icon.svg` |
| 18 | Community Icon | 5:350 | SVG | 20×20px | SVG | `icons/community-icon.svg` |
| 19 | Trending Icon | 5:355 | SVG | 20×20px | SVG | `icons/trending-icon.svg` |

---

## 🛠️ Import in Components

### Example: Header with Real Assets
```tsx
import logoIcon from '@/assets/icons/logo-icon.svg';
import monitorIcon from '@/assets/icons/monitor-icon.svg';
import profileAvatar from '@/assets/images/profile-avatar.png';

export function Header() {
  return (
    <header>
      <img src={logoIcon} alt="Storyverse" />
      <img src={monitorIcon} alt="Notifications" />
      <img src={profileAvatar} alt="Profile" />
    </header>
  );
}
```

### Example: Stats Cards with Icons
```tsx
import notepadIcon from '@/assets/icons/notepad-icon.svg';
import flameIcon from '@/assets/icons/flame-icon.svg';

export function StatsCards() {
  return (
    <>
      <Card>
        <img src={notepadIcon} alt="Words" />
        <span>4,635</span>
      </Card>
      <Card>
        <img src={flameIcon} alt="Streak" />
        <span>5 Days</span>
      </Card>
    </>
  );
}
```

---

## 📋 Extraction Checklist

### Before Exporting
- [ ] Open Figma design file
- [ ] Enable "Dev Mode"
- [ ] Navigate to node ID: 5-51 (Dashboard root)
- [ ] Create `src/assets/icons/` folder
- [ ] Create `src/assets/images/` folder

### SVG Extraction
- [ ] Right-click icon component
- [ ] Select "Export" → SVG
- [ ] Set filename to kebab-case
- [ ] Enable SVG compression
- [ ] Save to `src/assets/icons/`

### Image Extraction
- [ ] Right-click image component
- [ ] Select "Export" → PNG/JPG
- [ ] Set 2x resolution
- [ ] Save to `src/assets/images/`

### Post-Processing
- [ ] Run SVGO optimization on all SVGs
- [ ] Compress images with ImageOptim or similar
- [ ] Verify all file sizes are under 50KB
- [ ] Test all imports in components

---

## 🔧 Vite Configuration for Assets

Add to `vite.config.ts`:

```typescript
export default defineConfig({
  assetsInclude: ['**/*.svg', '**/*.webp'],
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1];
          if (/png|jpe?g|gif|svg/.test(extType)) {
            return `assets/images/[name][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/.test(extType)) {
            return `assets/fonts/[name][extname]`;
          }
          return `assets/[name][extname]`;
        },
      },
    },
  },
});
```

---

## 📝 Notes

- **Heatmap:** Don't export dots from Figma - generate with React/CSS
- **Profile Avatar:** Can use Figma image or generate from user initials
- **Story Cover:** Essential asset - high quality image with dark tones
- **Icons:** All SVGs should be simple, clean, and scalable
- **Colors:** Maintain exact hex values from design tokens

---

**Last Updated:** December 28, 2025  
**Status:** Ready for Export
