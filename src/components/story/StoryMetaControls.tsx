/**
 * StoryMetaControls - Structured metadata controls for Story Editor
 * Includes three-level genre hierarchy, audience selector, and reading time
 */
import { useState, useEffect } from 'react';
import Dropdown from './StoryMetaSection/Dropdown';
import styles from './StoryMetaControls.module.css';

interface StoryMetaControlsProps {
  readingTime?: string;
  onMetaChange?: (meta: {
    primaryGenre: string;
    secondaryGenre: string;
    tertiaryGenre: string;
    audience: string;
  }) => void;
}

// Mock genre options
const PRIMARY_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Historical',
  'Adventure'
];

const SECONDARY_GENRES: Record<string, string[]> = {
  'Fiction': ['Literary', 'Contemporary', 'Historical', 'Magical Realism'],
  'Fantasy': ['Epic', 'Urban', 'Dark', 'High Fantasy', 'Low Fantasy'],
  'Science Fiction': ['Space Opera', 'Cyberpunk', 'Dystopian', 'Hard SF', 'Soft SF'],
  'Mystery': ['Cozy', 'Detective', 'Crime', 'Noir', 'Police Procedural'],
  'Romance': ['Contemporary', 'Historical', 'Paranormal', 'Romantic Comedy'],
  'Thriller': ['Psychological', 'Action', 'Espionage', 'Legal', 'Medical'],
  'Horror': ['Psychological', 'Supernatural', 'Gothic', 'Cosmic'],
  'Historical': ['Medieval', 'Victorian', 'War', 'Ancient'],
  'Adventure': ['Action', 'Quest', 'Survival', 'Exploration']
};

const TERTIARY_GENRES: Record<string, string[]> = {
  'Literary': ['Character-Driven', 'Experimental', 'Minimalist'],
  'Contemporary': ['Coming of Age', 'Family Drama', 'Social Issues'],
  'Epic': ['Multi-Book Series', 'World Building', 'Quest'],
  'Urban': ['Modern Setting', 'Supernatural', 'Dark Magic'],
  'Space Opera': ['Military', 'Exploration', 'Political'],
  'Cyberpunk': ['Corporate', 'Hacker', 'Noir'],
  'Cozy': ['Amateur Detective', 'Small Town', 'Light'],
  'Detective': ['Hard-Boiled', 'Classic', 'Modern'],
  'Psychological': ['Mind Games', 'Suspense', 'Twisted'],
  'Action': ['Fast-Paced', 'High Stakes', 'Espionage']
};

const AUDIENCE_OPTIONS = [
  'Young Adult (13-18)',
  'New Adult (18-25)',
  'Adult (25+)',
  'All Ages',
  'Below 13',
  'Middle Grade (8-12)',
  'Children (5-8)'
];

export default function StoryMetaControls({
  readingTime = '45m',
  onMetaChange
}: StoryMetaControlsProps) {
  const [primaryGenre, setPrimaryGenre] = useState('');
  const [secondaryGenre, setSecondaryGenre] = useState('');
  const [tertiaryGenre, setTertiaryGenre] = useState('');
  const [audience, setAudience] = useState('');

  // Notify parent of changes
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        primaryGenre,
        secondaryGenre,
        tertiaryGenre,
        audience
      });
    }
  }, [primaryGenre, secondaryGenre, tertiaryGenre, audience, onMetaChange]);

  const handlePrimaryGenreChange = (value: string) => {
    setPrimaryGenre(value);
    // Reset dependent genres
    setSecondaryGenre('');
    setTertiaryGenre('');
  };

  const handleSecondaryGenreChange = (value: string) => {
    setSecondaryGenre(value);
    // Reset dependent genre
    setTertiaryGenre('');
  };

  const handleTertiaryGenreChange = (value: string) => {
    setTertiaryGenre(value);
  };

  const handleAudienceChange = (value: string) => {
    setAudience(value);
  };

  // Get available options based on selections
  const secondaryOptions = primaryGenre ? SECONDARY_GENRES[primaryGenre] || [] : [];
  const tertiaryOptions = secondaryGenre ? TERTIARY_GENRES[secondaryGenre] || [] : [];

  return (
    <div className={styles.metaControls}>
      {/* Row 1: Three Genre Dropdowns */}
      <div className={styles.genreRow}>
        <Dropdown
          label="Primary genre"
          value={primaryGenre}
          options={PRIMARY_GENRES}
          onChange={handlePrimaryGenreChange}
          variant="genre"
        />
        <Dropdown
          label="Secondary genre"
          value={secondaryGenre}
          options={secondaryOptions}
          onChange={handleSecondaryGenreChange}
          variant="genre"
          disabled={!primaryGenre}
        />
        <Dropdown
          label="Tertiary genre"
          value={tertiaryGenre}
          options={tertiaryOptions}
          onChange={handleTertiaryGenreChange}
          variant="genre"
          disabled={!secondaryGenre}
        />
      </div>

      {/* Row 2: Audience (Left) and Reading Time (Right) */}
      <div className={styles.bottomRow}>
        <Dropdown
          label="Audience"
          value={audience}
          options={AUDIENCE_OPTIONS}
          onChange={handleAudienceChange}
          variant="audience"
        />
        <div className={styles.readingTime}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" />
            <path d="M7 3.5V7H10.5" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <span>{readingTime} read</span>
        </div>
      </div>
    </div>
  );
}
