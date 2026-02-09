# Offline Protection System

## Overview

Storyverse implements a comprehensive **offline protection system** with a **premium lockdown experience** that prevents data loss by completely locking the app when offline. The entire screen blurs with a beautiful animated logo, creating a polished and trustworthy offline state.

## Safety Philosophy

**"No edits are better than lost edits"**

Rather than attempting complex offline sync that could fail silently, we prioritize correctness and user trust by:
- **Immediately locking the entire app** when connection is lost
- **Blurring the screen** with a premium glassmorphism effect
- **Showing animated gradient logo** in center (140px Storyverse logo)
- **Smooth premium transitions** when going offline/online
- **Blocking all interactions** via full-screen overlay (z-index: 99999)
- Automatically restoring full functionality when connection returns

## Premium Offline Experience

### Visual Design

**When Offline:**
- Full-screen dark overlay with 20px blur + desaturation
- Animated gradient Storyverse logo (140px) in center
- Elegant "You're Offline" heading with gradient text
- Subtle subtitle: "Reconnecting to protect your work..."
- Gentle breathing animation (2% scale pulse every 4s)

**Transition Animations:**
- 600ms fade-in with cubic-bezier easing
- Float-in animation with elastic bounce (0.8s)
- Gradient blur backdrop animation
- Message fade-up with 200ms delay

### User Experience Flow

1. **Going Offline:**
   - Screen immediately blurs over 600ms
   - Dark overlay fades in smoothly
   - Logo floats in from below with bounce
   - Message appears with fade-up animation
   - All interactions blocked

2. **While Offline:**
   - Logo continues its gradient animation
   - Subtle breathing pulse (scale 1.0 → 1.02 → 1.0)
   - Clear, calm messaging
   - User cannot interact with any UI elements

3. **Reconnecting:**
   - Overlay fades out over 600ms
   - Blur gradually clears
   - Logo and message fade away
   - App becomes fully interactive again
   - No data loss, seamless resumption

## Implementation

### 1. Online Status Detection

**Hook:** `src/hooks/useOnlineStatus.ts`

```typescript
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // ...
  }, []);
  
  return isOnline;
}
```

**Features:**
- Uses native `navigator.onLine` API
- Listens to `online` and `offline` window events
- Console logging for debugging (🟢 online, 🔴 offline)

### 2. Premium Lockdown Overlay

**Component:** `src/components/common/OfflineNotice.tsx`

**Behavior:**
- **Full-screen overlay** covering entire viewport (z-index: 99999)
- **Blur backdrop:** 20px blur + dark gradient + desaturation
- **Animated logo:** 140px Storyverse gradient logo in center
- **Premium animations:** Float-in, fade, breathing pulse
- **Message:** "You're Offline" + "Reconnecting to protect your work..."
- **Blocks all interactions** when offline (pointer-events: all)

**Animations:**
- `fadeInBlur`: 600ms backdrop blur animation
- `floatIn`: 800ms elastic bounce entry
- `fadeInUp`: 800ms message appear (200ms delay)
- `breathe`: 4s infinite gentle scale pulse (1.0 → 1.02 → 1.0)

**Integration:**
- Added to `App.tsx` at root level
- Uses `AppLoader` component (140px gradient logo)
- Monitors global `isOnline` state from `useOnlineStatus()`

### 3. Story Editor Protection

**File:** `src/pages/story-editor/StoryEditorPage.tsx`

**Protected Actions:**
- ✅ Story title editing (TitleInputBlock)
- ✅ Act title editing (ActSection)
- ✅ Chapter title editing (ChapterCard)
- ✅ Chapter text editing (ChapterTextEditor)
- ✅ Add Act button
- ✅ Add Chapter button
- ✅ Delete Act button
- ✅ Cover image save/delete operations

**Disabled Behavior:**
- Inputs become `readOnly` with visual feedback (opacity: 0.6, cursor: not-allowed)
- Buttons become `disabled` with same visual feedback
- Save operations show warning toast: "Cannot save while offline"

### 4. Poem Editor Protection

**File:** `src/pages/poem-editor/PoemEditorPage.tsx`

**Protected Actions:**
- ✅ Poem text editing (main textarea)
- ✅ Cover image operations

**Implementation:**
```tsx
<textarea
  readOnly={!isOnline}
  style={!isOnline ? { cursor: 'not-allowed', opacity: 0.6 } : undefined}
/>
```

### 5. Character Profile Protection

**File:** `src/pages/character-profile/CharacterProfilePage.tsx`

**Protected Actions:**
- ✅ Writer Notes textarea
- ✅ All character attribute inputs (via trait components)

### 6. Text Editor Component Protection

**File:** `src/components/story/ChapterTextEditor.tsx`

**Protected Actions:**
- ✅ `handleChange()` - Prevents text changes
- ✅ `handleFocus()` - Prevents editor activation
- ✅ Visual feedback: `readOnly`, reduced opacity, not-allowed cursor

**State Management:**
- Editor remainLockdown:** Full screen blurs over 600ms
2. **Premium Overlay:** Dark glassmorphism backdrop appears
3. **Logo Animation:** Storyverse logo floats in with bounce (800ms)
4. **Message Display:** "You're Offline" appears with fade-up
5. **Complete Block:** All clicks, typing, navigation blocked
6. **Breathing Animation:** Subtle 4s pulse begins

