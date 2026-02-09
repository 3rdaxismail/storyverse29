/**
 * ActSection - Container for chapters within a narrative act
 * Groups related chapters together
 */
import { useState } from 'react';
import ChapterCard from './ChapterCard';
import type { EditorState } from './ChapterTextEditor';
import styles from './ActSection.module.css';
import deleteIcon from '../../assets/delete.svg';

interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface Chapter {
  id: string;
  title: string;
  characterIds: string[];
  locationIds: string[];
  content: string;
  state: EditorState;
}

interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT';
}

interface ActSectionProps {
  actId: string;
  actNumber: number;
  actTitle: string;
  chapters: Chapter[];
  availableCharacters: Character[];
  availableLocations: Location[];
  expandedChapterId: string | null;
  activeEditorId: string | null;
  isOnline?: boolean; // Online/offline status
  onActTitleChange: (actId: string, title: string) => void;
  onDeleteAct: (actId: string) => void;
  onAddChapter: (actId: string) => void;
  onAddCharacter: (chapterId: string, characterId: string) => void;
  onRemoveCharacter: (chapterId: string, characterId: string) => void;
  onAddLocation: (chapterId: string, locationId: string) => void;
  onRemoveLocation: (chapterId: string, locationId: string) => void;
  onCreateNewLocation: (chapterId: string, name: string, type: 'INT' | 'EXT') => void;
  onChapterTitleChange: (chapterId: string, title: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onToggleChapterExpanded: (chapterId: string) => void;
  onChapterContentChange: (chapterId: string, content: string) => void;
  onChapterEditorFocus: (chapterId: string) => void;
  onChapterEditorBlur: (chapterId: string) => void;
}

export default function ActSection({
  actId,
  actNumber,
  actTitle,
  chapters,
  availableCharacters,
  availableLocations,
  expandedChapterId,
  activeEditorId,
  isOnline = true,
  onActTitleChange,
  onDeleteAct,
  onAddChapter,
  onAddCharacter,
  onRemoveCharacter,
  onAddLocation,
  onRemoveLocation,
  onCreateNewLocation,
  onChapterTitleChange,
  onDeleteChapter,
  onToggleChapterExpanded,
  onChapterContentChange,
  onChapterEditorFocus,
  onChapterEditorBlur
}: ActSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(actTitle);

  const handleTitleClick = () => {
    if (!isOnline) return; // Prevent editing when offline
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOnline) return; // Prevent changes when offline
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (localTitle.trim() !== actTitle) {
      onActTitleChange(actId, localTitle.trim() || `Act ${actNumber}`);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleAddChapter = () => {
    onAddChapter(actId);
  };

  return (
    <section className={styles.actSection}>
      {/* Act Header */}
      <header className={styles.actHeader}>
        {isEditingTitle ? (
          <input
            type="text"
            className={styles.actTitleInput}
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h3 className={styles.actTitle} onClick={handleTitleClick}>
            {actTitle || `Act ${actNumber}`}
          </h3>
        )}
        <button
          className={styles.deleteButton}
          onClick={() => onDeleteAct(actId)}
          aria-label="Delete act"
          disabled={!isOnline}
          style={!isOnline ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <img src={deleteIcon} alt="Delete" width="18" height="18" />
        </button>
      </header>

      {/* Chapters */}
      <div className={styles.chaptersContainer}>
        {chapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            chapterId={chapter.id}
            chapterNumber={index + 1}
            chapterTitle={chapter.title}
            selectedCharacterIds={chapter.characterIds}
            selectedLocationIds={chapter.locationIds}
            availableCharacters={availableCharacters}
            availableLocations={availableLocations}
            isExpanded={expandedChapterId === chapter.id}
            content={chapter.content}
            editorState={chapter.state}
            isActiveEditor={activeEditorId === chapter.id}
            isOnline={isOnline}
            onChapterTitleChange={onChapterTitleChange}
            onDeleteChapter={onDeleteChapter}
            onToggleExpanded={onToggleChapterExpanded}
            onAddCharacter={onAddCharacter}
            onRemoveCharacter={onRemoveCharacter}
            onAddLocation={onAddLocation}
            onRemoveLocation={onRemoveLocation}
            onCreateNewLocation={onCreateNewLocation}
            onContentChange={onChapterContentChange}
            onEditorFocus={onChapterEditorFocus}
            onEditorBlur={onChapterEditorBlur}
          />
        ))}

        {/* Add Chapter Button */}
        <button 
          className={styles.addChapterButton} 
          onClick={handleAddChapter}
          disabled={!isOnline}
          style={!isOnline ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Add Chapter</span>
        </button>
      </div>
    </section>
  );
}
