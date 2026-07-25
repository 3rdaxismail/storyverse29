/**
 * useSyncedRotation Hook
 * 
 * Provides synchronized rotation timing for multiple dashboard components
 * Ensures HeroTitles and DashboardBackground rotate in perfect sync
 * 
 * Usage:
 * const { rotation, fadeIn } = useSyncedRotation();
 * 
 * rotation: Current rotation index (0, 1, 2, ...)
 * fadeIn: Boolean for fade state (true = fade in, false = fade out)
 */

import { useState, useEffect } from 'react';

// Shared constants across all dashboard components
const ROTATION_INTERVAL = 5000; // 5 seconds
const FADE_DURATION = 300; // 300ms fade transition

// Global rotation state to sync across all components
let globalRotationIndex = 0;
let globalFadeState = true;
let activeComponentCount = 0;
const listeners = new Set<(state: { rotation: number; fadeIn: boolean }) => void>();

/**
 * Broadcast rotation update to all listeners
 */
function broadcastRotationUpdate() {
  listeners.forEach(listener => {
    listener({ rotation: globalRotationIndex, fadeIn: globalFadeState });
  });
}

/**
 * Initialize the shared rotation timer (only once per active component)
 */
let rotationInterval: number | null = null;
let fadeTimeouts = new Set<number>();

function initializeSharedRotation() {
  if (rotationInterval !== null) {
    // Timer already running
    return;
  }

  console.log('[useSyncedRotation] Initializing shared rotation timer');

  rotationInterval = window.setInterval(() => {
    // Fade out
    globalFadeState = false;
    broadcastRotationUpdate();

    // Wait for fade duration, then switch
    const timeoutId = window.setTimeout(() => {
      globalRotationIndex = (globalRotationIndex + 1) % 1000; // Max 1000 items
      globalFadeState = true;
      broadcastRotationUpdate();
      fadeTimeouts.delete(timeoutId);
    }, FADE_DURATION);

    fadeTimeouts.add(timeoutId);
  }, ROTATION_INTERVAL);
}

function cleanupSharedRotation() {
  if (rotationInterval !== null) {
    console.log('[useSyncedRotation] Cleaning up shared rotation timer');
    clearInterval(rotationInterval);
    rotationInterval = null;
    
    // Clear any pending fade timeouts
    fadeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    fadeTimeouts.clear();
  }
}

/**
 * Hook to use synced rotation across dashboard components
 */
export function useSyncedRotation() {
  const [rotation, setRotation] = useState(globalRotationIndex);
  const [fadeIn, setFadeIn] = useState(globalFadeState);

  useEffect(() => {
    // Increment active component count
    activeComponentCount++;
    console.log(`[useSyncedRotation] Component mounted, active count: ${activeComponentCount}`);

    // Initialize shared timer only when first component mounts
    if (activeComponentCount === 1) {
      initializeSharedRotation();
    }

    // Subscribe to rotation updates
    const listener = (state: { rotation: number; fadeIn: boolean }) => {
      setRotation(state.rotation);
      setFadeIn(state.fadeIn);
    };

    listeners.add(listener);

    // Immediately sync with current global state
    setRotation(globalRotationIndex);
    setFadeIn(globalFadeState);

    return () => {
      // Decrement active component count
      activeComponentCount--;
      console.log(`[useSyncedRotation] Component unmounted, active count: ${activeComponentCount}`);

      listeners.delete(listener);

      // Clean up shared timer when last component unmounts
      if (activeComponentCount === 0) {
        cleanupSharedRotation();
      }
    };
  }, []);

  return { rotation, fadeIn };
}

/**
 * Get the total items count to modulo rotation against
 * Components should register their item counts for proper cycling
 */
let totalItemsPerComponent: Map<string, number> = new Map();

export function registerComponentItemCount(componentId: string, count: number) {
  totalItemsPerComponent.set(componentId, count);
}

export function getComponentRotationIndex(componentId: string): number {
  const totalItems = totalItemsPerComponent.get(componentId) || 1;
  return globalRotationIndex % totalItems;
}
