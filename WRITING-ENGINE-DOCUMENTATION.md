# Writing Session Engine - Complete Documentation

## Overview

The Writing Session Engine is the **SINGLE SOURCE OF TRUTH** for all Story Editor data in Storyverse. It provides a robust, offline-first persistence layer with autosave, state recovery, and large text handling.

---

## Architecture

### Core Components

1. **WritingSessionEngine** (`src/engine/WritingSessionEngine.ts`)
   - Main state manager
   - Handles all business logic
   - Coordinates persistence
   - Manages autosave scheduling

2. **StorageManager** (`src/engine/storage/StorageManager.ts`)
   - Low-level localStorage interface
   - Text splitting for large content
   - Storage cleanup and management

3. **Hooks** (`src/hooks/useWritingSession.ts`)
   - React integration layer
   - Component-level state management
   - UI event handlers

---

## Data Model

### Storage Structure

All data is stored in localStorage with this structure:

```
/storyverse/
  /stories/
    /{storyId}/
      story                          ← StoryMetadata (title, genres, audience)
      characters                     ← Character[] (global list)
      acts                           ← Acts + Chapter structure
      /chapters/
        chapter_{id}_meta            ← ChapterContent metadata
        chapter_{id}_part_0          ← Text content (primary)
        chapter_{id}_part_1          ← Text content (overflow if > 30k chars)
        chapter_{id}_part_2          ← ...
        ...
```

### Data Types

#### StoryMetadata
```typescript
{
  storyId: string;
  storyTitle: string;
  privacy: 'open' | 'private';
  primaryGenre: string;
  secondaryGenre: string;
  tertiaryGenre: string;
  audience: string;
  readingTime: number;        // derived, in minutes
  createdAt: number;
  updatedAt: number;
}
```

#### Character
```typescript
{
  characterId: string;
  name: string;
  avatar?: string;
  initials: string;
  order: number;
}
```

#### Act
```typescript
{
  actId: string;
  actTitle: string;
  actOrder: number;
}
```

#### Chapter
```typescript
{
  chapterId: string;
  actId: string;
  chapterTitle: string;
  assignedCharacterIds: string[];
  expanded: boolean;
  chapterOrder: number;
  lastEditedAt: number;
}
```

#### ChapterContent
```typescript
{
  chapterId: string;
  text: string;
  wordCount: number;
  charCount: number;
  state: 'empty' | 'writing' | 'idle' | 'syncing' | 'error';
  lastSavedAt: number;
}
```

---

## Autosave Strategy

### Text Content
- **Debounce:** 1000ms (1 second)
- **Trigger:** Every keystroke in chapter editor
- **State flow:** `writing` → `syncing` → `idle`

### Metadata (Dropdowns, Title, etc.)
- **Debounce:** 0ms (immediate)
- **Trigger:** Any dropdown change, title edit
- **Saves:** Immediately after change

### Structure (Acts/Chapters)
- **Debounce:** 0ms (immediate)
- **Trigger:** Add/delete act, add/delete chapter
- **Saves:** Immediately after change

---

## Large Text Handling

### Splitting Strategy

When chapter text exceeds **30,000 characters**, it's automatically split into multiple parts.

**Algorithm:**
1. Check if text length > 30,000 chars
2. Find safe split point:
   - Prefer paragraph break (`\n\n`)
   - Fallback to sentence end (`. `)
   - Ensure split point is > 80% of max size
3. Save each part as `chapter_{id}_part_{index}`
4. Store part count in metadata

### Reassembly

On load, all parts are:
1. Retrieved sequentially by index
2. Joined in order
3. Returned as single string
4. No data loss

### Cleanup

When text is shortened, old parts are automatically removed to prevent orphaned data.

---

## State Recovery

### On Page Load

```typescript
writingSessionEngine.initStory(storyId);
```

**Recovery Flow:**
1. Check if `storyId` exists in localStorage
2. Load `story.json` (metadata)
3. Load `characters.json`
4. Load `acts.json` (acts + chapters structure)
5. Load all chapter content (with reassembly)
6. Restore UI state (expanded/collapsed)
7. Notify all subscribers

### On New Story

```typescript
writingSessionEngine.initStory(); // no storyId
```

**Creates:**
- New storyId: `story_{timestamp}_{random}`
- Default title: "Untitled Story"
- Default privacy: "private"
- Empty arrays for characters, acts, chapters

---

## Writing State Indicators

Each chapter has a `WritingState`:

| State | Meaning | Trigger |
|-------|---------|---------|
| `empty` | No text content | Text length = 0 |
| `writing` | User is typing | Text change detected |
| `syncing` | Save in progress | Autosave triggered |
| `idle` | Saved, no changes | Save completed |
| `error` | Save failed | localStorage error |

**UI should display:**
- `empty` → Placeholder text
- `writing` → No indicator (or typing animation)
- `syncing` → "Saving..." / spinner
- `idle` → "Saved" / checkmark
- `error` → "Error saving" / warning icon

---

## API Reference

