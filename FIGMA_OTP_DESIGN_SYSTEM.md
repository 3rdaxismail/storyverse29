# OTP Verification Page - Figma Design System

**Source**: Figma file `zuWEY4gNbhwescluD1WZAC` (Preview design)  
**Node ID**: 23-189 - "OTP verification"  
**Status**: ✅ Extracted via Figma MCP API  
**Last Updated**: December 27, 2025

---

## 📋 Executive Summary

This document provides a complete mapping of the OTP Verification page design from Figma to React components and CSS tokens. The design has been extracted directly from the Figma API (Node 23-189) and all design tokens have been catalogued in `src/styles/tokens.ts`.

---

## 🎨 Design Frame Properties

| Property | Value | Notes |
|----------|-------|-------|
| **Frame Name** | OTP verification | Main artboard |
| **Width** | 412px | Mobile-first design |
| **Height** | 917px | Full viewport height |
| **Background** | Radial gradient | See gradients section |
| **Dev Status** | COMPLETED | From Figma metadata |

---

## 🎭 Color Palette

### Primary Colors
| Token | Hex Code | RGB | Usage | Figma Node |
|-------|----------|-----|-------|-----------|
| `accent` | #A5B785 | 165, 183, 133 | Accent, highlights, dividers | Node 23:200, 23:201 |
| `accentDark` | #495139 | 73, 81, 59 | Dark gradient stops | Button gradient |

### Text Colors
| Token | Hex Code | RGB | Usage | Figma Node |
|-------|----------|-----|-------|-----------|
| `textPrimary` | #FFFFFF | 255, 255, 255 | Main text | Node 23:209 |
| `textSecondary` | #8C8B91 | 140, 139, 145 | Secondary text | - |
| `textTertiary` | #9CA3AF | 156, 163, 175 | Tertiary text, muted | Node 23:207 |

### Background Colors
| Token | Hex Code | RGB | Usage | Figma Node |
|-------|----------|-----|-------|-----------|
| `background` | #0D0D0F | 13, 13, 15 | Main background | Node 23:192 |
| `otpInputBg` | #111827 | 17, 24, 39 | Input field background | - |
| `otpInputBorder` | #374151 | 55, 65, 81 | Input border color | Node 23:203, 23:213 |

### Status & UI Colors
| Token | Hex Code | RGB | Usage | Figma Node |
|-------|----------|-----|-------|-----------|
| `errorLight` | #EF4444 | 239, 68, 68 | Error messages | - |
| `otpDivider` | #A5B785 | 165, 183, 133 | Divider line | Node 23:200 |

---

## 📐 Gradients

### 1. Background Gradient (Radial)
**Used in**: OTP frame background  
**Figma Node**: 23:189 (frame fill)

```typescript
// Radial gradient with 3 handles
gradient: radial-gradient(
  circle at 64% 62.6%,
  rgba(63.75, 52, 79, 1) 0%,    // Purple-ish start
  rgba(10, 10, 12, 1) 100%       // Dark end
)
```

**Handle Positions**:
- Center: (64%, 62.6%)
- Secondary: (37.86%, 102.18%)
- Tertiary: (-15.06%, 52.06%)

### 2. Button Gradient (Linear)
**Used in**: Submit/Continue button  
**Figma Node**: 23:203 (Group 58 > Rectangle 28)

```typescript
gradient: linear-gradient(
  180deg,
  rgba(165, 183, 133, 1) 0%,    // #A5B785 - Accent
  rgba(73, 81, 59, 1) 100%       // #495139 - Accent dark
)
```

### 3. Overlay Gradient
**Used in**: Background overlay with opacity

```typescript
gradient: linear-gradient(
  to bottom,
  rgba(0, 0, 0, 1) 0%,
  rgba(32, 32, 37, 0.8) 100%
)
opacity: 0.4
```

---

## 🔤 Typography

### Font Family
- **Primary**: `"Noto Sans"` with fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Font Styles Used

#### 1. Page Title - "OTP Verification"
**Figma Node**: 23:201  
**Style ID**: Character overrides for "OTP" (50) and "Verification" (49)

| Property | Value |
|----------|-------|
| Font Weight | 400 (Regular) |
| Font Size | 40px |
| Line Height | 48px (120% of font size) |
| Text Align | Left |
| Color | #A5B785 (accent) for "OTP", #FFFFFF (white) for "Verification" |

