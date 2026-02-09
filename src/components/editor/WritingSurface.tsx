/**
 * WritingSurface Component
 * 
 * DEPRECATED: This component uses the old generic content API.
 * For Story Editor, use ChapterTextEditor with useChapterText hook instead.
 * 
 * Temporarily returns placeholder to avoid breaking CreateStoryPage.
 */

import styles from './WritingSurface.module.css';

interface WritingSurfaceProps {
  sectionId: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: string;
}

export default function WritingSurface({
  placeholder = 'Start writing...',
  disabled = false,
  readOnly = false,
  minHeight = '300px',
}: WritingSurfaceProps) {
  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        style={{ minHeight }}
        spellCheck
      />
    </div>
  );
}

