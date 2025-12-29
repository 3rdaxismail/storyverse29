# UI Implementation Guide - Storyverse Preview Landing Page

## 🎯 Core Principle
**VISUAL ACCURACY IS NON-NEGOTIABLE.** Every pixel, spacing, color, and typographic detail must match the Figma design exactly. No approximations. No simplifications.

## 📋 Verification Checklist (Pre-Commit)

Before considering ANY page "done", verify all of the following:

### Typography
- [ ] Headline (h2): 22px Noto Serif, weight 900, line-height 1.2
- [ ] Subheadline (p): 12px Noto Sans, weight 300, line-height 1.3
- [ ] Header title (h1): 18px Noto Serif, weight 800, line-height 1.2
- [ ] Header tagline: 11px Noto Serif, weight 400, line-height 1.2
- [ ] Button text: 14px Noto Sans, weight 500
- [ ] Text hierarchy is visually dominant where intended

### Spacing & Layout
- [ ] Header padding: 24px vertical, 27px horizontal
- [ ] Content container padding: 32px top/bottom, 27px left/right
- [ ] Hero section gap: 16px between headline and subheadline
- [ ] Decorative line top/bottom padding: 16px
- [ ] CTA section gap: 12px between buttons
- [ ] Bottom spacer: 48px
- [ ] Section gaps: 32px (between sections)

### Colors & Gradients
- [ ] Background: #0D0D0F (pure dark)
- [ ] Text primary: #FFFFFF
- [ ] Text secondary: #8C8B91
- [ ] Accent (green): #A5B785
- [ ] Accent dark: #495139
- [ ] Hero gradient (0deg): from #000000 (0%) to #202025 (100%)
- [ ] Header gradient (0deg): from #000000 (0%) to #202025 (100%)
- [ ] Primary button gradient (180deg): from #A5B785 (0%) to #495139 (100%)
- [ ] Secondary button gradient (134deg): from #2B2A30 (10%) to #232227 (98%)
- [ ] Secondary button border: #302D2D

### Components
- [ ] Header displays logo (S in gradient circle), title, tagline
- [ ] Logo circle: 40x40px with green gradient background
- [ ] Hero section: centered text layout
- [ ] Decorative line: 40px width, green gradient, 0.6 opacity
- [ ] Primary button: 48px height, 25px border-radius, full width, green gradient
- [ ] Secondary button: 48px height, 25px border-radius, full width, dark gradient with border
- [ ] Both buttons have padding: 16px vertical, 24px horizontal
- [ ] Loader component renders with isVisible prop

### Visual Hierarchy
- [ ] Headline feels prominent and heavy (weight 900)
- [ ] Subheadline feels secondary and light (weight 300)
- [ ] Buttons feel clickable and intentional
- [ ] Green accent creates visual dominance where needed
- [ ] Page doesn't look generic, flat, or templated

### Responsive Design
- [ ] Mobile base: 412px
- [ ] Desktop (768px+): headline 28px, subheadline 14px
- [ ] Desktop content container: gap 48px, padding 64px top/bottom, 48px left/right
- [ ] All elements scale proportionally

## 📐 Design Token Reference

### Colors
```
Primary: #FFFFFF (white text)
Secondary: #8C8B91 (muted text)
Background: #0D0D0F (dark)
Accent: #A5B785 (green)
Accent Dark: #495139 (darker green)
Border: #302D2D (divider)
Surface Light: #2B2A30
Surface Dark: #202025 to #232227
```

### Typography System
```
Heading 1: 22px Noto Serif, weight 900, line-height 1.2
Heading 2: 18px Noto Serif, weight 800, line-height 1.2
Body Large: 14px Noto Sans, weight 500
Body Base: 12px Noto Sans, weight 300-400
Caption: 11px Noto Serif, weight 400
```

### Spacing Scale
```
4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, 40px, 48px, 56px, 64px
```

### Border Radius
```
25px (buttons, rounded)
50% (logo circle)
```

## 🔄 Iterative Refinement Process

When implementing or updating ANY page:

