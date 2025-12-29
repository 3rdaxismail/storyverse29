import styles from "./HeaderActions.module.css";

interface HeaderActionsProps {
  onSearch?: () => void;
  onSettings?: () => void;
  onCreate?: () => void;
}

export function GroupHeaderActions({
  onSearch,
  onSettings,
  onCreate,
}: HeaderActionsProps) {
  return (
    <div className={styles.groupHeaderActions}>
      <button
        className={styles.actionButton}
        onClick={onSearch}
        title="Search"
        aria-label="Search"
      >
        <span className={styles.icon}>🔍</span>
      </button>

      <button
        className={styles.actionButton}
        onClick={onCreate}
        title="Create new"
        aria-label="Create new"
      >
        <span className={styles.icon}>➕</span>
      </button>

      <button
        className={styles.actionButton}
        onClick={onSettings}
        title="Settings"
        aria-label="Settings"
      >
        <span className={styles.icon}>⚙️</span>
      </button>
    </div>
  );
}
