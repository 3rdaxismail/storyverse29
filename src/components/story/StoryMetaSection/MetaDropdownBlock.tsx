/**
 * MetaDropdownBlock - Three-level genre hierarchy, Audience dropdown, and Read time badge
 * Matches Figma design - Genres stacked vertically under title, Audience + Reading Time in bottom row
 */
import { usePrimaryGenre, useSecondaryGenre, useTertiaryGenre, useAudience } from '../../../hooks/useWritingSession';
import Dropdown from './Dropdown';
import styles from './MetaDropdownBlock.module.css';

interface MetaDropdownBlockProps {
  readTime: string;
  onOpenDropdown?: (dropdownName: string) => void;
  openDropdown?: string | null;
}

// Genre options (same list for all three levels)
const GENRE_OPTIONS = [
  'Drama',
  'Romance',
  'Thriller',
  'Mystery',
  'Crime',
  'Horror',
  'Adventure',
  'Fantasy',
  'Sci-fi',
  'Historical',
  'Contemporary',
  'Coming-of-age',
  'Family drama',
  'Social drama',
  'Political drama',
  'Musical',
  'Comedy',
  'Tragedy',
  'Action',
  'Suspense',
  'Mythology',
  'Dystopian',
  'Cyberpunk',
  'Steampunk',
  'Space Opera',
  'Solarpunk',
  'Noir',
  'Psychological drama',
  'Cosy Mystery',
  'Legal Thriller',
  'Techno-thriller',
  'Urban Fantasy',
  'Grimdark',
  'Magical Realism',
  'Dark Fantasy',
  'Folklore',
  'Satire',
  'Epistolary',
  'Slice of Life',
  'Erotica',
  'Gothic',
  'Memoir',
  'Travel Story',
  'Auto-fiction',
  'Western',
  'Utopian'
];

const AUDIENCE_OPTIONS = [
  'All Ages',
  'Below 13',
  '13+',
  '16+',
  '18+',
  '18+(A)'
];

export default function MetaDropdownBlock({
  readTime,
  onOpenDropdown,
  openDropdown
}: MetaDropdownBlockProps) {
  // Connect to WritingSessionEngine via hooks - this enables autosave to localStorage
  const [primaryGenre, setPrimaryGenre] = usePrimaryGenre();
  const [secondaryGenre, setSecondaryGenre] = useSecondaryGenre();
  const [tertiaryGenre, setTertiaryGenre] = useTertiaryGenre();
  const [audience, setAudience] = useAudience();

  const handlePrimaryGenreChange = (value: string) => {
    setPrimaryGenre(value);
  };

  const handleSecondaryGenreChange = (value: string) => {
    setSecondaryGenre(value);
  };

  const handleTertiaryGenreChange = (value: string) => {
    setTertiaryGenre(value);
  };

  const handleAudienceChange = (value: string) => {
    setAudience(value);
  };

  // Manage dropdown open states
  const handlePrimaryGenreOpenChange = (isOpen: boolean) => {
    onOpenDropdown?.(isOpen ? 'primary-genre' : '');
  };

  const handleSecondaryGenreOpenChange = (isOpen: boolean) => {
    onOpenDropdown?.(isOpen ? 'secondary-genre' : '');
  };

  const handleTertiaryGenreOpenChange = (isOpen: boolean) => {
    onOpenDropdown?.(isOpen ? 'tertiary-genre' : '');
  };

  const handleAudienceOpenChange = (isOpen: boolean) => {
    onOpenDropdown?.(isOpen ? 'audience' : '');
  };

  return (
    <div className={styles.metaDropdownBlock}>
      {/* Row 1: Three Genre Dropdowns */}
      <div className={styles.genreRow}>
        <Dropdown
          label="Primary genre"
          value={primaryGenre}
          options={GENRE_OPTIONS}
          onChange={handlePrimaryGenreChange}
          variant="genre"
          onOpenChange={handlePrimaryGenreOpenChange}
          isOpen={openDropdown === 'primary-genre'}
        />
        <Dropdown
          label="Secondary genre"
          value={secondaryGenre}
          options={['None', ...GENRE_OPTIONS]}
          onChange={handleSecondaryGenreChange}
          variant="genre"
          onOpenChange={handleSecondaryGenreOpenChange}
          isOpen={openDropdown === 'secondary-genre'}
        />
        <Dropdown
          label="Tertiary genre"
          value={tertiaryGenre}
          options={['None', ...GENRE_OPTIONS]}
          onChange={handleTertiaryGenreChange}
          variant="genre"
          onOpenChange={handleTertiaryGenreOpenChange}
          isOpen={openDropdown === 'tertiary-genre'}
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
          onOpenChange={handleAudienceOpenChange}
          isOpen={openDropdown === 'audience'}
        />
        <div className={styles.readTimeBadge}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1"/>
            <path d="M7 4V7L9 9" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span>{readTime} read</span>
        </div>
      </div>
    </div>
  );
}
