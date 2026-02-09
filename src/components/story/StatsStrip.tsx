/**
 * StatsStrip - Matches StoryStatsBlock (271:143) from Figma
 * HORIZONTAL layout, 9px itemSpacing, 4px padding, CENTER aligned
 * Background: rgba(43, 42, 48, 1), 10px radius
 */
import styles from './StatsStrip.module.css';

interface StatItemProps {
  label: string;
  value: string;
}

interface StatsStripProps {
  words: string;
  dialogues: string;
  characters: string;
  locations: string;
  acts: string;
  chapters: string;
}

/**
 * Frame 24-29 - VERTICAL layout, CENTER aligned, h=32px
 */
function StatItem({ label, value }: StatItemProps) {
  return (
    <div className={styles.statItem}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}

export default function StatsStrip({
  words,
  dialogues,
  characters,
  locations,
  acts,
  chapters
}: StatsStripProps) {
  return (
    <div className={styles.storyStatsBlock}>
      <StatItem label="Words" value={words} />
      <StatItem label="Dialogues" value={dialogues} />
      <StatItem label="Characters" value={characters} />
      <StatItem label="Locations" value={locations} />
      <StatItem label="Acts" value={acts} />
      <StatItem label="Chapters" value={chapters} />
    </div>
  );
}
