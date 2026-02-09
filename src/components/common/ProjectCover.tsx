/**
 * ProjectCover - Cover image for story/poem projects
 * 3:4 aspect ratio, appears above project title
 */
import { useRef } from 'react';
import styles from './ProjectCover.module.css';

interface ProjectCoverProps {
  coverImageUrl?: string;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  projectType?: 'story' | 'poem';
}

export default function ProjectCover({ 
  coverImageUrl, 
  onUpload, 
  onDelete,
  projectType = 'story'
}: ProjectCoverProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!coverImageUrl) {
    // Placeholder: show "Add cover" card
    return (
      <div className={styles.container}>
        <button className={styles.placeholder} onClick={handleClick} aria-label={`Add ${projectType} cover`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={styles.placeholderIcon}>
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor" opacity="0.5"/>
          </svg>
          <span className={styles.placeholderText}>Add cover</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
          aria-hidden="true"
        />
      </div>
    );
  }

  // Show cover image with replace/delete options
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img src={coverImageUrl} alt={`${projectType} cover`} className={styles.image} />
        <div className={styles.overlay}>
          <div className={styles.actions}>
            <button 
              className={styles.actionButton} 
              onClick={handleClick}
              aria-label="Replace cover"
              title="Replace cover"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
              </svg>
            </button>
            {onDelete && (
              <button 
                className={styles.actionButton} 
                onClick={onDelete}
                aria-label="Delete cover"
                title="Delete cover"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.fileInput}
        aria-hidden="true"
      />
    </div>
  );
}
