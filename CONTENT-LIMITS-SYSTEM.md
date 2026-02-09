# Storyverse Content Limits System

## Overview

This document describes the content and storage limits implemented in Storyverse to safely support 100+ active users under a **hard global storage limit of 1 GB** while maintaining a completely free tier for all users.

## Hard Limits

### Per-User Content Limits

| Content Type | Limit | Reasoning |
|-------------|-------|-----------|
| Stories | 10 per user | Prevents storage bloat while allowing meaningful creative output |
| Poems | 20 per user | Poems are shorter, so higher limit is safe |
| Characters per Story | 20 | Reasonable for most narratives, prevents excessive character creation |
| Profile Photo | 1 per user | Single user identity image |

### Image Storage Constraints

All images must adhere to:
- **Format**: WebP (optimized compression)
- **Maximum Size**: 50 KB per image
- **Automatic Optimization**: Images are resized and compressed before upload
- **Replacement Logic**: Uploading a new image deletes the old one (no duplicates)

## Storage Budget Validation

### Worst-Case Per-User Calculation

```
Profile photo:        1 × 50 KB  = 50 KB
Story covers:        10 × 50 KB  = 500 KB
Poem covers:         20 × 50 KB  = 1,000 KB
Character images: 20×10 × 50 KB  = 10,000 KB (10 MB)
─────────────────────────────────────────────
Total per user:                  ≈ 11.5 MB
```

### Global Capacity

```
11.5 MB × 100 users = 1,150 MB
```

**Result**: With buffer and not all users maxing limits, 1 GB supports 100+ users safely.

## Implementation

### Services

#### 1. Content Limits Service
**Location**: `src/firebase/services/contentLimits.ts`

**Functions**:
- `canCreateStory(uid)` - Checks if user can create new story
- `canCreatePoem(uid)` - Checks if user can create new poem
- `canAddCharacter(storyId)` - Checks if story can have new character
- `getUserContentCounts(uid)` - Returns current story/poem counts
- `validateImageSize(file)` - Validates image file size
- `validateImageType(file)` - Validates image format

**Offline Validation**:
- `canCreateStoryOffline(count)` - Immediate UI feedback
- `canCreatePoemOffline(count)` - Immediate UI feedback
- `canAddCharacterOffline(count)` - Immediate UI feedback

#### 2. Image Storage Service
**Location**: `src/firebase/services/imageStorage.ts`

**Functions**:
- `optimizeImage(file)` - Converts to WebP and compresses to ≤50KB
- `uploadImage(file, path, imageId)` - Uploads new image
- `replaceImage(file, path, newId, oldId)` - Deletes old, uploads new
- `deleteImage(path, imageId)` - Removes image from storage
- `generateImageId()` - Creates unique image identifier

### UI Enforcement

#### Create Project Page
**Location**: `src/pages/create/CreateProjectPage.tsx`

**Behavior**:
- Checks limits before story/poem creation
- Shows user-friendly message when limit reached
- Prevents navigation to editor if limit exceeded

**Example Message**:
```
"You've reached the current story limit (10 stories)."
```

#### Story Editor
**Location**: `src/pages/story-editor/StoryEditorPage.tsx`

**Behavior**:
- Character creation blocked at 20 characters
- Alert shown: "This story has reached the current character limit (20 characters)."

### Data Model

All entities that use images must store:

```typescript
interface ImagedEntity {
  coverImageId?: string;    // Unique identifier for replacement
  coverImageUrl?: string;   // Download URL
}

interface Character {
  characterImageId?: string;
  characterImageUrl?: string;
  // ... other fields
}
```

## User Experience

### What Users Can Do
✅ Create up to 10 stories  
✅ Create up to 20 poems  
✅ Add up to 20 characters per story  
✅ Edit existing content without limits  
✅ Replace images (old ones auto-deleted)  

### What Users Cannot Do
❌ Create story #11  
❌ Create poem #21  
❌ Add character #21 to a story  
❌ Upload images > 50 KB  