### When Coming Back Online

1. **Smooth Fade Out:** Overlay disappears over 600ms
2. **Blur Clears:** Screen sharpens gradually
3. **Logo Exit:** Animated logo fades away
4. **App Restores:** Full functionality returns immediately
5. **No Data Loss:** All previously saved content intact
6. **Seamless Resume:** User continues exactly where they left off
4. **Clear Message:** "You're offline. Writing is paused to protect your work."

### When Coming Back Online

1. **Banner Disappears:** Notification slides away
2. **Inputs Re-enable:** Full opacity, normal cursor
3. **Editing Resumes:** User can continue writing
4. **No Data Loss:** All previously saved content intact

## Technical Details

### isOnline Prop Chain

```
App.tsx (useOnlineStatus)
  ↓
OfflineNotice.tsx (isOnline)

StoryEditorPage.tsx (useOnlineStatus)
  ↓
  ├─ TitleInputBlock (isOnline)
  └─ ActSection (isOnline)
       ↓
       └─ ChapterCard (isOnline)
            ↓
            └─ ChapterTextEditor (isOnline)
```

### Save Operation Guards

All Firebase save operations check `isOnline` before executing:

```typescript
const handleCoverSave = async (imageDataUrl: string) => {
  if (!isOnline) {
    showNotification('Cannot save cover image while offline', 'warning');
    return;
  }
  // ... proceed with save
};
```

## What's Allowed Offline

✅ **Reading/Viewing:**
- View dashboard
- Read published stories/poems
- Browse trending content
- View character profiles
- Navigate between pages

❌ **Writing/Creating:**
- Edit story text
- Edit poem text
- Create new content
- Upload images
- Modify metadata
- Delete content

## Safety Rules

1. **No Offline Queue:** We do NOT attempt to queue offline writes
2. **No localStorage Workaround:** We do NOT store unsynced text in localStorage
3. **No Partial Sync:** We do NOT attempt complex offline-first architecture
4. **Prefer Correctness:** We prioritize data integrity over feature completeness

## Future Considerations

For production release, we could consider:
- Offline draft saving with explicit "unsaved draft" warning
- Service worker cache for read-only content
- Conflict resolution UI for concurrent edits

However, for Early Access, the current **safe and simple** approach is most appropriate.

## Testing
, start typing
3. Open DevTools → Network tab → Set "Offline" throttling
4. **Expected:** 
   - Screen blurs over 600ms
   - Dark overlay with animated logo appears
   - "You're Offline" message displays
   - All interactions completely blocked
   - Logo breathes with gentle pulse
5. Try typing → **Expected:** No response (keyboard blocked)
6. Try clicking → **Expected:** No response (clicks blocked)
7. Turn off "Offline" throttling
8. **Expected:** 
   - Overlay fades out smoothly over 600ms
   - Blur clears
   - App becomes fully interactive
   - Editing resumes perfectlyze
5. Try typing → **Expected:** No changes occur
6. Try clicking "Add Chapter" → **Expected:** Button does nothing
7. Turn off "Offline" throttling
8. **Expected:** Banner disappears, editing resumes

**Console Logging:**
- 🟢 "Connection restored - editing enabled"
- 🔴 "Connection lost - editing disabled to protect your work"

## Browser Compatibility

- ✅ Chrome/Edge (native `navigator.onLine`)
- ✅ Firefox (native `navigator.onLine`)
- ✅ Safari (native `navigator.onLine`)
- ✅ Mobile browsers (online/offline events)

## Files Modified

### Created Files:
- `src/hooks/useOnlineStatus.ts`
- `src/components/common/OfflineNotice.tsx`
- `src/components/common/OfflineNotice.module.css`

### Modified Files:
- `src/App.tsx` (added global OfflineNotice)
- `src/pages/story-editor/StoryEditorPage.tsx` (added isOnline guards)
- `src/pages/poem-editor/PoemEditorPage.tsx` (added isOnline guards)
- `src/pages/character-profile/CharacterProfilePage.tsx` (added isOnline guards)
- `src/components/story/StoryMetaSection/TitleInputBlock.tsx` (added isOnline prop)
- `src/components/story/ActSection.tsx` (added isOnline prop)
- `src/components/story/ChapterCard.tsx` (added isOnline prop)
- `src/components/story/ChapterTextEditor.tsx` (added isOnline prop)

## Deployment
locks entire app  
✅ Screen blurs with premium glassmorphism effect  
✅ Animated gradient logo displays in center  
✅ All interactions completely blocked (typing, clicking, navigation)  
✅ Smooth 600ms transitions when going offline/online  
✅ When internet returns, app unlocks seamlessly  
✅ No user can lose content due to offline edits  
✅ Premium animations create polished, trustworthy experience  

---

**Implementation Date:** February 5, 2026  
**Status:** Production Ready  
**Safety Level:** Maximum  
**UX Quality:** Premiumn be created while offline  
✅ When internet returns, editing resumes safely  
✅ No user can lose content due to offline edits  
✅ Clear, calm notification explains the situation  

---

**Implementation Date:** February 5, 2026  
**Status:** Production Ready  
**Safety Level:** High
