/**
 * TraitSpectrum - Dual-axis slider for psychological traits
 * Left label ⟷ Right label
 */
import { useState } from 'react';
import styles from './TraitSpectrum.module.css';

interface TraitSpectrumProps {
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-10, where 5 is neutral
  onChange: (value: number) => void;
}

export default function TraitSpectrum({
  leftLabel,
  rightLabel,
  value,
  onChange
}: TraitSpectrumProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(percentage * 10);
    onChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  return (
    <div className={styles.traitSpectrum}>
      <div className={styles.labels}>
        <span className={styles.leftLabel}>{leftLabel}</span>
        <span className={styles.rightLabel}>{rightLabel}</span>
      </div>
      <div 
        className={styles.trackWrapper}
        onClick={handleTrackClick}
      >
        <div className={styles.track}>
          <div className={styles.center} />
          <input
            type="range"
            min="0"
            max="10"
            value={value}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
            aria-label={`${leftLabel} to ${rightLabel}`}
          />
        </div>
      </div>
    </div>
  );
}
