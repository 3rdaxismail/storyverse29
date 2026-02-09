# 🎨 Figma Design Tokens - Quick Reference

## Colors (CSS Variables)

### Brand
```css
--color-brand-main          /* rgba(167, 186, 136, 1) - Sage Green */
```

### Backgrounds
```css
--color-app-background      /* rgba(22, 27, 34, 1) - Dark Blue */
--color-card-dark          /* rgba(15, 18, 22, 1) - Darker Blue */
--color-card-grey          /* rgba(43, 42, 48, 1) - Grey */
--color-surface-base       /* rgba(22, 27, 34, 1) - Dark Blue */
```

### Text
```css
--color-text-white         /* rgba(245, 245, 245, 1) */
--color-text-black         /* rgba(27, 28, 30, 1) */
--color-text-content       /* rgba(245, 245, 245, 1) - Primary */
--color-text-placeholder   /* rgba(146, 146, 147, 1) - Grey */
--color-text-muted         /* rgba(162, 162, 162, 1) - Light Grey */
```

### Status
```css
--color-status-success     /* rgba(67, 255, 146, 1) - Green */
--color-status-error       /* rgba(255, 108, 87, 1) - Red/Orange */
--color-status-notification /* rgba(255, 0, 132, 1) - Pink */
```

### Accents
```css
--color-accent-purple      /* rgba(167, 147, 255, 1) */
--color-accent-blue        /* rgba(121, 165, 255, 1) */
--color-accent-pink        /* rgba(255, 169, 251, 1) */
--color-accent-yellow      /* rgba(255, 219, 75, 1) */
```

### Icons & Borders
```css
--color-icon-primary       /* rgba(255, 255, 255, 1) */
--color-icon-inactive      /* rgba(112, 112, 112, 1) */
--color-border            /* rgba(47, 54, 64, 1) */
```

## Typography (Utility Classes)

### Display - `.font-display`
- **Size:** 36px | **Weight:** 600 (SemiBold) | **Line Height:** 44px
- **Use:** Landing hero, emotional statements

### Heading - `.font-heading`
- **Size:** 24px | **Weight:** 600 (SemiBold) | **Line Height:** 32px
- **Use:** Page titles, dashboard headings

### Subheading - `.font-subheading`
- **Size:** 18px | **Weight:** 500 (Medium) | **Line Height:** 26px
- **Use:** Supporting lines, onboarding text

### Body - `.font-body`
- **Size:** 16px | **Weight:** 400 (Regular) | **Line Height:** 26px
- **Use:** Story writing, reader view, card descriptions

### UI - `.font-ui`
- **Size:** 14px | **Weight:** 500 (Medium) | **Line Height:** 20px
- **Use:** Buttons, stats, inputs, navigation labels

### Meta - `.font-meta`
- **Size:** 12px | **Weight:** 400 (Regular) | **Line Height:** 18px
- **Use:** Timestamps, helper text, captions

## Usage Examples

### HTML
```html
<!-- Typography -->
<h1 class="font-display">Craft Your Epic</h1>
<h2 class="font-heading">My Stories</h2>
<p class="font-body">Once upon a time...</p>
<button class="font-ui">Save Story</button>
<span class="font-meta">Last edited 2 hours ago</span>

<!-- Colors -->
<div style="background: var(--color-card-dark); color: var(--color-text-content);">
  Content
</div>
```

### CSS
```css
.my-card {
  background: var(--color-card-dark);
  color: var(--color-text-content);
  border: 1px solid var(--color-border);
}

.my-title {
  composes: font-heading from global;
  color: var(--color-brand-main);
}

.success-badge {
  color: var(--color-status-success);
  composes: font-meta from global;
}
```

### TypeScript/React
```tsx
import { colors, typography } from '@/theme/figma-tokens';

const Hero = () => (
  <div style={{ 
    backgroundColor: colors.appBackground,
    color: colors.textContent 
  }}>
    <h1 style={typography.display}>Welcome to Storyverse</h1>
  </div>
);
```

## 🔄 Regenerate Tokens

```powershell
cd d:\storyverse\mcp
.\extract-design-tokens.ps1
```

---

**Source:** [Figma Design System](https://www.figma.com/design/hGphC3Bq9sx5G84wU3ZUKe/)
