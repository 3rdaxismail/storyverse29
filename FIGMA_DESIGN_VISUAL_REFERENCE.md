# Figma Design - Visual Layer Structure Reference

## Dashboard Frame - Complete Hierarchy

```
📦 DASHBOARD (FRAME - 412×917px)
│
├─ 🎯 group-header-actions (HEADER)
│  ├─ border-profile (Profile border circle)
│  │  └─ Group 24 (29×29px ellipse)
│  │
│  ├─ img-profile-user (Profile image)
│  │  └─ Group 24 (29×29px container)
│  │
│  ├─ logo-storyverse (Brand logo)
│  │
│  ├─ btn-inbox-icon (Notification button)
│  │  ├─ Vector (Icon part 1)
│  │  └─ Vector (Icon part 2)
│  │
│  └─ indicator-unread-inbox (Badge dot)
│
├─ 📁 group-hero-text (HERO SECTION)
│  ├─ text-hero-title ("Craft the Epic.")
│  └─ text-hero-subtitle ("One Scene at a Time.")
│
├─ 📊 section-stats (STATS ROW)
│  ├─ card-stat-streak (5 Days)
│  │  ├─ card-days (BG Rectangle)
│  │  ├─ text-stat-label ("Streak")
│  │  ├─ text-stat-value ("5 Days")
│  │  └─ icon-stat-streak (Icon)
│  │
│  └─ card-stat-total-words (4,635)
│     ├─ card-words (BG Rectangle)
│     ├─ text-stat-label ("Total words")
│     ├─ text-stat-value ("4,635")
│     └─ icon-stat-total-words (Icon)
│
├─ 📈 heatmap-month-group-jan (JANUARY DOTS)
│  ├─ heatmap-dot-active (●)
│  ├─ heatmap-dot-inactive (○)
│  ├─ heatmap-dot-active (●)
│  ... (31 total dots for January)
│
├─ 📈 heatmap-month-group-feb (FEBRUARY DOTS)
│  ├─ heatmap-dot-inactive (○)
│  ├─ heatmap-dot-active (●)
│  ... (29 total dots for February)
│
├─ 📈 heatmap-month-group-mar (MARCH DOTS)
│  ├─ heatmap-dot-active (●)
│  ├─ heatmap-dot-inactive (○)
│  ... (31 total dots for March)
│
├─ 📝 ACTIVITY SECTION (TEXT ELEMENTS)
│  ├─ text-activity-title
│  ├─ text-activity-summary
│  ├─ heatmap-month-jan
│  ├─ heatmap-month-feb
│  └─ heatmap-month-mar
│
├─ 🎨 card-calendar-activity (BG Card)
├─ 🎨 card-recent-activity (BG Card)
│
├─ 🎯 ICON COMPOSITIONS
│  ├─ Group 33 (Icon container)
│  │  ├─ Group 21
│  │  ├─ Group 20
│  │  │  └─ Group 16
│  │  └─ Vector elements
│  │
│  └─ icon-activity-trends (Trending icon)
│
├─ 💬 icon-comments (Comments icon)
│  ├─ Vector (Icon part 1)
│  └─ Vector (Icon part 2)
│
├─ 📖 STORY CARD SECTION
│  ├─ card-story-preview (BG Rectangle)
│  ├─ img-story-cover (Story image)
│  ├─ text-story-title ("Midnight Reflections")
│  ├─ text-story-excerpt (Description)
│  ├─ text-word-count ("4,635 words")
│  ├─ text-reading-time (Estimate)
│  ├─ text-chapter-count (Chapters)
│  ├─ text-story-genre (Category)
│  ├─ text-age-rating (Rating)
│  ├─ text-privacy-status (Private/Public)
│  ├─ text-like-count (Likes)
│  │
│  ├─ 📍 STORY METADATA ICONS
│  │  ├─ icon-characters
│  │  ├─ icon-locations
│  │  ├─ icon-dialogues
│  │  ├─ icon-chapters
│  │  ├─ icon-privacy
│  │  └─ icon-age-group
│  │
│  ├─ zone-danger-action (Delete zone)
│  ├─ btn-delete-story (Delete button)
│  │
│  └─ indicator-unread-story-comments (Badge)
│
└─ 🔗 DIVIDER
   └─ Divider line
```

