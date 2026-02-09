// Design tokens extracted from Figma
// Source: Storyverse Design System
// File: https://www.figma.com/design/hGphC3Bq9sx5G84wU3ZUKe/
// Generated from Figma on ${new Date().toISOString()}
// DO NOT MODIFY MANUALLY - Regenerate from Figma when design system changes

export const colors = {
  // Primary colors
  textWhite: '#F5F5F5',
  textBlack: '#1B1C1E',
  textTemp: '#929293',
  brandAnchor: '#A7BA88',
  iconsGrey: '#A2A2A2',
  appBg: '#0F1216',
  darkButton: '#2F3640',
  borders: '#2C3838',
  cardDarkBg: '#161B22',
  cardGreyBg: '#D8D8D9',
  
  // Secondary colors
  green: '#43FF92',
  yellow: '#FFDB4B',
  red: '#FF6C57',
  pink: '#FFA9FB',
  blue: '#79A5FF',
  violet: '#A793FF',
} as const;

export const typography = {
  // Font Display - 36px / 44px line height
  // Use for: Landing hero, emotional statements ("Millions start stories")
  display: {
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: 36,
    fontWeight: 600,
    lineHeight: 44,
    letterSpacing: 0,
  },
  
  // Font Heading - 24px / 32px line height
  // Use for: Page titles, dashboard headings ("Craft the Epic")
  heading: {
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 32,
    letterSpacing: 0,
  },
  
  // Font Subheading - 18px / 26px line height
  // Use for: Supporting lines, onboarding text ("One Scene at a Time")
  subheading: {
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 26,
    letterSpacing: 0,
  },
  
  // Font Body - 16px / 26px line height
  // Use for: Story writing, reader view, card descriptions
  body: {
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 26,
    letterSpacing: 0,
  },
  
  // Font UI - 14px / 20px line height
  // Use for: Buttons, stats, inputs, navigation labels
  ui: {
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Font Meta - 12px / 18px line height
  // Use for: Timestamps, helper text, captions
  meta: {
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 18,
    letterSpacing: 0,
  },
} as const;

export type ColorToken = typeof colors[keyof typeof colors];
export type TypographyToken = typeof typography[keyof typeof typography];
