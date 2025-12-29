import React from 'react';
import styles from './PublicHeader.module.css';

interface PublicHeaderProps {
  /**
   * Optional custom className
   */
  className?: string;
}

/**
 * PublicHeader Component
 * 
 * Header for public-facing pages.
 * Displays Storyverse logo with tagline "Your words matter"
 * 
 * Usage:
 * ```
 * <PublicHeader />
 * ```
 */
export const PublicHeader: React.FC<PublicHeaderProps> = ({ className = '' }) => {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        {/* Logo & Branding */}
        <div className={styles.branding}>
          {/* Logo placeholder - would be replaced with actual SVG/image */}
          <div className={styles.logoContainer}>
            <div className={styles.logo} title="Storyverse Logo">
              S
            </div>
          </div>
          
          {/* Text Content */}
          <div className={styles.textContent}>
            <h1 className={styles.title}>Storyverse</h1>
            <p className={styles.tagline}>Your words matter</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
