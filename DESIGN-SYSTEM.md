# STORYVERSE DESIGN SYSTEM

> **Strict token-based design system from Figma**

## Overview

This design system enforces consistent visual design across the entire application using CSS custom properties (CSS variables) and utility classes.

## Architecture

```
src/
├── theme/
│   ├── tokens.css       ← All design tokens (colors, spacing, etc.)
│   ├── typography.css   ← Typography utility classes
│   ├── tokens.ts        ← TypeScript token definitions (legacy)
│   └── typography.ts    ← TypeScript typography (legacy)
├── index.css            ← Global styles, imports tokens
└── pages/               ← Pages use tokens via CSS variables
    └── components/      ← Components use tokens via CSS variables
```

---

## 🚨 STRICT RULES

### 1. NO HARDCODED COLORS

❌ **WRONG:**
```css
.my-component {
  background: #0d0d0f;
  color: rgba(255, 255, 255, 1);
}
```

✅ **CORRECT:**
```css
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### 2. NO HARDCODED FONTS

❌ **WRONG:**
```css
.my-text {
  font-family: 'Noto Sans', sans-serif;
  font-size: 16px;
}
```

✅ **CORRECT:**
```css
.my-text {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
}
```

### 3. USE TYPOGRAPHY UTILITY CLASSES

❌ **WRONG:**
```tsx
<h1 style={{ fontSize: '40px', fontWeight: 600 }}>Title</h1>
```

✅ **CORRECT:**
```tsx
<h1 className="text-hero-large">Title</h1>
```

### 4. USE SPACING TOKENS

❌ **WRONG:**
```css
.card {
  padding: 16px;
  margin-bottom: 24px;
}
```

✅ **CORRECT:**
```css
.card {
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}
```

---

## Color Tokens

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `rgba(13, 13, 15, 1)` | Main app background |
| `--bg-secondary` | `rgba(15, 18, 22, 1)` | Secondary surfaces |
| `--bg-tertiary` | `rgba(22, 27, 34, 1)` | Cards, panels |
| `--bg-card` | `rgba(43, 42, 48, 1)` | Card backgrounds |
| `--bg-input` | `rgba(48, 45, 45, 1)` | Input fields |
| `--bg-button` | `rgba(47, 54, 64, 1)` | Button backgrounds |
| `--bg-nav` | `rgba(0, 0, 0, 1)` | Navigation |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `rgba(255, 255, 255, 1)` | Main text |
| `--text-secondary` | `rgba(245, 245, 245, 1)` | Secondary text |
| `--text-tertiary` | `rgba(162, 162, 162, 1)` | Muted text |
| `--text-muted` | `rgba(112, 112, 112, 1)` | Very muted |
| `--text-placeholder` | `rgba(140, 139, 145, 1)` | Placeholders |

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-primary` | `rgba(167, 186, 136, 1)` | Primary brand (green) |
| `--brand-secondary` | `rgba(165, 183, 133, 1)` | Secondary brand |

### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--status-error` | `rgba(255, 108, 87, 1)` | Errors |
| `--status-success` | `rgba(67, 255, 146, 1)` | Success states |

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-primary` | `'Noto Sans', sans-serif` | UI text |
| `--font-serif` | `'Noto Serif', serif` | Story content |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | `12px` | Captions, labels |
| `--font-size-sm` | `14px` | Body text |
| `--font-size-base` | `16px` | Base size |
| `--font-size-md` | `18px` | Large body |
| `--font-size-lg` | `22px` | H2 |
| `--font-size-xl` | `24px` | H1 |
| `--font-size-2xl` | `30px` | Hero medium |
| `--font-size-3xl` | `40px` | Hero large |

### Typography Utility Classes

#### Headings
- `.text-hero-large` - 40px, semibold
- `.text-hero-medium` - 30px, medium
- `.text-h1` - 24px, semibold
- `.text-h2` - 22px, medium
- `.text-h3` - 18px, medium
- `.text-h4` - 16px, semibold

#### Body Text
- `.text-body-large` - 16px, normal
- `.text-body` - 14px, normal
- `.text-body-small` - 12px, light

#### UI Text
- `.text-label` - 14px, medium
- `.text-label-small` - 12px, medium
- `.text-caption` - 12px, light

#### Story Content
- `.text-story-content` - 16px, serif, loose line-height

#### Color Utilities
- `.text-primary` - Primary text color
- `.text-secondary` - Secondary text color
- `.text-tertiary` - Tertiary text color
- `.text-muted` - Muted text color
- `.text-brand` - Brand color
- `.text-error` - Error color
- `.text-success` - Success color

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tiny gaps |
| `--space-2` | `8px` | Small gaps |
| `--space-3` | `12px` | Medium-small gaps |
| `--space-4` | `16px` | Base spacing |
| `--space-5` | `20px` | Medium spacing |
| `--space-6` | `24px` | Large spacing |
| `--space-8` | `32px` | Extra large |
| `--space-10` | `40px` | 2x extra large |
| `--space-12` | `48px` | 3x extra large |
| `--space-16` | `64px` | 4x extra large |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Small elements |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `10px` | Cards |
| `--radius-xl` | `12px` | Large cards |
| `--radius-2xl` | `16px` | Extra large |
| `--radius-full` | `9999px` | Circles, pills |

---

## Usage Examples

### Component CSS

```css
/* components/MyComponent.module.css */
.container {
  background: var(--bg-tertiary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

.title {
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
}
```

### Using Typography Utilities

```tsx
// Instead of custom CSS for every text element
<div>
  <h1 className="text-h1 text-primary">Welcome</h1>
  <p className="text-body text-secondary">
    Start writing your story
  </p>
  <span className="text-caption text-muted">
    Last saved 2 minutes ago
  </span>
</div>
```

---

## File Reference

- **All tokens:** `src/theme/tokens.css`
- **Typography utilities:** `src/theme/typography.css`
- **Global imports:** `src/index.css`

---

## Maintenance

### Adding New Tokens

1. Add to `src/theme/tokens.css` following existing patterns
2. Document in this README
3. Update Figma if design changes

### Modifying Tokens

1. ⚠️ **NEVER** modify token values directly in component CSS
2. Only modify in `tokens.css`
3. Changes will cascade to all components automatically

---

## Migration Guide

If you find hardcoded values in existing components:

1. Identify the closest token match
2. Replace hardcoded value with CSS variable
3. Test visual consistency

**Example:**
```css
/* Before */
.old-component {
  background: #0d0d0f;
  padding: 16px;
  color: white;
}

/* After */
.old-component {
  background: var(--bg-primary);
  padding: var(--space-4);
  color: var(--text-primary);
}
```
