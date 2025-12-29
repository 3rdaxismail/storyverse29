# Dashboard Figma Components - Complete Reference

**File:** Dashboard 29 12 25  
**Frame ID:** 5:51  
**Size:** 412 × 917px  
**Total Components:** 177  
**Exported:** December 28, 2025

---

## 📊 Component Breakdown by Type

### 🎨 Card Components (7)
Cards for displaying grouped information:

| Component | Type | Purpose |
|-----------|------|---------|
| `card-calendar-activity` | RECTANGLE | Calendar/activity card container |
| `card-recent-activity` | RECTANGLE | Recent activity section |
| `card-story-preview` | RECTANGLE | Story preview/listing card |
| `card-stat-streak` | GROUP | Streak statistics card |
| `card-stat-total-words` | GROUP | Word count statistics card |
| `card-days` | RECTANGLE | Day counter card |
| `card-words` | RECTANGLE | Words written counter card |

### 📝 Text Elements (26)
Text components for various sections:

**Activity Section:**
- `text-activity-title` - Activity section heading
- `text-activity-summary` - Activity description

**Story Metadata:**
- `text-story-title` - Story name
- `text-story-genre` - Genre classification
- `text-story-excerpt` - Story preview text
- `text-age-rating` - Age rating display

**Story Stats:**
- `text-like-count` - Number of likes
- `text-privacy-status` - Public/private indicator
- `text-word-count` - Total words written
- `text-chapter-count` - Number of chapters
- `text-location-count` - World locations
- `text-character-count` - Character count
- `text-dialogue-count` - Dialogue count
- `text-reading-time` - Estimated reading time

**Forum/Trending:**
- `text-trending-stories` - Trending section title
- `text-forum-messege` - Forum activity

**Stats Cards:**
- `text-stat-label` (×2) - Stat label
- `text-stat-value` (×2) - Stat value

**Heatmap:**
- `heatmap-month-jan/feb/mar` - Month labels

**Hero Section:**
- `text-hero-title` - Main title
- `text-hero-subtitle` - Subtitle text

### 🖼️ Icons (12+)
Icon vectors for actions and information:

| Icon | Type | Purpose |
|------|------|---------|
| `icon-activity-trends` | VECTOR | Trending indicator |
| `icon-activity-forum` | BOOLEAN_OPERATION | Forum/discussion |
| `icon-likes` | VECTOR | Like/heart action |
| `icon-privacy` | VECTOR | Privacy toggle |
| `icon-chapters` | VECTOR | Chapters counter |
| `icon-locations` | VECTOR | World locations |
| `icon-characters` | VECTOR | Character count |
| `icon-dialogues` | VECTOR | Dialogue count |
| `icon-age-group` | VECTOR | Age rating |
| `btn-delete-story` | VECTOR | Delete action |
| `icon-stat-streak` | VECTOR | Streak indicator |
| `icon-stat-total-words` | VECTOR | Words icon |
| `icon-comments` | GROUP | Comment discussion icon |

### 👤 Profile & Header Components (5)

**Profile Section:**
- `border-profile` (GROUP) - Profile border/container
- `img-profile-user` (GROUP) - User profile image
- `img-story-cover` (RECTANGLE) - Story cover image

**Header:**
- `group-header-actions` (GROUP) - **[EXTRACTED]** Top navigation with search, create, settings
- `btn-inbox-icon` (GROUP) - Inbox button with notifications

### 📊 Stats Section (21)

**Groups:**
- `section-stats` (GROUP) - Stats container
- `card-stat-streak` (GROUP) - Writing streak card
- `card-stat-total-words` (GROUP) - Total words card
- `heatmap-month-group-jan/feb/mar` (GROUP) - Heatmap month containers

**Other:**
- `heatmap-dot-active` - Active heatmap indicator
- Zone indicators and rectangle containers

### 🎯 Featured Components - Ready for Extraction

