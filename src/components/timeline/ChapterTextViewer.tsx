import React from 'react';
import styles from './ChapterTextViewer.module.css';

interface Chapter {
  id: string;
  title: string;
  content?: string;
  order?: number;
  actId?: string;
  tension?: number;
}

interface ChapterTextViewerProps {
  chapter: Chapter | null;
  storyTitle?: string;
}

const ChapterTextViewer: React.FC<ChapterTextViewerProps> = ({ chapter, storyTitle }) => {
  if (!chapter) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{storyTitle || 'Story'}</h3>
        </div>
        <div className={styles.emptyState}>
          <p>👈 Select a chapter from the timeline to view its content</p>
        </div>
      </div>
    );
  }

  const wordCount = chapter.content?.split(/\s+/).length || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{chapter.title}</h3>
        <p className={styles.wordCount}>{wordCount} words</p>
      </div>

      <div className={styles.content}>
        {chapter.content && chapter.content.trim() ? (
          <p className={styles.text}>{chapter.content}</p>
        ) : (
          <p className={styles.noContent}>No content yet. Start writing in the story editor.</p>
        )}
      </div>
    </div>
  );
};

export default ChapterTextViewer;
