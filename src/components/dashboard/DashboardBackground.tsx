/**
 * DashboardBackground - Cinematic crossfading background component
 * 
 * Rules:
 * • Lazy load images
 * • Preload only next image
 * • Use WebP where possible
 * • Do NOT block first paint
 * • Crossfade synced with HeroTitles rotation (every 5 seconds)
 * • Use opacity crossfade
 * • Do not retry if unstable
 * • Do not listen to network change events
 */

import { useEffect, useRef, useState } from 'react';
import { fetchDashboardImages, type BackgroundImageData } from '../../services/sheetImagesService';
import { useSyncedRotation, registerComponentItemCount, getComponentRotationIndex } from '../../hooks/useSyncedRotation';
import styles from './DashboardBackground.module.css';

export default function DashboardBackground() {
  const [images, setImages] = useState<BackgroundImageData[]>([]);
  const [validImages, setValidImages] = useState<Set<number>>(new Set());
  const [showCrossfade, setShowCrossfade] = useState(false);
  const { rotation, fadeIn } = useSyncedRotation();

  const containerRef = useRef<HTMLDivElement>(null);
  const currentImgRef = useRef<HTMLImageElement>(null);
  const nextImgRef = useRef<HTMLImageElement>(null);
  const preloadRef = useRef<Set<number>>(new Set());
  const idleCallbackRef = useRef<number | null>(null);

  // Register image count with shared rotation system
  useEffect(() => {
    if (images.length > 0) {
      registerComponentItemCount('dashboard-background', images.length);
    }
  }, [images.length]);

  /**
   * Preload image in background (non-blocking)
   */
  function preloadImage(index: number, img: BackgroundImageData) {
    if (preloadRef.current.has(index)) return; // Already preloaded
    preloadRef.current.add(index);

    const useWebP = !!(img.webp && supportsWebP());
    const src = useWebP ? img.webp : img.url;

    if (!src) {
      console.warn(`[DashboardBackground] No valid src for image ${index}`);
      return; // Safety check
    }

    console.log(`[DashboardBackground] Preloading image ${index}: ${src.substring(0, 80)}...`);

    const tempImg = new Image();
    tempImg.onload = () => {
      console.log(`[DashboardBackground] ✓ Image ${index} loaded successfully`);
      setValidImages(prev => new Set([...prev, index]));
    };
    tempImg.onerror = (e) => {
      console.error(`[DashboardBackground] ✗ Failed to load image ${index}:`, src, e);
      // Don't add to validImages - skip this image
      preloadRef.current.delete(index);
    };
    // Critical for Google Drive, Unsplash, and other CORS-protected sources
    tempImg.crossOrigin = 'anonymous';
    tempImg.referrerPolicy = 'no-referrer';
    tempImg.src = src;
  }

  /**
   * Check WebP support
   */
  function supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    try {
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
    } catch {
      return false;
    }
  }

  /**
   * Schedule next image crossfade
   */
  function applyCurrentImage() {
    if (images.length === 0) return;

    const currentIdx = getComponentRotationIndex('dashboard-background');
    const nextIdx = (currentIdx + 1) % images.length;

    // Preload the next image in background
    if (images.length > 1) {
      preloadImage(nextIdx, images[nextIdx]);
    }

    // Trigger proper crossfade: current fades out, next fades in simultaneously
    // CSS transition (1s) handles the smooth animation automatically
    if (currentImgRef.current && nextImgRef.current) {
      currentImgRef.current.style.opacity = '0'; // Fade out current
      nextImgRef.current.style.opacity = '1';    // Fade in next
    }
  }

  /**
   * Initialize component - fetch images and start showing them
   */
  useEffect(() => {
    let isMounted = true;
    let safetyTimeoutId: number | null = null;

  // Set a 8-second safety timeout to ensure component always renders
  // This is longer than 6 seconds plus network latency buffer
  // Prevents blank screen if any async operation hangs
  safetyTimeoutId = window.setTimeout(() => {
    if (isMounted && !showCrossfade) {
      console.warn('[DashboardBackground] Safety timeout triggered (8s) - forcing render without images');
      setShowCrossfade(true);
    }
  }, 8000);

  // Fetch images from Google Sheet
  (async () => {
    try {
      console.log('[DashboardBackground] Initializing - fetching images...');
      const fetchedImages = await fetchDashboardImages();
      
      if (!isMounted) {
        console.log('[DashboardBackground] Component unmounted during fetch, aborting');
        return;
      }

      console.log('[DashboardBackground] Received', fetchedImages.length, 'images');

      if (fetchedImages.length === 0) {
        console.warn('[DashboardBackground] No images found in Google Sheet, using fallback background');
        // Still show the background container, just without images
        setShowCrossfade(true);
        if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
        return;
      }

      setImages(fetchedImages);
      console.log('[DashboardBackground] Images received, preloading first two...');

      // Preload first two images
      preloadImage(0, fetchedImages[0]);
      if (fetchedImages.length > 1) {
        preloadImage(1, fetchedImages[1]);
      }

      // Start crossfade immediately (no delay)
      if (isMounted) {
        console.log('[DashboardBackground] Starting crossfade animation');
        setShowCrossfade(true);
        if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
      }
    } catch (error) {
      console.error('[DashboardBackground] Error:', error);
      // Always show background container even if fetch fails
      if (isMounted) {
        console.warn('[DashboardBackground] Error caught, showing fallback background');
        setShowCrossfade(true);
        if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
      }
    }
  })();

  return () => {
    isMounted = false;
    if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
    if (idleCallbackRef.current && 'cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(idleCallbackRef.current);
    }
  };
}, []);

  /**
   * Sync image crossfade with rotation from HeroTitles
   * Triggers crossfade animation every time rotation index changes
   */
  useEffect(() => {
    if (images.length === 0 || !showCrossfade) return;
    applyCurrentImage();
  }, [rotation, images.length, showCrossfade]);

  // Always render the background container for consistent layout
  // Even if images are still loading, the container provides the background space
  // This prevents blank screens when navigating back to dashboard
  
  if (!showCrossfade) {
    // Still render container while loading
    return (
      <div 
        className={styles.container}
        aria-hidden="true"
      >
        {/* Overlay only - images loading */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      </div>
    );
  }

  const currentIndex = getComponentRotationIndex('dashboard-background');
  const nextIndex = (currentIndex + 1) % images.length;
  
  // If no images, still render container but without images
  if (images.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={styles.container}
        aria-hidden="true"
      >
        {/* Overlay only - no images */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      </div>
    );
  }
  
  // Skip to next valid image if current one failed
  let safeCurrentIndex = currentIndex;
  let attempts = 0;
  while (!validImages.has(safeCurrentIndex) && attempts < images.length) {
    safeCurrentIndex = (safeCurrentIndex + 1) % images.length;
    attempts++;
  }
  
  // If no valid images found, still render container without images
  if (!validImages.has(safeCurrentIndex)) {
    console.warn('[DashboardBackground] No valid images to display');
    return (
      <div 
        ref={containerRef}
        className={styles.container}
        aria-hidden="true"
      >
        {/* Overlay only - no valid images */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      </div>
    );
  }
  
  const safeNextIndex = (safeCurrentIndex + 1) % images.length;
  const currentImg = images[safeCurrentIndex];
  const nextImg = images[safeNextIndex];
  const useWebP = !!(currentImg.webp && supportsWebP());
  const nextUseWebP = !!(nextImg.webp && supportsWebP());
  
  const currentSrc = useWebP ? currentImg.webp : currentImg.url;
  const nextSrc = nextUseWebP ? nextImg.webp : nextImg.url;

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${showCrossfade ? styles.visible : ''}`}
      aria-hidden="true"
    >
      {/* Semi-transparent overlay for better text contrast */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      {/* Current image */}
      {currentSrc && (
        <img
          ref={currentImgRef}
          src={currentSrc}
          alt=""
          className={styles.image}
          loading="lazy"
          decoding="async"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onLoad={() => {
            console.log('[DashboardBackground] Current image rendered');
          }}
          onError={() => {
            console.warn('[DashboardBackground] Current image failed to render');
            if (currentImgRef.current) {
              currentImgRef.current.style.opacity = '0';
            }
          }}
        />
      )}

      {/* Next image (preloaded) */}
      {nextSrc && (
        <img
          ref={nextImgRef}
          src={nextSrc}
          alt=""
          className={`${styles.image} ${styles.next}`}
          loading="lazy"
          decoding="async"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => {
            console.warn('[DashboardBackground] Next image failed to render');
          }}
        />
      )}
    </div>
  );
}
