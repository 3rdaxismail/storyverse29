# Extracted Icons from group-header-actions

## Extraction Date
12/29/2025, 12:57:00 AM

## Figma Source
- **File**: zuWEY4gNbhwescluD1WZAC (Preview)
- **Group**: group-header-actions (ID: 231:12)
- **Layer**: Dashboard

## Extracted Assets

### logo-storyverse
- **File**: `logo-storyverse.svg`
- **Path**: `src\assets\icons\figma\logo-storyverse.svg`
- **Node ID**: `5:85`
- **URL**: [View on Figma](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0a7707e2-7431-4f84-b5ea-36d11f10b864)
- **Status**: Extracted from Figma

### btn-inbox-icon
- **File**: `btn-inbox-icon.svg`
- **Path**: `src\assets\icons\figma\btn-inbox-icon.svg`
- **Node ID**: `5:84`
- **URL**: [View on Figma](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/505bd076-d158-484c-9992-48a61e4e4bab)
- **Status**: Extracted from Figma

### indicator-unread
- **File**: `indicator-unread-template.svg`
- **Path**: `src\assets\icons\figma\indicator-unread-template.svg`
- **Node ID**: `231:19`
- **URL**: Template
- **Status**: Template (requires manual SVG editing)


## Usage

### Import All Icons
```typescript
import { logoStoryverse, btnInboxIcon, indicatorUnread } from '@/assets/icons/figma';
```

### Import Specific Icon
```typescript
import logoStoryverse from '@/assets/icons/figma/logo-storyverse.svg';
```

### Use in Component
```tsx
import { logoStoryverse } from '@/assets/icons/figma';

export function Header() {
  return (
    <img src={logoStoryverse} alt="Storyverse" width="36" height="36" />
  );
}
```

## Icon Specifications

### Logo (logo-storyverse)
- **Type**: Vector
- **Purpose**: Brand logo/mark
- **Recommended Size**: 36×36px
- **Color**: #9dbb7d (Green accent)

### Inbox Button Icon (btn-inbox-icon)
- **Type**: Vector Group
- **Purpose**: Notification/message icon
- **Recommended Size**: 20×20px
- **Color**: #eaeaea (Light gray)

### Unread Indicator (indicator-unread)
- **Type**: Ellipse
- **Purpose**: Badge for unread count
- **Recommended Size**: 8×8px or variable
- **Color**: #ff4444 (Red)

## Next Steps

1. Review extracted SVG files
2. Adjust viewBox if needed
3. Update color variables to use CSS variables
4. Test in HeaderFromFigma component
5. Optimize SVG for web

## Files Created

- `src\assets\icons\figma\logo-storyverse.svg`
- `src\assets\icons\figma\btn-inbox-icon.svg`
- `src\assets\icons\figma\indicator-unread-template.svg`
- `src\assets\icons\figma\index.ts` (Index file)
