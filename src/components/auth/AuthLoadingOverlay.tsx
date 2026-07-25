import React from 'react';
import { useAuth } from '../../firebase/AuthContext';
import AppLoader from '../common/AppLoader';
import styles from './AuthLoadingOverlay.module.css';

/**
 * Global auth loading overlay that appears during Firebase authentication
 * Shows Storyverse gradient logo with animated dots
 * Prevents blank screen during sign in/sign up process
 */
export default function AuthLoadingOverlay() {
  const { isAuthLoading } = useAuth();

  if (!isAuthLoading) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Animated Storyverse Logo using existing AppLoader */}
        <AppLoader size={140} />

        {/* Loading Text with Animated Dots */}
        <div className={styles.textWrapper}>
          <p className={styles.loadingText}>
            Loading your stories
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </p>
        </div>

        {/* Subtle progress indicator */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
}
