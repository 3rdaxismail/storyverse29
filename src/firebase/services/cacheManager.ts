/**
 * Cache Manager for Dashboard Data
 * 
 * Ensures writing activity data is always fresh from Firestore.
 * PWA service worker can cache stale data, so we use these utilities
 * to bust cache and force network-first strategy for critical data.
 */

/**
 * Clear all cached writing activity data from browser.
 * Call this after user writes to ensure dashboard shows latest data.
 */
export function clearWritingActivityCache(): void {
  try {
    // Clear IndexedDB (used by Firebase)
    if (window.indexedDB) {
      const request = window.indexedDB.databases 
        ? window.indexedDB.databases() 
        : null;
      
      if (request && typeof request.then === 'function') {
        request.then((databases: any[]) => {
          databases.forEach((db: any) => {
            if (db.name && db.name.includes('firebase')) {
              window.indexedDB.deleteDatabase(db.name);
              console.log('[CACHE] Cleared IndexedDB:', db.name);
            }
          });
        });
      }
    }

    // Clear localStorage entries related to activity
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('activity') || key.includes('writing')) {
        localStorage.removeItem(key);
        console.log('[CACHE] Cleared localStorage:', key);
      }
    });

    console.log('[CACHE] 🧹 Writing activity cache cleared');
  } catch (error) {
    console.warn('[CACHE] Could not fully clear cache:', error);
  }
}

/**
 * Add cache-busting query parameter to ensure fresh Firestore fetches.
 * Use this for critical dashboard API calls.
 */
export function getBustingQueryString(): string {
  return `?cacheBust=${Date.now()}`;
}

/**
 * Configure service worker to use network-first strategy for writing activity.
 * This is handled at service worker level, but this function documents the approach.
 */
export function ensureNetworkFirstStrategy(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Send message to service worker to update strategy
      registration.active?.postMessage({
        type: 'SET_NETWORK_FIRST_PATHS',
        paths: ['/writingActivity', '/activity'],
      });
      console.log('[CACHE] Network-first strategy enabled for writing activity');
    });
  }
}
