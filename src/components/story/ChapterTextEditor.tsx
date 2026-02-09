/**
 * ChapterTextEditor - Chapter-wise text editor with visual states
 * States: empty, writing, idle, syncing, offline, error, loading
 */
import { useState, useEffect, useRef } from 'react';
import styles from './ChapterTextEditor.module.css';

export type EditorState = 'empty' | 'writing' | 'idle' | 'syncing' | 'offline' | 'error' | 'loading';

interface ChapterTextEditorProps {
  chapterId: string;
  content: string;
  state: EditorState;
  isActive: boolean;
  isExpanded: boolean;
  placeholder?: string;
  isOnline?: boolean;
  onContentChange: (chapterId: string, content: string) => void;
  onFocus: (chapterId: string) => void;
  onBlur: (chapterId: string) => void;
  onOverflowChange?: (hasOverflow: boolean) => void;
}

export default function ChapterTextEditor({
  chapterId,
  content,
  state,
  isActive,
  isExpanded,
  placeholder = 'Write your chapter...',
  isOnline = true,
  onContentChange,
  onFocus,
  onBlur,
  onOverflowChange
}: ChapterTextEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check if content overflows in collapsed state (5 lines)
  useEffect(() => {
    const checkOverflow = () => {
      if (textareaRef.current && !isExpanded) {
        // Collapsed state shows max 5 lines (calc(1.6em * 5))
        const maxCollapsedHeight = 1.6 * 5 * 15; // ~120px (1.6em line-height * 5 lines * 15px font-size)
        const isOverflowing = textareaRef.current.scrollHeight > maxCollapsedHeight;
        setHasOverflow(isOverflowing);
        onOverflowChange?.(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [localContent, isExpanded, onOverflowChange]);

  // Sync local content with prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isOnline) return; // Prevent editing when offline
    const newContent = e.target.value;
    console.log('[ChapterTextEditor] Text changed:', { chapterId, length: newContent.length });
    setLocalContent(newContent);
    onContentChange(chapterId, newContent);
  };

  const handleFocus = () => {
    if (!isOnline) return; // Prevent activation when offline
    onFocus(chapterId);
  };

  const handleBlur = () => {
    onBlur(chapterId);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localContent]);

  const getStateLabel = () => {
    switch (state) {
      case 'syncing':
        return 'Saving...';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error saving';
      case 'loading':
        return 'Loading...';
      case 'idle':
        return 'Saved';
      default:
        return null;
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'syncing':
        return (
          <svg className={styles.spinIcon} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32 16" />
          </svg>
        );
      case 'offline':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        );
      case 'idle':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const stateLabel = getStateLabel();
  const stateIcon = getStateIcon();

  return (
    <div className={`${styles.chapterTextEditor} ${isActive ? styles.active : ''} ${isExpanded ? styles.expanded : styles.collapsed} ${styles[state]}`}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={localContent}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={3}
        readOnly={!isOnline}
        style={!isOnline ? { cursor: 'not-allowed', opacity: 0.6 } : undefined}
      />

      {/* State Indicator */}
      {stateLabel && (
        <div className={styles.stateIndicator}>
          {stateIcon && <span className={styles.stateIcon}>{stateIcon}</span>}
          <span className={styles.stateLabel}>{stateLabel}</span>
        </div>
      )}
    </div>
  );
}
