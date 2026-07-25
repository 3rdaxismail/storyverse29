import React from 'react';
import type { TimelineNode } from '../../firebase/services/timelineService';
import { getTensionColor } from '../../utils/tensionColorUtils';
import styles from './TimelineNodeComponent.module.css';

interface Chapter {
  id: string;
  title: string;
  tension?: number;
}

interface TimelineNodeComponentProps {
  node: TimelineNode;
  chapter?: Chapter;
  pixelCoords: { x: number; y: number };
  isSelected: boolean;
  isOwner: boolean;
  onSelect: () => void;
  onTensionClick?: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

const TimelineNodeComponent: React.FC<TimelineNodeComponentProps> = ({
  node,
  chapter,
  pixelCoords,
  isSelected,
  isOwner,
  onSelect,
  onTensionClick,
  onMouseDown,
}) => {
  const title = chapter?.title || `Chapter ${node.chapterId.slice(0, 8)}`;
  const tension = chapter?.tension ?? 0;
  const tensionColor = getTensionColor(tension);
  
  // Extract first word of chapter title for display on dot
  const firstWord = title.split(/\s+/)[0].substring(0, 6); // First word, max 6 chars

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For owners: click opens tension editor
    // For guests: click selects the node
    if (isOwner && onTensionClick) {
      console.log('Opening tension popup for chapter:', node.chapterId);
      onTensionClick();
    } else if (!isOwner) {
      onSelect();
    }
  };

  return (
    <div
      className={`${styles.node} ${isSelected ? styles.selected : ''}`}
      style={{
        position: 'absolute',
        left: `${pixelCoords.x}px`,
        top: `${pixelCoords.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 10 : isOwner ? 5 : 1,
        cursor: isOwner ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      title={isOwner ? `${title} - Click to edit tension` : title}
    >
      {/* Outer glow with tension color */}
      <div className={styles.glow} style={{ borderColor: tensionColor, boxShadow: `0 0 12px ${tensionColor}` }} />

      {/* Inner circle with tension color */}
      <div className={styles.circle} style={{ backgroundColor: tensionColor, borderColor: tensionColor }} />

      {/* Chapter first word */}
      <div className={styles.icon}>
        <span className={styles.text}>{firstWord}</span>
      </div>

      {/* Tooltip on hover */}
      <div className={styles.tooltip}>{title}</div>
    </div>
  );
};

export default TimelineNodeComponent;
