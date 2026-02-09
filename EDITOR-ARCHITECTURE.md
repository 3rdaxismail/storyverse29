# Editor Architecture - Source of Truth Pattern

## Core Principle

**Editor pages are NOT data owners. User content is the ONLY source of truth.**

Pages act as **stateless views** that consume data from `WritingSessionEngine`, dispatch updates back to the engine, and only manage UI-specific state (expanded/collapsed, focus, dropdowns, etc.).

---

## Architectural Rules

### 1. Source of Truth

**WritingSessionEngine** is the single source of truth for ALL user content:

- **Stories**: title, chapters, acts, characters, locations, genres, privacy, cover images
- **Poems/Lyrics**: title, text, tags, privacy, cover images
- **Metadata**: reading time, word counts, statistics

### 2. Page Responsibilities

Editor pages (StoryEditorPage, PoemEditorPage) **MUST**:

✅ Receive a `contentId` from routing (URL query parameter)
✅ Initialize the engine with that `contentId` on mount
✅ Subscribe to engine state via `useWritingEngine()` hook
✅ Render UI purely from engine state
✅ Dispatch user edits back to engine via setter methods
✅ Unload cleanly when route changes (subscription auto-cleanup)

### 3. Page Restrictions

Editor pages **MUST NOT**:

❌ Store content data in local React state (useState)
❌ Read/write content directly to localStorage
❌ Initialize default content data internally
❌ Act as singleton source of truth
❌ Assume they are the only editor instance

### 4. UI State vs Content State

**Allowed Page State** (UI-only):
- `openDropdown` - which dropdown is open
- `isShareModalOpen` - modal visibility
- `coverImageFile` - temporary file before save
- `expandedChapterId` - which chapter is expanded
- `activeChapterId` - which chapter has focus

**Forbidden Page State** (content):
- ❌ `title`, `text`, `privacy` - must come from engine
- ❌ `characters`, `chapters`, `acts` - must come from engine
- ❌ `coverImageUrl` - must come from engine

---

## Implementation

### Engine Initialization

```typescript
// PoemEditorPage.tsx
const [poemId] = useState(() => 
  searchParams.get('id') || `poem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
);

useEffect(() => {
  writingSessionEngine.initPoem(poemId, 'poem');
}, [poemId]);
```

### Engine Subscription

```typescript
// Subscribe to engine state (auto-updates on engine changes)
import { usePoemEngine } from '../../hooks/useWritingEngine';

const poemState = usePoemEngine();

// Consume engine state
const title = poemState?.title || '';
const text = poemState?.text || '';
const privacy = poemState?.privacy || '';
```

### Dispatching Updates

```typescript
// User edits text → dispatch to engine
const handleTextChange = (newText: string) => {
  writingSessionEngine.setPoemText(newText);
};

