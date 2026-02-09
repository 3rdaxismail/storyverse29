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
  onChapterTitleChange: (chapterId: string, title: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onToggleExpanded: (chapterId: string) => void;
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
  onChapterTitleChange,
  onDeleteChapter,
  onToggleExpanded,
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

  return (
    <article className={styles.chapterCard}>
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
        <button
          className={styles.deleteButton}
          onClick={() => onDeleteChapter(chapterId)}
          aria-label="Delete chapter"
        >
          <img src={deleteIcon} alt="Delete" width="16" height="16" />
        </button>
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

      {/* Chapter Text Editor - Always visible, limited to 5 lines when collapsed */}
      <div className={styles.chapterSection}>
        <div className={styles.textEditorHeader}>
          <button 
            className={`${styles.expandButton} ${hasTextOverflow ? styles.hasContent : styles.noContent}`}
            onClick={() => onToggleExpanded(chapterId)}
            aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
              className={isExpanded ? styles.chevronUp : styles.chevronDown}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.expandLabel}>
              {isExpanded ? 'Collapse chapter' : 'Expand chapter'}
            </span>
          </button>
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
