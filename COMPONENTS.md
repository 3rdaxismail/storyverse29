# Component Documentation

## Overview

This document lists all components in the Storyverse application, their Figma sources, purposes, and WritingSessionEngine integration status.

---

## Writing-Aware Components (Engine-Bound)

These components are connected to the WritingSessionEngine and manage text content with undo/redo, autosave, and editor states.

### WritingSurface
- **File**: `src/components/editor/WritingSurface.tsx`
- **Figma Source**: `writing / surface` (Story editor frame)
- **Purpose**: Main text editing area for chapter content
- **Engine Binding**: ✅ Yes
- **Section ID**: `chapter-content` (configurable via props)
- **Editor States**: empty, idle, focused, typing, selection, disabled, readOnly
- **Props**:
  ```typescript
  {
    sectionId: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    minHeight?: string;
  }
  ```
- **Features**:
  - Debounced autosave (2 seconds)
  - Undo/Redo with Cmd+Z / Ctrl+Z
  - Word-safe cursor position preservation
  - Real-time state indicator

### TitleField
- **File**: `src/components/editor/TitleField.tsx`
- **Figma Source**: `Chapter 1 (Text)`, `StoryHeader` text elements
- **Purpose**: Title editor for chapters, stories, sections
- **Engine Binding**: ✅ Yes
- **Section ID**: Configurable via props
- **Editor States**: empty, idle, focused, typing, selection, disabled, readOnly
- **Props**:
  ```typescript
  {
    sectionId: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
  }
  ```
- **Features**:
  - Undo/Redo support
  - Auto-blur on Enter key
  - Multiple font size variants

### ExcerptBlock
- **File**: `src/components/editor/ExcerptBlock.tsx`
- **Figma Source**: `ExcerptBlock` (Story editor frame)
- **Purpose**: Story excerpt display and editing
- **Engine Binding**: ✅ Yes (dual sections)
- **Section IDs**: 
  - `excerptHeadingSectionId` (heading)
  - `excerptBodySectionId` (body text)
- **Editor States**: Independent states for heading and body
- **Props**:
  ```typescript
  {
    excerptHeadingSectionId: string;
    excerptBodySectionId: string;
    readOnly?: boolean;
  }
  ```
- **Features**:
  - Two independent editing areas
  - Custom styling for heading (brand color)
  - Synchronized state management

---

## Pure UI Components (No Engine Binding)

These components handle presentation and interaction but don't manage text content through the engine.

### HeaderBar
- **File**: `src/components/header/HeaderBar.tsx`
- **Figma Source**: `Frame 50` (Story editor header)
- **Purpose**: Top navigation bar with logo and actions
- **Engine Binding**: ❌ No
- **Props**:
  ```typescript
  {
    title?: string;
  }
  ```

### BottomNavigation
- **File**: `src/components/navigation/BottomNavigation.tsx`
- **Figma Source**: `nav-bottom` (Story editor frame)
- **Purpose**: Bottom navigation bar with primary actions
- **Engine Binding**: ❌ No
- **Features**:
  - Home, Folder, Community, Trending navigation
  - Write button (floating action button)
  - Notification indicators

### CharactersRow
- **File**: `src/components/story/CharactersRow.tsx`
- **Figma Source**: `Frame 52/Frame 53` (Character avatars)
- **Purpose**: Display character avatars with add button
- **Engine Binding**: ❌ No
- **Props**:
  ```typescript
  {
    characters: Character[];
    maxCharacters?: number;
  }
  ```

### StatsStrip
- **File**: `src/components/story/StatsStrip.tsx`
- **Figma Source**: `StoryStatsBlock`
- **Purpose**: Display story statistics (words, dialogues, characters, etc.)
- **Engine Binding**: ❌ No
- **Props**:
  ```typescript
  {
    words: string;
    dialogues: string;
    characters: string;
    locations: string;
    acts: string;
  }
  ```

### StoryMetaCard
- **File**: `src/components/story/StoryMetaCard.tsx`
- **Figma Source**: `StoryMetaBlock`
- **Purpose**: Display story metadata (name, genre, audience, etc.)
- **Engine Binding**: ❌ No
- **Props**:
  ```typescript
  {
    storyName: string;
    genre: string;
    audience: string;
    readTime: string;
    privacy: string;
  }
  ```

