/**
 * SessionConflictModal
 * Shown when a second device becomes active
 * Blocks interaction and forces user to choose which device to use
 */
import { useEffect, useState } from 'react';
import styles from './SessionConflictModal.module.css';
import { deviceSessionManager } from '../../services/DeviceSessionManager';
import type { SessionConflict } from '../../services/DeviceSessionManager';

interface SessionConflictModalProps {
  conflict: SessionConflict;
  onResolve: () => void;
}

export default function SessionConflictModal({ conflict, onResolve }: SessionConflictModalProps) {
  const [isActivating, setIsActivating] = useState(false);

  const handleUseHere = async () => {
    try {
      setIsActivating(true);
      
      // Activate THIS device (will deactivate the other)
      await deviceSessionManager.activateThisDevice();
      
      // Notify parent that conflict is resolved
      onResolve();
      
    } catch (error) {
      console.error('[SessionConflict] Error activating device:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const getDeviceIcon = (deviceType: 'desktop' | 'mobile') => {
    if (deviceType === 'mobile') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      );
    }
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </div>

        <h2 className={styles.title}>Active on Another Device</h2>
        
        <p className={styles.message}>
          Your account can be active on only one device at a time.
          <br />
          Where do you want to use Storyverse?
        </p>

        <div className={styles.deviceInfo}>
          <div className={styles.deviceCard}>
            {getDeviceIcon(conflict.remoteSession.deviceType)}
            <span className={styles.deviceLabel}>
              Other Device
              <br />
              <small>({conflict.remoteSession.deviceType})</small>
            </span>
          </div>
          
          <div className={styles.vs}>VS</div>
          
          <div className={`${styles.deviceCard} ${styles.current}`}>
            {getDeviceIcon(deviceSessionManager.getCurrentSessionId() ? 
              (navigator.userAgent.toLowerCase().match(/mobile/) ? 'mobile' : 'desktop') : 'desktop'
            )}
            <span className={styles.deviceLabel}>
              This Device
              <br />
              <small>(current)</small>
            </span>
          </div>
        </div>

        <button
          className={styles.useHereButton}
          onClick={handleUseHere}
          disabled={isActivating}
        >
          {isActivating ? 'Switching...' : 'Use It Here'}
        </button>

        <p className={styles.footer}>
          The other device will become read-only and stop saving.
        </p>
      </div>
    </div>
  );
}
