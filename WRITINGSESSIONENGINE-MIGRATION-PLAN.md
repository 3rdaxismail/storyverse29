# WritingSessionEngine Migration Plan

## Current State Analysis

**File**: `src/engine/WritingSessionEngine.ts` (1370 lines)
**Storage**: localStorage via StorageManager
**Problem**: All localStorage calls must be replaced with Firestore service calls

## localStorage Usage Breakdown

### Poem/Lyrics Storage (Direct localStorage)
```typescript
localStorage.getItem(`storyverse:poem:${poemId}:title`)
localStorage.getItem(`storyverse:poem:${poemId}:text`)
localStorage.getItem(`storyverse:poem:${poemId}:tags`)
localStorage.getItem(`storyverse:poem:${poemId}:privacy`)
localStorage.getItem(`storyverse:poem:${poemId}:coverImageUrl`)
localStorage.setItem(`storyverse:poem:${poemId}:authorId`, authorId)
```

### Story Storage (Via StorageManager)
```typescript
storageManager.loadStoryMeta(storyId)
storageManager.saveStoryMeta(metadata)
storageManager.loadCharacters(storyId)
storageManager.saveCharacters(storyId, characters)
storageManager.loadLocations(storyId)
storageManager.saveLocations(storyId, locations)
storageManager.loadActs(storyId)
storageManager.saveActs(storyId, acts, chapters)
storageManager.loadChapterContent(storyId, chapterId)
storageManager.saveChapterContent(storyId, chapterId, content)
```

## Migration Strategy

### Phase 1: Update WritingSessionEngine imports
- Add Firestore service imports
- Add auth import to get current user UID
- Keep existing interface unchanged (singleton pattern)

### Phase 2: Replace Poem/Lyrics localStorage
**Replace loadPoem():**
```typescript
// OLD
const savedTitle = localStorage.getItem(`storyverse:poem:${poemId}:title`);

// NEW
import { getPoem } from '../firebase/services/poemsService';
const poem = await getPoem(poemId);
if (poem) {
  this.poemTitle = poem.title;
  this.poemText = poem.text;
  // etc
}
```

**Replace savePoem():**
```typescript
// OLD
localStorage.setItem(`storyverse:poem:${this.poemId}:title`, this.poemTitle);

// NEW
import { updatePoem, createPoem } from '../firebase/services/poemsService';
const poem = await getPoem(this.poemId);
if (poem) {
  await updatePoem(this.poemId, { title: this.poemTitle, text: this.poemText, ... });
} else {
  await createPoem(this.poemId, { title: this.poemTitle, text: this.poemText, ... });
}
```

### Phase 3: Replace Story localStorage (via StorageManager)
**Option A: Update StorageManager to use Firestore**
- Replace all localStorage calls in StorageManager with Firestore
- Keep WritingSessionEngine calls to StorageManager unchanged
- PRO: Minimal changes to WritingSessionEngine
- CON: StorageManager becomes async, breaking current API

**Option B: Replace StorageManager calls directly in WritingSessionEngine**
- Import storiesService directly in WritingSessionEngine
- Replace each storageManager.* call with storiesService.*
- PRO: Clean separation, async from the start
- CON: More changes in WritingSessionEngine

**DECISION: Option B** - Direct Firestore service calls in WritingSessionEngine

### Phase 4: Make WritingSessionEngine methods async
**Current signature:**
```typescript
initStory(storyId?: string): void
updateStoryTitle(newTitle: string): void
```

**New signature:**
```typescript
async initStory(storyId?: string): Promise<void>
async updateStoryTitle(newTitle: string): Promise<void>
```

**Impact**: All calling pages must await WritingSessionEngine methods

### Phase 5: Update calling pages
**Pages to update:**
- `src/pages/create-story/StoryEditorPage.tsx`
- `src/pages/poem-editor/PoemEditorPage.tsx`
- Any other pages using WritingSessionEngine

## Implementation Steps

1. **Create new WritingSessionEngine with Firestore** (parallel file)
   - `src/engine/WritingSessionEngine.firebase.ts`
   - Import storiesService and poemsService
   - Make all methods async
   - Replace localStorage with Firestore calls
   - Keep same public interface

2. **Test new engine** with one page
   - Update StoryEditorPage to use new engine
   - Verify create/load/save/delete works
   - Verify autosave works

3. **Migrate remaining pages**
   - PoemEditorPage
   - Any other editor pages

4. **Remove old engine and StorageManager**
   - Delete WritingSessionEngine.ts
   - Rename WritingSessionEngine.firebase.ts → WritingSessionEngine.ts
   - Delete StorageManager.ts

5. **Add Firestore security rules**
   - Stories: uid-scoped read/write
   - Poems: uid-scoped read/write
   - Public read for published content

## Critical Requirements

✅ **UID Isolation**: All content must be scoped by auth.currentUser.uid  
✅ **Ownership Validation**: Use storiesService/poemsService validators  
✅ **Auto-create stories/poems**: First save should call createStory/createPoem  
✅ **Auto-update**: Subsequent saves should call updateStory/updatePoem  
✅ **Singleton pattern**: Keep singleton instance export  
✅ **Listener pattern**: Keep subscription system for page updates

## Next Action

Start with creating a simplified async version of WritingSessionEngine that uses Firestore services for poems only (simpler than stories). Test with PoemEditorPage.
