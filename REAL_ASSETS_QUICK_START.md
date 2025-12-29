# Quick Start Guide - Real Assets Dashboard

## 🎯 What's New

Your Storyverse Dashboard now uses:
- **15 SVG icons** instead of emoji (profes sional appearance)
- **ActivityHeatmap component** with exact calendar grid (Jan/Feb/Mar)
- **Real image imports** for profile avatars and story covers

---

## 📦 Using the ActivityHeatmap Component

### Basic Usage
```tsx
import ActivityHeatmap from '@/components/ActivityHeatmap';

export function Dashboard() {
  return (
    <ActivityHeatmap 
      year={2025}
      months={[0, 1, 2]} // January, February, March
    />
  );
}
```

### With Real Activity Data
```tsx
const activityData = {
  '2025-01-15': 5,  // High activity (white dot)
  '2025-01-16': 3,  // Medium activity (olive green)
  '2025-02-20': 4,  // Medium-high activity
  '2025-03-05': 1,  // Low activity
};

<ActivityHeatmap 
  data={activityData}
  year={2025}
  months={[0, 1, 2]}
/>
```

### Props Reference
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `HeatmapData` | `{}` | Map of dates to activity levels (0-5) |
| `year` | `number` | `new Date().getFullYear()` | Year for calendar |
| `months` | `number[]` | `[0, 1, 2]` | Month indices (0=Jan, 11=Dec) |
| `className` | `string` | `''` | Additional CSS classes |

---

## 🎨 Icon Usage Examples

### Header Icons
```tsx
import logoIcon from '@/assets/icons/logo-icon.svg';
import monitorIcon from '@/assets/icons/monitor-icon.svg';

<img src={logoIcon} alt="Storyverse" width="22.244" height="29.408" />
<img src={monitorIcon} alt="Notifications" width="24" height="24" />
```

### Navigation Icons
```tsx
import homeIcon from '@/assets/icons/home-icon.svg';
import folderIcon from '@/assets/icons/folder-icon.svg';
import writeIcon from '@/assets/icons/write-icon.svg';
import peopleIcon from '@/assets/icons/people-icon.svg';
import trendingIcon from '@/assets/icons/trending-icon.svg';

<button><img src={homeIcon} alt="Home" width="20" height="20" /></button>
<button><img src={folderIcon} alt="Folders" width="20" height="20" /></button>
<button><img src={writeIcon} alt="Write" width="20" height="20" /></button>
<button><img src={peopleIcon} alt="Community" width="20" height="20" /></button>
<button><img src={trendingIcon} alt="Trending" width="20" height="20" /></button>
```

### Engagement Icons
```tsx
import heartIcon from '@/assets/icons/heart-icon.svg';
import commentIcon from '@/assets/icons/comment-icon.svg';
import eyeIcon from '@/assets/icons/eye-icon.svg';
import shareIcon from '@/assets/icons/share-icon.svg';
import bookmarkIcon from '@/assets/icons/bookmark-icon.svg';

<img src={heartIcon} alt="Like" width="16" height="16" /> 42
<img src={commentIcon} alt="Comment" width="14" height="14" /> 28
<img src={eyeIcon} alt="Views" width="16" height="12" /> 156
<img src={shareIcon} alt="Share" width="14" height="14" /> 12
<img src={bookmarkIcon} alt="Save" width="12" height="16" /> 8
```

---

## 🎯 Activity Level Colors

The heatmap uses 5 levels of activity intensity:

```
0 (Inactive)  → #2a2a2a (dark gray, 50% opacity)
1 (Low)       → #4a4a4a (gray)
2 (Med-Low)   → #7a8c5f (olive)
3 (Medium)    → #a5b785 (olive green)
4 (Med-High)  → #b8d47f (light olive)
5 (High)      → #ffffff (white, 100% opacity)
```

---

## 📱 Component Dimensions

### Fixed Viewport
- **Width:** 412px (mobile standard)
- **Height:** 917px (full dashboard)
- **Margin:** 0 auto (centered)

