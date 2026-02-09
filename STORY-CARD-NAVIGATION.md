# Story Card Navigation Implementation

## Overview

Story Cards in the profile page now serve as **entry points to the Story Editor**, allowing users to click on any story card to open and edit that specific story.

---

## Implementation Details

### 1. Story Card Click Handler

**File**: `d:\storyverse\src\pages\profile\PublicProfilePage.tsx`

```typescript
const handleStoryClick = (storyId: string) => {
  // Determine if this is the owner's profile
  // If owner, open in Story Editor for editing
  // If not owner, open in Story Reader for viewing
  
  if (isOwnProfile) {
    // Owner clicking their own story - open in editor
    const story = allStories.find(s => s.id === storyId);
    if (story) {
      if (story.genre === 'Poem') {
        // Navigate to poem editor
        navigate(`/poem/editor?id=${storyId}`);
      } else {
        // Navigate to story editor
        navigate(`/story/editor?id=${storyId}`);
      }
    }
  } else {
    // Non-owner viewing published story - open in reader
    navigate(`/story/view/${storyId}`);
  }
};
```

**Logic**:
- **Owner view**: Opens story in editor for modification
- **Non-owner view**: Opens story in reader mode (read-only)
- **Content type detection**: Routes poems to poem editor, stories to story editor

---

### 2. Story Editor Load Flow

**File**: `d:\storyverse\src\pages\story-editor\StoryEditorPage.tsx`

```typescript
// Get story ID from URL query parameter
const [storyId] = useState(() => 
  searchParams.get('id') || `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
);

// Initialize engine with story ID
useEffect(() => {
  // Check if this is a NEW story or an EXISTING story
  const existingStoryMeta = storageManager.loadStoryMeta(storyId);
  const isNewStory = existingStoryMeta === null;
  
  // Initialize engine with story ID
  writingSessionEngine.initStory(storyId);
  
  // Get saved story state
  const storyState = writingSessionEngine.getStoryState();
  
  // ONLY create defaults for NEW stories
  // For EXISTING stories, respect saved state even if empty
  if (isNewStory) {
    // Create default act/chapter structure
  } else {
    // Load existing story data from engine
  }
}, [storyId]);
```

**Load Process**:
1. Extract `storyId` from URL query parameter (`?id=story_123`)
2. Check if story exists in storage
3. Initialize WritingSessionEngine with the storyId
4. Load story data from engine
5. Render editor UI with loaded data

---

### 3. Data Persistence

**WritingSessionEngine** handles all data persistence:

- **Auto-save**: Debounced (1000ms for text, 0ms for metadata)
- **Storage**: localStorage via StorageManager
- **Consistency**: Same story data across navigation cycles

**Key Methods**:
- `initStory(storyId)` - Initialize or load story
- `loadStory(storyId)` - Load from localStorage
- `saveStoryMeta()` - Persist metadata
- `getStoryState()` - Get complete story state

---

### 4. Story ID Extraction

**File**: `d:\storyverse\src\pages\profile\PublicProfilePage.tsx`

```typescript
function fetchUserStories(): Story[] {
  const stories: Story[] = [];
  
  // Scan localStorage for stories
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('storyverse/stories/') && key.endsWith('/story')) {
      const data = localStorage.getItem(key);
      if (data) {
        const storyMeta = JSON.parse(data);
        stories.push({
          id: storyMeta.storyId,  // ← Correct story ID
          title: storyMeta.storyTitle,
          genre: 'Story',
          // ... other fields
        });
      }
    }
  }
  
  // Also scan for poems
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(':poem:') && key.endsWith(':title')) {
      const poemId = key.split(':')[2];  // ← Extract poem ID
      stories.push({
        id: poemId,
        title: localStorage.getItem(key),
        genre: 'Poem',
        // ... other fields
      });
    }
  }
  
  return stories;
}
```

**ID Sources**:
- **Stories**: `storyMeta.storyId` from story.json
- **Poems**: Extracted from localStorage key pattern `storyverse:poem:{poemId}:*`

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PROFILE PAGE                              │
│  fetchUserStories() → Get all stories from localStorage     │
│  Render StoryCard for each story with correct storyId       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ User clicks Story Card
┌─────────────────────────────────────────────────────────────┐
│              handleStoryClick(storyId)                       │
│  • Check if owner (isOwnProfile)                            │
│  • Check content type (Story vs Poem)                       │
│  • Navigate to appropriate editor with storyId             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ navigate(`/story/editor?id=${storyId}`)
┌─────────────────────────────────────────────────────────────┐
│                  STORY EDITOR PAGE                           │
│  • Extract storyId from URL query param                     │
│  • Call writingSessionEngine.initStory(storyId)             │
│  • Engine loads story from localStorage                     │
│  • Page renders editor UI with loaded data                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ User edits content
┌─────────────────────────────────────────────────────────────┐
│              WRITING SESSION ENGINE                          │
│  • User edits trigger setter methods                        │
│  • Engine debounces autosave                                │
│  • Persists to localStorage                                 │
│  • Notifies subscribers (UI updates)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ User navigates away and returns
┌─────────────────────────────────────────────────────────────┐
│              SAME STORY LOADS AGAIN                          │
│  • Engine loads same storyId                                │
│  • All edits preserved                                      │
│  • No data duplication                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## URL Patterns

### Story Editor
```
/story/editor?id=story_1738456789012_abc123xyz
```

### Poem Editor
```
/poem/editor?id=poem_1738456789012_xyz789abc
```

### Story Reader (non-owner)
```
/story/view/story_1738456789012_abc123xyz
```

---

## Key Features

### ✅ Owner vs Non-Owner Behavior
- **Owner**: Clicks story card → Opens in editor (editable)
- **Non-owner**: Clicks story card → Opens in reader (read-only)

### ✅ Content Type Detection
- **Story**: Routes to `/story/editor`
- **Poem**: Routes to `/poem/editor`
- Determined by `story.genre` field ('Story' or 'Poem')

### ✅ Data Persistence
- Edits save automatically to localStorage
- Navigating away preserves all changes
- Returning to editor restores exact state
- No data duplication or loss

### ✅ New vs Existing Stories
- **New story**: Creates default act/chapter structure
- **Existing story**: Loads saved data (even if empty/modified)
- Engine handles detection automatically

---

## Testing Checklist

### Basic Navigation
- [ ] Click story card on own profile → Opens in story editor
- [ ] Click poem card on own profile → Opens in poem editor
- [ ] Click story card on someone else's profile → Opens in reader
- [ ] URL contains correct storyId parameter

### Data Loading
- [ ] Existing story loads with all saved content
- [ ] Title, chapters, characters, locations all present
- [ ] Cover image loads correctly
- [ ] Privacy settings preserved

### Editing & Persistence
- [ ] Edit title → Auto-saves → Navigate away → Return → Title preserved
- [ ] Edit chapter text → Auto-saves → Refresh page → Text preserved
- [ ] Add character → Save → Navigate away → Return → Character present
- [ ] Change privacy → Save → Navigate away → Return → Privacy preserved

### Edge Cases
- [ ] Empty story (user deleted all content) → Loads with empty state
- [ ] Story with no chapters → Loads correctly, shows empty state
- [ ] Story with special characters in title → Loads correctly
- [ ] Multiple tabs: Edit in Tab A → Refresh Tab B → Sees latest changes

### Navigation Flow
- [ ] Profile → Story Card → Editor → Back → Profile (correct story highlighted)
- [ ] Create new story → Save → Go to profile → Click that story → Opens same story
- [ ] Edit story → Close tab → Reopen story from profile → All edits preserved

---

## Technical Implementation

### StoryCard Component
**File**: `d:\storyverse\src\pages\profile\components\StoryCard.tsx`

```typescript
interface StoryCardProps {
  id: string;  // ← Story ID passed from parent
  title: string;
  coverImageUrl: string;
  genre: string;
  likes: number;
  readingTime: number;
  comments?: number;
  onClick: (id: string) => void;  // ← Click handler
}

