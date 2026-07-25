/**
 * ChapterCard - Individual chapter container
 * Contains chapter header, character selector, locations selector, and text editor
 */
import { useState } from 'react';
import ChapterCharacters from './ChapterCharacters';
import ChapterLocations from './ChapterLocations';
import ChapterTextEditor, { type EditorState } from './ChapterTextEditor';
import styles from './ChapterCard.module.css';
import deleteIcon from '../../assets/delete.svg';

interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT';
}

interface ChapterCardProps {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  selectedCharacterIds: string[];
  selectedLocationIds: string[];
  availableCharacters: Character[];
  availableLocations: Location[];
  isExpanded: boolean;
  content: string;
  editorState: EditorState;
  isActiveEditor: boolean;
  isOnline?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onChapterTitleChange: (chapterId: string, title: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onToggleExpanded: (chapterId: string) => void;
  onMoveUp?: (chapterId: string) => void;
  onMoveDown?: (chapterId: string) => void;
  onAddCharacter: (chapterId: string, characterId: string) => void;
  onRemoveCharacter: (chapterId: string, characterId: string) => void;
  onAddLocation: (chapterId: string, locationId: string) => void;
  onRemoveLocation: (chapterId: string, locationId: string) => void;
  onCreateNewLocation: (chapterId: string, name: string, type: 'INT' | 'EXT') => void;
  onContentChange: (chapterId: string, content: string) => void;
  onEditorFocus: (chapterId: string) => void;
  onEditorBlur: (chapterId: string) => void;
}

export default function ChapterCard({
  chapterId,
  chapterNumber,
  chapterTitle,
  selectedCharacterIds,
  selectedLocationIds,
  availableCharacters,
  availableLocations,
  isExpanded,
  content,
  editorState,
  isActiveEditor,
  isOnline = true,
  canMoveUp = false,
  canMoveDown = false,
  onChapterTitleChange,
  onDeleteChapter,
  onToggleExpanded,
  onMoveUp,
  onMoveDown,
  onAddCharacter,
  onRemoveCharacter,
  onAddLocation,
  onRemoveLocation,
  onCreateNewLocation,
  onContentChange,
  onEditorFocus,
  onEditorBlur
}: ChapterCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(chapterTitle);
  const [hasTextOverflow, setHasTextOverflow] = useState(false);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (localTitle.trim() !== chapterTitle) {
      onChapterTitleChange(chapterId, localTitle.trim());
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Render collapsed strip view when not expanded
  if (!isExpanded) {
    return (
      <article 
        className={`${styles.chapterCard} ${styles.collapsed}`}
        onClick={() => onToggleExpanded(chapterId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggleExpanded(chapterId);
          }
        }}
      >
        {/* Collapsed Header Strip */}
        <header className={styles.collapsedHeader}>
          <div className={styles.titleWrapper}>
            <svg 
              width="20" 
              height="20"
              viewBox="0 0 24 24" 
              fill="none"
              className={styles.expandIcon}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h4 className={styles.collapsedTitle}>
              <span className={styles.chapterNumber}>Chapter {chapterNumber}</span>
              <span className={styles.chapterName}>
                {chapterTitle ? ' · ' + chapterTitle : ' · [Untitled]'}
              </span>
            </h4>
          </div>
          {/* Quick actions visible on collapsed state */}
          <div className={styles.quickActions} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChapter(chapterId);
              }}
              aria-label="Delete chapter"
              title="Delete chapter"
            >
              <img src={deleteIcon} alt="Delete" width="16" height="16" />
            </button>
          </div>
        </header>
      </article>
    );
  }

  // Render expanded card view
  return (
    <article className={`${styles.chapterCard} ${styles.expanded}`}>
      {/* Chapter Header */}
      <header className={styles.chapterHeader}>
        <h4 className={styles.chapterTitle}>
          <span className={styles.chapterNumber}>Chapter {chapterNumber}</span>
          {isEditingTitle ? (
            <input
              type="text"
              className={styles.chapterTitleInput}
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              placeholder="Enter chapter name"
            />
          ) : (
            <span className={styles.chapterName} onClick={handleTitleClick}>
              {chapterTitle ? ' · ' + chapterTitle : ' · '}
              {!chapterTitle && <span className={styles.placeholder}>Click to add name</span>}
            </span>
          )}
        </h4>
        
        {/* Right-aligned controls */}
        <div className={styles.controlsGroup}>
          {/* Collapse Button - Primary action */}
          <button
            className={styles.collapseButtonProminent}
            onClick={() => onToggleExpanded(chapterId)}
            aria-label="Collapse chapter"
            title="Collapse chapter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Move Up Button */}
          <button
            className={styles.moveButton}
            onClick={() => onMoveUp?.(chapterId)}
            disabled={!canMoveUp}
            aria-label="Move chapter up"
            title="Move chapter up"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 14L12 9L17 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Move Down Button */}
          <button
            className={styles.moveButton}
            onClick={() => onMoveDown?.(chapterId)}
            disabled={!canMoveDown}
            aria-label="Move chapter down"
            title="Move chapter down"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            className={styles.deleteButton}
            onClick={() => onDeleteChapter(chapterId)}
            aria-label="Delete chapter"
          >
            <img src={deleteIcon} alt="Delete" width="16" height="16" />
          </button>
        </div>
      </header>

      {/* Chapter Characters */}
      <div className={styles.chapterSection}>
        <h5 className={styles.sectionLabel}>Characters</h5>
        <ChapterCharacters
          selectedCharacterIds={selectedCharacterIds}
          availableCharacters={availableCharacters}
          onAddCharacter={(characterId) => onAddCharacter(chapterId, characterId)}
          onRemoveCharacter={(characterId) => onRemoveCharacter(chapterId, characterId)}
        />
      </div>

      {/* Chapter Locations */}
      <div className={styles.chapterSection}>
        <h5 className={styles.sectionLabel}>Locations</h5>
        <ChapterLocations
          selectedLocationIds={selectedLocationIds}
          availableLocations={availableLocations}
          onAddLocation={(locationId) => onAddLocation(chapterId, locationId)}
          onRemoveLocation={(locationId) => onRemoveLocation(chapterId, locationId)}
          onCreateNewLocation={(name, type) => onCreateNewLocation(chapterId, name, type)}
        />
      </div>

      {/* Chapter Text Editor - Always visible for expanded state */}
      <div className={styles.chapterSection}>
        <div className={styles.textEditorHeader}>
        </div>
        <ChapterTextEditor
          chapterId={chapterId}
          content={content}
          state={editorState}
          isActive={isActiveEditor}
          isExpanded={isExpanded}
          placeholder="Write your chapter..."
          isOnline={isOnline}
          onContentChange={onContentChange}
          onFocus={onEditorFocus}
          onBlur={onEditorBlur}
          onOverflowChange={setHasTextOverflow}
        />
      </div>
    </article>
  );
}
