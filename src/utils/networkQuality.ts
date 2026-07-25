/**
 * Network Quality Detection Utility
 * One-time decision per page load for background rendering
 * 
 * Detects:
 * 1. Connection type (4g/5g/wifi only)
 * 2. Quick latency check via HEAD request
 * 
 * Decision is made ONCE and never re-evaluated until page refresh
 */

// Cache the result to ensure it's only evaluated once per page load
let cachedResult: boolean | null = null;
let checkInProgress = false;

/**
 * Perform a lightweight latency check
 * Uses a small static asset to measure network quality
 * @returns Promise<boolean> - true if latency < 300ms, false otherwise
 */
async function checkLatency(): Promise<boolean> {
  try {
    const testUrl = '/ping.svg'; // Minimal 1x1 SVG image
    const start = performance.now();
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const latency = performance.now() - start;
    
    // Connection is stable if latency < 300ms
    return response.ok && latency < 300;
  } catch (error) {
    // If check fails, consider connection unstable
    console.debug('[NetworkQuality] Latency check failed:', error);
    return false;
  }
}

/**
 * Detect connection type from browser API
 * @returns 'stable' | 'unstable' | 'unknown'
 */
function detectConnectionType(): 'stable' | 'unstable' | 'unknown' {
  try {
    // Access the Network Information API
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) {
      // API not available - assume stable (modern browsers only)
      console.debug('[NetworkQuality] Connection API not available, assuming stable');
      return 'unknown';
    }

    const effectiveType = connection.effectiveType;
    const type = connection.type;

    // Allow only 4g, 5g, or wifi
    const isStableType =
      effectiveType === '4g' ||
      effectiveType === '5g' ||
      type === 'wifi' ||
      type === '4g' ||
      type === '5g';

    console.debug('[NetworkQuality] Connection detected:', {
      effectiveType,
      type,
      isStable: isStableType
    });

    return isStableType ? 'stable' : 'unstable';
  } catch (error) {
    console.debug('[NetworkQuality] Connection detection error:', error);
    return 'unknown';
  }
}

/**
 * Determine if connection is stable for background rendering
 * 
 * Decision is made ONCE per page load and cached
 * Subsequent calls return the cached result
 * 
 * @returns Promise<boolean> - true if stable, false if unstable
 */
export async function isConnectionStable(): Promise<boolean> {
  // Return cached result if already determined
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Prevent multiple simultaneous checks
  if (checkInProgress) {
    // Wait a bit and return cached result
    let attempts = 0;
    while (checkInProgress && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 10));
      attempts++;
    }
    return cachedResult ?? false;
  }

  checkInProgress = true;

  try {
    // Step 1: Check connection type
    const connectionType = detectConnectionType();

    if (connectionType === 'unstable') {
      // Connection type is explicitly slow
      cachedResult = false;
      return false;
    }

    if (connectionType === 'unknown') {
      // Connection API says it's likely stable or not available
      // Do a latency check to be sure
      const isLatencyStable = await checkLatency();
      cachedResult = isLatencyStable;
      return isLatencyStable;
    }

    // connectionType === 'stable'
    // Connection API says stable, still do a quick latency check
    const isLatencyStable = await checkLatency();
    cachedResult = isLatencyStable;
    return isLatencyStable;
  } catch (error) {
    console.error('[NetworkQuality] Unexpected error:', error);
    cachedResult = false;
    return false;
  } finally {
    checkInProgress = false;
  }
}

/**
 * Get the cached connection stability result
 * Returns null if check hasn't been performed yet
 */
export function getCachedConnectionStatus(): boolean | null {
  return cachedResult;
}

/**
 * Reset the cache (for testing only)
 * In production, this should never be called except on full page refresh
 */
export function resetConnectionCache(): void {
  cachedResult = null;
  checkInProgress = false;
}
