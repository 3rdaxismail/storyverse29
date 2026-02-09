/**
 * PhotoCropEditor - Floating image crop and optimization editor
 * Storyverse themed, mobile-first, keyboard accessible
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PhotoCropEditor.module.css';

interface PhotoCropEditorProps {
  imageFile: File;
  onSave: (optimizedImageData: string) => void;
  onCancel: () => void;
}

export default function PhotoCropEditor({ imageFile, onSave, onCancel }: PhotoCropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Calculate minimum zoom to fit entire image in circular crop area
        const size = 400;
        const scale = Math.max(size / img.width, size / img.height);
        setMinZoom(scale);
        setZoom(scale);
        // Reset position when new image loads
        setPosition({ x: 0, y: 0 });
        console.log(`[PhotoCropEditor] Image loaded: ${img.width}×${img.height}, minZoom: ${scale.toFixed(3)}`);
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

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Calculate scaled dimensions
    const scaledWidth = image.width * zoom;
    const scaledHeight = image.height * zoom;

    // Center image with position offset
    const x = (size - scaledWidth) / 2 + position.x;
    const y = (size - scaledHeight) / 2 + position.y;

    // Draw image (CSS border-radius: 50% will make it circular)
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Draw circular border
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;
    
    ctx.strokeStyle = 'rgba(165, 183, 133, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
    ctx.stroke();
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

  // Optimize and export image
  const handleSave = useCallback(async () => {
    if (!canvasRef.current || !image) return;

    // Create a temporary canvas for the circular crop export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    const size = 400;
    exportCanvas.width = size;
    exportCanvas.height = size;

    // Calculate scaled dimensions
    const scaledWidth = image.width * zoom;
    const scaledHeight = image.height * zoom;

    // Center image with position offset
    const x = (size - scaledWidth) / 2 + position.x;
    const y = (size - scaledHeight) / 2 + position.y;

    // Create circular clipping path
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    exportCtx.beginPath();
    exportCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    exportCtx.clip();

    // Draw only the circular area
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

      console.log(`[PhotoCropEditor] Export attempt ${attempts + 1}: ${sizeInKB.toFixed(2)} KB at ${(quality * 100).toFixed(0)}% quality`);

      // Check if within limit (target <20KB)
      if (sizeInKB <= TARGET_SIZE_KB) {
        console.log(`[PhotoCropEditor] ✅ Final size: ${sizeInKB.toFixed(2)} KB (under ${TARGET_SIZE_KB}KB limit)`);
        break;
      }

      // Reduce quality and retry
      quality -= 0.06;
      attempts++;

      if (quality < 0.15) {
        // If we can't get under 20KB, use minimum quality
        console.warn(`[PhotoCropEditor] ⚠️ Could not compress below ${TARGET_SIZE_KB}KB. Final size: ${sizeInKB.toFixed(2)} KB at ${(quality * 100).toFixed(0)}% quality`);
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
        aria-label="Photo crop editor"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Crop & Optimize Photo</h2>
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
                −
              </button>
              <input
                type="range"
                min={minZoom}
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.zoomSlider}
                aria-label="Zoom level"
              />
              <button
                className={styles.zoomButton}
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </label>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
