/**
 * TitleInputBlock - Full-width story title input
 * Matches StoryMetaBlock (70:169) from Figma - h=34px, 4px padding
 * Connected to WritingSessionEngine for persistence
 */
import { useEffect, useRef } from 'react';
import { useStoryTitle, useActiveEditor } from '../../../hooks/useWritingSession';
import writingSessionEngine from '../../../engine/WritingSessionEngine';
import styles from './TitleInputBlock.module.css';

interface TitleInputBlockProps {
  onChange?: (value: string) => void; // Optional callback
  placeholder?: string;
  isOnline?: boolean; // Online/offline status
}

const EDITOR_ID = 'story-title';

export default function TitleInputBlock({
  onChange: onChangeProp,
  placeholder = 'Enter story title',
  isOnline = true
}: TitleInputBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useStoryTitle();
  const isActive = useActiveEditor(EDITOR_ID);

  // Sync with parent component if callback provided
  useEffect(() => {
    onChangeProp?.(title);
  }, [title, onChangeProp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOnline) return; // Prevent editing when offline
    setTitle(e.target.value);
  };

  const handleFocus = () => {
    if (!isOnline) return; // Prevent activation when offline
    writingSessionEngine.setActiveEditor(EDITOR_ID);
  };

  const handleBlur = () => {
    // Could trigger auto-save or validation here
  };

  return (
    <div className={`${styles.titleInputBlock} ${isActive ? styles.active : ''}`}>
      <input
        ref={inputRef}
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-label="Story title"
        readOnly={!isOnline}
        style={!isOnline ? { cursor: 'not-allowed', opacity: 0.6 } : undefined}
      />
    </div>
  );
}
