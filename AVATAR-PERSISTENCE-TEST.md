# Avatar Persistence Test Guide

## Testing Steps

### 1. Upload Avatar Test
1. Navigate to Character Profile page
2. Click "Upload photo" button
3. Select an image
4. Crop and save the image
5. **Check console logs** - Should see:
   - `[CharacterProfilePage] Saving optimized image`
   - `[CharacterProfilePage] Saving profile with new avatar`
   - `[StorageManager] Saving profile to key`
   - `[StorageManager] Profile imageUrl: Present`
   - `[StorageManager] Verified save - imageUrl: Present`
6. **Refresh the page** (F5)
7. **Expected Result**: Avatar should remain visible

### 2. Delete Avatar Test
1. With avatar uploaded, click "Delete photo" button
2. **Check console logs** - Should see:
   - `[CharacterProfilePage] Deleting avatar`
   - `[CharacterProfilePage] Saving profile with deleted avatar`
   - `[StorageManager] Profile imageUrl: None`
3. **Refresh the page** (F5)
4. **Expected Result**: Icon should appear, "Upload photo" button visible

### 3. Replace Avatar Test  
1. Upload an avatar
2. Click the avatar image itself
3. Upload a different image
4. Save the new crop
5. **Refresh the page** (F5)
6. **Expected Result**: New avatar should be visible

### 4. Story Editor Sync Test
1. Upload avatar in Character Profile
2. Navigate back to Story Editor
3. **Expected Result**: Avatar should appear in Characters section
4. Go back to Character Profile, delete avatar
5. Navigate back to Story Editor
6. **Expected Result**: Icon should appear (no avatar)

## Debug Console Commands

Run this in browser console to check localStorage:

```javascript
// Check all character data
const storyId = '1';
const chars = JSON.parse(localStorage.getItem(`storyverse/stories/${storyId}/characters`) || '[]');
chars.forEach(c => {
  const profile = JSON.parse(localStorage.getItem(`storyverse/stories/${storyId}/character_profiles/${c.characterId}`) || '{}');
  console.log(c.name, '- Avatar in list:', c.avatar ? 'YES' : 'NO', '- Avatar in profile:', profile.imageUrl ? 'YES' : 'NO');
});
```

Or use the test script:
```javascript
// Copy and paste contents of test-avatar-persistence.js into console
```

## Expected Console Logs

### On Page Load:
```
[StorageManager] Loaded character profile: {characterId} Avatar: Present (...)
[CharacterProfilePage] Initializing profile for characterId: {id}
[CharacterProfilePage] Loaded existing profile, imageUrl: Present
[CharacterProfilePage] Profile imageUrl changed: Present
```

### On Avatar Upload:
```
[CharacterProfilePage] Saving optimized image, length: {number}
[CharacterProfilePage] Saving profile with new avatar
[StorageManager] Saving profile to key: storyverse/stories/1/character_profiles/{id}
[StorageManager] Profile imageUrl: Present ({number} chars)
[StorageManager] Verified save - imageUrl: Present
[StorageManager] Updated character avatar: {id} Avatar: Set
```

### On Avatar Delete:
```
[CharacterProfilePage] Deleting avatar
[CharacterProfilePage] Saving profile with deleted avatar
[StorageManager] Saving profile to key: storyverse/stories/1/character_profiles/{id}
[StorageManager] Profile imageUrl: None
[StorageManager] Verified save - imageUrl: Missing
[StorageManager] Updated character avatar: {id} Avatar: Removed
```

## Troubleshooting

If avatar disappears on refresh:

1. **Check console logs** - Look for any errors
2. **Check localStorage** - Run the debug command above
3. **Check browser** - Try in incognito mode to rule out extensions
4. **Clear and retry** - Clear localStorage and test from scratch:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## What Was Fixed

1. **Fixed state update timing** - Avatar save now uses the updated profile state directly
2. **Added verification logging** - localStorage save is now verified immediately
3. **Enhanced debugging** - Comprehensive logs at every step
4. **Removed race conditions** - Save happens with the correct state, not stale state
