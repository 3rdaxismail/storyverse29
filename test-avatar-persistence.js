/**
 * Avatar Persistence Test
 * Run this in browser console to test avatar persistence
 */

console.log('=== Avatar Persistence Test ===');

// Test 1: Check if character profiles exist
const storyId = '1';
const profilesKey = `storyverse/stories/${storyId}/characters`;
const charactersData = localStorage.getItem(profilesKey);

if (charactersData) {
  const characters = JSON.parse(charactersData);
  console.log('Characters found:', characters.length);
  characters.forEach(char => {
    console.log(`- ${char.name} (${char.characterId}):`, char.avatar ? 'HAS AVATAR' : 'NO AVATAR');
    
    // Check individual profile
    const profileKey = `storyverse/stories/${storyId}/character_profiles/${char.characterId}`;
    const profileData = localStorage.getItem(profileKey);
    if (profileData) {
      const profile = JSON.parse(profileData);
      console.log(`  Profile imageUrl:`, profile.imageUrl ? 'PRESENT' : 'MISSING');
      
      if (profile.imageUrl && char.avatar) {
        console.log(`  ✓ Avatar synced correctly`);
      } else if (profile.imageUrl && !char.avatar) {
        console.warn(`  ⚠ Avatar in profile but NOT in characters list`);
      } else if (!profile.imageUrl && char.avatar) {
        console.warn(`  ⚠ Avatar in characters list but NOT in profile`);
      }
    } else {
      console.warn(`  ⚠ No profile data found`);
    }
  });
} else {
  console.log('No characters found in localStorage');
}

// Test 2: Check localStorage size
let totalSize = 0;
for (let key in localStorage) {
  if (key.startsWith('storyverse/')) {
    const itemSize = localStorage.getItem(key)?.length || 0;
    totalSize += itemSize;
    if (key.includes('character_profiles')) {
      console.log(`${key}: ${(itemSize / 1024).toFixed(2)} KB`);
    }
  }
}
console.log(`Total Storyverse data: ${(totalSize / 1024).toFixed(2)} KB`);

console.log('=== Test Complete ===');
