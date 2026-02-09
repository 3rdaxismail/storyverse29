# Writing Session Engine Integration

## Overview

The Story Editor is now fully connected to a **WritingSessionEngine** that provides persistent state management for all writing content, including the story title. This ensures that:

- ✅ Story title persists across page reloads
- ✅ Only one text editor is active at a time
- ✅ All content is auto-saved to localStorage
- ✅ No data loss on browser refresh
- ✅ Clean separation of concerns (UI vs. business logic)

## Architecture

### WritingSessionEngine (Single Source of Truth)

**Location**: `src/engine/WritingSessionEngine.ts`

**Responsibilities**:
- Manage story metadata (title, ID)
- Track active editor (only one active at a time)
- Store all editor content (title, chapters, excerpts)
- Persist state to localStorage
- Provide undo/redo functionality
- Notify subscribers of state changes

**Key Methods**:
```typescript
initSession(documentId?: string): void
setStoryTitle(title: string): void
getStoryTitle(): string
setActiveEditor(editorId: string): void
getActiveEditorId(): string
updateContent(sectionId: string, text: string, cursorPos: number): void
getContent(sectionId: string): string
subscribe(listener: () => void): () => void
```

### Hooks

#### `useStoryTitle()`
**Location**: `src/hooks/useWritingSession.ts`

Connects UI components to the story title in the session engine.

```typescript
const [title, setTitle] = useStoryTitle();

// Read title
console.log(title);

// Update title (persisted automatically)
setTitle('New Story Title');
```

#### `useActiveEditor(editorId)`
**Location**: `src/hooks/useWritingSession.ts`

Tracks whether a specific editor is currently active.

```typescript
const isActive = useActiveEditor('story-title');

// Use for visual feedback
<div className={isActive ? 'active' : 'inactive'}>
```

#### `useWritingSession(options)`
**Location**: `src/hooks/useWritingSession.ts`

General-purpose hook for connecting any text input to the session.

```typescript
const { content, isActive, handleChange, handleFocus, handleBlur } = 
  useWritingSession({
    editorId: 'my-editor',
    debounceMs: 300
  });
```

## Components Integration

### TitleInputBlock
**Location**: `src/components/story/StoryMetaSection/TitleInputBlock.tsx`

**How it works**:
1. Reads initial title from `WritingSessionEngine.getStoryTitle()`
2. Registers itself with editorId = `'story-title'`
3. On focus, sets active editor: `setActiveEditor('story-title')`
4. On change, updates engine: `setStoryTitle(newValue)`
5. Engine auto-saves to localStorage after debounce
6. Visual feedback when active (green border)

**Props**:
```typescript
interface TitleInputBlockProps {
  value?: string;        // Ignored - session is source of truth
  onChange?: (value: string) => void; // Optional sync callback
  placeholder?: string;
}
```

### WritingSurface
**Location**: `src/components/editor/WritingSurface.tsx`

**Registration**:
- On focus: `setActiveEditor(sectionId)`
- Deactivates other editors automatically

### ExcerptBlock
**Location**: `src/components/editor/ExcerptBlock.tsx`

**Registration**:
- Heading input: `setActiveEditor(excerptHeadingSectionId)`
- Body textarea: `setActiveEditor(excerptBodySectionId)`

### StoryEditorPage
**Location**: `src/pages/story-editor/StoryEditorPage.tsx`

**Initialization**:
```typescript
useEffect(() => {
  writingSessionEngine.initSession('titanic-story');
}, []);
```

This initializes the session and restores saved state (title, content) from localStorage.

## Persistence

### LocalStorage Structure

**Key**: `session_{documentId}`

**Value** (JSON):
```json
{
  "sessionId": "session_1234567890_abc123",
  "activeDocumentId": "titanic-story",
  "activeSectionId": "chapter-content",
  "activeEditorId": "story-title",
  "storyTitle": "Titanic",
  "cursorPosition": 42,
  "contentBlocks": [
    {
      "id": "excerpt-heading",
      "type": "caption",
      "text": "Excerpt",
      "metadata": {}
    },
    {
      "id": "chapter-content",
      "type": "paragraph",
      "text": "Once upon a time...",
      "metadata": {}
    }
  ],
  "timestamp": 1706400000000
}
```

### Auto-Save Behavior

