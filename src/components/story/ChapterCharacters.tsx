/**
 * ChapterCharacters - Character selector for chapter-level assignments
 * Displays selected characters and allows adding from story-level character pool
 */
import { useState, useRef, useEffect } from 'react';
import styles from './ChapterCharacters.module.css';

interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface ChapterCharactersProps {
  selectedCharacterIds: string[];
  availableCharacters: Character[];
  onAddCharacter: (characterId: string) => void;
  onRemoveCharacter: (characterId: string) => void;
}

export default function ChapterCharacters({
  selectedCharacterIds,
  availableCharacters,
  onAddCharacter,
  onRemoveCharacter
}: ChapterCharactersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected character objects
  const selectedCharacters = availableCharacters.filter(char =>
    selectedCharacterIds.includes(char.id)
  );

  // Get unselected characters for dropdown
  const unselectedCharacters = availableCharacters.filter(char =>
    !selectedCharacterIds.includes(char.id)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleAddClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectCharacter = (characterId: string) => {
    onAddCharacter(characterId);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.chapterCharacters}>
      <div className={styles.characterList}>
        {selectedCharacters.map((character) => (
          <div key={character.id} className={styles.characterItem}>
            <div className={styles.avatar}>
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarInitial}>
                  {character.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              className={styles.removeButton}
              onClick={() => onRemoveCharacter(character.id)}
              aria-label={`Remove ${character.name}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add Character Button */}
        <div className={styles.addButtonWrapper} ref={dropdownRef}>
          <button
            className={styles.addButton}
            onClick={handleAddClick}
            aria-label="Add character to chapter"
          >
            <div className={styles.addIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && unselectedCharacters.length > 0 && (
            <div className={styles.dropdown}>
              {unselectedCharacters.map((character) => (
                <button
                  key={character.id}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectCharacter(character.id)}
                >
                  <div className={styles.dropdownAvatar}>
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <span className={styles.avatarInitial}>
                        {character.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className={styles.dropdownName}>{character.name}</span>
                </button>
              ))}
            </div>
          )}

          {isDropdownOpen && unselectedCharacters.length === 0 && (
            <div className={styles.dropdown}>
              <div className={styles.emptyMessage}>
                All characters added
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