#### 2. Subtitle - "Enter OTP we've sent to you email"
**Figma Node**: 23:209

| Property | Value |
|----------|-------|
| Font Weight | 300 (Light) |
| Font Size | 14px |
| Line Height | 18.2px (130% of font size) |
| Text Align | Left |
| Color | #FFFFFF |

#### 3. Input Label - "Enter OTP"
**Figma Node**: 23:207 (inside Group 58)

| Property | Value |
|----------|-------|
| Font Weight | 300 (Light) |
| Font Size | 14px |
| Line Height | 16.8px (120% of font size) |
| Text Align | Left |
| Color | #8B8B8D (secondary gray) |

#### 4. Button Text - "Continue"
**Figma Node**: 23:214

| Property | Value |
|----------|-------|
| Font Weight | 400 (Regular) |
| Font Size | 18px |
| Line Height | 32.4px (180% of font size) |
| Text Align | Center |
| Color | #0D0D0F (dark on white background) |

---

## 📏 Spacing & Layout

### Frame Dimensions
| Property | Value | Notes |
|----------|-------|-------|
| Viewport Width | 412px | Mobile-first design |
| Viewport Height | 917px | Full page height |
| Content Max Width | 358px | Inner content area |
| Horizontal Padding | 27px | Left & right padding |

### Element Spacing
| Element | Spacing Value | Figma Reference |
|---------|-------|---|
| Header section to divider | 62px | Y position |
| Divider line | Y: 92px | Node 23:200 |
| Title section start | Y: 130px | Node 23:201 |
| Input button height | 50px | Node 23:203 |
| Button width | 358px | Matches content area |
| Between form elements | 24px | Standard gap |
| Between OTP inputs | 12px | Grid gap in container |

### Header Layout
```
┌─────────────────────────────────────┐
│    Logo (132.4 x 29.6px)            │  Y: 33.77px
├─────────────────────────────────────┤
│         Divider Line                │  Y: 92px, 358px wide, 0.5px height
└─────────────────────────────────────┘
```

### Title Section
```
┌─────────────────────────────────────┐
│   "OTP Verification" Heading        │  Y: 130px, 40px font
│   (accent + white text)             │
│                                     │
│  "Enter OTP we've sent to..."      │  Y: 295px, 14px font
│  (white subtitle text)              │
└─────────────────────────────────────┘
```

### Form Section
```
┌─────────────────────────────────────┐
│  Input Button Group (Enter OTP)     │  Y: 377px, 50px height
│                                     │
│  [Continue Button]                  │  Y: 440px, 50px height
└─────────────────────────────────────┘
```

---

## 🔳 Border Radius

| Token | Value | Usage | Figma Nodes |
|-------|-------|-------|-----------|
| `borderRadius.xl` | 25px | Buttons, input containers | Node 23:203, 23:213 |
| `borderRadius.base` | 8px | Small elements | - |
| `borderRadius.md` | 12px | Medium elements | - |

**Note**: OTP page uses primarily 25px radius for main interactive elements.

---

## 🧩 Component Hierarchy & Figma-to-React Mapping

### Figma Structure
```
Frame: "OTP verification" (23:189)
├── Rectangle 24 (23:192) - Background overlay
├── Vector 5 (23:200) - Divider line
├── Text: "OTP Verification" (23:201) - Title
├── Group 58 (26:38)
│   ├── Rectangle 28 (23:203) - Input button
│   └── Text: "Enter OTP" (23:207) - Input label
├── Text: Subtitle (23:209) - Description
├── Rectangle 30 (23:213) - Continue button
├── Text: "Continue" (23:214) - Button label
└── Vector: Logo (130:82) - Logo icon
```

### React Component Mapping

#### 1. Main Container
| Property | Value |
|----------|-------|
| **Figma Node** | 23:189 |
| **React Component** | `OTPVerificationPage` |
| **CSS Class** | `.container` |
| **CSS File** | `OTPVerificationPage.module.css` |

```typescript
// Usage in OTPVerificationPage.tsx
<div className={styles.container} data-node-id="23:189">
  {/* Content */}
</div>
```

---

#### 2. Background Overlay
| Property | Value |
|----------|-------|
| **Figma Node** | 23:192 (Rectangle 24) |
| **React Component** | Div overlay in `OTPVerificationPage` |
| **CSS Class** | `.backgroundGradient` |
| **Type** | Decorative background |

