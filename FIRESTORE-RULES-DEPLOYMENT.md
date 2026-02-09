# Firestore Security Rules Deployment Guide

## Problem
Users are getting "Missing or insufficient permissions" errors when trying to bookmark content. This is because Firestore security rules don't allow access to the `users/{uid}/savedReads` subcollection.

## Solution
Deploy the updated `firestore.rules` file to Firebase.

## Option 1: Deploy via Firebase Console (Quickest)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your StoryVerse project

2. **Navigate to Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in this workspace
   - Copy the entire contents
   - Paste into the Firebase Console rules editor
   - Click "Publish"

## Option 2: Deploy via Firebase CLI

1. **Install Firebase CLI** (if not already installed)
   ```powershell
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```powershell
   firebase login
   ```

3. **Initialize Firebase** (if not already initialized)
   ```powershell
   firebase init
   ```
   - Select "Firestore" when prompted
   - Choose your existing project
   - Use `firestore.rules` as the rules file

4. **Deploy Rules**
   ```powershell
   firebase deploy --only firestore:rules
   ```

## What These Rules Allow

### Critical for Bookmarks Feature:
```javascript
match /users/{userId} {
  match /savedReads/{itemId} {
    // Users can only read/write their own saved reads
    allow read, write: if isOwner(userId);
  }
}
```

### Other Important Rules:
- **Stories/Poems**: Anyone authenticated can read, only owners can write
- **Likes**: Users can create/delete their own likes
- **Comments**: Users can create/update/delete their own comments
- **User Profiles**: Users can read all profiles, write only their own

## Verify Rules are Active

After deploying, test the bookmark feature:
1. Sign in to the app
2. Click the bookmark icon on a story/poem card
3. Check browser console - should see success logs, no permission errors
4. Switch to "My Reads" tab - bookmarked items should appear

## Troubleshooting

If you still see permission errors:
1. Check Firebase Console → Firestore → Rules tab to confirm rules are published
2. Clear browser cache and refresh the app
3. Check the rules version number in Firebase Console
4. Verify your Firebase project ID matches the one in `src/firebase/config.ts`

## Security Notes

These rules ensure:
- ✅ Users can only bookmark their own content
- ✅ Users can only view their own saved reads
- ✅ Other users cannot see or modify someone else's bookmarks
- ✅ All data access requires authentication
- ✅ Content owners control their own stories/poems