1. **Debounced**: Changes are saved 2 seconds after user stops typing
2. **Word-safe**: Cursor position preserved at word boundaries
3. **Automatic**: No manual "save" button needed
4. **Reliable**: Survives browser refresh/crash

## Single-Active-Editor Flow

### How It Works

1. User focuses on story title input
   - `TitleInputBlock` calls `setActiveEditor('story-title')`
   - Engine updates `activeEditorId = 'story-title'`
   - All subscribed components re-render
   - Other editors see `isActive = false`

2. User focuses on chapter textarea
   - `WritingSurface` calls `setActiveEditor('chapter-content')`
   - Engine updates `activeEditorId = 'chapter-content'`
   - Title input sees `isActive = false` (border color changes)
   - Chapter textarea sees `isActive = true`

### Visual Feedback

**Active Editor**:
- Green border: `border-color: rgba(165, 183, 133, 0.5)`
- Transition: `transition: border-color 0.2s ease`

**Inactive Editor**:
- Default border: `border-color: rgba(48, 45, 45, 1)`

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  WritingSessionEngine                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ State:                                           │  │
│  │ - storyTitle: "Titanic"                          │  │
│  │ - activeEditorId: "story-title"                  │  │
│  │ - contentBlocks: Map<id, ContentBlock>           │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│                   Persistence Layer                     │
│                          ↓                              │
│              localStorage: session_titanic-story        │
└─────────────────────────────────────────────────────────┘
                          ↑
                          │ subscribe()
         ┌────────────────┼────────────────┐
         ↓                ↓                ↓
   ┌───────────┐   ┌─────────────┐   ┌──────────┐
   │ TitleInput│   │WritingSurface│   │ Excerpt  │
   │   Block   │   │              │   │  Block   │
   └───────────┘   └─────────────┘   └──────────┘
   editorId:       editorId:          editorId:
   'story-title'   'chapter-content'  'excerpt-heading'
```

## Migration from Old Behavior

### Before (Component-Managed State)

```tsx
const [title, setTitle] = useState('Titanic');

<TitleInputBlock
  value={title}
  onChange={setTitle}
/>
```

**Problems**:
- ❌ State lost on refresh
- ❌ No persistence
- ❌ No coordination between editors
- ❌ Parent component manages title

### After (Engine-Managed State)

```tsx
// No title state in parent needed!

<TitleInputBlock
  onChange={(title) => {
    // Optional: sync with parent if needed
    console.log('Title changed:', title);
  }}
/>
```

**Benefits**:
- ✅ Title persists across reloads
- ✅ Auto-saved to localStorage
- ✅ Active editor tracking
- ✅ Clean separation of concerns

## Testing the Integration

### Test 1: Persistence
1. Type a story title: "My Amazing Story"
2. Refresh the page (F5)
3. ✅ Title should be restored

### Test 2: Active Editor
1. Click on title input → should show green border
2. Click on chapter textarea → title border turns gray, chapter shows green
3. ✅ Only one editor active at a time

### Test 3: Auto-Save
1. Type in title input
2. Wait 2 seconds
3. Check browser DevTools → Application → Local Storage
4. ✅ Should see `session_titanic-story` with latest title

### Test 4: Content Persistence
1. Write some chapter content
2. Write excerpt text
3. Close browser tab
4. Reopen page
5. ✅ All content should be restored

## Best Practices

### DO ✅
- Initialize session in page component's `useEffect`
- Use `useStoryTitle()` hook for title access
- Register editors with `setActiveEditor()` on focus
- Let engine handle persistence automatically
- Use visual feedback for active state

### DON'T ❌
- Store title in component state (use engine instead)
- Access localStorage directly from UI components
- Manage active editor state in multiple places
- Forget to initialize session on page load
- Mix controlled and uncontrolled inputs

## Future Enhancements

### Planned Features
- [ ] Cloud sync (save to backend API)
- [ ] Conflict resolution for multi-device editing
- [ ] Version history / snapshots
- [ ] Export session to JSON
- [ ] Import session from file
- [ ] Collaborative editing (real-time)

### Extensibility
The engine is designed to be extended:
- Add new content types in `ContentBlock.type`
- Implement custom auto-save strategies
- Add compression for large documents
- Integrate with IndexedDB for larger storage
