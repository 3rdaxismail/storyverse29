// Spacing design tokens from Figma
// DO NOT MODIFY - Generated from Figma design system

export const spacing = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  5: '5px',
  6: '6px',
  7: '7px',
  8: '8px',
  9: '9px',
  10: '10px',
  11: '11px',
  12: '12px',
  13: '13px',
  14: '14px',
  15: '15px',
  16: '16px',
  17: '17px',
  18: '18px',
  20: '20px',
  22: '22px',
  24: '24px',
  28: '28px',
  32: '32px',
  36: '36px',
  40: '40px',
  48: '48px',
  52: '52px',
  56: '56px',
  64: '64px',
  72: '72px',
  80: '80px',
  96: '96px',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
  circle: '52px', // Extracted from nav-bottom
} as const;

export type Spacing = typeof spacing[keyof typeof spacing];
export type BorderRadius = typeof borderRadius[keyof typeof borderRadius];
