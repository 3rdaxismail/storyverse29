# Character Data Persistence - Complete Test Guide

## Overview

This guide tests **both** character name and avatar persistence fixes.

Both issues had the same root cause: **React async setState** causing stale state to be saved.

---

## Quick Summary of Fixes

### Issue 1: Avatar Disappearing on Refresh
**Root Cause:** Avatar saved with old state (before imageUrl was set)  
**Fix:** Use functional setState to save updated profile immediately

### Issue 2: Character Name Not Persisting Fully
**Root Cause:** Name saved with old state (before typing completed)  
**Fix:** Use functional setState to save updated profile immediately

---

## Test Suite

### Test 1: Character Name Persistence

**Steps:**
1. Navigate to Character Profile page
2. In the "What's this character's name?" field, type: **"Evan Rodriguez"**
3. Wait for "Character saved" message (appears briefly)
4. Navigate back to Story Editor (click breadcrumb or use browser back)
5. Look at Characters section

**Expected Result:**  
✅ Characters section shows **"Evan Rodriguez"** (full name, no truncation)

**Console Logs to Verify:**
```
[CharacterProfilePage] Profile name changed: E
[CharacterProfilePage] Profile name changed: Ev
[CharacterProfilePage] Profile name changed: Eva
[CharacterProfilePage] Profile name changed: Evan
[CharacterProfilePage] Profile name changed: Evan 
[CharacterProfilePage] Profile name changed: Evan R
[CharacterProfilePage] Profile name changed: Evan Ro
...
[CharacterProfilePage] Saving profile update: name = Evan Rodriguez
[StorageManager] Profile name: Evan Rodriguez
[StorageManager] Updated character in list: {id} Name: Evan Rodriguez
[StoryEditorPage] 🔄 Characters reloaded: 1
```

---

### Test 2: Name Change Updates Everywhere

**Steps:**
1. Create a character named **"Alice"**
2. Go to Story Editor → verify "Alice" appears
3. Go back to Character Profile
4. Change name to **"Alicia"**
5. Wait for save confirmation
6. Go to Story Editor

**Expected Result:**  
✅ Characters section shows **"Alicia"** (updated name)

---

### Test 3: Fast Typing (No Truncation)

**Steps:**
1. Open Character Profile
2. **Rapidly type without pausing:** "Christopher Montgomery III"
3. Don't wait between keystrokes
4. Wait for "Character saved" message
5. Refresh page (F5)
6. Check the name field

**Expected Result:**  
✅ Name field shows full name: **"Christopher Montgomery III"**  
✅ No truncation like "Christo" or "Christopher M"

---

### Test 4: Avatar Upload + Name Sync

**Steps:**
1. Open Character Profile for "Evan Rodriguez"
2. Upload a photo
3. Crop and save
4. Wait for save confirmation
5. Navigate to Story Editor

**Expected Result:**  
✅ Characters section shows avatar AND name "Evan Rodriguez"  
✅ Both are synced correctly

---

### Test 5: Avatar Delete + Name Preserved

**Steps:**
1. Character with avatar and name "Evan Rodriguez"
2. Click "Delete photo" button
3. Wait for save confirmation
4. Navigate to Story Editor
5. Check Characters section

**Expected Result:**  
✅ Avatar is removed (icon appears)  
✅ Name "Evan Rodriguez" is still present

---

### Test 6: Multiple Characters Independence

**Steps:**
1. Create character "Alice"
2. Create character "Bob"
3. Go to Story Editor → verify both appear
4. Edit "Alice" → change to "Alicia"
5. Go to Story Editor → verify "Alicia" and "Bob"
6. Edit "Bob" → add avatar
7. Go to Story Editor → verify "Alicia" (no avatar) and "Bob" (with avatar)

**Expected Result:**  
✅ Each character maintains independent data  
✅ Changes to one don't affect others

---

### Test 7: Page Refresh Preserves Everything

**Steps:**
1. Character with name "Evan Rodriguez" and avatar
2. Navigate to Story Editor
3. Verify both name and avatar show correctly
4. Refresh page (F5)
5. Check Characters section again

**Expected Result:**  
✅ Name still shows "Evan Rodriguez"  
✅ Avatar still displays

---

## Console Test Script

Run this in browser console to check localStorage sync:

```javascript
// Copy and paste from test-character-name-persistence.js
```

Or manually check:

```javascript
const storyId = '1';
const chars = JSON.parse(localStorage.getItem(`storyverse/stories/${storyId}/characters`) || '[]');
chars.forEach(c => {
  const profile = JSON.parse(localStorage.getItem(`storyverse/stories/${storyId}/character_profiles/${c.characterId}`) || '{}');
  console.log(c.name, '→ List:', c.name, '| Profile:', profile.name, '| Match:', c.name === profile.name ? '✅' : '❌');
});
```

