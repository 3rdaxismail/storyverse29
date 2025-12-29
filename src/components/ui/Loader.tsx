import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import styles from './Loader.module.css';

interface LoaderProps {
  /**
   * Whether to display the loader overlay
   * @default false
   */
  isVisible?: boolean;
  
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional message to display below loader
   */
  message?: string;
}

/**
 * Loader Component
 * 
 * Renders an animated loader using Lottie.
 * By default, the loader is NOT visible—pass isVisible={true} to show it.
 * 
 * Usage:
 * ```
 * <Loader isVisible={isLoading} message="Loading your story..." />
 * ```
 */
export const Loader: React.FC<LoaderProps> = ({
  isVisible = false,
  size = 'md',
  message,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Fetch and initialize Lottie animation
    const loadAnimation = async () => {
      try {
        const response = await fetch('/loader.json');
        const animationData = await response.json();
        
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current!,
          renderer: 'svg',
          loop: true,
          autoplay: isVisible,
          animationData: animationData as Record<string, unknown>,
        });
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    loadAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [isVisible]);

  // Control animation playback
  useEffect(() => {
    if (!animationRef.current) return;

    if (isVisible) {
      animationRef.current.play();
    } else {
      animationRef.current.pause();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.overlay} ${styles[`size-${size}`]}`}>
      <div className={styles.container}>
        <div
          ref={containerRef}
          className={styles.animation}
        />
        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loader;
