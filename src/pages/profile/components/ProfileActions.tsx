/**
 * ProfileActions - Follow and Message buttons
 * Premium button interactions with soft glow
 */

import styles from './ProfileActions.module.css';

interface ProfileActionsProps {
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
}

export default function ProfileActions({
  isFollowing,
  onFollow,
  onMessage
}: ProfileActionsProps) {
  return (
    <div className={styles.actionsContainer}>
      <button
        className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
        onClick={onFollow}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>

      <button
        className={styles.messageButton}
        onClick={onMessage}
        aria-label="Send message"
        title="Send message"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  );
}
