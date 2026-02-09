# Figma Design Tokens Usage Guide

This document explains how to use the design tokens extracted from your Figma design system.

## 📁 Files Created

- `src/theme/figma-tokens.ts` - TypeScript design tokens
- `src/theme/figma-tokens.css` - CSS custom properties
- `mcp/extract-design-tokens.ps1` - Extraction script (reusable)

## 🎨 Colors

### Available Colors

#### Brand
- `--color-brand-main` - Main brand color (sage green)

#### Backgrounds
- `--color-app-background` - Main app background
- `--color-card-dark` - Dark card background
- `--color-card-grey` - Grey card background
- `--color-surface-base` - Base surface color

#### Text
- `--color-text-white` - White text
- `--color-text-black` - Black text
- `--color-text-content` - Primary content text
- `--color-text-placeholder` - Placeholder text
- `--color-text-muted` - Muted/secondary text

#### Status
- `--color-status-success` - Success state (green)
- `--color-status-error` - Error state (red)
- `--color-status-notification` - Notification (pink)

#### Accents
- `--color-accent-purple` - Purple accent
- `--color-accent-blue` - Blue accent
- `--color-accent-pink` - Pink accent
- `--color-accent-yellow` - Yellow accent

### Usage in CSS

```css
.my-component {
  background-color: var(--color-card-dark);
  color: var(--color-text-content);
  border: 1px solid var(--color-border);
}

.success-message {
  color: var(--color-status-success);
}
```

### Usage in TypeScript

```tsx
import { colors } from '@/theme/figma-tokens';

const MyComponent = () => (
  <div style={{ backgroundColor: colors.cardDark }}>
    <p style={{ color: colors.textContent }}>Hello World</p>
  </div>
);
```

## 📝 Typography

### Available Font Styles

#### Display (36px, SemiBold, 44px line-height)
**Use for:** Landing hero, emotional statements

```html
<h1 className="font-display">Millions start stories</h1>
```

```tsx
import { typography } from '@/theme/figma-tokens';

const Hero = () => (
  <h1 style={typography.display}>Craft Your Epic</h1>
);
```

#### Heading (24px, SemiBold, 32px line-height)
**Use for:** Page titles, dashboard headings

```html
<h2 className="font-heading">Craft the Epic</h2>
```

#### Subheading (18px, Medium, 26px line-height)
**Use for:** Supporting lines, onboarding text

```html
<h3 className="font-subheading">One Scene at a Time</h3>
```

#### Body (16px, Regular, 26px line-height)
**Use for:** Story writing, reader view, card descriptions

```html
<p className="font-body">Your story content goes here...</p>
```

#### UI (14px, Medium, 20px line-height)
**Use for:** Buttons, stats, inputs, navigation labels

```html
<button className="font-ui">Continue</button>
<label className="font-ui">Story Title</label>
```

#### Meta (12px, Regular, 18px line-height)
**Use for:** Timestamps, helper text, captions

```html
<span className="font-meta">Posted 2 hours ago</span>
<small className="font-meta">Characters: 1,234</small>
```

### CSS Module Usage

```css
.title {
  font-family: var(--font-family-primary);
  font-size: var(--font-heading-size);
  font-weight: var(--font-heading-weight);
  line-height: var(--font-heading-line-height);
}

/* Or use the utility class */
.title {
  composes: font-heading from global;
}
```

## 🔄 Updating Design Tokens

When the Figma design system is updated, regenerate the tokens:

```powershell
cd d:\storyverse\mcp
.\extract-design-tokens.ps1
```

This will:
1. Fetch the latest design data from Figma
2. Extract colors and typography
3. Update `src/theme/figma-tokens.ts`
4. Save a JSON backup to `mcp/extracted-tokens.json`

## 🎯 Best Practices

### DO ✅
- Use Figma tokens for all new components
- Use CSS custom properties (`var(--color-*)`) in stylesheets
- Use TypeScript tokens when dynamic styling is needed
- Apply utility classes (`.font-heading`, etc.) for typography
- Keep the design system in sync with Figma

### DON'T ❌
- Hardcode colors or font values
- Mix legacy tokens with Figma tokens in the same component
- Override token values inline unless absolutely necessary
- Modify `figma-tokens.ts` or `figma-tokens.css` manually

## 📦 Theme Access

The Figma tokens are exported through the main theme object:

```tsx
import { theme } from '@/theme';

// Access Figma tokens
const brandColor = theme.figma.colors.brandMain;
const headingStyle = theme.figma.typography.heading;

// Legacy tokens still available
const legacyColor = theme.colors.bgPrimary;
```

## 🚀 Migration Guide

To migrate existing components to use Figma tokens:

1. **Replace hardcoded values**
   ```css
   /* Before */
   .card {
     background: #0f1216;
     color: #f5f5f5;
   }
   
   /* After */
   .card {
     background: var(--color-card-dark);
     color: var(--color-text-white);
   }
   ```

2. **Update legacy token references**
   ```css
   /* Before */
   background: var(--bg-secondary);
   
   /* After */
   background: var(--color-card-dark);
   ```

3. **Use typography utilities**
   ```html
   <!-- Before -->
   <h1 style="font-size: 24px; font-weight: 600;">Title</h1>
   
   <!-- After -->
   <h1 className="font-heading">Title</h1>
   ```

## 📚 Font Loading

Make sure Noto Sans is loaded in your HTML:

```html
<!-- In index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Or use CSS imports:

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap');
```

## 🔗 Resources

- **Figma Design System:** https://www.figma.com/design/hGphC3Bq9sx5G84wU3ZUKe/Storyverse--Design-System
- **MCP Server Configuration:** See `start-figma-mcp.ps1`
- **Extraction Script:** `mcp/extract-design-tokens.ps1`
