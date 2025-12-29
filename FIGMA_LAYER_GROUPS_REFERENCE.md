# Figma Design Layer Groups - Complete Reference

## File Information
- **File Name**: Preview
- **File ID**: zuWEY4gNbhwescluD1WZAC
- **Pages**: 1 (Page 1)
- **Last Updated**: As of latest fetch

---

## Design Frames Overview

### 1. **Preview landing page** (FRAME)
Location: `x: 69, y: 0, width: 412, height: 917`
- Contains: Landing page design with gradient background
- Key Element: Mask group

### 2. **Dashboard** (FRAME) ⭐
Location: `x: 0, y: 0`
- **Contains the main dashboard layout with multiple component groups**
- Key Groups:
  - `group-header-actions` (THE HEADER ACTIONS GROUP)
  - `section-stats`
  - `group-hero-text`
  - `heatmap-month-group-jan`
  - `heatmap-month-group-feb`
  - `heatmap-month-group-mar`
  - And many individual components for story cards, activity, etc.

### 3. **Signup** (FRAME)
- Authentication signup screen design
- Contains form elements and branding

### 4. **Signin** (FRAME)
- Authentication signin screen design
- Contains login form elements

### 5. **Forgot password** (FRAME)
- Password recovery screen design

### 6. **OTP Verification** (FRAME)
- OTP input and verification screen

### 7. **Loader animation** (FRAME)
- Loading state animation design

---

## 🎯 GROUP-HEADER-ACTIONS (Main Focus)

**Location**: Inside the Dashboard frame
**Type**: GROUP
**Structure**:

```
📁 group-header-actions (GROUP)
  ├── 📁 border-profile (GROUP)
  │   └── 📁 Group 24 (GROUP)
  │       └── 🟣 Ellipse 1 (ELLIPSE)
  ├── 📁 img-profile-user (GROUP)
  │   └── 📁 Group 24 (GROUP)
  │       └── 🟣 Ellipse 1 (ELLIPSE)
  ├── 🔷 logo-storyverse (VECTOR)
  ├── 📁 btn-inbox-icon (GROUP)
  │   ├── 🔷 Vector (VECTOR)
  │   └── 🔷 Vector (VECTOR)
  └── 🟣 indicator-unread-inbox (ELLIPSE)
```

### Component Breakdown:

#### **border-profile**
- Type: GROUP
- Contains circular ellipse element (profile border)

#### **img-profile-user**
- Type: GROUP
- Contains circular profile image (nested group with ellipse)

#### **logo-storyverse**
- Type: VECTOR
- The Storyverse logo mark

#### **btn-inbox-icon**
- Type: GROUP
- Contains inbox/message icon (composed of 2 vectors)
- This is an interactive button element

#### **indicator-unread-inbox**
- Type: ELLIPSE
- Visual indicator for unread messages (dot/badge)

---

## 📊 Other Important Group Structures

### **section-stats**
```
📁 section-stats
  ├── 📁 card-stat-streak
  │   ├── card-days (RECTANGLE)
  │   ├── text-stat-label (TEXT)
  │   ├── text-stat-value (TEXT)
  │   └── icon-stat-streak (VECTOR)
  └── 📁 card-stat-total-words
      ├── card-words (RECTANGLE)
      ├── text-stat-label (TEXT)
      ├── text-stat-value (TEXT)
      └── icon-stat-total-words (VECTOR)
```

### **group-hero-text**
```
📁 group-hero-text
  ├── text-hero-subtitle (TEXT)
  └── text-hero-title (TEXT)
```

### **Heatmap Groups** (3 months)
- `heatmap-month-group-jan` (31 dot elements)
- `heatmap-month-group-feb` (29 dot elements)
- `heatmap-month-group-mar` (31 dot elements)

Each contains multiple `heatmap-dot-active` and `heatmap-dot-inactive` elements.

---

## 📋 Full Layer Count Summary

| Type | Count | Notes |
|------|-------|-------|
| FRAME | 7 | Dashboard, Signup, Signin, etc. |
| GROUP | 36+ | Major component groupings |
| VECTOR | 20+ | Icons and logo elements |
| TEXT | 40+ | Typography throughout |
| RECTANGLE | 20+ | Cards and backgrounds |
| ELLIPSE | 60+ | Dots, circles, avatars |
| BOOLEAN_OPERATION | 4 | Complex shapes |

---

## 🚀 Usage Guide

### For Implementation:
1. **group-header-actions** contains:
   - User profile display (profile image + border)
   - Logo branding
   - Inbox/notification button
   - Unread indicator badge

2. **Location**: Top of Dashboard frame (header area)

3. **Components to implement**:
   - Profile avatar image
   - Notification/message button
   - Unread count indicator
   - Profile menu (if interactive)

### CSS/Styling Hints:
- Circular elements use border-radius
- Icons use vectors (SVG)
- Badges/indicators use small ellipses
- Header appears to be horizontal flex layout

---

## 📁 Export Files

- **Main Export**: `figma-layers-export.json` - Full structured data
- **This Document**: Complete reference for all layer groups
- **Design URL**: https://www.figma.com/design/zuWEY4gNbhwescluD1WZAC/Preview