### Section Sizes
| Section | Width | Height |
|---------|-------|--------|
| Header | 412px | 92px |
| Hero | 358px | auto |
| Stats Cards | 358px (total) | 73px |
| Heatmap | 358px | 169px |
| Activity Feed | 358px | auto |
| Story Card | 358px | 150px |
| Bottom Nav | 325px | 51px |

---

## 🔧 Adding New Icons

To add more SVG icons:

1. **Create SVG** (20×20px recommended):
```svg
<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path fill="#6b7280" d="..."/>
</svg>
```

2. **Save to** `src/assets/icons/my-icon.svg`

3. **Import in component**:
```tsx
import myIcon from '@/assets/icons/my-icon.svg';
<img src={myIcon} alt="My Icon" width="20" height="20" />
```

4. **CSS styling**:
```css
img {
  filter: brightness(0.6);  /* Dim by default */
  transition: filter 0.2s;
}

button:hover img {
  filter: brightness(0.8);  /* Brighten on hover */
}

button.active img {
  filter: brightness(1);    /* Full brightness when active */
}
```

---

## 📊 Real Data Integration

### Connecting to Firebase
```tsx
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { getUserActivity } from '@/services/activityService';

export function Dashboard() {
  const [activityData, setActivityData] = useState({});
  
  useEffect(() => {
    // Fetch user's activity data from Firebase
    getUserActivity(userId).then(data => {
      // Transform Firebase data to heatmap format
      const heatmapData = {};
      data.forEach(activity => {
        const date = activity.date; // '2025-01-15'
        const level = calculateActivityLevel(activity); // 0-5
        heatmapData[date] = level;
      });
      setActivityData(heatmapData);
    });
  }, [userId]);

  return (
    <ActivityHeatmap 
      data={activityData}
      year={2025}
      months={[0, 1, 2]}
    />
  );
}

function calculateActivityLevel(activity) {
  const wordCount = activity.wordsWritten;
  if (wordCount >= 1000) return 5;
  if (wordCount >= 500) return 4;
  if (wordCount >= 200) return 3;
  if (wordCount >= 50) return 2;
  if (wordCount > 0) return 1;
  return 0;
}
```

---

## 🎨 Customizing Icons

### Color Override (CSS)
```css
img.header-icon {
  filter: brightness(1.2) hue-rotate(45deg);
}
```

### Size Scaling
```tsx
// Large icon (28px)
<img src={myIcon} width="28" height="28" alt="icon" />

// Small icon (16px)
<img src={myIcon} width="16" height="16" alt="icon" />
```

### State-based Styling
```css
.navButton {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.navButton:hover {
  opacity: 0.8;
}

.navButton.active {
  opacity: 1;
  background: var(--accent-green-dark);
}
```

---

## 🐛 Troubleshooting

### Icons Not Showing
- Check file path: `src/assets/icons/icon-name.svg`
- Verify import: `import icon from '@/assets/icons/icon-name.svg'`
- Check img src: `src={icon}` (not `src={icon.url}`)

### Heatmap Grid Misaligned
- Ensure month array is valid: `[0, 1, 2]` (Jan, Feb, Mar)
- Check year is correct: `year={new Date().getFullYear()}`
- Verify CSS module imported: `import styles from './ActivityHeatmap.module.css'`

### Colors Not Applying
- Check CSS custom properties imported
- Verify filter values: `brightness(0.6-1)` for dimming/brightening
- Use `filter: none` to remove all effects

---

## 📚 Files to Review

1. **DashboardPageNew.tsx** - Main component with all 7 sections
2. **ActivityHeatmap.tsx** - Calendar grid component
3. **ActivityHeatmap.module.css** - Heatmap styling (358×169px)
4. **DashboardPageNew.module.css** - Dashboard styling
5. **design-tokens.css** - All colors, spacing, typography

---

## 🚀 Performance Notes

- **SVG Icons:** Lightweight, scale perfectly, CSS-filterable
- **ActivityHeatmap:** Efficient grid generation, memoized for re-renders
- **CSS Modules:** Scoped styling, no global conflicts
- **Bundle Size:** ~15 icons + component ≈ 20KB gzipped

---

**Created:** December 28, 2025  
**Status:** Production Ready  
**Framework:** React 18+ with TypeScript  
**Styling:** CSS Modules + Design Tokens

