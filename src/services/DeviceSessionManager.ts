/**
 * DeviceSessionManager
 * Enforces single active device session per user to prevent data conflicts
 * 
 * CRITICAL RULE: Only ONE device can be active at a time per user
 * 
 * When a second device becomes active:
 * - Both devices show a modal asking where to continue
 * - User chooses which device to use
 * - Other device immediately becomes inactive and read-only
 */

import { doc, setDoc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface DeviceSession {
  sessionId: string;
  deviceType: 'desktop' | 'mobile';
  lastActiveAt: any;
  userAgent?: string;
}

export type SessionStatus = 'active' | 'inactive' | 'conflicted';

export interface SessionConflict {
  remoteSession: DeviceSession;
  localSessionId: string;
}

class DeviceSessionManager {
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private unsubscribe: Unsubscribe | null = null;
  private sessionStatusCallback: ((status: SessionStatus, conflict?: SessionConflict) => void) | null = null;
  private heartbeatInterval: number | null = null;

  /**
   * Generate a unique session ID for this device
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Detect device type
   */
  private getDeviceType(): 'desktop' | 'mobile' {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    return isMobile ? 'mobile' : 'desktop';
  }

  /**
   * Initialize session for a user
   * Called on login or app mount when user is authenticated
   */
  async initializeSession(userId: string, onStatusChange: (status: SessionStatus, conflict?: SessionConflict) => void): Promise<void> {
    console.log('[DeviceSession] Initializing session for user:', userId);
    
    this.userId = userId;
    this.currentSessionId = this.generateSessionId();
    this.sessionStatusCallback = onStatusChange;

    // Create the session in Firestore
    await this.activateThisDevice();

    // Listen to session changes
    this.startSessionListener();

    // Start heartbeat to keep session alive
    this.startHeartbeat();
  }

  /**
   * Activate THIS device as the active session
   * Overwrites any existing session
   */
  async activateThisDevice(): Promise<void> {
    if (!this.userId || !this.currentSessionId) {
      console.error('[DeviceSession] Cannot activate - no userId or sessionId');
      return;
    }

    console.log('[DeviceSession] Activating this device:', this.currentSessionId);

    const sessionRef = doc(db, 'users', this.userId, 'activeSession', 'current');
    
    const newSession: DeviceSession = {
      sessionId: this.currentSessionId,
      deviceType: this.getDeviceType(),
      lastActiveAt: serverTimestamp(),
      userAgent: navigator.userAgent
    };

    await setDoc(sessionRef, newSession);
    
    // Notify that we're active
    this.sessionStatusCallback?.('active');
  }

  /**
   * Listen to session changes in real-time
   * Detects when another device becomes active
   */
  private startSessionListener(): void {
    if (!this.userId) return;

    const sessionRef = doc(db, 'users', this.userId, 'activeSession', 'current');

    this.unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      if (!snapshot.exists()) {
        // No session document - we might be first, or it was deleted
        console.log('[DeviceSession] No active session found');
        return;
      }

      const remoteSession = snapshot.data() as DeviceSession;
      
      console.log('[DeviceSession] Session update received:', {
        remoteSessionId: remoteSession.sessionId,
        localSessionId: this.currentSessionId,
        match: remoteSession.sessionId === this.currentSessionId
      });

      // Check if the remote session matches our local session
      if (remoteSession.sessionId !== this.currentSessionId) {
        // CONFLICT! Another device took over
        console.warn('[DeviceSession] CONFLICT DETECTED - Another device is now active');
        
        this.sessionStatusCallback?.('conflicted', {
          remoteSession,
          localSessionId: this.currentSessionId!
        });
      } else {
        // We are the active session
        this.sessionStatusCallback?.('active');
      }
    }, (error) => {
      console.error('[DeviceSession] Session listener error:', error);
    });
  }

  /**
   * Send periodic heartbeat to update lastActiveAt
   * Helps detect stale sessions
   */
  private startHeartbeat(): void {
    // Update every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (!this.userId || !this.currentSessionId) return;

      try {
        const sessionRef = doc(db, 'users', this.userId, 'activeSession', 'current');
        const snapshot = await getDoc(sessionRef);
        
        if (snapshot.exists()) {
          const currentSession = snapshot.data() as DeviceSession;
          
          // Only update if we're still the active session
          if (currentSession.sessionId === this.currentSessionId) {
            await setDoc(sessionRef, {
              lastActiveAt: serverTimestamp()
            }, { merge: true });
          }
        }
      } catch (error) {
        console.error('[DeviceSession] Heartbeat failed:', error);
      }
    }, 30000); // 30 seconds
  }

  /**
   * Check if this device is currently active
   */
  async isActive(): Promise<boolean> {
    if (!this.userId || !this.currentSessionId) return false;

    try {
      const sessionRef = doc(db, 'users', this.userId, 'activeSession', 'current');
      const snapshot = await getDoc(sessionRef);
      
      if (!snapshot.exists()) return false;
      
      const session = snapshot.data() as DeviceSession;
      return session.sessionId === this.currentSessionId;
    } catch (error) {
      console.error('[DeviceSession] isActive check failed:', error);
      return false;
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Clean up session on logout or unmount
   */
  cleanup(): void {
    console.log('[DeviceSession] Cleaning up session');
    
    // Stop listening
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Clear state
    this.currentSessionId = null;
    this.userId = null;
    this.sessionStatusCallback = null;
  }

  /**
   * Deactivate this device (make it inactive/read-only)
   * Called when user chooses to use another device
   */
  deactivateThisDevice(): void {
    console.log('[DeviceSession] Deactivating this device');
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Notify that we're inactive
    this.sessionStatusCallback?.('inactive');
  }
}

// Singleton instance
export const deviceSessionManager = new DeviceSessionManager();