### Messaging Philosophy

**DO**:
- Use calm, non-monetary language
- Explain the limit clearly
- Keep the focus on creativity, not restrictions

**DON'T**:
- Mention pricing or upgrades
- Use aggressive or sales-y language
- Block editing of existing content

**Example Messages**:
```
✅ "You've reached the current story limit (10 stories)."
✅ "This story has reached the current character limit (20 characters)."
❌ "Upgrade to Premium to create more stories!"
❌ "You've hit your limit. Pay to continue."
```

## Enforcement Layers

### 1. Frontend (Immediate Feedback)
- Offline validation using local counts
- Disable buttons when limits reached
- Show messages before API calls

### 2. Backend (Server Validation)
- Firestore count queries via `getCountFromServer`
- Block creation if limit exceeded
- Atomic operations to prevent race conditions

### 3. Storage (Cleanup)
- Image replacement deletes old files
- No orphaned images
- Automatic optimization on upload

## Testing Checklist

### Story Limits
- [ ] Create 10 stories successfully
- [ ] Attempt to create story #11 → blocked with message
- [ ] Delete a story → can create new one
- [ ] Edit existing stories always works

### Poem Limits
- [ ] Create 20 poems successfully
- [ ] Attempt to create poem #21 → blocked with message
- [ ] Delete a poem → can create new one
- [ ] Edit existing poems always works

### Character Limits
- [ ] Add 20 characters to a story
- [ ] Attempt to add character #21 → blocked with message
- [ ] Edit existing characters always works

### Image Handling
- [ ] Upload image < 50 KB → success
- [ ] Upload image > 50 KB → auto-compressed or rejected
- [ ] Replace profile photo → old one deleted
- [ ] Replace story cover → old one deleted
- [ ] Replace character image → old one deleted

### Offline Behavior
- [ ] Limits enforced when offline
- [ ] Limit messages show immediately (no server delay)
- [ ] After going online, server validates again

## Future Enhancements (Not in MVP)

### Storage Usage Dashboard
Track and display:
- Current story count vs. limit
- Current poem count vs. limit
- Approximate storage used

### Soft Limits with Warnings
- Warning at 80% of limit
- Suggestion to archive/delete old content

### Admin Tools
- View global storage usage
- Identify users approaching limits
- Cleanup orphaned images

## Technical Notes

### Why 200 words/minute reading speed?
Standard average for comfortable reading on screens.

### Why WebP format?
- Superior compression (30-50% smaller than JPEG)
- Broad browser support
- Maintains quality at low file sizes

### Why 50 KB limit?
Balance between image quality and storage efficiency. With optimization, 50 KB allows decent cover images.

### Why these specific limits (10/20/20)?
Based on worst-case storage calculation to support 100+ users under 1 GB with safety buffer.

## Support & Troubleshooting

### User reports "Can't create story" but has < 10
1. Check Firestore `stories` collection count for user
2. Verify no orphaned/soft-deleted documents
3. Check console for limit check errors

### Images not uploading
1. Verify file size < 50 KB pre-optimization
2. Check browser console for optimization errors
3. Verify Firebase Storage rules allow writes

### Old images not deleted
1. Check `imageId` is stored correctly
2. Verify `replaceImage` function is called (not `uploadImage`)
3. Check Firebase Storage rules allow deletes

## Constants Reference

```typescript
export const CONTENT_LIMITS = {
  MAX_STORIES_PER_USER: 10,
  MAX_POEMS_PER_USER: 20,
  MAX_CHARACTERS_PER_STORY: 20,
  MAX_IMAGE_SIZE_KB: 50,
  MAX_IMAGE_SIZE_BYTES: 50 * 1024,
} as const;
```

---

**Last Updated**: February 3, 2026  
**Status**: ✅ Implemented  
**Global Cap**: 1 GB  
**Target Users**: 100+  
**Tier**: Free (no paid plans)
