import React from 'react';
import styles from './AppLoader.module.css';
import LogoMaskSVG from '../../assets/Logo mask.svg?raw';

interface AppLoaderProps {
  /**
   * Size of the loader in pixels
   * @default 120
   */
  size?: number;
  
  /**
   * Optional class name for custom styling
   */
  className?: string;
}

/**
 * Storyverse App Loader
 * 
 * A clean, minimal loading animation using the Storyverse logo with
 * an animated gradient fill. Uses CSS animations only (no JS libraries).
 * 
 * @example
 * ```tsx
 * <AppLoader />
 * <AppLoader size={200} />
 * ```
 */
export const AppLoader: React.FC<AppLoaderProps> = ({ 
  size = 120,
  className = '' 
}) => {
  return (
    <div 
      className={`${styles.loaderContainer} ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size * 1.32}px` // Maintain aspect ratio (22.2 / 29.4)
      }}
      role="status"
      aria-label="Loading"
    >
      {/* Animated gradient background */}
      <div className={styles.gradientBackground} />
      
      {/* Logo mask - clips the gradient to logo shape */}
      <svg 
        viewBox="0 0 22.2 29.4" 
        xmlns="http://www.w3.org/2000/svg"
        className={styles.logoMask}
        aria-hidden="true"
      >
        <path d="M10.5,24.7c1.3,0,2.5-0.2,3.6-0.5c-1,1.5-2,3.2-3,5.2c-0.8-1.8-1.7-3.4-2.7-4.8C9,24.7,9.7,24.7,10.5,24.7z M12.8,15.4
          c-0.9-0.5-1.9-1-3.3-1.5c-1.2-0.5-2.2-1-3.1-1.5c-0.8-0.5-1.5-1.1-2-1.7c-0.5-0.6-0.9-1.3-1.1-2S3,7.2,3,6.4C3,5,3.3,3.7,4.1,2.7
          c0.7-1,1.8-1.8,3-2.4C7.4,0.2,7.6,0.1,7.9,0H0v16.3c0.9,0.7,1.8,1.5,2.6,2.1c0.1-0.1,0.2-0.3,0.2-0.4c0.4-0.5,0.9-0.8,1.5-1
          c0.6-0.2,1.2-0.3,1.9-0.3c0,1.3,0.2,2.4,0.6,3.3c0.4,0.9,1,1.5,1.7,2c0.7,0.4,1.6,0.7,2.5,0.7c1.4,0,2.4-0.4,3.2-1.1
          s1.2-1.6,1.2-2.6c0-0.8-0.2-1.4-0.7-2C14.3,16.3,13.6,15.8,12.8,15.4z M15.8,0c1.1,0.3,1.9,0.8,2.4,1.4s0.8,1.3,0.8,2
          c0,0.8-0.4,1.5-1.1,2c-0.7,0.6-1.8,0.8-3.2,0.8c0-0.6-0.1-1.3-0.4-2.1c-0.2-0.7-0.6-1.4-1.2-1.9c-0.5-0.5-1.3-0.8-2.2-0.8
          c-0.6,0-1.2,0.1-1.8,0.4C8.7,2.1,8.3,2.5,8,3C7.7,3.4,7.5,4,7.5,4.7c0,0.6,0.2,1.2,0.5,1.8C8.3,7,8.8,7.6,9.7,8.1
          c0.8,0.5,2,1.1,3.6,1.7c1.6,0.6,2.9,1.3,3.9,2c1,0.7,1.7,1.5,2.1,2.3c0.4,0.8,0.7,1.8,0.7,3c0,0.3,0,0.6,0,0.9
          c0.7-0.6,1.5-1.2,2.3-1.8V0H15.8z" 
          fill="currentColor"
        />
      </svg>

      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

export default AppLoader;
