/**
 * SectionCard - Reusable section wrapper for Character Profile
 */
import styles from './SectionCard.module.css';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  helperIcon?: React.ReactNode;
}

export default function SectionCard({
  title,
  children,
  helperIcon
}: SectionCardProps) {
  return (
    <section className={styles.sectionCard}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {helperIcon && <div className={styles.helperIcon}>{helperIcon}</div>}
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
}
