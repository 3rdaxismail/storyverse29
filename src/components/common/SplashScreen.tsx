/**
 * SplashScreen - Premium loading screen with blurred background
 * Shows animated gradient logo on blurred backdrop
 */
import React from 'react';
import AppLoader from './AppLoader';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ message = '' }) => {
  return (
    <div className={styles.splashContainer}>
      {/* Blurred background */}
      <div className={styles.blurredBackground} />
      
      {/* Animated gradient overlay */}
      <div className={styles.gradientOverlay} />
      
      {/* Logo loader */}
      <div className={styles.loaderWrapper}>
        <AppLoader size={180} />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default SplashScreen;
