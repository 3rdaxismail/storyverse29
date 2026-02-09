// Quick script to check story privacy setting
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyDwpGN7pVUuj9NKvxKcXlOcdtWr89Av4s0",
  authDomain: "storyverse-830fc.firebaseapp.com",
  projectId: "storyverse-830fc",
  storageBucket: "storyverse-830fc.firebasestorage.app",
  messagingSenderId: "358594681746",
  appId: "1:358594681746:web:5b0c71cf3c1dc3ab9073b1",
  measurementId: "G-RPHZQGXKHD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStoryPrivacy(storyId) {
  const docRef = doc(db, 'stories', storyId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log('✅ Story found!');
    console.log('Title:', data.storyTitle);
    console.log('Privacy:', data.privacy);
    console.log('Author UID:', data.uid);
    console.log('\n📝 Privacy Options:');
    console.log('  - "Trending" = Publicly accessible (no login required)');
    console.log('  - "Open access" = Requires authentication');
    console.log('  - "Private" = Owner only');
    console.log('\n💡 To make this story publicly viewable, set privacy to "Trending"');
  } else {
    console.log('❌ Story not found');
  }
  
  process.exit(0);
}

const storyId = process.argv[2] || 'story_1770282640149_50r8229wo';
checkStoryPrivacy(storyId);