---

## Component Layout (Pixel Coordinates)

```
┌─────────────────────────────────────────┐
│  group-header-actions (Header Bar)      │ y: 33.7px
│  ├─ Logo (left)                         │
│  ├─ [SPACE]                             │
│  └─ Profile • Inbox (right)             │
│                                         │
│  ⌀────────────────────────────────────  │ Divider
│                                         │
│  📋 group-hero-text                     │
│  Craft the Epic.                        │
│  One Scene at a Time.                   │
│                                         │
│  ┌─────────────┬─────────────┐         │
│  │ 📊 5 Days   │ 📊 4,635    │         │ section-stats
│  │ Streak      │ Total words │         │
│  └─────────────┴─────────────┘         │
│                                         │
│  📈 Recent Activity                     │
│  Jan  Feb  Mar                          │
│  ●○●●○●  ○○●○●  ●○○●○○ ...            │ heatmap groups
│                                         │
│  ┌──────────────────────────────┐      │
│  │ ☐ Midnight Reflections       │      │
│  │ A collection of late-night.. │      │ card-story-preview
│  │ 4,635 words • 10 min read    │      │
│  └──────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Group-Header-Actions Detailed View

```
group-header-actions (354px × 29.6px)
Position: x-377, y: 33.7

Left Section:          Center Section:        Right Section:
┌────────────────────┬─────────────────┬──────────────────┐
│ S (logo)           │ [SPACE - FLEX]  │ 💬 + ⊙           │
│ Storyverse         │                 │ Inbox + Badge    │
│ Your words matter  │                 │                  │
└────────────────────┴─────────────────┴──────────────────┘
    ▲                                          ▲
    │                                          │
  border-profile                           btn-inbox-icon
  img-profile-user                         indicator-unread
```

---

## CSS Grid Layout (Recommended)

```css
.group-header-actions {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  height: 29.6px;
  width: 354px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.border-profile,
.img-profile-user {
  width: 29px;
  height: 29px;
  border-radius: 50%;
}

.btn-inbox-icon {
  position: relative;
  width: 22px;
  height: 19.9px;
}

.indicator-unread-inbox {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4444;
}
```

---

## Responsive Design Notes

- **Header Height**: 29.6px (very compact)
- **Profile Circle**: 29×29px (consistent sizing)
- **Inbox Button**: 22.1×19.9px (icon size)
- **Total Width**: 354px (sidebar + actions)
- **Spacing**: 12px gaps between sections

### Breakpoints:
- Mobile: Stack vertically
- Tablet: Horizontal with reduced spacing
- Desktop: Full layout as designed

---

## Color & Style Hints

### Suggested Color Mapping:
```
Logo: Green accent (#9dbb7d from Storyverse palette)
Background: Dark theme (#0D0D0F)
Border/Profile: Light gray (#444 or similar)
Unread Badge: Bright red (#ff4444)
Icons: Light gray/white (#eaeaea)
```

### Font Sizes (inferred):
- Logo Text: ~12px
- Header Text: ~14px-16px
- Tagline: ~12px (opacity 0.7)

---

## Layer Depth & Z-Index

```
z-index layers (top to bottom):
5: indicator-unread-inbox (badge)
4: btn-inbox-icon (button)
3: border-profile (border ring)
2: img-profile-user (image)
1: logo-storyverse (logo)
0: background
```

---

## File References

- **Full Data**: `figma-layers-export.json`
- **CLI Access**: `figmaLayerAccessor.mjs`
- **React Hooks**: `src/hooks/useFigmaLayer.ts`
- **Current Impl**: `src/components/ui/GroupHeaderActions.tsx`

---

## Implementation Checklist

- [x] Extract layer structure
- [x] Map groups to components
- [x] Create React component
- [x] Add to header
- [ ] Implement functionality (search, create, settings)
- [ ] Add responsive behavior
- [ ] Connect profile menu
- [ ] Implement notifications
- [ ] Style with Figma design specs

