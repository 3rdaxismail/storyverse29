/**
 * StoryMetaSection - Main layout component for story metadata
 * Controls padding, spacing, and vertical flow
 * Child blocks must NOT define outer margins
 * 
 * Matches Frame 33 from Figma - VERTICAL layout, 11px itemSpacing
 */
import { useState } from 'react';
import IdentityHeader from './IdentityHeader';
import TitleInputBlock from './TitleInputBlock';
import MetaDropdownBlock from './MetaDropdownBlock';
import StatsBlock from './StatsBlock';
import styles from './StoryMetaSection.module.css';

interface StoryMetaSectionProps {
  // Identity & Privacy - managed by session
  onShareClick?: () => void;

  // Title - managed by WritingSessionEngine
  onTitleChange?: (value: string) => void;

  // Meta dropdowns - managed by session
  readTime: string;

  // Stats (read-only)
  words: string;
  dialogues: string;
  characters: string;
  locations: string;
  acts: string;
  chapters: string;
}

export default function StoryMetaSection({
  onShareClick,
  onTitleChange,
  readTime,
  words,
  dialogues,
  characters,
  locations,
  acts,
  chapters
}: StoryMetaSectionProps) {
  // Ensure only one dropdown is open at a time
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleOpenDropdown = (dropdownName: string) => {
    setOpenDropdown(dropdownName || null);
  };

  return (
    <section className={styles.storyMetaSection}>
      <IdentityHeader
        onShareClick={onShareClick}
        onOpenDropdown={handleOpenDropdown}
        openDropdown={openDropdown}
      />

      <TitleInputBlock
        onChange={onTitleChange}
      />

      <MetaDropdownBlock
        readTime={readTime}
        onOpenDropdown={handleOpenDropdown}
        openDropdown={openDropdown}
      />

      <StatsBlock
        words={words}
        dialogues={dialogues}
        characters={characters}
        locations={locations}
        acts={acts}
        chapters={chapters}
      />
    </section>
  );
}
