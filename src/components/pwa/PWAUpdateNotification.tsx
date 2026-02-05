import { useEffect, useState } from 'react';
import styles from './PWAUpdateNotification.module.css';

export default function PWAUpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker update checker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Check for updates every 60 seconds
        const interval = setInterval(() => {
          reg.update();
        }, 60000);

        // Listen for new service worker waiting
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                setShowNotification(true);
              }
            });
          }
        });

        return () => {
          clearInterval(interval);
        };
      });

      // Listen for controller change (update activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to use the new service worker
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className={styles.updateNotification}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L12 12M12 2L8 6M12 2L16 6" stroke="#A7BA88" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 12L19 20C19 20.5523 18.5523 21 18 21L6 21C5.44772 21 5 20.5523 5 20L5 12" stroke="#A7BA88" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <div className={styles.text}>
          <h3 className={styles.title}>Update Available</h3>
          <p className={styles.description}>A new version of Storyverse is ready</p>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.updateButton} onClick={handleUpdate}>
            Reload
          </button>
          <button className={styles.dismissButton} onClick={handleDismiss} aria-label="Dismiss">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
