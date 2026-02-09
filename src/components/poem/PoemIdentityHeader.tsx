/**
 * PoemIdentityHeader - Poem name label, share icon, and privacy dropdown
 * Identical to Story IdentityHeader - only labels differ
 */
import Dropdown from '../story/StoryMetaSection/Dropdown';
import styles from './PoemIdentityHeader.module.css';

interface PoemIdentityHeaderProps {
  privacy: string;
  onPrivacyChange: (value: string) => void;
  privacyOptions?: string[];
  genre?: string;
  genreOptions?: string[];
  onGenreChange?: (value: string) => void;
  onShareClick?: () => void;
  onViewPoem?: () => void;
  onOpenDropdown?: (dropdownName: string) => void;
  openDropdown?: string | null;
}

export default function PoemIdentityHeader({
  privacy,
  onPrivacyChange,
  privacyOptions = ['Private', 'Open access', 'Trending'],
  genre = '',
  genreOptions = [],
  onGenreChange,
  onShareClick,
  onViewPoem,
  onOpenDropdown,
  openDropdown
}: PoemIdentityHeaderProps) {

  const handleShareClick = () => {
    onShareClick?.();
  };

  const handlePrivacyOpenChange = (isOpen: boolean) => {
    onOpenDropdown?.(isOpen ? 'privacy' : '');
  };

  const handleGenreOpenChange = (isOpen: boolean) => {
    onOpenDropdown?.(isOpen ? 'genre' : '');
  };

  return (
    <div className={styles.identityHeader}>
      <span className={styles.poemNameLabel}>Poem name</span>
      
      <button 
        className={styles.shareIcon} 
        onClick={handleShareClick}
        aria-label="Share poem"
      >
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.8333 14C10.2315 14 9.71991 13.7958 9.29861 13.3875C8.87731 12.9792 8.66667 12.4833 8.66667 11.9C8.66667 11.83 8.68472 11.6667 8.72083 11.41L3.64722 8.54C3.45463 8.715 3.23194 8.85208 2.97917 8.95125C2.72639 9.05042 2.45556 9.1 2.16667 9.1C1.56481 9.1 1.05324 8.89583 0.631944 8.4875C0.210648 8.07917 0 7.58333 0 7C0 6.41667 0.210648 5.92083 0.631944 5.5125C1.05324 5.10417 1.56481 4.9 2.16667 4.9C2.45556 4.9 2.72639 4.94958 2.97917 5.04875C3.23194 5.14792 3.45463 5.285 3.64722 5.46L8.72083 2.59C8.69676 2.50833 8.68171 2.42958 8.67569 2.35375C8.66968 2.27792 8.66667 2.19333 8.66667 2.1C8.66667 1.51667 8.87731 1.02083 9.29861 0.6125C9.71991 0.204167 10.2315 0 10.8333 0C11.4352 0 11.9468 0.204167 12.3681 0.6125C12.7894 1.02083 13 1.51667 13 2.1C13 2.68333 12.7894 3.17917 12.3681 3.5875C11.9468 3.99583 11.4352 4.2 10.8333 4.2C10.5444 4.2 10.2736 4.15042 10.0208 4.05125C9.76805 3.95208 9.54537 3.815 9.35278 3.64L4.27917 6.51C4.30324 6.59167 4.31829 6.67042 4.32431 6.74625C4.33032 6.82208 4.33333 6.90667 4.33333 7C4.33333 7.09333 4.33032 7.17792 4.32431 7.25375C4.31829 7.32958 4.30324 7.40833 4.27917 7.49L9.35278 10.36C9.54537 10.185 9.76805 10.0479 10.0208 9.94875C10.2736 9.84958 10.5444 9.8 10.8333 9.8C11.4352 9.8 11.9468 10.0042 12.3681 10.4125C12.7894 10.8208 13 11.3167 13 11.9C13 12.4833 12.7894 12.9792 12.3681 13.3875C11.9468 13.7958 11.4352 14 10.8333 14ZM10.8333 12.6C11.038 12.6 11.2095 12.5329 11.3479 12.3987C11.4863 12.2646 11.5556 12.0983 11.5556 11.9C11.5556 11.7017 11.4863 11.5354 11.3479 11.4012C11.2095 11.2671 11.038 11.2 10.8333 11.2C10.6287 11.2 10.4572 11.2671 10.3188 11.4012C10.1803 11.5354 10.1111 11.7017 10.1111 11.9C10.1111 12.0983 10.1803 12.2646 10.3188 12.3987C10.4572 12.5329 10.6287 12.6 10.8333 12.6ZM2.16667 7.7C2.3713 7.7 2.54282 7.63292 2.68125 7.49875C2.81968 7.36458 2.88889 7.19833 2.88889 7C2.88889 6.80167 2.81968 6.63542 2.68125 6.50125C2.54282 6.36708 2.3713 6.3 2.16667 6.3C1.96204 6.3 1.79051 6.36708 1.65208 6.50125C1.51366 6.63542 1.44444 6.80167 1.44444 7C1.44444 7.19833 1.51366 7.36458 1.65208 7.49875C1.79051 7.63292 1.96204 7.7 2.16667 7.7ZM10.8333 2.8C11.038 2.8 11.2095 2.73292 11.3479 2.59875C11.4863 2.46458 11.5556 2.29833 11.5556 2.1C11.5556 1.90167 11.4863 1.73542 11.3479 1.60125C11.2095 1.46708 11.038 1.4 10.8333 1.4C10.6287 1.4 10.4572 1.46708 10.3188 1.60125C10.1803 1.73542 10.1111 1.90167 10.1111 2.1C10.1111 2.29833 10.1803 2.46458 10.3188 2.59875C10.4572 2.73292 10.6287 2.8 10.8333 2.8Z" fill="white"/>
        </svg>
      </button>

      <button 
        className={styles.viewPoemButton}
        onClick={onViewPoem}
        aria-label="View poem"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z" fill="currentColor"/>
        </svg>
        <span>View poem</span>
      </button>

      <div className={styles.privacyDropdownContainer}>
        <Dropdown
          label="Privacy"
          value={privacy}
          options={privacyOptions}
          onChange={onPrivacyChange}
          variant="privacy"
          onOpenChange={handlePrivacyOpenChange}
          isOpen={openDropdown === 'privacy'}
        />
      </div>

      {genreOptions.length > 0 && (
        <div className={styles.genreDropdownContainer}>
          <Dropdown
            label="Genre"
            value={genre}
            options={genreOptions}
            onChange={onGenreChange}
            variant="genre"
            onOpenChange={handleGenreOpenChange}
            isOpen={openDropdown === 'genre'}
          />
        </div>
      )}
    </div>
  );
}