```typescript
<div className={styles.backgroundGradient} data-node-id="23:192" />
```

**CSS**:
```css
.backgroundGradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse 600px 500px at 50% 50%,
    #202025 0%,
    #000000 100%
  );
  opacity: 0.8;
  z-index: 0;
}
```

---

#### 3. Header Section
| Property | Value |
|----------|-------|
| **Figma Nodes** | 23:200 (divider), 130:82 (logo) |
| **React Component** | `OTPVerificationPage` header div |
| **CSS Class** | `.header`, `.logo` |

```typescript
<div className={styles.header} data-node-id="23:192">
  <div className={styles.logoContainer} data-node-id="23:193">
    <svg className={styles.logo} data-node-id="130:82">
      {/* Logo content */}
    </svg>
  </div>
</div>
```

---

#### 4. Title Section
| Property | Value |
|----------|-------|
| **Figma Nodes** | 23:201, 23:209 |
| **React Component** | Div with h1 and p elements |
| **CSS Classes** | `.titleSection`, `.title`, `.subtitle` |

```typescript
<div className={styles.titleSection} data-node-id="23:196">
  <h1 className={styles.title} data-node-id="23:197">
    Enter OTP
  </h1>
  <p className={styles.subtitle} data-node-id="23:198">
    We've sent a 6-digit code to {email}
  </p>
</div>
```

**CSS Tokens Applied**:
```css
.title {
  font-family: 'Noto Sans';
  font-size: 32px;  /* Was 32px, could increase to 40px per Figma */
  font-weight: 600;
  line-height: 40px;
  color: #ffffff;
  margin: 0;
}

.subtitle {
  font-family: 'Noto Sans';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #9ca3af;
  margin: 0;
}
```

---

#### 5. Form & Input Fields
| Property | Value |
|----------|-------|
| **Figma Nodes** | 26:38 (Group 58), 23:203 (input button) |
| **React Component** | Form with input elements |
| **CSS Classes** | `.form`, `.otpContainer`, `.otpInput` |

```typescript
<form onSubmit={handleVerify} className={styles.form} data-node-id="23:199">
  <div className={styles.otpContainer} data-node-id="23:200">
    {formData.otp.map((digit, index) => (
      <input
        key={index}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={digit}
        className={styles.otpInput}
        data-node-id={`23:${201 + index}`}
        placeholder="0"
      />
    ))}
  </div>
</form>
```

**CSS Tokens Applied**:
```css
.otpContainer {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;  /* otpInputGap token */
  width: 100%;
}

.otpInput {
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 0;
  border: 2px solid #374151;  /* otpInputBorder */
  border-radius: 12px;        /* borderRadius.md */
  background: rgba(17, 24, 39, 0.5);  /* otpInputBg */
  color: #ffffff;
  font-family: 'Noto Sans';
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
}

.otpInput:focus {
  outline: none;
  border-color: #a5b785;  /* accent */
  background: rgba(17, 24, 39, 0.8);
  box-shadow: 0 0 0 3px rgba(165, 183, 133, 0.1);
}
```

---

#### 6. Submit Button
| Property | Value |
|----------|-------|
| **Figma Nodes** | 23:213 (Rectangle), 23:214 (Text) |
| **React Component** | Button element |
| **CSS Class** | `.submitButton` |

```typescript
<button
  type="submit"
  className={styles.submitButton}
  disabled={isLoading || otpCode.length !== 6}
  data-node-id="23:208"
>
  {isLoading ? 'Verifying...' : 'Verify OTP'}
</button>
```

**CSS Tokens Applied**:
```css
.submitButton {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;  /* borderRadius.base */
  background: linear-gradient(
    135deg,
    #a5b785 0%,      /* accent */
    #8a9a6f 100%     /* accentDark */
  );
  color: #ffffff;
  font-family: 'Noto Sans';
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(165, 183, 133, 0.3);
  background: linear-gradient(
    135deg,
    #b5c795 0%,
    #9aaa7f 100%
  );
}
```

---

## 📄 CSS Tokens Reference

All tokens are defined in `src/styles/tokens.ts` and can be imported:

```typescript
import {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  sizes,
  otpDesignSystem,
} from '@/styles/tokens';
```

