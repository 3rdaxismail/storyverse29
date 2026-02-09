// Typography design tokens from Figma
// Font sizes and line heights per design system specification

export const fontFamilies = {
  primary: 'Noto Sans, sans-serif',
} as const;

export const fontSizes = {
  display: 36,
  heading: 24,
  subheading: 18,
  body: 16,
  ui: 14,
  meta: 12,
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
} as const;

export const lineHeights = {
  display: 44,
  heading: 32,
  subheading: 26,
  body: 26,
  ui: 20,
  meta: 18,
} as const;

export const typography = {
  // Font Display - 36px / 44px line height
  // Use for: Landing hero, emotional statements
  display: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.display,
  },
  
  // Font Heading - 24px / 32px line height
  // Use for: Page titles, dashboard headings
  heading: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.heading,
  },
  
  // Font Subheading - 18px / 26px line height
  // Use for: Supporting lines, onboarding text
  subheading: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.subheading,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.subheading,
  },
  
  // Font Body - 16px / 26px line height
  // Use for: Story writing, reader view, card descriptions
  body: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.body,
  },
  
  // Font UI - 14px / 20px line height
  // Use for: Buttons, stats, inputs, navigation labels
  ui: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.ui,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.ui,
  },
  
  // Font Meta - 12px / 18px line height
  // Use for: Timestamps, helper text, captions
  meta: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.meta,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.meta,
  },
} as const;

export type TypographyStyle = typeof typography[keyof typeof typography];
