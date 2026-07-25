/**
 * HeroTitles Component
 * Displays rotating inspirational titles from Google Sheets
 * Auto-rotates every 5 seconds with smooth transitions
 * Synced with DashboardBackground image crossfades via useSyncedRotation hook
 * 
 * Always displays a title - uses fallback if fetch fails
 */
import { useState, useEffect } from 'react';
import { useSyncedRotation, registerComponentItemCount, getComponentRotationIndex } from '../../hooks/useSyncedRotation';
import styles from './HeroTitles.module.css';

const SPREADSHEET_ID = '1LpPKHoUJO-ydfLjQT6UWG7z3GCqrSvv1mcp6U4_CASg';

interface HeroTitle {
  line1: string;
  line2: string;
}

// Fallback titles if Google Sheets fetch fails
// These are stable, inspirational, and will always render
const FALLBACK_TITLES: HeroTitle[] = [
  { line1: "Craft the Epic.", line2: "One Scene at a Time." },
  { line1: "Every Word Matters.", line2: "Every Story Lives." },
  { line1: "Transform Ideas into", line2: "Immortal Tales." },
  { line1: "Write Today.", line2: "Inspire Tomorrow." },
  { line1: "Your Voice.", line2: "Your Story." }
];

export default function HeroTitles() {
  const [titles, setTitles] = useState<HeroTitle[]>(FALLBACK_TITLES);
  const [isLoading, setIsLoading] = useState(true);
  const { rotation, fadeIn } = useSyncedRotation();

  // Register item count with shared rotation system
  useEffect(() => {
    registerComponentItemCount('hero-titles', titles.length);
  }, [titles.length]);

  // Fetch titles from Google Sheets with timeout protection
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchTitles = async () => {
      try {
        console.log('[HeroTitles] Fetching titles from Google Sheets...');
        
        // Set a 6-second timeout to prevent hanging
        const controller = new AbortController();
        const fetchTimeoutId = setTimeout(() => {
          console.warn('[HeroTitles] Fetch timeout, using fallback');
          controller.abort();
        }, 6000);

        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`,
          { signal: controller.signal }
        );

        clearTimeout(fetchTimeoutId);
        
        if (!response.ok) {
          console.warn('[HeroTitles] Failed to fetch from Google Sheets:', response.statusText);
          if (isMounted) setIsLoading(false);
          return;
        }

        const csvText = await response.text();
        const rows = csvText.split('\n').filter(row => row.trim());
        
        const fetchedTitles: HeroTitle[] = rows
          .map(row => {
            // Simple CSV parsing (handles basic cases)
            const columns = row.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
            return {
              line1: columns[0] || '',
              line2: columns[1] || ''
            };
          })
          .filter(title => title.line1 && title.line2); // Only include complete titles

        if (isMounted) {
          if (fetchedTitles.length > 0) {
            console.log('[HeroTitles] Successfully fetched', fetchedTitles.length, 'titles');
            setTitles(fetchedTitles);
          } else {
            console.warn('[HeroTitles] No valid titles in sheet, using fallback');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[HeroTitles] Error fetching titles:', error);
        // Continue using fallback titles - never render blank
        if (isMounted) {
          console.log('[HeroTitles] Using fallback titles');
          setIsLoading(false);
        }
      }
    };

    fetchTitles();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Auto-rotate titles synchronized with DashboardBackground
  // Timing is managed by useSyncedRotation hook (5 second interval)
  const currentIndex = getComponentRotationIndex('hero-titles');

  return (
    <div className={styles.heroContainer}>
      <h1 className={`${styles.heroTitle} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
        <span className={styles.line1}>{titles[currentIndex].line1}</span>
        <span className={styles.line2}>{titles[currentIndex].line2}</span>
      </h1>
    </div>
  );
}
