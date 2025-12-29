# Storyverse Dashboard - Complete Specification Reference

## 🎯 Design Source
**Figma:** https://www.figma.com/design/zuWEY4gNbhwescluD1WZAC/Preview?node-id=5-51&m=dev  
**Viewport:** 412px × 917px (mobile)  
**Theme:** Dark with Olive-Green accents

---

## 🎨 EXACT COLOR PALETTE (All Colors from Figma)

### Background Colors
```
Primary Background: #0d0d0f
Gradient Overlay: linear-gradient(to-t, rgba(0,0,0,0.4), rgba(32,32,37,0.4))
```

### Card Backgrounds (4 Gradient Variations)
```
Card Gradient 1:
  Direction: 136.197deg
  Color 1: rgb(43, 42, 48) at 11.765%
  Color 2: rgb(35, 34, 39) at 94.577%

Card Gradient 2 (Alt):
  Direction: 133.654deg
  Color 1: rgb(43, 42, 48) at 11.765%
  Color 2: rgb(35, 34, 39) at 94.577%

Card Gradient 3 (Alt2):
  Direction: 137.068deg
  Color 1: rgb(43, 42, 48) at 11.765%
  Color 2: rgb(35, 34, 39) at 94.577%

Card Gradient 4 (Alt3):
  Direction: 155.937deg
  Color 1: rgb(43, 42, 48) at 11.765%
  Color 2: rgb(35, 34, 39) at 94.577%
```

### Borders
```
Card Border Color: #302d2d
```

### Text Colors
```
Primary Text: #ffffff
Muted Text: #8c8b91
Accent Green: #a5b785 (rgb(165, 183, 133))
```

### Accent Colors
```
Pink Accent: #ff0084
Green Dark: rgb(165, 183, 133)
Green Gradient: linear-gradient(to-b, rgba(165,183,133,0.5), rgba(73,81,59,0.5))
```

### Navigation Colors
```
Nav Background: #000000
Active Dot: #10b981
Inactive Icon: #6b7280
```

---

## 📐 EXACT DIMENSIONS & MEASUREMENTS

### Container
```
Width: 412px (fixed)
Height: 100vh (min)
Margin: 0 auto (centered)
Overflow: hidden-x, auto-y
```

### Header
```
Position: top-0, left-0
Width: 412px
Height: 92px
Padding: 34px top, 27px left/right
Border-bottom: 1px solid #302d2d

Logo Icon:
  Width: 22.244px
  Height: 29.408px
  Position: left-27px, top-34px

Brand Name "Storyverse":
  Position: 39.8px from top
  Font: Noto Serif ExtraBold, 18px
  Color: #ffffff

Tagline "Your words matter":
  Position: 59.12px from top
  Font: Noto Serif Regular, 11px
  Color: #ffffff

Monitor Icon:
  Position: left-320.39px, top-41px
  Red Dot: 8px × 8px

Profile Avatar:
  Position: left-352px, top-34px
  Size: 29px × 29px (circular)
```

### Hero Section
```
Position: top-121px, left-27px
Width: 358px

Text 1 "Craft the Epic.":
  Font: Noto Serif Black, 22px
  Color: #ffffff
  Line-height: 1.2

Text 2 "One Scene at a Time.":
  Font: Noto Serif Black, 22px
  Color: #a5b785 (olive green)
  Line-height: 1.2
```

### Stats Cards
```
Container:
  Position: top-194px, left-27px
  Grid: 2 columns
  Gap: 20px

Card 1 (Total Words) & Card 2 (Streak):
  Dimensions: 169px × 73px
  Border: 1px solid #302d2d
  Border-radius: 25px
  Background: linear-gradient(136.197deg, rgb(43,42,48) 11.765%, rgb(35,34,39) 94.577%)
  Padding: 22px

Number Value:
  Font: Noto Sans Regular, 25px
  Position: left-49px (card 1), left-240px (card 2), top-202px
  Color: #ffffff

Label:
  Font: Noto Sans Light, 12px
  Position: left-49px (card 1), left-240px (card 2), top-238px
  Color: #8c8b91

Icon (right):
  Position: top-16px, right-16px
  Size: 20px
```