### WritingSessionEngine Methods

#### Initialization
```typescript
initStory(storyId?: string): void
loadStory(storyId: string): boolean
```

#### Story Metadata
```typescript
setStoryTitle(title: string): void
getStoryTitle(): string

setPrivacy(privacy: 'open' | 'private'): void
getPrivacy(): string

setPrimaryGenre(genre: string): void
getPrimaryGenre(): string

setSecondaryGenre(genre: string): void
getSecondaryGenre(): string

setTertiaryGenre(genre: string): void
getTertiaryGenre(): string

setAudience(audience: string): void
getAudience(): string

getReadingTime(): number
```

#### Characters
```typescript
addCharacter(character: Character): void
updateCharacter(characterId: string, updates: Partial<Character>): void
removeCharacter(characterId: string): void
getCharacters(): Character[]
```

#### Acts
```typescript
addAct(actTitle?: string): Act
updateActTitle(actId: string, title: string): void
removeAct(actId: string): void
getActs(): Act[]
getChaptersForAct(actId: string): Chapter[]
```

#### Chapters
```typescript
addChapter(actId: string, chapterTitle?: string): Chapter
updateChapterTitle(chapterId: string, title: string): void
updateChapterText(chapterId: string, text: string): void
getChapterText(chapterId: string): string
getChapterState(chapterId: string): WritingState
toggleChapterExpanded(chapterId: string): void
assignCharacterToChapter(chapterId: string, characterId: string): void
removeCharacterFromChapter(chapterId: string, characterId: string): void
removeChapter(chapterId: string): void
```

#### Active Editor
```typescript
setActiveEditor(editorId: string): void
getActiveEditorId(): string
```

#### State & Subscription
```typescript
getStoryState(): StoryState
subscribe(listener: () => void): () => void
```

---

## React Hooks

### Story Metadata Hooks
```typescript
useStoryTitle(): [string, (title: string) => void]
usePrivacy(): [string, (privacy: string) => void]
usePrimaryGenre(): [string, (genre: string) => void]
useSecondaryGenre(): [string, (genre: string) => void]
useTertiaryGenre(): [string, (genre: string) => void]
useAudience(): [string, (audience: string) => void]
useReadingTime(): number
```

### Chapter Hook
```typescript
useChapterText(chapterId: string): [string, (text: string) => void, WritingState]
```

**Returns:**
- `[0]` Current text content
- `[1]` Update function
- `[2]` Writing state indicator

### Editor Hooks
```typescript
useActiveEditor(editorId: string): boolean
useWritingSession(options): UseWritingSessionReturn
```

---

## Usage Examples

### Initialize Story on Page Load

```typescript
// In StoryEditorPage.tsx
useEffect(() => {
  // Try to load existing story, or create new one
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get('storyId');
  
  writingSessionEngine.initStory(storyId || undefined);
}, []);
```

### Use Dropdowns with Persistence

```typescript
// In MetaDropdownBlock.tsx
import { usePrimaryGenre, useSecondaryGenre, useTertiaryGenre, useAudience } from '@/hooks/useWritingSession';

function MetaDropdownBlock() {
  const [primaryGenre, setPrimaryGenre] = usePrimaryGenre();
  const [secondaryGenre, setSecondaryGenre] = useSecondaryGenre();
  const [tertiaryGenre, setTertiaryGenre] = useTertiaryGenre();
  const [audience, setAudience] = useAudience();
  const readingTime = useReadingTime();

  return (
    <div>
      <Dropdown value={primaryGenre} onChange={setPrimaryGenre} />
      <Dropdown value={secondaryGenre} onChange={setSecondaryGenre} />
      <Dropdown value={tertiaryGenre} onChange={setTertiaryGenre} />
      <Dropdown value={audience} onChange={setAudience} />
      <div>Reading Time: {readingTime} min</div>
    </div>
  );
}
```

### Use Chapter Text Editor

```typescript
// In ChapterTextEditor.tsx
import { useChapterText } from '@/hooks/useWritingSession';

function ChapterTextEditor({ chapterId }: { chapterId: string }) {
  const [text, setText, state] = useChapterText(chapterId);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing..."
      />
      <div className="status">
        {state === 'syncing' && '💾 Saving...'}
        {state === 'idle' && '✅ Saved'}
        {state === 'error' && '⚠️ Error saving'}
      </div>
    </div>
  );
}
```

### Manage Acts and Chapters

```typescript
// In ActSection.tsx
function ActSection({ actId }: { actId: string }) {
  const handleAddChapter = () => {
    writingSessionEngine.addChapter(actId, 'New Chapter');
  };

  const handleDeleteAct = () => {
    if (confirm('Delete this act and all its chapters?')) {
      writingSessionEngine.removeAct(actId);
    }
  };

  const chapters = writingSessionEngine.getChaptersForAct(actId);

  return (
    <div>
      <button onClick={handleAddChapter}>Add Chapter</button>
      <button onClick={handleDeleteAct}>Delete Act</button>
      {chapters.map(chapter => (
        <ChapterCard key={chapter.chapterId} chapter={chapter} />
      ))}
    </div>
  );
}
```

