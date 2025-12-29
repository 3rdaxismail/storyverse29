import React, { useMemo } from 'react';
import styles from './ActivityHeatmap.module.css';

interface HeatmapData {
  [date: string]: number; // 0-5: activity level (0 = none, 5 = max)
}

interface ActivityHeatmapProps {
  data?: HeatmapData;
  year?: number;
  months?: number[]; // [0-11] for Jan, Feb, Mar
  className?: string | undefined;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Get the number of days in a month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the starting day of the week for a month (0 = Sunday)
 */
function getStartingDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Generate array of dates for a month with day-of-week information
 */
function generateMonthDates(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getStartingDayOfMonth(year, month);

  const dates = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < startingDay; i++) {
    dates.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push({
      day,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dayOfWeek: (startingDay + day - 1) % 7,
    });
  }

  return dates;
}

/**
 * Create a 7-row grid from dates (7 = days of week)
 */
function organizeIntoGrid(dates: any[]) {
  const grid: (any | null)[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    grid.push(dates.slice(i, i + 7));
  }
  return grid;
}

/**
 * Activity level to class name mapping
 */
function getActivityClass(level: number): string {
  switch (level) {
    case 5:
      return styles.active5 || '';
    case 4:
      return styles.active4 || '';
    case 3:
      return styles.active3 || '';
    case 2:
      return styles.active2 || '';
    case 1:
      return styles.active1 || '';
    default:
      return styles.inactive || '';
  }
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data = {}, // Empty by default - all dots inactive
  year = new Date().getFullYear(),
  months = [0, 1, 2], // January, February, March by default
  className = '',
}) => {
  const monthGrids = useMemo(() => {
    return months.map((month) => {
      const dates = generateMonthDates(year, month);
      return {
        month,
        name: MONTH_NAMES[month],
        grid: organizeIntoGrid(dates),
      };
    });
  }, [year, months]);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Heatmap Grid */}
      <div className={styles.heatmapGrid}>
        {monthGrids.map(({ month, name, grid }) => (
          <div key={`month-${month}`} className={styles.monthSection}>
            {/* Month Label */}
            <div className={styles.monthLabel}>{name}</div>

            {/* Day of Week Headers (abbreviated) */}
            <div className={styles.dayHeaders}>
              {DAY_NAMES.map((day) => (
                <div key={`day-${day}`} className={styles.dayHeader}>
                  {day.charAt(0)}
                </div>
              ))}
            </div>

            {/* Dots Grid */}
            <div className={styles.dotsContainer}>
              {grid.map((week, weekIndex) => (
                <div key={`week-${month}-${weekIndex}`} className={styles.weekRow}>
                  {week.map((dateObj, dayIndex) => {
                    if (!dateObj) {
                      // Empty slot (day from previous/next month)
                      return (
                        <div
                          key={`empty-${month}-${weekIndex}-${dayIndex}`}
                          className={styles.dotSlot}
                        >
                          {/* Empty */}
                        </div>
                      );
                    }

                    const { date } = dateObj;
                    const activity = data[date] || 0;
                    const activityClass = getActivityClass(activity);

                    return (
                      <div
                        key={`dot-${date}`}
                        className={`${styles.dotSlot}`}
                        title={`${date}: Activity level ${activity}`}
                      >
                        <div className={`${styles.dot} ${activityClass}`} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Activity:</span>
        <div className={`${styles.dot} ${styles.inactive}`} />
        <span className={styles.legendText}>None</span>

        <div className={`${styles.dot} ${styles.active1}`} />
        <span className={styles.legendText}>Low</span>

        <div className={`${styles.dot} ${styles.active3}`} />
        <span className={styles.legendText}>Medium</span>

        <div className={`${styles.dot} ${styles.active5}`} />
        <span className={styles.legendText}>High</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
