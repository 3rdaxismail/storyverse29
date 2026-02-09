/**
 * StoryCard - UNIFIED card component for story/poem display
 * 
 * SINGLE SOURCE OF TRUTH for all story and poem cards across the app.
 * Used by: TrendingPage, PublicProfilePage, and any future pages.
 * 
 * Features:
 * - Large cover image on left, content on right
 * - Shows: title, type (STORY/POEM), genre, word count, likes, comments
 * - Optional delete button (showDelete prop)
 * - Bookmark functionality (My Reads)
 * - Premium animations and hover effects
 */

import { useState, useEffect } from 'react';
import styles from './StoryCard.module.css';

export interface StoryCardProps {
  id: string;
  title: string;
  coverImageUrl: string;
  genre: string;
  likes: number;
  comments: number;
  wordCount: number;
  readingTime?: number;
  type: 'story' | 'poem';
  excerpt?: string;
  audience?: string;
  authorId?: string;
  authorName?: string;
  onClick: (id: string) => void;
  onDelete?: (id: string, type: 'story' | 'poem') => void;
  onBookmark?: (id: string, type: 'story' | 'poem', authorId: string) => void;
  showDelete?: boolean;
  isBookmarked?: boolean;
}

export default function StoryCard({
  id,
  title,
  coverImageUrl,
  genre,
  likes,
  comments,
  wordCount,
  readingTime,
  type,
  excerpt = '',
  audience,
  authorId = '',
  authorName,
  onClick,
  onDelete,
  onBookmark,
  showDelete = false,
  isBookmarked = false
}: StoryCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // Sync local state with prop when it changes
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  // Debug logging
  console.log('StoryCard render:', { id, title, wordCount, type, isBookmarked, bookmarked });

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatWordCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatReadTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min read`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} read`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} read`;
    }
  };

  const calculateReadTime = (words: number): number => {
    // Average reading speed: 200 words per minute
    return Math.ceil(words / 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id, type);
    }
    setShowConfirmation(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmation(false);
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onBookmark) {
      // Optimistically update UI
      setBookmarked(!bookmarked);
      
      try {
        await onBookmark(id, type, authorId);
      } catch (error) {
        // Revert on error
        setBookmarked(bookmarked);
        console.error('[StoryCard] Bookmark failed:', error);
      }
    }
  };

  return (
    <div
      className={styles.storyCard}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Delete Button - Top Right (only if showDelete is true) */}
      {showDelete && (
        <button 
          className={styles.deleteButton}
          onClick={handleDeleteClick}
          aria-label="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.confirmationOverlay} onClick={handleCancelDelete}>
          <div className={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
            <h4>Delete {type}?</h4>
            <p>Are you sure you want to delete "{title}"? This action cannot be undone.</p>
            <div className={styles.confirmationActions}>
              <button className={styles.cancelButton} onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className={styles.confirmDeleteButton} onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Large Cover Image - Left */}
      <div className={styles.coverWrapper}>
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverPlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
        <div className={styles.coverGradient}></div>
      </div>

      {/* Content - Right Section */}
      <div className={styles.cardContent}>
        {/* Type and Genre Header */}
        <div className={styles.typeSection}>
          <span className={styles.typeLabel}>
            {type === 'poem' ? '📝 POEM' : '📖 STORY'}
          </span>
          {genre && (
            <>
              <span className={styles.typeSeparator}>•</span>
              <span className={styles.genreLabel}>{genre}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className={styles.title}>{title}</h3>

        {/* Author Name with Audience Chip */}
        {authorName && (
          <div className={styles.authorSection}>
            <span className={styles.authorName}>By {authorName}</span>
            {audience && (
              <>
                <span className={styles.separator}>|</span>
                <span className={styles.audienceChip}>{audience}</span>
              </>
            )}
          </div>
        )}

        {/* Excerpt */}
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

        {/* Footer Stats */}
        <div className={styles.cardFooter}>
          <div className={styles.statsGroup}>
            {/* Read Time */}
            <div className={styles.stat}>
              <span>{formatReadTime(readingTime || calculateReadTime(wordCount))}</span>
            </div>
            {/* Word Count */}
            <div className={styles.stat}>
              <span>{formatWordCount(wordCount)} words</span>
            </div>
            {/* Likes */}
            <div className={styles.stat}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={likes > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={likes > 0 ? "0" : "2"}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{formatCount(likes)}</span>
            </div>
            {/* Comments */}
            <div className={styles.stat}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{formatCount(comments)}</span>
            </div>
          </div>
          
          {/* Bookmark Icon */}
          <button 
            className={`${styles.bookmarkButton} ${bookmarked ? styles.bookmarked : ''}`} 
            aria-label="Bookmark" 
            onClick={handleBookmarkClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