### Activity Heatmap
```
Container:
  Dimensions: 358px × 169px
  Position: left-27px, top-283px
  Border: 1px solid #302d2d
  Border-radius: 25px
  Background: linear-gradient(133.654deg, rgb(43,42,48) 11.765%, rgb(35,34,39) 94.577%)
  Padding: 20px

Month Labels:
  "Jan": left-79px, top-298px
  "Feb": left-196px, top-298px
  "Mar": left-315px, top-298px
  Font: Noto Sans Light, 12px
  Line-height: 10px

Heatmap Grid:
  Starting Position: left-40px, top-325.02px
  January Grid: 95.118px × 53.118px
  February Grid: 95.118px × 41.118px (left-158px)
  March Grid: 95.118px × 53.094px (left-276px)
  Dot Size: 4-6px diameter
  Active Dot: #ffffff
  Inactive Dot: #2a2a2a
  Spacing: 4-6px between dots
  Layout: 7 rows (days) × ~31 columns (dates)

Bottom Text:
  "Recent writing activity":
    Position: left-48px, top-402px
    Font: Noto Sans Light, 12px
  
  "3 Stories, 7 Poems, 1 Travel story, 3 Memoirs":
    Position: left-48px, top-423px
    Font: Noto Sans Light, 12px
```

### Recent Activity Feed
```
Container:
  Dimensions: 358px × 72px
  Position: left-27px, top-468px
  Border: 1px solid #302d2d
  Border-radius: 25px
  Background: linear-gradient(155.937deg, rgb(43,42,48) 11.765%, rgb(35,34,39) 94.577%)
  Padding: 20px

Activity Item 1:
  Icon: 🔥 (left)
  Text: "The ugly truth | 48 likes | 2 days ago"
  Position: left-70px, top-483px
  Font: Noto Sans Light, 12px

Activity Item 2:
  Icon: 👥 (left)
  Text: "Its very nice to see you all ..." 33 min ago"
  Position: left-70px, top-511px
  Font: Noto Sans Light, 12px
```

### Featured Story Card
```
Container:
  Dimensions: 358px × 150px
  Position: left-27px, top-556px
  Border: 1px solid #302d2d
  Border-radius: 25px
  Background: linear-gradient(137.068deg, rgb(43,42,48) 11.765%, rgb(35,34,39) 94.577%)

Cover Image (LEFT):
  Dimensions: 83.452px × 148px
  Position: left-28px, top-557px
  Border-radius: 24px (left corners only)
  Gradient Overlays:
    Top: linear-gradient(to-b, #000000 5.882%, transparent 24.632%)
    Bottom: Same rotated 180deg

Story Details (MIDDLE):
  Position starts: left-123px

Badges:
  "Story, Mystery":
    Position: left-123px, top-572px
    Font: Noto Sans Regular, 8px
    Color: #8c8b91
  
  "13+":
    Position: left-149.04px, top-585px
    Font: Noto Sans Regular, 8px
  
  "Private" (with eye icon):
    Position: left-183.59px, top-585px
    Font: Noto Sans Regular, 8px

Title "Midnight Reflections":
  Position: left-123px, top-602px
  Font: Noto Sans Light, 12px
  Color: #ffffff
  Dimensions: 260.699px × 25.134px

Description:
  Position: left-123px, top-622px
  Font: Noto Sans Light, 12px
  Color: #ffffff
  Dimensions: 229px × 29px
  Text: "A collection of late-night thoughts and observations recorded during the..."

Metadata:
  "Word count 80523":
    Position: left-123px, top-656px
    Font: Noto Sans Regular, 8px
    Color: #8c8b91
  
  "Est reading time 13 hours":
    Position: left-123px, top-667px
    Font: Noto Sans Regular, 8px
    Color: #8c8b91

Engagement Stats (Bottom Row):
  Comments: 53 (left-140px, top-686px)
  Views: 76 (left-174px, top-686.1px)
  Bookmarks: 42 (left-211px, top-686.1px)
  Shares: 53 (left-247px, top-686.1px)
  Font: Noto Sans Regular, 8px
  Color: #8c8b91

Heart Icon + Count (TOP RIGHT):
  Position: top-570px, right side
  Heart Color: #ff0084 (pink)
  Count: "0"

Accent Bar (RIGHT):
  Width: 27px
  Position: left-358px, top-556px
  Height: 150px
  Border-radius: 0 25px 25px 0 (right corners only)
  Background: linear-gradient(to-b, rgba(165,183,133,0.5), rgba(73,81,59,0.5))
  Border: 1px solid #302d2d
```

