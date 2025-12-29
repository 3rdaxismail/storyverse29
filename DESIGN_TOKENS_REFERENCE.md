# Design Tokens & Component Reference Guide

**Project**: Storyverse  
**Date**: December 27, 2025  
**Status**: ✅ Complete Implementation

---

## 🎯 Quick Navigation

- [Design Tokens File](#design-tokens-file)
- [CSS Variables](#css-variables)
- [Component Mapping](#component-mapping)
- [How to Use Tokens](#how-to-use-tokens)
- [Design System Files](#design-system-files)

---

## 📦 Design Tokens File

**Location**: `src/styles/tokens.ts`

**Main Exports**:

```typescript
import {
  colors,              // 18 color tokens
  gradients,           // 4 gradient definitions
  typography,          // 8 predefined styles + sizes/weights
  spacing,             // 20 spacing values
  borderRadius,        // 7 radius values
  sizes,               // Component and viewport sizes
  transitions,         // Animation timing
  otpDesignSystem,     // Complete OTP spec
  figmaToReactMapping  // Figma node → React component map
} from '@/styles/tokens';
```

---

## 🎨 Color Tokens

### Primary & Accent
```typescript
colors.accent          // #A5B785 - Main green accent
colors.accentDark      // #495139 - Dark green gradient
```

### Backgrounds
```typescript
colors.background              // #0D0D0F
colors.backgroundDark          // #0D0D0F
colors.backgroundGradientLight // #323235
colors.backgroundGradientStart // #202025
colors.backgroundGradientEnd   // #0A0A0C
colors.surfaceLight            // #2B2A30
```

### Text
```typescript
colors.textPrimary             // #FFFFFF
colors.textSecondary           // #8C8B91
colors.textTertiary            // #9CA3AF
colors.textMuted               // #707070
```

### UI Elements
```typescript
colors.border                  // #302D2D
colors.borderLight             // #3D3C41
colors.otpInputBg              // #111827
colors.otpInputBorder          // #374151
colors.otpDivider              // #A5B785
```

### Status
```typescript
colors.error                   // #FF0084
colors.errorLight              // #EF4444
```

---

## 🎨 Gradient Tokens

### 1. Hero Background
```typescript
gradients.heroBg
// linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(32,32,37,1) 100%)
```

### 2. OTP Background
```typescript
gradients.otpBg
// radial-gradient(circle at 64% 62.6%, rgba(63.75,52,79,1) 0%, rgba(10,10,12,1) 100%)
```

### 3. Accent/Button
```typescript
gradients.accentGradient
// linear-gradient(180deg, rgba(165,183,133,1) 0%, rgba(73,81,59,1) 100%)
```

### 4. Overlay
```typescript
gradients.otpOverlay
// linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(32,32,37,0.8) 100%)
```

---

## 🔤 Typography Tokens

### Font Families
```typescript
typography.fontSans   // "Noto Sans", -apple-system, ...
typography.fontSerif  // "Noto Serif", serif
```

### Font Sizes
```typescript
typography.sizes.xs      // 8px
typography.sizes.sm      // 10px
typography.sizes.base    // 12px
typography.sizes.md      // 14px
typography.sizes.lg      // 16px
typography.sizes.xl      // 18px
typography.sizes['2xl']  // 22px
typography.sizes['3xl']  // 25px
typography.sizes['4xl']  // 32px
typography.sizes['5xl']  // 40px
```

### Font Weights
```typescript
typography.weights.light       // 300
typography.weights.normal      // 400
typography.weights.medium      // 500
typography.weights.semibold    // 600
typography.weights.bold        // 700
typography.weights.extrabold   // 800
typography.weights.black       // 900
```

### Line Heights
```typescript
typography.lineHeights.tight    // 1.2
typography.lineHeights.normal   // 1.3
typography.lineHeights.relaxed  // 1.5
typography.lineHeights.loose    // 1.6
```

### Predefined Styles
```typescript
typography.otpHeading      // 40px, weight 400
typography.otpTitle        // 14px, weight 300
typography.otpSubtitle     // 14px, weight 300
typography.otpButtonText   // 18px, weight 400
typography.heading1        // Serif, 22px, weight 900
typography.heading2        // Serif, 18px, weight 800
```

---

## 📐 Spacing Tokens

### Standard Spacing
```typescript
spacing[0]    // 0
spacing[2]    // 2px
spacing[4]    // 4px
spacing[6]    // 6px
spacing[8]    // 8px
spacing[10]   // 10px
spacing[12]   // 12px
spacing[16]   // 16px
spacing[20]   // 20px
spacing[24]   // 24px
spacing[28]   // 28px
spacing[32]   // 32px
spacing[40]   // 40px
spacing[48]   // 48px
spacing[56]   // 56px
spacing[64]   // 64px
```

### OTP-Specific Spacing
```typescript
spacing.otpPaddingX        // 27px - Horizontal padding
spacing.otpPaddingTop      // 34px - Top padding
spacing.otpPaddingBottom   // 40px - Bottom padding
spacing.otpTitleGap        // 12px - Between title elements
spacing.otpFormGap         // 24px - Between form elements
spacing.otpInputGap        // 12px - Between OTP inputs
spacing.otpDividerY        // 62px - Divider Y position
```

---

## 🔲 Border Radius Tokens

```typescript
borderRadius.none    // 0
borderRadius.sm      // 4px
borderRadius.base    // 8px
borderRadius.md      // 12px
borderRadius.lg      // 20px
borderRadius.xl      // 25px - OTP buttons
borderRadius.full    // 9999px
```

---

## 📏 Size Tokens

### Viewport
```typescript
sizes.otpViewportWidth    // 412px
sizes.otpViewportHeight   // 917px
sizes.otpMaxContentWidth  // 358px
```

### Components
```typescript
sizes.otpInputSize        // 50px
sizes.otpButtonHeight     // 50px
sizes.otpButtonWidth      // 358px
sizes.otpHeaderHeight     // 92px
```

---

## ⏱️ Transition Tokens

```typescript
transitions.fast   // 150ms ease-in-out
transitions.base   // 200ms ease-in-out
transitions.slow   // 300ms ease-in-out
```

---

## 🌫️ Shadow Tokens

```typescript
shadows.sm    // 0 1px 2px rgba(0, 0, 0, 0.05)
shadows.base  // 0 1px 3px rgba(0, 0, 0, 0.1)
shadows.md    // 0 4px 6px rgba(0, 0, 0, 0.1)
shadows.lg    // 0 10px 15px rgba(0, 0, 0, 0.2)
```

---

## 🎯 CSS Variables

**Location**: `src/styles/global.css` - Defined in `:root`

### Using CSS Variables

```css
/* Color variables */
background-color: var(--color-accent);
color: var(--color-text-primary);
border-color: var(--color-otp-input-border);

/* Spacing variables */
padding: var(--otp-padding-x);
gap: var(--otp-form-gap);
margin: var(--spacing-24);

/* Typography variables */
font-family: var(--font-sans);
font-size: var(--fs-md);
font-weight: var(--fw-semibold);
line-height: var(--lh-tight);

/* Border radius variables */
border-radius: var(--radius-base);

/* Gradient variables */
background: var(--gradient-accent);

/* Transitions */
transition: all var(--transition-base);

/* Component sizes */
width: var(--viewport-width);
max-width: var(--content-max-width);
```

---

## 🧩 Component Mapping

### OTPVerificationPage

```
Figma Frame 23:189 "OTP verification" (412×917)
├── Container
│   ├── Background Overlay (Node 23:192)
│   ├── Header Section (Node 23:192)
│   │   └── Logo (Node 130:82)
│   │   └── Divider Line (Node 23:200)
│   ├── Form Section
│   │   ├── Title Section
│   │   │   ├── Heading (Node 23:201) - "OTP Verification"
│   │   │   └── Subtitle (Node 23:209) - "Enter OTP we've sent..."
│   │   ├── Form
│   │   │   └── OTP Input Container (6 inputs)
│   │   ├── Error Message
│   │   ├── Submit Button (Node 23:213)
│   │   ├── Resend Section
│   │   └── Help Section
```

---

## 💻 How to Use Tokens

### In TypeScript Components

```typescript
import { colors, typography, spacing } from '@/styles/tokens';

const buttonStyle = {
  backgroundColor: colors.accent,
  color: colors.textPrimary,
  fontSize: `${typography.sizes.md}px`,
  padding: `${spacing[12]}px ${spacing[16]}px`,
  fontWeight: typography.weights.semibold,
};

export function MyButton() {
  return <button style={buttonStyle}>Click me</button>;
}
```

### In CSS Modules

```css
.button {
  background-color: var(--color-accent);
  color: var(--color-text-primary);
  font-size: var(--fs-md);
  padding: var(--spacing-12) var(--spacing-16);
  font-weight: var(--fw-semibold);
  border-radius: var(--radius-base);
  transition: all var(--transition-base);
}

.button:hover {
  background-color: var(--color-accent-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### In Tailwind (if using)

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    colors: {
      accent: colors.accent,
      background: colors.background,
      // ... etc
    },
    spacing: spacing,
    borderRadius: borderRadius,
    // ... etc
  },
};
```

---

## 📚 Design System Files

| File | Purpose | Status |
|------|---------|--------|
| `src/styles/tokens.ts` | All design tokens | ✅ Complete |
| `src/styles/global.css` | CSS custom properties | ✅ Complete |
| `src/styles/index.ts` | Token exports | ✅ Complete |
| `src/pages/public/OTPVerificationPage.module.css` | Component styles with tokens | ✅ Complete |
| `FIGMA_OTP_DESIGN_SYSTEM.md` | Design documentation | ✅ Complete |
| `FIGMA_MCP_EXTRACTION_SUMMARY.md` | Extraction summary | ✅ Complete |

---

## 🔄 Figma-to-Code Workflow

### Step 1: Extract from Figma
```bash
# Use Figma API via MCP to fetch design
curl -H "X-FIGMA-TOKEN: $TOKEN" \
  "https://api.figma.com/v1/files/zuWEY4gNbhwescluD1WZAC/nodes?ids=23-189"
```

### Step 2: Map Design Data
- Color values (RGB → Hex)
- Typography specifications
- Spacing measurements
- Component hierarchy

### Step 3: Create Tokens
- Define in `src/styles/tokens.ts`
- Export as TypeScript constants
- Document with Figma references

### Step 4: Create CSS Variables
- Add to `src/styles/global.css`
- Use in `:root` selector
- Available to all components

### Step 5: Update Components
- Replace hardcoded values with token references
- Use CSS variables in modules
- Import tokens in TypeScript

### Step 6: Document
- Create design system documentation
- Map Figma nodes to components
- Document token usage patterns

---

## ✅ Verification Checklist

- [x] Extract design data from Figma API
- [x] Define all color tokens
- [x] Define all typography tokens
- [x] Define all spacing tokens
- [x] Define all other design tokens
- [x] Create CSS custom properties
- [x] Update OTP CSS module
- [x] Document design system
- [x] Create component mapping
- [x] Add usage examples
- [x] Create reference guide

---

## 🚀 Next Steps

1. **Extend to Other Components**
   - Update SignupPage with tokens
   - Update SigninPage with tokens
   - Update ForgotPasswordPage with tokens
   - Update PreviewLandingPage with tokens

2. **Create Token Component Library**
   - Build Storybook stories
   - Document token usage
   - Create examples

3. **Setup Automation**
   - Figma plugin for token sync
   - CI/CD pipeline for token updates
   - Automated changelog generation

4. **Enhance Documentation**
   - Interactive token explorer
   - Design token usage guide
   - Best practices documentation

---

## 📝 Notes

- All color values have been converted from Figma RGB format (0-1 range) to hex format
- Typography values are preserved exactly as specified in Figma
- Spacing values are derived from Figma bounding boxes and positions
- Border radius values use Figma's cornerRadius properties
- Gradients are reconstructed from Figma gradient stop data

---

## 🔗 Related Documentation

- **Main Design System**: `FIGMA_OTP_DESIGN_SYSTEM.md`
- **Extraction Summary**: `FIGMA_MCP_EXTRACTION_SUMMARY.md`
- **Implementation Guide**: `OTP_IMPLEMENTATION_GUIDE.md`
- **Project README**: `README.md`

---

**Last Updated**: December 27, 2025  
**Version**: 1.0.0  
**Maintainer**: AI Developer