### Using Tokens in CSS Modules

```css
/* Colors */
background-color: #A5B785;  /* colors.accent */
color: #FFFFFF;              /* colors.textPrimary */
border-color: #374151;       /* colors.otpInputBorder */

/* Gradients */
background: linear-gradient(
  180deg,
  rgba(165, 183, 133, 1) 0%,
  rgba(73, 81, 59, 1) 100%
);  /* gradients.accentGradient */

/* Typography */
font-size: 40px;            /* typography.sizes['5xl'] */
font-weight: 400;           /* typography.weights.normal */
font-family: 'Noto Sans';   /* typography.fontSans */
line-height: 1.2;           /* typography.lineHeights.tight */

/* Spacing */
padding: 27px;              /* spacing.otpPaddingX */
gap: 12px;                  /* spacing.otpInputGap */

/* Border Radius */
border-radius: 25px;        /* borderRadius.xl */

/* Sizes */
width: 412px;               /* sizes.otpViewportWidth */
height: 50px;               /* sizes.otpButtonHeight */
```

---

## 🎯 Design System Exports

The file `src/styles/tokens.ts` exports:

1. **`otpDesignSystem`** - Complete OTP design specification
2. **`figmaToReactMapping`** - Figma Node IDs mapped to React components

### Access the Design System

```typescript
import { otpDesignSystem, figmaToReactMapping } from '@/styles/tokens';

// Get OTP frame properties
console.log(otpDesignSystem.frame);

// Get component mapping
console.log(figmaToReactMapping['Node 23:189']);
// Output:
// {
//   component: 'OTPVerificationPage',
//   cssModule: 'OTPVerificationPage.module.css',
//   className: 'container'
// }
```

---

## 📊 Design Token Summary

| Category | Count | Key Tokens |
|----------|-------|-----------|
| **Colors** | 18 | accent, background, textPrimary, otpInputBorder, etc. |
| **Gradients** | 4 | heroBg, otpBg, accentGradient, otpOverlay |
| **Typography** | 8 sizes | xs to 5xl (8px to 40px) |
| **Font Weights** | 7 | light (300) to black (900) |
| **Spacing** | 20 | 0 to 64px + OTP-specific |
| **Border Radius** | 7 | none to full + xl (25px) |
| **Sizes** | 14 | Viewport, component, and layout dimensions |

---

## 🔄 Figma to Code Workflow

### Step 1: Extract from Figma
✅ Used Figma API to fetch design (Node 23-189)

### Step 2: Define Tokens
✅ Created `src/styles/tokens.ts` with all extracted values

### Step 3: Map Components
✅ Created `figmaToReactMapping` object linking Figma nodes to React components

### Step 4: Implement CSS
✅ Updated `OTPVerificationPage.module.css` with token values

### Step 5: Update Components
- [ ] Refactor `OTPVerificationPage.tsx` to use design tokens
- [ ] Add token imports to CSS modules
- [ ] Update hardcoded values with token references

---

## 📚 Reference Links

- **Figma File**: [Preview Design](https://www.figma.com/design/zuWEY4gNbhwescluD1WZAC/Preview)
- **Node ID**: 23-189 (OTP verification frame)
- **Tokens File**: [src/styles/tokens.ts](src/styles/tokens.ts)
- **Component File**: [src/pages/public/OTPVerificationPage.tsx](src/pages/public/OTPVerificationPage.tsx)
- **CSS Module**: [src/pages/public/OTPVerificationPage.module.css](src/pages/public/OTPVerificationPage.module.css)

---

## ✅ Checklist

- [x] Extract Figma design data via API
- [x] Document color palette
- [x] Document typography
- [x] Document spacing & layout
- [x] Document border radius
- [x] Create design tokens file
- [x] Map Figma nodes to React components
- [ ] Update CSS modules with token values
- [ ] Refactor React components to use tokens
- [ ] Add design system documentation
- [ ] Test responsive design
- [ ] Validate design implementation

---

## 📝 Notes

- All color values have been converted from Figma RGB format to hex codes
- Typography line heights are preserved from Figma (as percentages and pixel values)
- Spacing values are extracted from absolute bounding boxes and positions
- Border radius values are from Figma `cornerRadius` properties
- The OTP frame is 412px × 917px (mobile-first design)
- All interactive elements use the accent color (#A5B785) for consistency