---

## Data Safety Guarantees

### No Data Loss
- ✅ All changes are persisted to localStorage
- ✅ Large text (>30k chars) is split safely
- ✅ Autosave prevents loss on browser close
- ✅ Recovery on page refresh is automatic

### Error Handling
- ✅ localStorage quota errors are caught
- ✅ Chapter state changes to `error` on failure
- ✅ User can retry save manually
- ✅ Corrupted data is logged, not crashed

### Consistency
- ✅ Single source of truth (WritingSessionEngine)
- ✅ UI components never write directly to storage
- ✅ All state changes go through engine methods
- ✅ Subscribers are notified synchronously

---

## Storage Limits

### localStorage Capacity
- **Typical limit:** 5-10 MB per domain
- **Current strategy:** Text splitting at 30k chars
- **Monitoring:** Use `storageManager.getStorageInfo()`

### Per-Story Estimate
- Metadata: ~2 KB
- Characters (10): ~1 KB
- Acts (5): ~500 bytes
- Chapters (50): ~5 KB
- Chapter text (50 × 10k chars): ~500 KB
- **Total per story:** ~510 KB
- **Stories per 10MB:** ~20 stories

### Recommendations
- Implement story deletion for old drafts
- Add export/import for backup
- Warn user at 80% storage capacity

---

## Testing Recovery

### Manual Test Procedure

1. **Create a story with data:**
   ```typescript
   writingSessionEngine.initStory();
   writingSessionEngine.setStoryTitle('Test Story');
   writingSessionEngine.setPrimaryGenre('Fantasy');
   const act = writingSessionEngine.addAct('Act 1');
   const chapter = writingSessionEngine.addChapter(act.actId, 'Chapter 1');
   writingSessionEngine.updateChapterText(chapter.chapterId, 'Lorem ipsum...');
   ```

2. **Wait for autosave (1 second)**

3. **Refresh the page**

4. **Verify recovery:**
   ```typescript
   const storyId = writingSessionEngine.getStoryId();
   writingSessionEngine.loadStory(storyId);
   
   console.assert(writingSessionEngine.getStoryTitle() === 'Test Story');
   console.assert(writingSessionEngine.getPrimaryGenre() === 'Fantasy');
   console.assert(writingSessionEngine.getActs().length === 1);
   ```

### Automated Test (future)
```typescript
describe('WritingSessionEngine persistence', () => {
  it('should recover all data after reload', () => {
    // Setup
    const storyId = 'test-story-123';
    writingSessionEngine.initStory(storyId);
    // ... add data ...
    
    // Simulate reload
    const newEngine = new WritingSessionEngine();
    newEngine.loadStory(storyId);
    
    // Verify
    expect(newEngine.getStoryTitle()).toBe('Test Story');
  });
});
```

---

## Migration from Old Engine

### Old API (deprecated)
```typescript
writingSessionEngine.setGenre('Fantasy');  // ❌ Removed
writingSessionEngine.updateContent(...);    // ❌ Removed
```

### New API
```typescript
writingSessionEngine.setPrimaryGenre('Fantasy');        // ✅ Use this
writingSessionEngine.updateChapterText(chapterId, ...); // ✅ Use this
```

### Hook Changes
```typescript
// Old
const [genre, setGenre] = useGenre();  // ❌ Removed

// New
const [primaryGenre, setPrimaryGenre] = usePrimaryGenre();     // ✅ Use this
const [secondaryGenre, setSecondaryGenre] = useSecondaryGenre(); // ✅ Use this
const [tertiaryGenre, setTertiaryGenre] = useTertiaryGenre();   // ✅ Use this
```

---

## Troubleshooting

### Issue: Data not persisting
- Check browser console for localStorage errors
- Verify `storyId` is not changing on refresh
- Check storage quota: `storageManager.getStorageInfo()`

### Issue: Slow autosave
- Reduce debounce time (not recommended < 500ms)
- Check text size (split if > 30k chars)
- Profile localStorage write times

### Issue: Lost data after refresh
- Verify `initStory()` is called with correct `storyId`
- Check localStorage in DevTools (Application tab)
- Look for exceptions in console

### Issue: State not updating in UI
- Ensure component uses hook (e.g., `useChapterText`)
- Verify engine method is called (not direct state mutation)
- Check that component is subscribed to engine updates

---

## Future Enhancements

- [ ] IndexedDB support for larger storage
- [ ] Cloud sync (optional)
- [ ] Version history / undo-redo
- [ ] Export to JSON / Markdown
- [ ] Import from other formats
- [ ] Conflict resolution for multi-device
- [ ] Compression for large texts
- [ ] Story templates

---

## Contact & Support

For issues or questions about the Writing Session Engine:
- Check console logs for detailed error messages
- Review this documentation
- Inspect localStorage in DevTools
- Test with minimal example

**Data is stored locally in your browser's localStorage. No server-side persistence yet.**
