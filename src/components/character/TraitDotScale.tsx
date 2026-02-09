/**
 * TraitDotScale - Dot-based trait rating component
 * Used for physical presence, emotional landscape, values, etc.
 */
import { useState } from 'react';
import styles from './TraitDotScale.module.css';

interface TraitDotScaleProps {
  label: string;
  value: number; // 0-5
  onChange: (value: number) => void;
  maxDots?: number;
}

export default function TraitDotScale({
  label,
  value,
  onChange,
  maxDots = 5
}: TraitDotScaleProps) {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  const handleDotClick = (dotIndex: number) => {
    // If clicking the same value, set to 0 (clear)
    onChange(value === dotIndex + 1 ? 0 : dotIndex + 1);
  };

  return (
    <div className={styles.traitDotScale}>
      <label className={styles.label}>{label}</label>
      <div className={styles.dots}>
        {Array.from({ length: maxDots }).map((_, index) => {
          const isFilled = index < value;
          const isHovered = hoveredDot !== null && index <= hoveredDot;
          
          return (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${isFilled ? styles.filled : ''} ${isHovered ? styles.hovered : ''}`}
              onClick={() => handleDotClick(index)}
              onMouseEnter={() => setHoveredDot(index)}
              onMouseLeave={() => setHoveredDot(null)}
              aria-label={`${label} rating ${index + 1} of ${maxDots}`}
            />
          );
        })}
      </div>
    </div>
  );
}
