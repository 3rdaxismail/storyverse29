/**
 * TraitTogglePair - Binary trait selection (either/or)
 */
import styles from './TraitTogglePair.module.css';

interface TraitTogglePairProps {
  leftLabel: string;
  rightLabel: string;
  value: 'left' | 'right' | 'neutral';
  onChange: (value: 'left' | 'right' | 'neutral') => void;
}

export default function TraitTogglePair({
  leftLabel,
  rightLabel,
  value,
  onChange
}: TraitTogglePairProps) {
  const handleClick = (selected: 'left' | 'right') => {
    // If clicking the same value, set to neutral
    onChange(value === selected ? 'neutral' : selected);
  };

  return (
    <div className={styles.traitTogglePair}>
      <button
        type="button"
        className={`${styles.option} ${value === 'left' ? styles.selected : ''}`}
        onClick={() => handleClick('left')}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === 'right' ? styles.selected : ''}`}
        onClick={() => handleClick('right')}
      >
        {rightLabel}
      </button>
    </div>
  );
}