// User changes privacy → dispatch to engine
const handlePrivacyChange = (newPrivacy: string) => {
  writingSessionEngine.setPoemPrivacy(newPrivacy);
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│  (types text, selects dropdown, uploads image)              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  EDITOR PAGE (Stateless View)                │
│  • Renders UI from engine state                             │
│  • Dispatches user edits to engine                          │
│  • Only manages UI state (dropdowns, modals, focus)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              WRITING SESSION ENGINE (Source of Truth)        │
│  • Owns all content data (title, text, characters, etc.)    │
│  • Debounces autosave (1000ms for text, 0ms for metadata)   │
│  • Persists to localStorage via StorageManager              │
│  • Notifies subscribers on state changes                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL STORAGE / INDEXEDDB                 │
│  • /storyverse/stories/{storyId}/story.json                 │
│  • /storyverse/poems/{poemId}/poem.json                     │
│  • Persistent across sessions                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Content Types

WritingSessionEngine supports three content types:

### 1. **Story**
- Complex multi-chapter narrative
- Includes characters, locations, acts, chapters
- Story-specific methods: `initStory()`, `getStoryState()`, `setStoryTitle()`, etc.

### 2. **Poem**
- Line-based poetic content
- Includes title, text, tags, privacy
- Poem-specific methods: `initPoem()`, `getPoemState()`, `setPoemText()`, etc.

### 3. **Lyrics**
- Same structure as poem, different content type flag
- Uses `initPoem(id, 'lyrics')` for initialization

---

## Benefits

### ✅ Safe Routing
Navigating away from editor doesn't destroy data. Returning to editor reloads same content from engine.

### ✅ Draft Persistence
All content auto-saves to localStorage via engine. Pages can crash without data loss.

### ✅ Offline-First
Engine manages all persistence. No network required for drafts.

### ✅ Future Collaboration
Single source of truth enables:
- Real-time sync
- Conflict resolution
- Multi-user editing
- Version history

### ✅ Consistent Behavior
All editors (Story, Poem, Lyrics) follow same architectural pattern. No special cases.

---

## Migration Guide

### Before (Page-Owned Data)
```typescript
// ❌ OLD PATTERN - Page owns data
const [text, setText] = useState(() => {
  const saved = localStorage.getItem(`storyverse:poem:${poemId}:text`);
  return saved || "";
});

// Direct localStorage autosave
useEffect(() => {
  localStorage.setItem(`storyverse:poem:${poemId}:text`, text);
}, [text, poemId]);

// User edits text
<textarea value={text} onChange={e => setText(e.target.value)} />
```

### After (Engine-Owned Data)
```typescript
// ✅ NEW PATTERN - Engine owns data
const poemState = usePoemEngine();
const text = poemState?.text || '';

// No direct localStorage - engine handles it
// (autosave happens in engine with debouncing)

// User edits text → dispatch to engine
<textarea 
  value={text} 
  onChange={e => writingSessionEngine.setPoemText(e.target.value)} 
/>
```

---

## Testing Checklist

- [ ] Create new story → navigate away → return → data persists
- [ ] Create new poem → navigate away → return → data persists
- [ ] Edit story title → verify autosave after 1000ms
- [ ] Edit poem text → verify autosave after 1000ms
- [ ] Change privacy dropdown → verify immediate save
- [ ] Upload cover image → verify persistence
- [ ] Multiple tabs: Edit in Tab A → refresh Tab B → sees changes
- [ ] Crash recovery: Force close tab → reopen → draft restored

---

## File Structure

```
src/
├── engine/
│   └── WritingSessionEngine.ts         # Single source of truth
├── hooks/
│   └── useWritingEngine.ts             # React subscription hook
├── pages/
│   ├── story-editor/
│   │   └── StoryEditorPage.tsx         # Stateless story view
│   ├── poem-editor/
│   │   └── PoemEditorPage.tsx          # Stateless poem view
│   └── create/
│       └── CreateProjectPage.tsx       # Creates new content bundles
```

---

## API Reference

### WritingSessionEngine

#### Story Methods
- `initStory(storyId?: string): void` - Initialize or load story
- `getStoryState(): StoryState` - Get full story state
- `setStoryTitle(title: string): void` - Update story title
- `setPrivacy(privacy: string): void` - Update privacy setting
- `setCoverImage(id: string, url: string): void` - Update cover image

#### Poem Methods
- `initPoem(poemId?: string, type: 'poem' | 'lyrics'): void` - Initialize or load poem
- `getPoemState(): PoemState` - Get full poem state
- `setPoemTitle(title: string): void` - Update poem title
- `setPoemText(text: string): void` - Update poem text
- `setPoemTags(tags: string[]): void` - Update poem tags
- `setPoemPrivacy(privacy: string): void` - Update privacy
- `setPoemCoverImage(url: string): void` - Update cover image
- `getPoemStats(): { lines, stanzas, words, readTime }` - Get calculated stats

#### Utility Methods
- `subscribe(listener: () => void): () => void` - Subscribe to state changes
- `getContentType(): 'story' | 'poem' | 'lyrics'` - Get current content type
- `getContentId(): string` - Get current content ID

### useWritingEngine Hook

```typescript
const { contentType, story, poem } = useWritingEngine();
// Returns current engine state, auto-updates on engine changes

const storyState = useStoryEngine();
// Convenience hook for story-only state

const poemState = usePoemEngine();
// Convenience hook for poem-only state
```

---

## Troubleshooting

**Problem**: Changes not persisting
- ✅ Verify engine initialization: `writingSessionEngine.initPoem(poemId)`
- ✅ Check content has value (empty content doesn't auto-save)
- ✅ Confirm using engine setters, not local setState

**Problem**: Stale data on page load
- ✅ Ensure `useEffect` calls `initPoem(poemId)` on mount
- ✅ Verify `poemId` is correct from URL query param
- ✅ Check engine subscription is active (useWritingEngine hook)

**Problem**: Multiple saves firing
- ✅ Autosave is debounced (1000ms for text, 0ms for metadata)
- ✅ Avoid calling setters in render phase
- ✅ Use `useEffect` cleanup to prevent double initialization

---

## Future Enhancements

- [ ] IndexedDB migration for larger content
- [ ] Cloud sync integration
- [ ] Collaborative editing (CRDT)
- [ ] Undo/redo history
- [ ] Conflict resolution UI
- [ ] Version control (Git-like diffs)
- [ ] Export to multiple formats (PDF, EPUB, Markdown)

---

**Last Updated**: 2026-02-01
**Architecture Version**: 2.0 (Unified Source of Truth)
