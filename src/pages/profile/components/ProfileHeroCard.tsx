/**
 * ProfileHeroCard - Avatar, name, bio, and current work showcase
 * Premium entrance animation with circular avatar
 */

import styles from './ProfileHeroCard.module.css';

interface ProfileHeroCardProps {
  displayName: string;
  bio: string;
  avatar: string;
  currentWork: string;
}

export default function ProfileHeroCard({
  displayName,
  bio,
  avatar,
  currentWork
}: ProfileHeroCardProps) {
  return (
    <div className={styles.heroCard}>
      {/* Animated Avatar Ring */}
      <div className={styles.avatarWrapper}>
        <div className={styles.animatedRing}></div>
        <div className={styles.avatar}>
          {avatar ? (
            <img src={avatar} alt={displayName} />
          ) : (
            <div className={styles.avatarFallback}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="28" r="14" fill="rgba(165, 183, 133, 1)" />
                <path d="M14 70C14 56 24 48 40 48C56 48 66 56 66 70" fill="rgba(165, 183, 133, 1)"/>
              </svg>
            </div>
          )}
        </div>
        <div className={styles.statusIndicator}></div>
      </div>

      {/* Name */}
      <h1 className={styles.displayName}>{displayName}</h1>

      {/* Bio */}
      <p className={styles.bio}>{bio}</p>

      {/* Current Work Highlight */}
      {currentWork && (
        <div className={styles.currentWorkHighlight}>
          Currently writing <span className={styles.workTitle}>{currentWork}</span>
        </div>
      )}
    </div>
  );
}