---

## Verification Checklist

### Character Name
- [ ] Full name saves completely (no truncation)
- [ ] Fast typing doesn't cause partial saves
- [ ] Name shows in Story Editor Characters section
- [ ] Name updates sync immediately
- [ ] Page refresh preserves name
- [ ] Multiple characters work independently

### Character Avatar
- [ ] Avatar uploads and displays correctly
- [ ] Avatar persists on page refresh
- [ ] Avatar delete works correctly
- [ ] Avatar syncs to Story Editor
- [ ] Avatar and name stay in sync

### Data Flow
- [ ] CharacterProfilePage saves to StorageManager
- [ ] StoryEditorPage reads from StorageManager
- [ ] No duplicate state or caching
- [ ] Changes reflect immediately when navigating back

---

## Technical Details

### Data Flow (Single Source of Truth)

```
CharacterProfilePage (Editor)
        ↓
    [User types name or uploads avatar]
        ↓
    updateProfile() / handleSaveOptimizedImage()
        ↓
    setProfile(prev => { const updated = {...prev}; save(updated); })
        ↓
StorageManager.saveCharacterProfile(storyId, characterId, updated)
        ↓
localStorage:
  - character_profiles/{characterId} → Full profile
  - characters → [{id, name, avatar}, ...]
        ↓
StoryEditorPage (Consumer)
        ↓
    reloadCharacters() on mount + visibilitychange
        ↓
StorageManager.loadCharacters(storyId)
        ↓
setCharacterProfiles([{id, name, avatar}, ...])
        ↓
    Characters section renders
```

### Key Pattern: Functional setState

**Problem:**
```tsx
setProfile({ ...profile, name: 'Evan' });  // Async
setTimeout(() => save(profile), 100);       // Reads OLD profile!
```

**Solution:**
```tsx
setProfile(prev => {
  const updated = { ...prev, name: 'Evan' };  // Current state
  setTimeout(() => save(updated), 300);        // Save UPDATED profile
  return updated;
});
```

---

## Files Modified

1. **CharacterProfilePage.tsx**
   - Fixed `updateProfile` to use functional setState
   - Fixed `handleSaveOptimizedImage` to use functional setState
   - Fixed `handleDeletePhoto` to use functional setState
   - Added name change monitoring
   - Removed unused `triggerSave` function

2. **StorageManager.ts**
   - Enhanced logging to show profile name
   - Enhanced logging to show character list updates
   - Avatar and name both logged during save

3. **StoryEditorPage.tsx**
   - Already reloads characters on mount and visibility change (implemented earlier)

---

## Expected Console Logs

### On Character Name Edit:
```
[CharacterProfilePage] Profile name changed: Evan Rodriguez
[CharacterProfilePage] Saving profile update: name = Evan Rodriguez
[StorageManager] Saving profile to key: storyverse/stories/1/character_profiles/{id}
[StorageManager] Profile name: Evan Rodriguez
[StorageManager] Updated character in list: {id} Name: Evan Rodriguez Avatar: Set
```

### On Navigate to Story Editor:
```
[StoryEditorPage] 🔄 Characters reloaded: 1
```

### On Avatar Upload:
```
[CharacterProfilePage] Saving optimized image, length: 15234
[CharacterProfilePage] Saving profile with new avatar
[StorageManager] Profile name: Evan Rodriguez
[StorageManager] Profile imageUrl: Present (15234 chars)
[StorageManager] Updated character in list: {id} Name: Evan Rodriguez Avatar: Set
```

---

## Troubleshooting

### Name Still Truncated?
1. Open browser console
2. Check for errors during save
3. Run test script to check localStorage
4. Verify console shows "Saving profile update: name = [full name]"

### Avatar Still Disappearing?
1. Check console logs for "Profile imageUrl: Present"
2. Verify "Verified save - imageUrl: Present"
3. Check visibilitychange events firing when navigating back

### Characters Not Syncing?
1. Verify visibilitychange listener is working
2. Check "🔄 Characters reloaded" appears in console
3. Manually reload page to force sync

---

## Success Criteria

✅ **All tests pass**  
✅ **Console logs show complete data**  
✅ **No errors in browser console**  
✅ **Data persists across page refreshes**  
✅ **Story Editor always shows latest character data**

---

## Next Steps After Verification

Once all tests pass:
1. Remove debug console.log statements (if desired)
2. Consider adding debounce indicator (e.g., "Saving..." message)
3. Consider optimistic UI updates
4. Add TypeScript types for character profile (replace `any`)
