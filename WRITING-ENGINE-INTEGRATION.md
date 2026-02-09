# Writing Session Engine - Integration Guide

## Quick Start

### 1. Initialize Engine on App Load

In your main StoryEditorPage component:

```typescript
// src/pages/story-editor/StoryEditorPage.tsx
import { useEffect } from 'react';
import writingSessionEngine from '@/engine/WritingSessionEngine';

function StoryEditorPage() {
  useEffect(() => {
    // Get storyId from URL or create new
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('storyId');
    
    // Initialize or load story
    writingSessionEngine.initStory(storyId || undefined);
  }, []);

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

---

## Component Integration Examples

### Story Title Field

```typescript
// src/components/editor/TitleField.tsx
import { useStoryTitle } from '@/hooks/useWritingSession';

function TitleField() {
  const [title, setTitle] = useStoryTitle();

  return (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Story Title"
      className={styles.titleInput}
    />
  );
}
```

**✅ Autosaved immediately on change**

---

### Privacy Dropdown

```typescript
// In your header component
import { usePrivacy } from '@/hooks/useWritingSession';

function PrivacySelector() {
  const [privacy, setPrivacy] = usePrivacy();

  return (
    <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
      <option value="private">Private</option>
      <option value="open">Open</option>
    </select>
  );
}
```

**✅ Autosaved immediately on change**

---

### Genre Dropdowns

```typescript
// src/components/story/StoryMetaSection/MetaDropdownBlock.tsx
import {
  usePrimaryGenre,
  useSecondaryGenre,
  useTertiaryGenre,
  useAudience,
  useReadingTime
} from '@/hooks/useWritingSession';

function MetaDropdownBlock() {
  const [primaryGenre, setPrimaryGenre] = usePrimaryGenre();
  const [secondaryGenre, setSecondaryGenre] = useSecondaryGenre();
  const [tertiaryGenre, setTertiaryGenre] = useTertiaryGenre();
  const [audience, setAudience] = useAudience();
  const readingTime = useReadingTime();

  return (
    <div className={styles.metaBlock}>
      <div className={styles.genreRow}>
        <Dropdown
          label="Primary Genre"
          value={primaryGenre}
          onChange={setPrimaryGenre}
          options={GENRE_OPTIONS}
        />
        <Dropdown
          label="Secondary Genre"
          value={secondaryGenre}
          onChange={setSecondaryGenre}
          options={['None', ...GENRE_OPTIONS]}
        />
        <Dropdown
          label="Tertiary Genre"
          value={tertiaryGenre}
          onChange={setTertiaryGenre}
          options={['None', ...GENRE_OPTIONS]}
        />
      </div>
      
      <div className={styles.audienceRow}>
        <Dropdown
          label="Audience"
          value={audience}
          onChange={setAudience}
          options={AUDIENCE_OPTIONS}
        />
        <div className={styles.readingTime}>
          {readingTime} min read
        </div>
      </div>
    </div>
  );
}
```

**✅ All autosaved immediately on change**  
**✅ Reading time auto-calculated from chapter text**

---

### Acts Section

```typescript
// In your acts container
import writingSessionEngine from '@/engine/WritingSessionEngine';
import { useEffect, useState } from 'react';

function ActsContainer() {
  const [acts, setActs] = useState(() => writingSessionEngine.getActs());

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      setActs(writingSessionEngine.getActs());
    });
    return unsubscribe;
  }, []);

  const handleAddAct = () => {
    writingSessionEngine.addAct('New Act');
  };

  return (
    <div>
      {acts.map(act => (
        <ActSection key={act.actId} act={act} />
      ))}
      <button onClick={handleAddAct}>+ Add Act</button>
    </div>
  );
}
```

**✅ Autosaved immediately on add/delete**

---

### Act Section Component

```typescript
// src/components/story/ActSection.tsx
import writingSessionEngine from '@/engine/WritingSessionEngine';
import { useEffect, useState } from 'react';

interface ActSectionProps {
  act: Act;
}

