/**
 * Design Tokens for Storyverse Application
 * Extracted from Figma design via MCP
 * Includes: Preview Landing Page (Node 0-3), OTP Verification Page (Node 23-189)
 * Mobile-first: 412px base width
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary & Accent
  accent: '#A5B785', // Green accent for buttons, highlights (RGB: 165, 183, 133)
  accentDark: '#495139', // Darker green for gradients (RGB: 73, 81, 59)
  
  // Backgrounds
  background: '#0D0D0F', // Main dark background
  backgroundDark: '#0D0D0F',
  backgroundGradientLight: '#323235', // Light gradient stop (RGB: 50, 50, 53)
  backgroundGradientStart: '#202025', // Gradient stop 1
  backgroundGradientEnd: '#0A0A0C', // Gradient end (RGB: 10, 10, 12)
  surfaceLight: '#2B2A30', // Light surface for cards
  surfaceDarkGradientStart: '#202025', // Gradient stop 1
  surfaceDarkGradientEnd: '#232227', // Gradient stop 2
  
  // Text
  textPrimary: '#FFFFFF', // Primary text (RGB: 255, 255, 255)
  textSecondary: '#8C8B91', // Secondary/muted text (RGB: 140, 139, 145)
  textMuted: '#707070', // Very muted text
  textTertiary: '#9CA3AF', // Tertiary text (from OTP - RGB: 156, 163, 175)
  
  // Dividers & Borders
  border: '#302D2D', // Border color
  borderLight: '#3D3C41', // Light border (RGB: 61, 60, 65)
  
  // Status
  error: '#FF0084', // Pink/magenta accent
  errorLight: '#EF4444', // Error red (RGB: 239, 68, 68)
  
  // OTP-specific colors
  otpDivider: '#A5B785', // Divider line color (same as accent)
  otpInputBg: '#111827', // Input background (RGB: 17, 24, 39)
  otpInputBorder: '#374151', // Input border (RGB: 55, 65, 81)
  otpSecondaryText: '#8B8B8D', // Secondary text in OTP elements
};

// ============================================================================
// GRADIENTS (Extracted from Figma)
// ============================================================================

export const gradients = {
  // Hero background gradient (top to bottom)
  heroBg: `linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(32, 32, 37, 1) 100%)`,
  
  // Card backgrounds (diagonal)
  cardBg: `linear-gradient(134deg, rgba(43, 42, 48, 1) 10%, rgba(35, 34, 39, 1) 98%)`,
  
  // Button/accent gradient (from OTP - Node 23:203)
  accentGradient: `linear-gradient(180deg, rgba(165, 183, 133, 1) 0%, rgba(73, 81, 59, 1) 100%)`,
  
  // OTP Background gradient (radial - from Node 23:189)
  otpBg: `radial-gradient(circle at 64% 62.6%, rgba(63.75, 52, 79, 1) 0%, rgba(10, 10, 12, 1) 100%)`,
  
  // Overlay gradient for OTP background
  otpOverlay: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(32, 32, 37, 0.8) 100%)`,
};

// ============================================================================
// TYPOGRAPHY (Extracted from Figma)
// ============================================================================

export const typography = {
  // Fonts
  fontSerif: '"Noto Serif", serif',
  fontSans: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  
  // Font sizes (in pixels) - OTP specific sizes
  sizes: {
    xs: 8,
    sm: 10,
    base: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 22,
    '3xl': 25,
    '4xl': 32, // OTP title size
    '5xl': 40, // OTP heading size
  },
  
  // Line heights (unitless)
  lineHeights: {
    tight: 1.2,
    normal: 1.3,
    relaxed: 1.5,
    loose: 1.6,
  },
  
  // Font weights
  weights: {
    light: 300,     // "Light" - for subtitles
    normal: 400,    // "Regular" - normal text
    medium: 500,    // "Medium" - medium text
    semibold: 600,  // "Semibold"
    bold: 700,      // "Bold"
    extrabold: 800, // "Extrabold"
    black: 900,     // "Black"
  },
  
  // Predefined styles (from Figma design)
  // OTP Page - Heading (Node 23:201)
  otpHeading: {
    fontFamily: '"Noto Sans"',
    fontSize: 40,
    fontWeight: 400,
    lineHeight: 1.2, // 48px line height
    letterSpacing: 0,
  },
  
  // OTP Page - Title section (Node 23:207)
  otpTitle: {
    fontFamily: '"Noto Sans"',
    fontSize: 14,
    fontWeight: 300, // Light weight
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  
  // OTP Page - Subtitle (Node 23:209)
  otpSubtitle: {
    fontFamily: '"Noto Sans"',
    fontSize: 14,
    fontWeight: 300, // Light weight
    lineHeight: 1.3,
    letterSpacing: 0,
  },
  
  // OTP Button text (Node 23:214)
  otpButtonText: {
    fontFamily: '"Noto Sans"',
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.8,
    letterSpacing: 0,
  },
  
  heading1: {
    fontFamily: '"Noto Serif"',
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1.2,
  },
  heading2: {
    fontFamily: '"Noto Serif"',
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  bodyLarge: {
    fontFamily: '"Noto Sans"',
    fontSize: 12,
    fontWeight: 300,
    lineHeight: 1.3,
  },
  bodyBase: {
    fontFamily: '"Noto Sans"',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.3,
  },
  caption: {
    fontFamily: '"Noto Sans"',
    fontSize: 8,
    fontWeight: 400,
    lineHeight: 1.3,
  },
};

// ============================================================================
// SPACING (Extracted from Figma)
// ============================================================================

export const spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
  
  // OTP specific spacing
  otpPaddingX: 27, // Horizontal padding (from Node 23:189)
  otpPaddingTop: 34, // Top padding for header
  otpPaddingBottom: 40, // Bottom padding for form
  otpTitleGap: 12, // Gap between title and subtitle
  otpFormGap: 24, // Gap between form elements
  otpInputGap: 12, // Gap between OTP input fields
  otpDividerY: 62, // Vertical position of divider line
};

// ============================================================================
// BORDER RADIUS (Extracted from Figma)
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 20,
  xl: 25,  // OTP button corner radius (from Node 23:203, 23:213)
  full: 9999,
};

// ============================================================================
// RESPONSIVE BREAKPOINTS (Mobile-first)
// ============================================================================

export const breakpoints = {
  mobile: 412,  // Base mobile width (Figma design)
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.2)',
};

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// ============================================================================
// SIZES (Mobile-first layout, Extracted from Figma)
// ============================================================================

export const sizes = {
  // OTP Viewport dimensions (from Node 23:189 Frame)
  otpViewportWidth: 412,   // Frame width
  otpViewportHeight: 917,  // Frame height
  
  // OTP Content dimensions
  otpMaxContentWidth: 358,       // Inner content width
  otpContentPaddingX: 27,        // Left/right padding
  otpContentPaddingXMobile: 16,  // Mobile padding
  
  // OTP Elements
  otpInputSize: 50,        // OTP input field dimensions (from button 23:203)
  otpButtonHeight: 50,     // Continue button height (from Node 23:213)
  otpButtonWidth: 358,     // Button width
  
  // OTP Layout
  otpHeaderHeight: 92,     // Header section height
  otpDividerPositionY: 92, // Divider line Y position
  otpTitlePositionY: 130,  // Title section Y position
  
  // Original viewport (for reference)
  mobileViewportWidth: 412,
  mobileViewportHeight: 917,
  maxContentWidth: 358,
  contentPaddingX: 27,
  buttonHeight: 48,
  inputHeight: 44,
  headerHeight: 60,
  cardPadding: 24,
};
// ============================================================================
// OTP VERIFICATION PAGE - DESIGN SYSTEM
// ============================================================================
// Extracted from Figma Node ID 23-189
// Maps Figma components to React components and CSS tokens

export const otpDesignSystem = {
  // Frame properties (Node 23:189)
  frame: {
    name: 'OTP verification',
    width: sizes.otpViewportWidth,
    height: sizes.otpViewportHeight,
    background: colors.background,
  },
  
  // Background overlay (Node 23:192) - Rectangle 24
  backgroundOverlay: {
    type: 'RECTANGLE',
    fill: gradients.otpBg,
    opacity: 0.4,
  },
  
  // Divider line (Node 23:200) - Vector 5
  dividerLine: {
    type: 'VECTOR',
    stroke: colors.otpDivider,
    strokeWeight: 0.5,
    width: 358,
    positionY: sizes.otpDividerPositionY,
  },
  
  // Page title (Node 23:201) - OTP Verification
  pageTitle: {
    type: 'TEXT',
    text: 'OTP  \nVerification',
    color: colors.accent,
    fontSize: typography.sizes['5xl'], // 40px
    fontWeight: typography.weights.normal, // 400
    fontFamily: typography.fontSans,
    textAlign: 'center',
    lineHeight: typography.lineHeights.tight,
  },
  
  // Input field button (Node 23:203, Group 58) - Enter OTP
  inputButton: {
    type: 'GROUP',
    children: [
      {
        name: 'Rectangle 28',
        type: 'RECTANGLE',
        width: 358,
        height: 50,
        borderRadius: borderRadius.xl, // 25px
        fill: 'gradient (dark)', // From style "card dark"
        stroke: colors.otpInputBorder,
        strokeWeight: 1,
      },
      {
        name: 'Enter OTP Label',
        type: 'TEXT',
        fontSize: typography.sizes.md, // 14px
        fontWeight: typography.weights.light, // 300
        color: colors.textTertiary,
      },
    ],
  },
  
  // Subtitle text (Node 23:209)
  subtitle: {
    type: 'TEXT',
    fontSize: typography.sizes.md, // 14px
    fontWeight: typography.weights.light, // 300
    color: colors.textPrimary,
    fontFamily: typography.fontSans,
  },
  
  // Continue button (Node 23:213) - Rectangle 30
  continueButton: {
    type: 'RECTANGLE',
    width: sizes.otpButtonWidth,
    height: sizes.otpButtonHeight,
    borderRadius: borderRadius.xl, // 25px
    fill: colors.textPrimary, // White
    stroke: colors.otpInputBorder,
    strokeWeight: 1,
  },
  
  // Button text (Node 23:214) - Continue
  buttonText: {
    type: 'TEXT',
    text: 'Continue',
    fontSize: typography.sizes.xl, // 18px
    fontWeight: typography.weights.normal, // 400
    fontFamily: typography.fontSans,
    color: '#0D0D0F', // Dark text on white background
    textAlign: 'center',
  },
  
  // Logo (Node 130:82)
  logo: {
    type: 'VECTOR',
    width: 132.4,
    height: 29.6,
    fill: colors.accent,
  },
};

// ============================================================================
// FIGMA TO REACT COMPONENT MAPPING
// ============================================================================

export const figmaToReactMapping = {
  'Node 23:189': {
    component: 'OTPVerificationPage',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'container',
  },
  'Node 23:192': {
    component: 'OTPVerificationPage',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'backgroundGradient',
    type: 'background overlay rectangle',
  },
  'Node 23:200': {
    component: 'OTPVerificationPage',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'dividerLine (header section)',
    type: 'decorative vector',
  },
  'Node 23:201': {
    component: 'OTPVerificationPage (titleSection)',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'title',
    htmlElement: 'h1',
  },
  'Node 26:38 (Group 58, Node 23:203)': {
    component: 'OTPVerificationPage (formSection)',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'otpContainer',
    type: 'OTP input fields group (6 digits)',
  },
  'Node 23:209': {
    component: 'OTPVerificationPage (titleSection)',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'subtitle',
    htmlElement: 'p',
  },
  'Node 23:213': {
    component: 'OTPVerificationPage (form button)',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'submitButton',
    htmlElement: 'button',
  },
  'Node 23:214': {
    component: 'OTPVerificationPage (button text)',
    className: 'submitButton (text content)',
    htmlElement: 'button > text',
  },
  'Node 130:82': {
    component: 'OTPVerificationPage (header)',
    cssModule: 'OTPVerificationPage.module.css',
    className: 'logo',
    htmlElement: 'svg / img',
  },
};