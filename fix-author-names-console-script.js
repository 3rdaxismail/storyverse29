/**
 * ONE-TIME FIX: Update all existing stories/poems with current display name
 * 
 * INSTRUCTIONS:
 * 1. Open your browser's Developer Console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 
 * This will update all your stories and poems with your current display name.
 */

(async function fixAuthorNames() {
  console.log('🔧 Starting author name fix...');
  
  try {
    // Get current user
    const auth = firebase.auth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('❌ No user logged in!');
      return;
    }
    
    console.log('✅ User ID:', user.uid);
    
    // Get current display name from users collection
    const db = firebase.firestore();
    const userDoc = await db.collection('users').doc(user.uid).get();
    const currentDisplayName = userDoc.data()?.displayName;
    
    if (!currentDisplayName) {
      console.error('❌ No display name found in profile');
      return;
    }
    
    console.log('✅ Current display name:', currentDisplayName);
    
    // Update all stories
    const storiesSnapshot = await db.collection('stories')
      .where('uid', '==', user.uid)
      .get();
    
    const batch = db.batch();
    let storiesCount = 0;
    
    storiesSnapshot.forEach((doc) => {
      batch.update(doc.ref, { authorName: currentDisplayName });
      storiesCount++;
    });
    
    // Update all poems
    const poemsSnapshot = await db.collection('poems')
      .where('uid', '==', user.uid)
      .get();
    
    let poemsCount = 0;
    
    poemsSnapshot.forEach((doc) => {
      batch.update(doc.ref, { authorName: currentDisplayName });
      poemsCount++;
    });
    
    if (storiesCount > 0 || poemsCount > 0) {
      await batch.commit();
      console.log(`✅ SUCCESS! Updated ${storiesCount} stories and ${poemsCount} poems`);
      console.log(`All your content now shows: "${currentDisplayName}"`);
      console.log('🔄 Refresh the page to see the changes');
    } else {
      console.log('ℹ️ No content found to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