### Bottom Navigation
```
Container:
  Position: fixed
  Bottom: 19px
  Centered: left-50%, transform translateX(-50%)
  Dimensions: 325px × 51px
  Border-radius: 52px
  Background: #000000
  Position: top-847px (relative)

Icons (5 total, evenly spaced):
  Home:
    Position: ~17.48% from left
    Icon: 🏠
  
  Folders:
    Position: ~31.62% from left
    Icon: 📁
  
  Write (ACTIVE):
    Position: center
    Icon: ✍️
    Size: 38.869px × 38.869px
    Background: Circular olive-green gradient (#a5b785)
    Active Indicator Dots:
      Left: left-279px, top-861px
      Right: left-331px, top-861px
      Size: 6px × 6px each
      Color: #10b981
  
  Community:
    Position: ~63.83% from left
    Icon: 👥
  
  Trending:
    Position: ~77.67% from left
    Icon: 🔥

Inactive Icons: #6b7280 (gray)
Active Icon: Olive-green with green dots below
```

---

## 🔤 TYPOGRAPHY SPECIFICATIONS

### Font Families
```
Primary (UI): 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif
Serif (Branding): 'Noto Serif', Georgia, serif
```

### Font Sizes & Weights
```
Hero Text:
  Size: 22px
  Weight: 900 (Black)
  Family: Noto Serif
  Line-height: 1.2

Brand Name:
  Size: 18px
  Weight: 800 (ExtraBold)
  Family: Noto Serif

Tagline:
  Size: 11px
  Weight: 400 (Regular)
  Family: Noto Serif

Stat Value:
  Size: 25px
  Weight: 400 (Regular)
  Family: Noto Sans

Stat Label:
  Size: 12px
  Weight: 300 (Light)
  Family: Noto Sans

Card Titles:
  Size: 12px
  Weight: 300 (Light)
  Family: Noto Sans

Labels & Small Text:
  Size: 8px
  Weight: 400 (Regular)
  Family: Noto Sans
```

---

## 📊 IMPLEMENTATION CHECKLIST

### Colors
- [x] #0d0d0f - Primary background
- [x] #302d2d - Card borders
- [x] #ffffff - Primary text
- [x] #8c8b91 - Muted text
- [x] #a5b785 - Accent green
- [x] #ff0084 - Pink accent
- [x] #10b981 - Active dot
- [x] #6b7280 - Inactive icon

### Card Gradients
- [x] 136.197deg - Stats cards
- [x] 133.654deg - Heatmap
- [x] 137.068deg - Story card
- [x] 155.937deg - Activity feed

### Dimensions
- [x] 412px container width
- [x] 92px header height
- [x] 169px × 73px stat cards
- [x] 358px × 169px heatmap
- [x] 358px × 150px story card
- [x] 325px × 51px bottom nav
- [x] 52px nav border-radius
- [x] 25px card border-radius

### Typography
- [x] Noto Serif for headers
- [x] Noto Sans for UI text
- [x] Correct font sizes
- [x] Correct font weights
- [x] Correct line-heights

### Components
- [x] Header with logo + brand
- [x] Hero section with 2-color text
- [x] Dual stat cards
- [x] Heatmap with dots
- [x] Activity feed
- [x] Story card with accent bar
- [x] Bottom navigation

### Features
- [x] Firebase authentication
- [x] Navigation state management
- [x] Active nav indicator with dots
- [x] Random heatmap activation
- [x] Proper spacing and padding
- [x] Mobile-optimized layout

---

## ✅ QUALITY VERIFICATION

All specifications have been implemented with pixel-perfect accuracy:
- ✅ All colors match Figma exactly
- ✅ All fonts and sizes match specification
- ✅ All measurements accurate to pixel
- ✅ All gradients correctly implemented
- ✅ All components properly styled
- ✅ No compilation errors
- ✅ No warnings
- ✅ Production-ready code

---

**Last Updated:** December 28, 2025  
**Implementation Status:** ✅ COMPLETE  
**Verification Status:** ✅ ALL CHECKS PASSED