---

## Hooks

### useEditorState
- **File**: `src/hooks/useEditorState.ts`
- **Purpose**: Determines editor component state based on content, focus, typing activity, and selection
- **Returns**: `EditorState` enum value
- **Usage**:
  ```typescript
  const editorState = useEditorState(inputRef, {
    content: string,
    disabled?: boolean,
    readOnly?: boolean,
  });
  ```
- **States**:
  - `empty`: No content present
  - `idle`: Has content, not focused
  - `focused`: Has focus, no typing
  - `typing`: Active typing detected (500ms debounce)
  - `selection`: Text is selected
  - `disabled`: Component is disabled
  - `readOnly`: Component is read-only

---

## Core Engine

### WritingSessionEngine
- **File**: `src/engine/WritingSessionEngine.ts`
- **Type**: Singleton class
- **Purpose**: Centralized content management, undo/redo, autosave
- **Import**: `import writingSessionEngine from '../../engine/WritingSessionEngine';`

#### Key Methods

```typescript
// Initialize session
initSession(documentId?: string): void;

// Content management
updateContent(sectionId: string, newText: string, cursorPos: number): void;
getContent(sectionId: string): string;

// Cursor management
getCursorPosition(): number;
setCursorPosition(position: number): void;

// Undo/Redo
undo(): void;
redo(): void;
canUndo(): boolean;
canRedo(): boolean;

// Session management
saveSession(): void;
setActiveSection(sectionId: string): void;
subscribe(listener: () => void): () => void;
```

#### Features

- **Debounced Autosave**: 2-second delay after last edit
- **Word-Safe Persistence**: Ensures cursor is at word boundaries when saving
- **Undo Stack**: Maximum 50 items
- **LocalStorage Persistence**: Automatic save/restore
- **Observable Pattern**: Subscribe to state changes

---

## Theme System

### Design Tokens
- **Files**:
  - `src/theme/tokens.ts` - Colors
  - `src/theme/typography.ts` - Fonts, sizes, weights
  - `src/theme/spacing.ts` - Spacing, border radius
  - `src/theme/index.ts` - Centralized export

### Usage

```typescript
import { colors, typography, spacing } from '../theme';

// In CSS modules, use CSS variables:
// var(--color-brand-primary)
// var(--font-primary)
```

---

## Page Layouts

### StoryEditorPage
- **File**: `src/pages/story/StoryEditorPage.tsx`
- **Figma Source**: `Story editor` (Frame 70:2)
- **Purpose**: Main editor page layout
- **Engine Integration**: ✅ Initializes session on mount
- **Sections**:
  1. Header (HeaderBar)
  2. Meta Section (StoryMetaCard, StatsStrip)
  3. Writing Section (TitleField, CharactersRow, WritingSurface)
  4. Excerpt Section (ExcerptBlock)
  5. Bottom Navigation (BottomNavigation)

---

## Component Hierarchy

```
StoryEditorPage
├── HeaderBar
├── StoryMetaCard
├── StatsStrip
├── TitleField (Engine-bound: chapter-title)
├── CharactersRow
├── WritingSurface (Engine-bound: chapter-content)
├── ExcerptBlock (Engine-bound: excerpt-heading, excerpt-body)
└── BottomNavigation
```

---

## Validation Checklist

✅ All text input fields have engine binding with sectionId  
✅ No hardcoded colors - all use theme tokens  
✅ No hardcoded fonts - all use theme typography  
✅ Figma component variants implemented as component state logic  
✅ Cursor position preserved on re-render  
✅ Autosave triggers after 2 seconds of inactivity  
✅ Undo/redo works with keyboard shortcuts  
✅ Editor states transition correctly  

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Architecture Notes

1. **Single Source of Truth**: WritingSessionEngine manages all content
2. **No Direct State Mutation**: Components read from engine, update via engine methods
3. **Observable Pattern**: Components subscribe to engine updates
4. **Figma Fidelity**: Design tokens extracted directly from Figma
5. **Accessibility**: All inputs have proper ARIA labels and semantic HTML

---

Last Updated: January 26, 2026
