# Single-Device Session Enforcement System

## Overview

Storyverse now enforces **single-device active sessions per user** to prevent data conflicts from simultaneous editing on multiple devices. This works similar to WhatsApp Web's session model - only one device can be actively writing/saving at a time.

## Problem Solved

**Before:**
- User has StoryVerse open on phone + laptop
- Both devices autosave to Firestore simultaneously
- Causes race conditions, merge conflicts, and data loss
- No way to know which device has the "correct" version

**After:**
- Only ONE device can be active at a time
- Second device triggers conflict modal on BOTH devices
- User explicitly chooses which device to use
- Losing device becomes read-only until reactivated

---

## Architecture

### 1. DeviceSessionManager (Singleton Service)
**Location:** `src/services/DeviceSessionManager.ts`

**Purpose:** Core session management with real-time Firestore tracking

**Key Features:**
- Generates unique session IDs per device
- Real-time conflict detection via `onSnapshot` listener
- 30-second heartbeat to maintain active status
- Automatic cleanup on logout

**Firestore Structure:**
```
users/{uid}/activeSession/current
  ├─ sessionId: "abc123..."
  ├─ deviceType: "desktop" | "mobile"
  ├─ lastActiveAt: Timestamp
  └─ userAgent: "Mozilla/5.0..."
```

**Session States:**
- `active` - This device is the active device
- `inactive` - Another device is active, writes are blocked
- `conflicted` - Conflict detected, user must choose

**Critical Methods:**
```typescript
initializeSession(userId, onStatusChange) // Called on login
activateThisDevice()                      // Overwrites Firestore with current device
startSessionListener()                    // Real-time listener for conflicts
startHeartbeat()                          // 30s interval updates
isActive()                                // Async check if device is active
deactivateThisDevice()                    // Makes device inactive/read-only
cleanup()                                 // Called on logout
```

### 2. AuthContext Integration
**Location:** `src/firebase/AuthContext.tsx`

**Changes:**
- Added `sessionStatus` and `sessionConflict` to context state
- Calls `deviceSessionManager.initializeSession()` when user logs in
- Calls `deviceSessionManager.cleanup()` on logout
- Exposes session state to all components via `useAuth()` hook

**New Context Properties:**
```typescript
const { sessionStatus, sessionConflict } = useAuth();
```

### 3. SessionConflictModal Component
**Location:** `src/components/session/SessionConflictModal.tsx`

**UI Flow:**
1. Shown when `sessionStatus === 'conflicted'`
2. Blocks entire app with full-screen overlay
3. Shows device comparison (Other Device vs This Device)
4. "Use It Here" button activates this device
5. Other device automatically becomes read-only

**Design:**
- Full-screen blocking modal (z-index: 10000)
- Brand green colors (`--brand-primary`, `--brand-secondary`)
- Device icons (mobile vs desktop)
- Non-dismissible until user chooses

### 4. App.tsx Integration
**Location:** `src/App.tsx`

**Change:**
```tsx
{sessionStatus === 'conflicted' && sessionConflict && (
  <SessionConflictModal
    conflict={sessionConflict}
    onResolve={() => {
      console.log('[App] Session conflict resolved');
    }}
  />
)}
```

Shows modal globally when conflict detected.

### 5. WritingSessionEngine Guards
**Location:** `src/engine/WritingSessionEngine.ts`

**Protected Methods:**
All save operations now check `deviceSessionManager.isActive()` before writing:

```typescript
// Story saves
private async saveStoryMeta()       // Metadata, genres, privacy
private async saveCharacters()      // Character list
private async saveLocations()       // Locations list
private async saveActsAndChapters() // Story structure
private async saveChapterContent()  // Chapter text

// Poem saves
private async savePoemMeta()        // Poem metadata and text
```

**Protection Logic:**
```typescript
const isActive = await deviceSessionManager.isActive();
if (!isActive) {
  console.warn('🚫 Device is not active - save blocked');
  return; // Early exit, no Firestore write
}
```

**Effect:**
- Inactive devices: autosave is silently blocked
- User can still type/edit (local state only)
- No writes reach Firestore
- Console shows clear warning logs

---

## User Experience Flow

### Scenario: User Opens StoryVerse on Second Device

**Step 1: Login on Device A (Laptop)**
```
✅ Device A: Session initialized
✅ Firestore: sessionId = "laptop_abc123"
✅ Device A: Status = 'active'
✅ Device A: Can write/save normally
```

**Step 2: Login on Device B (Phone)**
```
🔥 Firestore: sessionId updated to "phone_xyz789"
⚡ Device A: onSnapshot detects conflict
⚡ Device B: onSnapshot detects conflict
🚫 BOTH devices: Status = 'conflicted'
📱 BOTH devices: Show SessionConflictModal
```

