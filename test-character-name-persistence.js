/**
 * Character Name Persistence Test Script
 * 
 * Run this in the browser console to verify character name persistence.
 * Tests that character names are saved correctly and synced between
 * Character Profile page and Story Editor Characters section.
 */

(function() {
  console.log('='.repeat(60));
  console.log('CHARACTER NAME PERSISTENCE TEST');
  console.log('='.repeat(60));
  
  const storyId = '1';
  
  // Get all characters from localStorage
  const charactersKey = `storyverse/stories/${storyId}/characters`;
  const charactersData = localStorage.getItem(charactersKey);
  
  if (!charactersData) {
    console.log('❌ No characters found in localStorage');
    return;
  }
  
  const characters = JSON.parse(charactersData);
  console.log(`\n📊 Total Characters: ${characters.length}\n`);
  
  // Check each character
  characters.forEach((char, index) => {
    console.log(`Character ${index + 1}:`);
    console.log(`  ID: ${char.characterId}`);
    console.log(`  Name (in list): "${char.name}"`);
    console.log(`  Avatar: ${char.avatar ? 'Yes (' + char.avatar.substring(0, 30) + '...)' : 'No'}`);
    
    // Load full profile and compare
    const profileKey = `storyverse/stories/${storyId}/character_profiles/${char.characterId}`;
    const profileData = localStorage.getItem(profileKey);
    
    if (profileData) {
      const profile = JSON.parse(profileData);
      console.log(`  Name (in profile): "${profile.name}"`);
      
      // Check if names match
      if (char.name === profile.name) {
        console.log('  ✅ Names are in sync');
      } else {
        console.log('  ❌ NAME MISMATCH!');
        console.log(`     List: "${char.name}"`);
        console.log(`     Profile: "${profile.name}"`);
      }
      
      // Check avatar sync
      const listAvatar = char.avatar || '';
      const profileAvatar = profile.imageUrl || '';
      if (listAvatar === profileAvatar) {
        console.log('  ✅ Avatars are in sync');
      } else {
        console.log('  ⚠️  Avatar mismatch');
        console.log(`     List: ${listAvatar ? 'Present' : 'None'}`);
        console.log(`     Profile: ${profileAvatar ? 'Present' : 'None'}`);
      }
    } else {
      console.log('  ⚠️  No profile found for this character');
    }
    console.log('');
  });
  
  // Storage size report
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('storyverse/')) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }
  }
  
  console.log('='.repeat(60));
  console.log(`Storage Usage: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log('='.repeat(60));
  
  // Test Instructions
  console.log('\n📝 MANUAL TEST STEPS:\n');
  console.log('1. Go to Character Profile page');
  console.log('2. Type a full name (e.g., "Evan Rodriguez")');
  console.log('3. Wait for "Character saved" message');
  console.log('4. Navigate to Story Editor');
  console.log('5. Check Characters section shows full name');
  console.log('6. Run this script again to verify sync\n');
  
})();