1. **Implement the component structure**
   - Use semantic HTML
   - Proper nesting and hierarchy
   - All required props/states

2. **Extract exact measurements from Figma**
   - Font sizes, weights, line-heights
   - Spacing and padding (use explicit px values)
   - Gradient angles and color stops
   - Border radius, shadows

3. **Apply styles with precision**
   - No rounding (use exact values)
   - No "similar enough" gradients
   - No browser defaults
   - CSS Modules for scoped styles

4. **Compare visually with Figma**
   - Side-by-side inspection
   - Check proportions section-by-section
   - Verify visual hierarchy
   - Ensure breathing room matches

5. **Identify mismatches**
   - What spacing is off?
   - What text feels too small/large?
   - What gradient is wrong?
   - What looks generic vs. designed?

6. **Refine and re-compare**
   - Update CSS values
   - Test at multiple screen sizes
   - Ensure consistency across components
   - Repeat until matches exactly

7. **Sign off**
   - Document what was implemented
   - List any design decisions made
   - Verify no compromises were taken

## 🚫 Anti-Patterns (NEVER DO THIS)

❌ Approximating spacing ("it's close enough")
❌ Using browser defaults for margin/padding
❌ Rounding pixel values
❌ Using Tailwind classes without overrides
❌ Simplifying gradients
❌ Compressing whitespace to save lines
❌ Reusing typography styles across different text
❌ Using "similar looking" colors
❌ Stopping at iteration 1
❌ Claiming "done" without designer approval

## ✅ Quality Gates

A page is DONE only when:

1. ✅ Pixel-perfect layout matches Figma (verified by comparison)
2. ✅ Typography matches exactly (size, weight, line-height)
3. ✅ Spacing matches exactly (every gap, padding, margin)
4. ✅ Colors and gradients match exactly (no approximations)
5. ✅ Visual hierarchy matches (nothing feels flat or generic)
6. ✅ Responsive behavior works at all breakpoints
7. ✅ No console errors
8. ✅ No accessibility issues
9. ✅ Code is clean and commented
10. ✅ All changes documented

## 📱 Current Page: Preview Landing Page

### Current Implementation Status
- ✅ Structure: Complete and correct
- ✅ Typography: Matches Figma specifications
- ✅ Spacing: All values verified against design tokens
- ✅ Colors: Exact matches from token system
- ✅ Gradients: Angles and stops match Figma
- ✅ Components: Header, buttons, loader all implemented
- ✅ Responsive: Mobile and desktop breakpoints in place

### Components Used
- PublicHeader: Logo, title, tagline
- PrimaryButton: Green gradient CTA
- SecondaryButton: Dark gradient with border
- Loader: Animation overlay

### Files
- `src/pages/public/PreviewLandingPage.tsx` - Main page component
- `src/pages/public/PreviewLandingPage.module.css` - Page styles
- `src/components/layout/PublicHeader.tsx` - Header component
- `src/components/layout/PublicHeader.module.css` - Header styles
- `src/components/ui/PrimaryButton.tsx` - Primary button
- `src/components/ui/PrimaryButton.module.css` - Button styles
- `src/components/ui/SecondaryButton.tsx` - Secondary button
- `src/components/ui/SecondaryButton.module.css` - Button styles
- `src/styles/tokens.ts` - Design token constants
- `src/styles/global.css` - Global styles

## 🔍 Pre-Deployment Verification

Before deploying any UI changes:

1. [ ] Run `npm run dev` and visually inspect
2. [ ] Open browser DevTools → Mobile responsive view
3. [ ] Test at 412px (mobile), 768px (tablet), 1024px (desktop)
4. [ ] Check console for errors/warnings
5. [ ] Verify all interactive elements (buttons, links)
6. [ ] Test on actual devices if possible
7. [ ] Compare screenshot with Figma node side-by-side
8. [ ] Sign off with "VERIFIED: matches Figma exactly"

---

**Last Updated**: December 26, 2025  
**Author**: Design-Faithful Frontend Engineer  
**Status**: Active (all pages must follow this guide)
