import AppLoader from './AppLoader';
import styles from './OfflineNotice.module.css';

interface OfflineNoticeProps {
  isOnline: boolean;
}

export default function OfflineNotice({ isOnline }: OfflineNoticeProps) {
  return (
    <>
      {/* Full-screen blur overlay when offline */}
      <div 
        className={`${styles.offlineOverlay} ${!isOnline ? styles.active : ''}`}
        aria-hidden={isOnline}
      >
        <div className={styles.blurBackdrop} />
        
        <div className={styles.centerContent}>
          {/* Premium animated logo */}
          <AppLoader size={140} />
          
          {/* Message below logo */}
          <div className={styles.offlineMessage}>
            <h2 className={styles.title}>You're Offline</h2>
            <p className={styles.subtitle}>
              Reconnecting to protect your work...
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
