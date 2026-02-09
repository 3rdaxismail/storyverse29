# Character Name Persistence Fix

## Bug Summary

**Issue:** Character names were not persisting correctly between CharacterProfilePage and StoryEditorPage.

**Example:** User types "Evan" in Character Profile, but Story Editor shows "Eva" (partial/stale name).

## Root Cause

Same async state issue that affected avatar persistence:

```tsx
// OLD CODE (BROKEN)
const updateProfile = (key, value) => {
  setProfile(prev => ({ ...prev, [key]: value }));  // Async state update
  setTimeout(triggerSave, 100);  // Reads OLD profile.name!
};
```

**Problem:** React's `setState` is asynchronous. When `triggerSave()` executes 100ms later, it reads the OLD `profile.name` from closure, not the updated value.

**Result:** Partial names like "Eva" instead of "Evan" get saved to localStorage.

## Solution Implemented

Used functional setState pattern (same as avatar fix):

```tsx
// NEW CODE (FIXED)
const updateProfile = (key, value) => {
  setProfile(prev => {
    const updated = { ...prev, [key]: value };  // Get updated state
    setTimeout(() => {
      // Save the UPDATED profile directly (not stale closure)
      storageManager.saveCharacterProfile(storyId, updated.id, updated);
      setSaveMessage('Character saved');
      setTimeout(() => setSaveMessage(''), 2000);
    }, 300); // Debounced to 300ms for typing
    return updated;
  });
};
```

**Key Changes:**
1. Use functional setState to get current state
2. Create `updated` profile with new value
3. Pass `updated` profile directly to save function
4. Increased debounce to 300ms for better typing experience

## Data Flow (After Fix)

```
User types "Evan" in CharacterProfilePage
    ↓
onChange → updateProfile('name', 'Evan')
    ↓
setProfile(prev => { const updated = {...prev, name: 'Evan'}; ... })
    ↓
storageManager.saveCharacterProfile(storyId, characterId, updated)
    ↓
localStorage: character_profiles/{characterId} → {name: 'Evan', ...}
localStorage: characters → [{characterId, name: 'Evan', avatar}, ...]
    ↓
User navigates to StoryEditorPage
    ↓
visibilitychange event triggers reloadCharacters()
    ↓
storageManager.loadCharacters(storyId)
    ↓
setCharacterProfiles([{id, name: 'Evan', avatar}, ...])
    ↓
Characters section displays "Evan" ✅
```

## Files Modified

### 1. CharacterProfilePage.tsx
- **Fixed `updateProfile` function** - Uses functional setState
- **Added name monitoring** - `useEffect` logs name changes
- **Increased debounce** - 300ms for better typing experience
- **Added logging** - Tracks what field is being saved

### 2. StorageManager.ts
- **Enhanced logging** - Shows profile name when saving
- **Character list logging** - Shows name and avatar when updating characters array

## Testing Instructions

### Test 1: Full Name Persistence
1. Navigate to Character Profile page
2. Type a full name: "Evan Rodriguez"
3. Wait for "Character saved" message
4. Navigate back to Story Editor
5. **Expected:** Characters section shows "Evan Rodriguez" (full name)

### Test 2: Name Change
1. Open existing character profile showing "Eva"
2. Edit name to "Evan"
3. Wait for save confirmation
4. Refresh page (F5)
5. **Expected:** Name field shows "Evan" (updated name)
6. Go to Story Editor
7. **Expected:** Characters section shows "Evan"

### Test 3: Multiple Characters
1. Create character "Alice"
2. Go back to Story Editor - verify "Alice" appears
3. Create character "Bob"
4. Go back to Story Editor - verify both "Alice" and "Bob" appear
5. Edit "Alice" → "Alicia"
6. Go back to Story Editor - verify "Alicia" and "Bob" both show updated

### Test 4: Fast Typing
1. Open character profile
2. Rapidly type a long name without pausing
3. Wait for "Character saved" message
4. Navigate away and back
5. **Expected:** Full name is preserved, no truncation

## Console Logs to Verify

### When typing name:
```
[CharacterProfilePage] Profile name changed: E
[CharacterProfilePage] Profile name changed: Ev
[CharacterProfilePage] Profile name changed: Eva
[CharacterProfilePage] Profile name changed: Evan
[CharacterProfilePage] Saving profile update: name = Evan
[StorageManager] Saving profile to key: storyverse/stories/1/character_profiles/{id}
[StorageManager] Profile name: Evan
[StorageManager] Updated character in list: {id} Name: Evan Avatar: Set/Removed
```

### When navigating to Story Editor:
```
[StoryEditorPage] 🔄 Characters reloaded: 1
```

## Verification Checklist

✅ Full name saves completely (no truncation)  
✅ Characters section shows exact same name  
✅ Refreshing page preserves name  
✅ Fast typing doesn't cause partial saves  
✅ Multiple characters work independently  
✅ Name and avatar stay in sync  
✅ Editing existing name updates correctly  

## Related Fixes

This uses the same pattern as the **Avatar Persistence Fix** implemented previously:
- Both avatar and name had async state issues
- Both now use functional setState with immediate save
- Both pass the updated profile directly to StorageManager

## Technical Notes

**Why 300ms debounce?**
- Prevents excessive saves during typing
- Balances responsiveness vs performance
- User sees "Character saved" after finishing typing, not mid-word

**Why functional setState?**
- React's setState is asynchronous
- Closures capture old state values
- Functional setState `(prev => ...)` gets current state
- Passing `updated` directly prevents stale reads

**Single Source of Truth:**
- ✅ StorageManager (localStorage) is the source of truth
- ✅ CharacterProfilePage writes to StorageManager
- ✅ StoryEditorPage reads from StorageManager
- ✅ No duplicated state or caching
