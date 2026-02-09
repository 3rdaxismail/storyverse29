/**
 * CoverImageCropper - 3:4 aspect ratio cover image crop and optimization
 * For story/poem project covers - 600×800px WebP output
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './CoverImageCropper.module.css';

interface CoverImageCropperProps {
  imageFile: File;
  onSave: (optimizedImageData: string) => void;
  onCancel: () => void;
}

export default function CoverImageCropper({ imageFile, onSave, onCancel }: CoverImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 3:4 aspect ratio dimensions for preview
  const PREVIEW_WIDTH = 300;
  const PREVIEW_HEIGHT = 400;
  
  // Final export dimensions
  const EXPORT_WIDTH = 600;
  const EXPORT_HEIGHT = 800;

  // Load image
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Calculate minimum zoom to fit entire image in 3:4 crop area
        const scale = Math.max(PREVIEW_WIDTH / img.width, PREVIEW_HEIGHT / img.height);
        setMinZoom(scale);
        setZoom(scale);
        // Reset position when new image loads
        setPosition({ x: 0, y: 0 });
        console.log(`[CoverImageCropper] Image loaded: ${img.width}×${img.height}, minZoom: ${scale.toFixed(3)}`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Draw canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = PREVIEW_WIDTH;
    canvas.height = PREVIEW_HEIGHT;

    // Clear canvas
    ctx.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    // Calculate scaled dimensions
    const scaledWidth = image.width * zoom;
    const scaledHeight = image.height * zoom;

    // Center image with position offset
    const x = (PREVIEW_WIDTH - scaledWidth) / 2 + position.x;
    const y = (PREVIEW_HEIGHT - scaledHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Draw border around crop area
    ctx.strokeStyle = 'rgba(165, 183, 133, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, PREVIEW_WIDTH - 2, PREVIEW_HEIGHT - 2);
  }, [image, zoom, position]);

  // Handle mouse/touch drag
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Optimize and export image at 600×800px
  const handleSave = useCallback(async () => {
    if (!image) return;

    // Create export canvas at final resolution
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    exportCanvas.width = EXPORT_WIDTH;
    exportCanvas.height = EXPORT_HEIGHT;

    // Calculate scale factor from preview to export
    const scaleFactor = EXPORT_WIDTH / PREVIEW_WIDTH;

    // Calculate scaled dimensions for export
    const scaledWidth = image.width * zoom * scaleFactor;
    const scaledHeight = image.height * zoom * scaleFactor;

    // Center image with position offset (scaled to export size)
    const x = (EXPORT_WIDTH - scaledWidth) / 2 + position.x * scaleFactor;
    const y = (EXPORT_HEIGHT - scaledHeight) / 2 + position.y * scaleFactor;

    // Draw the cropped area at export resolution
    exportCtx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    // Try to export as WebP with quality reduction if needed (target <20KB)
    let quality = 0.75;
    let imageData = '';
    let attempts = 0;
    const maxAttempts = 12;
    const TARGET_SIZE_KB = 20;

    while (attempts < maxAttempts) {
      imageData = exportCanvas.toDataURL('image/webp', quality);
      
      // Calculate file size (Base64 is ~1.37x actual size)
      const sizeInBytes = (imageData.length * 3) / 4;
      const sizeInKB = sizeInBytes / 1024;

      console.log(`[CoverImageCropper] Export attempt ${attempts + 1}: ${sizeInKB.toFixed(2)} KB at ${(quality * 100).toFixed(0)}% quality`);

      // Check if within limit (target <20KB)
      if (sizeInKB <= TARGET_SIZE_KB) {
        console.log(`[CoverImageCropper] ✅ Final size: ${sizeInKB.toFixed(2)} KB (under ${TARGET_SIZE_KB}KB limit)`);
        break;
      }

      // Reduce quality and retry
      quality -= 0.06;
      attempts++;

      if (quality < 0.15) {
        // If we can't get under 20KB, use minimum quality
        console.warn(`[CoverImageCropper] ⚠️ Could not compress below ${TARGET_SIZE_KB}KB. Final size: ${sizeInKB.toFixed(2)} KB at ${(quality * 100).toFixed(0)}% quality`);
        break;
      }
    }

    onSave(imageData);
  }, [onSave, image, zoom, position]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, handleSave]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div 
        className={styles.editor} 
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        role="dialog"
        aria-label="Cover image crop editor"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Crop Cover Image</h2>
          <p className={styles.subtitle}>3:4 aspect ratio • 600×800px</p>
        </div>

        <div className={styles.cropArea}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
          <div className={styles.hint}>Drag to reposition</div>
        </div>

        <div className={styles.controls}>
          <label className={styles.zoomLabel}>
            <span>Zoom</span>
            <div className={styles.zoomControl}>
              <button
                className={styles.zoomButton}
                onClick={() => setZoom(Math.max(minZoom, zoom - 0.1))}
                aria-label="Zoom out"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <input
                type="range"
                min={minZoom}
                max={minZoom * 3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.zoomSlider}
                aria-label="Zoom slider"
              />
              <button
                className={styles.zoomButton}
                onClick={() => setZoom(Math.min(minZoom * 3, zoom + 0.1))}
                aria-label="Zoom in"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Cover
          </button>
        </div>
      </div>
    </div>
  );
}
