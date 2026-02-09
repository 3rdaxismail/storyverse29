// Design tokens extracted from Figma
// Source: Storyverse App (Working File)
// DO NOT MODIFY - Generated from Figma design system

export const colors = {
  // Background colors
  bgPrimary: 'rgba(13, 13, 15, 1)',
  bgSecondary: 'rgba(15, 18, 22, 1)',
  bgTertiary: 'rgba(22, 27, 34, 1)',
  bgCard: 'rgba(43, 42, 48, 1)',
  bgInput: 'rgba(48, 45, 45, 1)',
  bgButton: 'rgba(47, 54, 64, 1)',
  bgButtonDark: 'rgba(26, 26, 26, 1)',
  bgNav: 'rgba(0, 0, 0, 1)',
  bgOverlay: 'rgba(0, 0, 0, 0.61)',
  bgDark: 'rgba(47, 59, 59, 1)',
  bgHover: 'rgba(53, 53, 53, 1)',
  
  // Text colors
  textPrimary: 'rgba(255, 255, 255, 1)',
  textSecondary: 'rgba(245, 245, 245, 1)',
  textTertiary: 'rgba(162, 162, 162, 1)',
  textMuted: 'rgba(112, 112, 112, 1)',
  textDark: 'rgba(27, 28, 30, 1)',
  textPlaceholder: 'rgba(140, 139, 145, 1)',
  textGray: 'rgba(76, 76, 76, 1)',
  textLight: 'rgba(227, 227, 227, 1)',
  
  // Brand colors
  brandPrimary: 'rgba(167, 186, 136, 1)',
  brandSecondary: 'rgba(165, 183, 133, 1)',
  
  // Status colors
  statusError: 'rgba(255, 108, 87, 1)',
  statusSuccess: 'rgba(67, 255, 146, 1)',
  statusNotification: 'rgba(255, 0, 132, 1)',
  
  // Utility colors
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
  neutral: 'rgba(217, 217, 217, 1)',
  
  // Google colors (for auth)
  googleBlue: 'rgba(66, 133, 244, 1)',
  googleGreen: 'rgba(52, 168, 83, 1)',
  googleYellow: 'rgba(251, 188, 4, 1)',
  googleRed: 'rgba(233, 66, 53, 1)',
} as const;

export type ColorToken = typeof colors[keyof typeof colors];
