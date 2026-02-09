import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline network status
 * Returns true when online, false when offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default to online for SSR
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Connection restored - editing enabled');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('🔴 Connection lost - editing disabled to protect your work');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