**Step 3: User Clicks "Use It Here" on Device B**
```
✅ Device B: Calls activateThisDevice()
✅ Firestore: sessionId = "phone_xyz789" (confirmed)
✅ Device B: Status = 'active'
✅ Device B: Can write/save normally

❌ Device A: onSnapshot gets new sessionId
❌ Device A: Status = 'inactive'
❌ Device A: Writes are blocked
📢 Device A: Should show "Session moved to another device"
```

**Step 4: User Returns to Device A, Clicks "Use It Here"**
```
✅ Device A: Calls activateThisDevice()
✅ Firestore: sessionId = "laptop_abc123" (back to laptop)
✅ Device A: Status = 'active'

❌ Device B: Status = 'inactive'
```

---

## Implementation Status

### ✅ Completed
1. **DeviceSessionManager** - Full singleton service with Firestore real-time tracking
2. **SessionConflictModal** - Blocking modal UI with device comparison
3. **AuthContext Integration** - Session initialization on login, cleanup on logout
4. **App.tsx Integration** - Global modal display
5. **WritingSessionEngine Guards** - All 7 save methods protected with isActive() checks

### 🔄 In Progress
6. **Documentation** - You're reading it!

### ⏳ Pending
7. **UI Feedback for Inactive Devices**
   - Show "Read-Only Mode" banner when status='inactive'
   - Freeze text editors (make contenteditable=false)
   - Show message: "Your session has been moved to another device"
   
8. **Testing**
   - Multi-device conflict scenarios
   - Offline → online session resume
   - Heartbeat timeout detection (>30s inactive)

9. **Build and Deploy**
   - Production build
   - Deploy to Firebase Hosting
   - Verify real-time listeners work in production

---

## Code Examples

### Checking Session Status in Any Component
```typescript
import { useAuth } from './firebase/AuthContext';

function MyComponent() {
  const { sessionStatus, sessionConflict } = useAuth();
  
  if (sessionStatus === 'inactive') {
    return <div>Read-Only Mode - Session active on another device</div>;
  }
  
  // Normal component rendering
}
```

### Manual Session Check Before Critical Operation
```typescript
import { deviceSessionManager } from './services/DeviceSessionManager';

async function performCriticalAction() {
  const isActive = await deviceSessionManager.isActive();
  if (!isActive) {
    alert('Session is on another device');
    return;
  }
  
  // Proceed with action
}
```

---

## Firestore Security Rules

**Required Rule:**
```javascript
match /users/{userId}/activeSession/current {
  // Users can read/write their own session
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Make sure this is in:** `firestore.rules`

---

## Benefits

✅ **Data Integrity** - Prevents autosave conflicts and merge issues
✅ **User Control** - Explicit choice of which device to use
✅ **Real-time Sync** - Instant conflict detection via Firestore listeners
✅ **Silent Blocking** - Inactive devices can't accidentally overwrite data
✅ **Clear UX** - WhatsApp-like model users already understand
✅ **Offline Safe** - Session enforcement is online-only (offline = suspended)

---

## Technical Notes

### Heartbeat Mechanism
- Runs every 30 seconds on active device
- Updates `lastActiveAt` timestamp in Firestore
- If heartbeat stops (crash, close tab), device will eventually timeout
- Other devices can detect stale sessions by checking `lastActiveAt`

### Session ID Generation
```typescript
generateSessionId(): string {
  const deviceType = navigator.userAgent.toLowerCase().match(/mobile/) 
    ? 'mobile' 
    : 'desktop';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${deviceType}_${timestamp}_${random}`;
}
```

### Memory Management
- Listeners are properly cleaned up on unmount
- Heartbeat cleared on logout
- No memory leaks from orphaned intervals

### Offline Behavior
- Writes are blocked when offline (existing OfflineNotice handles this)
- Session enforcement is online-only
- When back online, session state re-syncs from Firestore

---

## Next Steps

1. **Add Read-Only Mode Banner** - Show when `sessionStatus === 'inactive'`
2. **Freeze Editors** - Make text inputs read-only when inactive
3. **Test Multi-Device** - Open StoryVerse on 2-3 devices simultaneously
4. **Deploy to Production** - Verify real-time listeners work in prod
5. **Monitor Logs** - Check console for session warnings

---

## Related Files

- `src/services/DeviceSessionManager.ts` - Core session management
- `src/firebase/AuthContext.tsx` - Session initialization on login
- `src/components/session/SessionConflictModal.tsx` - Conflict resolution UI
- `src/components/session/SessionConflictModal.module.css` - Modal styles
- `src/App.tsx` - Global modal display
- `src/engine/WritingSessionEngine.ts` - Save guards (7 methods protected)
- `firestore.rules` - Security rules for activeSession document

---

**Status:** Core implementation complete. Ready for testing and UI polish.