**✅ Already Extracted:**
- `group-header-actions` - Header with actions (EXTRACTED)
- `logo-storyverse` - Storyverse logo (EXTRACTED)
- `btn-inbox-icon` - Inbox button (EXTRACTED)

**🔄 Priority for Next Extraction:**
1. **`section-stats`** (GROUP) - Statistics dashboard container
   - Contains: streak card, word count card, heatmap section
   - Key for dashboard visualization

2. **`card-story-preview`** (RECTANGLE) - Story listing item
   - Contains: cover image, title, metadata, actions
   - Used for story feeds

3. **`card-calendar-activity`** (RECTANGLE) - Activity/calendar container
   - Shows writing activity over time

4. **`img-profile-user`** (GROUP) - Profile avatar section
   - User identification and picture

5. **`icon-comments`** (GROUP) - Discussion/comment icon
   - Forum interaction indicator

---

## 📐 Component Structure Map

```
Dashboard (412 × 917px)
├── group-header-actions ✅
│   ├── Profile avatar
│   ├── Logo
│   ├── Inbox button
│   └── Settings menu
│
├── section-stats 🔄
│   ├── card-stat-streak
│   │   ├── icon-stat-streak
│   │   └── text-stat-value
│   ├── card-stat-total-words
│   │   ├── icon-stat-total-words
│   │   └── text-stat-value
│   └── heatmap (calendar activity)
│
├── card-recent-activity
│   ├── icon-activity-trends
│   ├── text-trending-stories
│   ├── icon-activity-forum
│   └── text-forum-messege
│
├── card-story-preview (multiple)
│   ├── img-story-cover
│   ├── text-story-title
│   ├── text-story-genre
│   ├── text-age-rating
│   ├── text-word-count
│   ├── text-chapter-count
│   ├── text-character-count
│   ├── text-location-count
│   ├── text-dialogue-count
│   ├── text-like-count
│   ├── text-privacy-status
│   ├── text-reading-time
│   └── btn-delete-story
│
└── card-calendar-activity
    ├── text-activity-title
    └── heatmap-dots
```

---

## 🎨 Component Categories for Development

### Layout Sections
- Header Navigation
- Statistics Dashboard
- Story Feeds/Listings
- Activity Calendar
- Recent Activity Panel

### Data-Driven Components
- Story Cards (repeating)
- Heatmap Grid (97 ellipses for calendar)
- Activity Feed Items
- Stat Cards with values

### User Interactions
- Story preview/expand
- Story delete
- Inbox notifications
- Profile menu
- Settings access
- Like/comment actions

---

## 💡 Recommended Implementation Order

1. **Phase 1** (Complete): Header with search/create/settings
   - ✅ `group-header-actions`

2. **Phase 2** (Next): Statistics Dashboard
   - 🔄 `section-stats` with streak + word count + heatmap
   
3. **Phase 3**: Story Preview Cards
   - 🔄 `card-story-preview` (repeatable component)
   
4. **Phase 4**: Activity Sections
   - 🔄 `card-recent-activity`
   - 🔄 `card-calendar-activity`

5. **Phase 5**: Profile & User Components
   - 🔄 `img-profile-user`
   - 🔄 Enhanced profile menu integration

---

## 📁 Extracted Assets Reference

| Asset | File | Dimensions | Type |
|-------|------|-----------|------|
| Logo | `logo-storyverse.svg` | 19×15px | SVG |
| Inbox Icon | `btn-inbox-icon.svg` | 23×20px | SVG |
| Unread Badge | `indicator-unread-template.svg` | - | SVG Template |

**Location:** `src/assets/icons/figma/`  
**Index:** `src/assets/icons/figma/index.ts`

---

## 🔗 Data Source

- **Figma File:** Preview (Dashboard 29 12 25)
- **Extraction Date:** December 28, 2025
- **Total Dashboard Components:** 177
- **API Reference:** Figma REST API v1
- **Export Format:** dashboard-components-detailed.json

