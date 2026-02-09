/**
 * WritingActivityHeatmap Component
 * Visualizes user writing activity for the current month and previous 2 months
 * Shows calendar dots: active writing days vs inactive days
 */
import { useMemo } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { useWritingActivity } from '../../hooks/useWritingActivity';
import styles from './WritingActivityHeatmap.module.css';

interface MonthData {
  year: number;
  month: number; // 0-11 (JavaScript month index)
  monthName: string;
  daysInMonth: number;
  firstDayOfWeek: number; // 0-6 (Sunday-Saturday)
}

export default function WritingActivityHeatmap() {
  const { user } = useAuth();
  const { activeDays, storyCount, poemCount, loading } = useWritingActivity();

  // Get the three months to display (current, previous, month before that)
  // Recalculate daily to ensure correct months are shown
  const months = useMemo((): MonthData[] => {
    const now = new Date();
    const result: MonthData[] = [];

    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Get days in month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Get first day of week (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = new Date(year, month, 1).getDay();

      // Month names
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      result.push({
        year,
        month,
        monthName: monthNames[month],
        daysInMonth,
        firstDayOfWeek
      });
    }

    return result;
  }, []); // Empty dependency array - recalculates on mount (daily usage pattern)

  // Format date to YYYY-MM-DD string
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if a specific day is active
  const isDayActive = (year: number, month: number, day: number): boolean => {
    const dateKey = formatDateKey(new Date(year, month, day));
    return activeDays.has(dateKey);
  };

  if (!user) return null;

  return (
    <div className={styles.heatmap}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Recent writing activity</h3>
        <span className={styles.menuDots}>•••</span>
      </div>
      
      <div className={styles.monthsContainer}>
        {months.map((monthData) => (
          <div key={`${monthData.year}-${monthData.month}`} className={styles.monthSection}>
            <div className={styles.monthLabel}>{monthData.monthName}</div>
            
            <div className={styles.calendarGrid}>
              {/* Empty cells for days before the 1st of the month */}
              {Array.from({ length: monthData.firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className={styles.emptyCell} />
              ))}
              
              {/* Actual days of the month */}
              {Array.from({ length: monthData.daysInMonth }, (_, i) => {
                const day = i + 1;
                const isActive = isDayActive(monthData.year, monthData.month, day);
                const date = new Date(monthData.year, monthData.month, day);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div
                    key={day}
                    className={`${styles.dot} ${isActive ? styles.active : styles.inactive}`}
                    title={`${dateStr} - ${isActive ? 'Wrote' : 'No activity'}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.summaryText}>
        <strong>Summary:</strong> {storyCount} {storyCount === 1 ? 'Story' : 'Stories'}, {poemCount} {poemCount === 1 ? 'Poem' : 'Poems'}
      </p>

      {loading && (
        <div className={styles.loading}>Loading activity...</div>
      )}
    </div>
  );
}