// Click triggers parent handler with story ID
<div className={styles.storyCard} onClick={() => onClick(id)}>
```

### PublishedStoriesSection Component
**File**: `d:\storyverse\src\pages\profile\components\PublishedStoriesSection.tsx`

```typescript
interface PublishedStoriesSectionProps {
  stories: Story[];
  onStoryClick: (id: string) => void;  // ← Handler passed down
  title?: string;
}

// Maps stories to StoryCard components
{stories.map((story) => (
  <StoryCard key={story.id} {...story} onClick={onStoryClick} />
))}
```

---

## Future Enhancements

- [ ] Add reader mode UI for non-owners
- [ ] Implement collaborative editing (multi-user)
- [ ] Add version history / revision tracking
- [ ] Support story templates
- [ ] Enable story duplication (fork/clone)
- [ ] Add story export (PDF, EPUB, Markdown)

---

## Troubleshooting

**Problem**: Clicking story card opens new blank story
- ✅ Verify storyId is in URL: `/story/editor?id=story_xxx`
- ✅ Check fetchUserStories() returns correct IDs
- ✅ Ensure WritingSessionEngine.initStory() receives ID

**Problem**: Edits not persisting
- ✅ Check engine autosave is triggered (console logs)
- ✅ Verify localStorage contains story data
- ✅ Confirm storyId matches between save and load

**Problem**: Wrong story loads
- ✅ Check URL parameter matches clicked story ID
- ✅ Verify fetchUserStories() extracts correct IDs
- ✅ Ensure no ID collision in localStorage

**Problem**: Story disappears after edit
- ✅ Verify story is saving (check localStorage)
- ✅ Check privacy filter (private stories hidden from non-owners)
- ✅ Ensure fetchUserStories() scans correct storage keys

---

**Implementation Date**: 2026-02-01  
**Architecture Version**: 2.0 (Unified Source of Truth)  
**Status**: ✅ Complete