function ActSection({ act }: ActSectionProps) {
  const [chapters, setChapters] = useState(() =>
    writingSessionEngine.getChaptersForAct(act.actId)
  );
  const [actTitle, setActTitle] = useState(act.actTitle);

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      setChapters(writingSessionEngine.getChaptersForAct(act.actId));
    });
    return unsubscribe;
  }, [act.actId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setActTitle(newTitle);
    writingSessionEngine.updateActTitle(act.actId, newTitle);
  };

  const handleAddChapter = () => {
    writingSessionEngine.addChapter(act.actId, 'New Chapter');
  };

  const handleDeleteAct = () => {
    if (confirm('Delete this act and all its chapters?')) {
      writingSessionEngine.removeAct(act.actId);
    }
  };

  return (
    <div className={styles.actSection}>
      <div className={styles.actHeader}>
        <input
          type="text"
          value={actTitle}
          onChange={handleTitleChange}
          className={styles.actTitle}
        />
        <button onClick={handleDeleteAct}>
          <img src="/src/assets/delete.svg" alt="Delete" />
        </button>
      </div>

      <div className={styles.chapters}>
        {chapters.map(chapter => (
          <ChapterCard key={chapter.chapterId} chapter={chapter} />
        ))}
      </div>

      <button onClick={handleAddChapter} className={styles.addChapter}>
        + Add Chapter
      </button>
    </div>
  );
}
```

**✅ Act title autosaved immediately**  
**✅ Chapters autosaved immediately on add**

---

### Chapter Card Component

```typescript
// src/components/story/ChapterCard.tsx
import writingSessionEngine from '@/engine/WritingSessionEngine';
import { useChapterText } from '@/hooks/useWritingSession';
import { useState } from 'react';

interface ChapterCardProps {
  chapter: Chapter;
}

function ChapterCard({ chapter }: ChapterCardProps) {
  const [text, setText, state] = useChapterText(chapter.chapterId);
  const [title, setTitle] = useState(chapter.chapterTitle);
  const [expanded, setExpanded] = useState(chapter.expanded);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    writingSessionEngine.updateChapterTitle(chapter.chapterId, newTitle);
  };

  const handleToggleExpand = () => {
    writingSessionEngine.toggleChapterExpanded(chapter.chapterId);
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    if (confirm('Delete this chapter?')) {
      writingSessionEngine.removeChapter(chapter.chapterId);
    }
  };

  return (
    <div className={styles.chapterCard}>
      <div className={styles.chapterHeader}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className={styles.chapterTitle}
        />
        <button onClick={handleToggleExpand}>
          {expanded ? '▼' : '▶'}
        </button>
        <button onClick={handleDelete}>
          <img src="/src/assets/delete.svg" alt="Delete" />
        </button>
      </div>

      {expanded && (
        <div className={styles.chapterContent}>
          <ChapterTextEditor
            chapterId={chapter.chapterId}
            text={text}
            onTextChange={setText}
            state={state}
          />
        </div>
      )}
    </div>
  );
}
```

**✅ Chapter title autosaved immediately**  
**✅ Expanded state autosaved immediately**

---

### Chapter Text Editor

```typescript
// src/components/story/ChapterTextEditor.tsx
import { WritingState } from '@/engine/WritingSessionEngine';

interface ChapterTextEditorProps {
  chapterId: string;
  text: string;
  onTextChange: (text: string) => void;
  state: WritingState;
}

function ChapterTextEditor({ 
  chapterId, 
  text, 
  onTextChange, 
  state 
}: ChapterTextEditorProps) {
  return (
    <div className={styles.editor}>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Start writing your chapter..."
        className={styles.textarea}
      />
      
      <div className={styles.statusBar}>
        <div className={styles.wordCount}>
          {text.split(/\s+/).filter(Boolean).length} words
        </div>
        
        <div className={styles.saveStatus}>
          {state === 'empty' && ''}
          {state === 'writing' && '✏️ Writing...'}
          {state === 'syncing' && '💾 Saving...'}
          {state === 'idle' && '✅ Saved'}
          {state === 'error' && '⚠️ Error saving'}
        </div>
      </div>
    </div>
  );
}
```

**✅ Text autosaved after 1 second of inactivity**  
**✅ State indicator shows save progress**  
**✅ Large text (>30k chars) automatically split**

---

### Character Management

```typescript
// In your character section
import writingSessionEngine from '@/engine/WritingSessionEngine';
import { useEffect, useState } from 'react';

