/**
 * CharacterProfiles - Even-grid character avatar layout
 * Mobile-first, touch-friendly character management section
 * Uses CSS Grid for consistent, predictable rows and columns
 */
import { useState, useRef, useEffect } from 'react';
import styles from './CharacterProfiles.module.css';

interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface CharacterProfilesProps {
  characters?: Character[];
  onAddCharacter?: () => void;
  onSelectCharacter?: (characterId: string) => void;
}

export default function CharacterProfiles({
  characters = [],
  onAddCharacter,
  onSelectCharacter
}: CharacterProfilesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const avatarListRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check if content actually overflows in collapsed state
  useEffect(() => {
    const checkOverflow = () => {
      if (avatarListRef.current && !isExpanded) {
        // Check if scrollHeight exceeds the collapsed max-height (70px)
        const isOverflowing = avatarListRef.current.scrollHeight > 70;
        setHasOverflow(isOverflowing);
      }
    };

    checkOverflow();
    // Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [characters, isExpanded]);

  const handleCharacterClick = (characterId: string) => {
    onSelectCharacter?.(characterId);
  };

  const handleAddClick = () => {
    onAddCharacter?.();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className={styles.characterProfiles}>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Characters</h3>
        <button
          className={`${styles.expandButton} ${hasOverflow ? styles.hasContent : styles.noContent}`}
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse characters' : 'Expand characters'}
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
        </button>
      </div>
      
      <div 
        ref={avatarListRef}
        className={`${styles.avatarList} ${isExpanded ? styles.expanded : styles.collapsed}`}
      >
        {/* Add Character Button - First position */}
        <button
          className={styles.addButton}
          onClick={handleAddClick}
          aria-label="Add character"
        >
          <div className={styles.addIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className={styles.addLabel}>Add</span>
        </button>

        {characters.map((character) => (
            <button
              key={character.id}
              className={styles.avatarButton}
              onClick={() => handleCharacterClick(character.id)}
              aria-label={`Select ${character.name}`}
            >
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
              <span className={styles.characterName}>{character.name}</span>
            </button>
          ))}
      </div>
    </section>
  );
}
