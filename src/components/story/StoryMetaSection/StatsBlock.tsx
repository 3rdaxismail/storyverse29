/**
 * StatsBlock - Read-only statistics display
 * Matches StoryStatsBlock (271:143) from Figma
 * HORIZONTAL layout, 9px itemSpacing, 4px padding, CENTER aligned
 */
import styles from './StatsBlock.module.css';

interface StatItemProps {
  label: string;
  value: string;
}

interface StatsBlockProps {
  words: string;
  dialogues: string;
  characters: string;
  locations: string;
  acts: string;
  chapters: string;
}

/**
 * StatItem - Frame 24-29 from Figma
 * VERTICAL layout, CENTER aligned, h=32px
 */
function StatItem({ label, value }: StatItemProps) {
  return (
    <div className={styles.statItem}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}

export default function StatsBlock({
  words,
  dialogues,
  characters,
  locations,
  acts,
  chapters
}: StatsBlockProps) {
  return (
    <div className={styles.statsBlock}>
      <StatItem label="Words" value={words} />
      <StatItem label="Dialogues" value={dialogues} />
      <StatItem label="Characters" value={characters} />
      <StatItem label="Locations" value={locations} />
      <StatItem label="Acts" value={acts} />
      <StatItem label="Chapters" value={chapters} />
    </div>
  );
}