function CharacterProfiles() {
  const [characters, setCharacters] = useState(() =>
    writingSessionEngine.getCharacters()
  );

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      setCharacters(writingSessionEngine.getCharacters());
    });
    return unsubscribe;
  }, []);

  const handleAddCharacter = () => {
    const newCharacter = {
      characterId: `char_${Date.now()}`,
      name: 'New Character',
      initials: 'NC',
      order: characters.length,
    };
    writingSessionEngine.addCharacter(newCharacter);
  };

  const handleRemoveCharacter = (characterId: string) => {
    writingSessionEngine.removeCharacter(characterId);
  };

  return (
    <div className={styles.characters}>
      {characters.map(char => (
        <div key={char.characterId} className={styles.avatar}>
          {char.initials}
          <button onClick={() => handleRemoveCharacter(char.characterId)}>
            ×
          </button>
        </div>
      ))}
      <button onClick={handleAddCharacter} className={styles.addCharacter}>
        +
      </button>
    </div>
  );
}
```

**✅ Characters autosaved immediately**  
**✅ Removed from all chapters automatically**

---

## State Management Pattern

### ✅ DO: Use engine methods

```typescript
// Good
writingSessionEngine.setStoryTitle('My Story');
writingSessionEngine.updateChapterText(chapterId, text);
writingSessionEngine.addAct('Act 1');
```

### ❌ DON'T: Write directly to localStorage

```typescript
// Bad - bypasses engine
localStorage.setItem('story', JSON.stringify(data));
```

### ✅ DO: Subscribe to updates

```typescript
// Good - reactive to changes
useEffect(() => {
  const unsubscribe = writingSessionEngine.subscribe(() => {
    setData(writingSessionEngine.getData());
  });
  return unsubscribe;
}, []);
```

### ❌ DON'T: Poll for changes

```typescript
// Bad - inefficient
setInterval(() => {
  setData(writingSessionEngine.getData());
}, 1000);
```

---

## Testing Your Integration

### Check localStorage

1. Open DevTools → Application tab → Local Storage
2. Look for keys starting with `storyverse/stories/`
3. Verify data structure matches documentation

### Test Recovery

1. Make changes to story
2. Wait 1 second (for autosave)
3. Refresh page
4. Verify all data is restored

### Test Large Text

1. Paste >30,000 characters into chapter
2. Check localStorage for multiple parts:
   - `chapter_{id}_meta`
   - `chapter_{id}_part_0`
   - `chapter_{id}_part_1`
3. Refresh and verify text is reassembled

### Monitor State Indicators

1. Type in chapter → should show "Writing..."
2. Stop typing → should show "Saving..." → "Saved"
3. Clear text → should show empty state

---

## Common Patterns

### Load Story from URL

```typescript
useEffect(() => {
  const url = new URL(window.location.href);
  const storyId = url.searchParams.get('storyId');
  
  if (storyId) {
    writingSessionEngine.loadStory(storyId);
  } else {
    writingSessionEngine.initStory();
    
    // Update URL with new storyId
    const newStoryId = writingSessionEngine.getStoryId();
    url.searchParams.set('storyId', newStoryId);
    window.history.replaceState({}, '', url);
  }
}, []);
```

### Debounce Title Updates

```typescript
const [title, setTitle] = useState('');
const timeoutRef = useRef<number>();

const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newTitle = e.target.value;
  setTitle(newTitle);
  
  // Debounce engine update
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    writingSessionEngine.setStoryTitle(newTitle);
  }, 300);
};
```

### Conditional Rendering Based on State

```typescript
const state = writingSessionEngine.getChapterState(chapterId);

return (
  <div>
    {state === 'empty' && <PlaceholderText />}
    {state === 'writing' && <TypingIndicator />}
    {state === 'syncing' && <SavingSpinner />}
    {state === 'idle' && <SavedCheckmark />}
    {state === 'error' && <ErrorMessage />}
  </div>
);
```

---

## Verification Checklist

After integration, verify:

- [ ] Story title persists on refresh
- [ ] Privacy setting persists on refresh
- [ ] All three genres persist on refresh
- [ ] Audience setting persists on refresh
- [ ] Reading time updates automatically
- [ ] Characters persist on refresh
- [ ] Acts persist on refresh
- [ ] Chapters persist on refresh
- [ ] Chapter text persists on refresh
- [ ] Chapter expanded state persists on refresh
- [ ] Assigned characters persist on refresh
- [ ] Large text (>30k chars) splits correctly
- [ ] Writing state indicators work
- [ ] Autosave happens within 1 second
- [ ] No console errors on save/load
- [ ] localStorage keys are structured correctly

---

## Next Steps

1. Integrate hooks into existing components
2. Replace any direct localStorage calls
3. Test full user flow (create → edit → refresh → continue)
4. Add error boundaries for save failures
5. Implement export/import (future)
6. Add storage quota warnings (future)

**You now have a professional, offline-first writing engine!**
