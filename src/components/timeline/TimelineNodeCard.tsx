import React, { useState, useRef } from 'react';
import type { TimelineNode, StoryTimeline } from '../../firebase/services/timelineService';
import { getTensionColor, getTensionDescription } from '../../utils/tensionColorUtils';
import styles from './TimelineNodeCard.module.css';

interface Chapter {
  id: string;
  title: string;
  content?: string;
  order?: number;
  actId?: string;
  tension?: number;
  createdAt?: any;
  chapterTitle?: string;
  chapterId?: string;
}

interface Story {
  id: string;
  title: string;
  chapters?: any[];
}

interface TimelineNodeCardProps {
  nodeId: string;
  story: Story;
  timeline: StoryTimeline;
  chapters: Chapter[];
  isOwner: boolean;
  onClose: () => void;
  onTensionChange?: (chapterId: string, tension: number) => void;
}

const TimelineNodeCard: React.FC<TimelineNodeCardProps> = ({
  nodeId,
  story,
  timeline,
  chapters,
  isOwner,
  onClose,
  onTensionChange,
}) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const node = timeline.nodes.find((n) => n.chapterId === nodeId);
  const chapter = chapters.find((c) => c.id === nodeId);

  if (!node || !chapter) {
    return null;
  }

  // Initialize tension from chapter data (0-100) or fallback to node.y (0-1 normalized to 0-100)
  const initialTension = Math.round(chapter?.tension ?? (node?.y ?? 0) * 100);
  const [tension, setTension] = useState(initialTension);
  const timePosition = Math.round(node.x * 100);

  // Handle tension slider change with debouncing
  const handleTensionChange = (newValue: number) => {
    const clampedTension = Math.max(0, Math.min(100, newValue));
    setTension(clampedTension);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onTensionChange) {
        onTensionChange(nodeId, clampedTension);
      }
    }, 300);
  };

  // Get preview text (first 300 chars of content)
  const preview = chapter.content
    ? chapter.content.substring(0, 300) + (chapter.content.length > 300 ? '...' : '')
    : 'No content yet';

  // Get tension indicator
  const getTensionBars = () => {
    const bars = [];
    const color = getTensionColor(tension);

    for (let i = 0; i < 5; i++) {
      bars.push(
        <div
          key={i}
          className={`${styles.bar} ${i < Math.ceil(tension / 20) ? styles.filled : ''}`}
          style={{
            backgroundColor:
              i < Math.ceil(tension / 20) ? color : 'rgba(255,255,255,0.1)',
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className={styles.card}>
      {/* Close button */}
      <button className={styles.closeButton} onClick={onClose} title="Close">
        ✕
      </button>

      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.chapterTitle}>{chapter.title}</h2>
        <p className={styles.chapterMeta}>
          Chapter {chapter && chapters ? chapters.indexOf(chapter) + 1 : '?'}
        </p>
      </div>

      {/* Tension Indicator - MOVED TO TOP FOR VISIBILITY */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>⚡ Tension Level</h3>
        <div className={styles.tensionBars}>{getTensionBars()}</div>
        <p className={styles.tensionPercentage}>{tension}%</p>

        {isOwner && (
          <div className={styles.tensionControl}>
            <label className={styles.sliderLabel}>Adjust Tension (0-100%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={tension}
              onChange={(e) => handleTensionChange(parseInt(e.target.value))}
              className={styles.tensionSlider}
              title="Drag to adjust tension"
            />
            <p className={styles.tensionHint}>🔥 Drag slider to adjust emotional intensity</p>
          </div>
        )}
      </div>

      {/* Emotional Parameters */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{getTensionDescription(tension).label}</h3>
        <p className={styles.emotionalDescription}>{getTensionDescription(tension).description}</p>
        <div className={styles.emotionalTags}>
          {getTensionDescription(tension).emotions.map((emotion, idx) => (
            <span
              key={idx}
              className={styles.emotionalTag}
              style={{
                backgroundColor: getTensionColor(tension),
                color: tension > 50 ? '#000' : '#fff',
              }}
            >
              {emotion}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline Position Indicator */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Position</h3>
        <div className={styles.positionBar}>
          <div
            className={styles.positionMarker}
            style={{ left: `${node.x * 100}%` }}
          >
            <span className={styles.label}>{timePosition}%</span>
          </div>
        </div>
        <p className={styles.positionDescription}>
          {timePosition < 25
            ? 'Early in the story'
            : timePosition < 75
            ? 'Middle of the story'
            : 'Late in the story'}
        </p>
      </div>

      {/* Content Preview */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Content Preview</h3>
        <div className={styles.contentPreview}>{preview}</div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Words</span>
          <span className={styles.value}>{chapter.content?.split(/\s+/).length || 0}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Created</span>
          <span className={styles.value}>
            {chapter.createdAt
              ? new Date(chapter.createdAt.seconds * 1000).toLocaleDateString()
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Controls */}
      {isOwner && (
        <div className={styles.controls}>
          <p className={styles.hint}>
            ← Drag the chapter node on the timeline to adjust its position
          </p>
        </div>
      )}

      {!isOwner && (
        <div className={styles.readOnlyInfo}>
          <p>This timeline is read-only. Only the story owner can edit positions.</p>
        </div>
      )}
    </div>
  );
};

export default TimelineNodeCard;
