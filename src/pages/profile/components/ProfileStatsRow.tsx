/**
 * ProfileStatsRow - Stories count and followers display
 * Staggered entrance animation
 */

import styles from './ProfileStatsRow.module.css';

interface ProfileStatsRowProps {
  storiesCount: number;
  followersCount: number;
}

export default function ProfileStatsRow({
  storiesCount,
  followersCount
}: ProfileStatsRowProps) {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={styles.statsRow}>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{storiesCount}</div>
        <div className={styles.statLabel}>Stories</div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.statItem}>
        <div className={styles.statValue}>{formatCount(followersCount)}</div>
        <div className={styles.statLabel}>Followers</div>
      </div>
    </div>
  );
}
