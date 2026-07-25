import React, { useEffect, useRef, useState } from 'react';
import styles from './TensionPopup.module.css';

interface TensionPopupProps {
  chapterId: string;
  chapterTitle: string;
  tension: number;
  position: { x: number; y: number };
  onTensionChange: (chapterId: string, tension: number) => void;
  onClose: () => void;
  isOwner: boolean;
}

const TensionPopup: React.FC<TensionPopupProps> = ({
  chapterId,
  chapterTitle,
  tension,
  position,
  onTensionChange,
  onClose,
  isOwner,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [localTension, setLocalTension] = useState(tension);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleTensionChange = (newTension: number) => {
    const clampedTension = Math.max(0, Math.min(100, newTension));
    setLocalTension(clampedTension);
    console.log('Updating tension:', chapterId, clampedTension);
    onTensionChange(chapterId, clampedTension);
  };

  const getTensionColor = () => {
    if (localTension < 25) return '#888888'; // grey
    if (localTension < 50) return '#4fc3f7'; // light blue
    if (localTension < 75) return '#ffeb3b'; // yellow
    if (localTension < 90) return '#ff9800'; // orange
    return '#f44336'; // red
  };

  const getTensionLabel = () => {
    if (localTension < 25) return '😐 Calm';
    if (localTension < 50) return '🤔 Building';
    if (localTension < 75) return '😟 Tense';
    if (localTension < 90) return '😱 Intense';
    return '🔥 Peak';
  };

  // Offset popup so it doesn't overlap the node, with boundary checking
  let offsetX = position.x + 40;
  let offsetY = position.y - 200;

  // Ensure popup stays within viewport
  const popupWidth = 320;
  const popupHeight = 250;
  
  if (offsetX + popupWidth > window.innerWidth) {
    offsetX = position.x - popupWidth - 40;
  }
  
  if (offsetY < 0) {
    offsetY = position.y + 50;
  }

  return (
    <div
      ref={popupRef}
      className={styles.popup}
      style={{
        left: `${offsetX}px`,
        top: `${offsetY}px`,
      }}
    >
      <div className={styles.header}>
        <h4 className={styles.title}>{chapterTitle}</h4>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      {isOwner ? (
        <div className={styles.content}>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="100"
              value={localTension}
              onChange={(e) => handleTensionChange(parseInt(e.target.value))}
              className={styles.slider}
              style={{
                background: `linear-gradient(to right, #888888 0%, #4fc3f7 25%, #ffeb3b 50%, #ff9800 75%, #f44336 100%)`,
              }}
            />
          </div>

          <div className={styles.display}>
            <span
              className={styles.value}
              style={{ color: getTensionColor() }}
            >
              {localTension}%
            </span>
            <span className={styles.label}>{getTensionLabel()}</span>
          </div>

          <div className={styles.bars}>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={styles.bar}
                style={{
                  backgroundColor:
                    i < Math.ceil(localTension / 10)
                      ? getTensionColor()
                      : 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.readOnly}>
          <p>🔒 Read-Only</p>
          <span className={styles.value} style={{ color: getTensionColor() }}>
            {localTension}%
          </span>
        </div>
      )}
    </div>
  );
};

export default TensionPopup;
