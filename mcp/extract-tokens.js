import fs from 'fs';

// Read the Figma file data
const figmaData = JSON.parse(fs.readFileSync('./figma-full-file.json', 'utf8'));

// Helper function to convert RGBA to CSS format
function rgbaToCSS(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Helper function to convert hex to RGBA
function hexToRGBA(hex) {
  if (!hex) return null;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Extract colors from variables
const colors = {};
const fonts = {};

if (figmaData.styles) {
  Object.entries(figmaData.styles).forEach(([key, style]) => {
    if (style.styleType === 'FILL' && style.name) {
      // Extract color from style
      const colorName = style.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      colors[colorName] = style;
    } else if (style.styleType === 'TEXT' && style.name) {
      // Extract font from style
      const fontName = style.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      fonts[fontName] = style;
    }
  });
}

// Traverse the document tree to find color and text styles
function traverseNode(node, path = []) {
  if (!node) return;

  // Extract fills (colors)
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill, index) => {
      if (fill.type === 'SOLID' && fill.color) {
        const colorName = node.name ? node.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : `color_${index}`;
        if (!colors[colorName] && fill.color) {
          colors[colorName] = rgbaToCSS(fill.color);
        }
      } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
        const colorName = node.name ? node.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : `gradient_${index}`;
        if (!colors[colorName]) {
          colors[colorName] = fill;
        }
      }
    });
  }

  // Extract text styles
  if (node.style && node.type === 'TEXT') {
    const fontName = node.name ? node.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : 'text_style';
    if (!fonts[fontName]) {
      fonts[fontName] = {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx || node.style.lineHeightPercent,
        letterSpacing: node.style.letterSpacing,
      };
    }
  }

  // Recurse into children
  if (node.children) {
    node.children.forEach((child) => traverseNode(child, [...path, node.name]));
  }
}

// Start traversal from document
if (figmaData.document) {
  traverseNode(figmaData.document);
}

// Also check for variables if available
if (figmaData.variables) {
  Object.entries(figmaData.variables).forEach(([id, variable]) => {
    const varName = variable.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    if (variable.resolvedType === 'COLOR') {
      Object.entries(variable.valuesByMode).forEach(([modeId, value]) => {
        if (value.r !== undefined) {
          colors[varName] = rgbaToCSS(value);
        }
      });
    }
  });
}

console.log('=== EXTRACTED COLORS ===');
console.log(JSON.stringify(colors, null, 2));
console.log('\n=== EXTRACTED FONTS ===');
console.log(JSON.stringify(fonts, null, 2));

// Save to file
fs.writeFileSync('./extracted-tokens.json', JSON.stringify({ colors, fonts }, null, 2));
console.log('\nTokens saved to extracted-tokens.json');
