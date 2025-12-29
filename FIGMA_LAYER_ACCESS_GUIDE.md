# Figma Design Layer Access Guide

## Quick Summary

Successfully extracted all Figma design layer groups from your design file.

### Key Findings:
- **Total Layers**: 200+
- **Total Groups**: 34
- **Frames**: 7 (Dashboard, Signup, Signin, etc.)
- **Main Focus Group**: `group-header-actions` (5 children)

---

## 🎯 Group-Header-Actions Layer Structure

```
group-header-actions (GROUP - ID: 231:12)
├── border-profile (GROUP)
│   └── Group 24 (Ellipse - profile border)
├── img-profile-user (GROUP)
│   └── Group 24 (Ellipse - profile image)
├── logo-storyverse (VECTOR)
└── btn-inbox-icon (GROUP)
    └── 2 Vector elements (inbox icon)
```

### Layer Details:

| Element | Type | ID | Bounds (x, y, w, h) | Purpose |
|---------|------|----|--------------------|---------|
| group-header-actions | GROUP | 231:12 | (-377, 33.7, 354, 29.6) | Header container |
| border-profile | GROUP | 5:53 | (-52, 34, 29, 29) | Profile avatar border |
| img-profile-user | GROUP | 229:7 | (-52, 34, 29, 29) | Profile image container |
| btn-inbox-icon | GROUP | 5:84 | (-100, 40.1, 22.1, 19.9) | Notification button |

---

## 🛠️ Access Methods

### 1. **Programmatic Access (JavaScript/Node.js)**

```javascript
import FigmaLayerAccessor from './figmaLayerAccessor.mjs';

const accessor = new FigmaLayerAccessor();

// Get header actions group
const headerActions = accessor.getHeaderActionsGroup();
console.log(headerActions);

// Get all groups
const allGroups = accessor.getAllGroups();

// Find by pattern
const iconLayers = accessor.findByPattern('icon');

// Get statistics
const stats = accessor.getStatistics();
```

### 2. **CLI Commands**

```bash
# Show layer statistics
node figmaLayerAccessor.mjs stats

# Show header actions details
node figmaLayerAccessor.mjs header

# List all groups
node figmaLayerAccessor.mjs groups

# Show hierarchy for a specific group
node figmaLayerAccessor.mjs tree group-header-actions

# Find layers matching a pattern
node figmaLayerAccessor.mjs find icon
node figmaLayerAccessor.mjs find "stat"
node figmaLayerAccessor.mjs find "heatmap"
```

### 3. **JSON Data Files**

- **`figma-layers-export.json`** - Complete structured data of all layers
- **`FIGMA_LAYER_GROUPS_REFERENCE.md`** - Human-readable reference guide

---

## 📊 Complete List of Groups in Dashboard

1. **group-header-actions** ⭐ - Header with profile, logo, inbox
2. **section-stats** - Statistics cards (streak, total words)
3. **group-hero-text** - Hero heading and subtitle
4. **icon-comments** - Comment icon with vectors
5. **heatmap-month-group-jan** - January activity dots (31 dots)
6. **heatmap-month-group-feb** - February activity dots (29 dots)
7. **heatmap-month-group-mar** - March activity dots (31 dots)

### Group-33, Group-37, Group-39
- Nested icon groups for various features

---

## 🎨 Component Mapping

### Header Actions Components:
```
✓ border-profile → User avatar border/frame
✓ img-profile-user → User profile image
✓ logo-storyverse → Brand logo vector
✓ btn-inbox-icon → Message/notification button
✓ indicator-unread-inbox → Red dot badge for unread count
```

### Stats Section:
```
✓ card-stat-streak → "5 Days" streak card
  - text-stat-label
  - text-stat-value
  - icon-stat-streak

✓ card-stat-total-words → "4,635" words card
  - text-stat-label
  - text-stat-value
  - icon-stat-total-words
```

### Hero Text:
```
✓ group-hero-text
  - text-hero-title → "Craft the Epic."
  - text-hero-subtitle → "One Scene at a Time."
```

---

## 📋 All Available Groups (34 Total)

| # | Group Name | Children | Use Case |
|---|----------|----------|----------|
| 1 | Mask group | 0 | Landing page masking |
| 2 | Group 33 | 3 | Icon composition |
| 3 | Group 20 | 1 | Icon nesting |
| 4 | Group 39 | 2 | Feature icon |
| 5 | Group 37 | 1 | Nested icon |
| 6 | icon-comments | 0 | Comment icon |
| 7 | heatmap-month-group-jan | 0 | January heatmap |
| 8 | heatmap-month-group-feb | 0 | February heatmap |
| 9 | heatmap-month-group-mar | 0 | March heatmap |
| 10 | section-stats | 2 | Stats container |
| 11 | card-stat-streak | 0 | Streak stat card |
| 12 | card-stat-total-words | 0 | Words stat card |
| 13 | group-hero-text | 0 | Hero heading |
| 14 | **group-header-actions** | 5 | **Header controls** |
| 15+ | border-profile, img-profile-user, etc. | - | Sub-components |

---

## 🚀 Next Steps

### To Use Layer Data:

1. **Extract Specific SVGs** - Export vector icons from the layer IDs
2. **CSS Positioning** - Use bounds data to replicate layout
3. **Component Creation** - Map groups to React components
4. **Style System** - Extract colors, fonts, spacing from layer properties

### Example Implementation:

```tsx
// From group-header-actions
export function HeaderActions() {
  return (
    <header>
      {/* Profile from border-profile + img-profile-user */}
      <div className="profile">
        <img src="/profile.jpg" alt="Profile" />
      </div>
      
      {/* Logo from logo-storyverse */}
      <Logo />
      
      {/* Inbox button from btn-inbox-icon */}
      <button className="inbox-btn">
        <InboxIcon />
        {unreadCount > 0 && <Badge />}
      </button>
    </header>
  );
}
```

---

## 📁 Files Created

1. **`fetch-figma-layers.js`** - Script to fetch layers from Figma API
2. **`figma-layers-export.json`** - Exported layer data (full)
3. **`figmaLayerAccessor.mjs`** - Programmatic access utility
4. **`FIGMA_LAYER_GROUPS_REFERENCE.md`** - Human reference guide
5. **`FIGMA_LAYER_ACCESS_GUIDE.md`** - This file

---

## 💡 Tips

- Use `figmaLayerAccessor.mjs` for programmatic layer access in your build
- Check `figma-layers-export.json` for detailed layer properties
- The bounds data is in absolute coordinates
- Child elements can be nested multiple levels deep
- Some layers don't have bounds (groups without content)

