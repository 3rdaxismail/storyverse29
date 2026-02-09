// Centralized theme system
// Exports all design tokens and utilities

// Import Figma design tokens as the source of truth
import { colors as figmaColors, typography as figmaTypography } from './figma-tokens';
import { colors } from './tokens';
import { typography, fontFamilies, fontSizes, fontWeights, lineHeights } from './typography';
import { spacing, borderRadius } from './spacing';

export const theme = {
  // Figma design tokens (source of truth)
  figma: {
    colors: figmaColors,
    typography: figmaTypography,
  },
  
  // Legacy tokens (keep for backwards compatibility)
  colors,
  typography,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  
  // Breakpoints for responsive design
  breakpoints: {
    mobile: '375px',
    tablet: '834px',
    desktop: '1440px',
  },
  
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    overlay: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
} as const;

export default theme;

// Re-export for convenience
export { colors } from './tokens';
export { typography, fontFamilies, fontSizes, fontWeights, lineHeights } from './typography';
export { spacing, borderRadius } from './spacing';
