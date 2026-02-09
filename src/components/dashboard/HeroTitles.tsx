/**
 * HeroTitles Component
 * Displays rotating inspirational titles from Google Sheets
 * Auto-rotates every 10 seconds with smooth transitions
 */
import { useState, useEffect } from 'react';
import styles from './HeroTitles.module.css';

const SPREADSHEET_ID = '1LpPKHoUJO-ydfLjQT6UWG7z3GCqrSvv1mcp6U4_CASg';

interface HeroTitle {
  line1: string;
  line2: string;
}

// Fallback titles if Google Sheets fetch fails
const FALLBACK_TITLES: HeroTitle[] = [
  { line1: "Craft the Epic.", line2: "One Scene at a Time." },
  { line1: "Every Word Matters.", line2: "Every Story Lives." },
  { line1: "Transform Ideas into", line2: "Immortal Tales." },
  { line1: "Write Today.", line2: "Inspire Tomorrow." },
  { line1: "Your Voice.", line2: "Your Story." }
];

export default function HeroTitles() {
  const [titles, setTitles] = useState<HeroTitle[]>(FALLBACK_TITLES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Fetch titles from Google Sheets
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        // Use CSV export which works for public sheets
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`
        );
        
        if (!response.ok) {
          console.warn('[HeroTitles] Failed to fetch from Google Sheets, using fallback');
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

        if (fetchedTitles.length > 0) {
          setTitles(fetchedTitles);
        }
      } catch (error) {
        console.error('[HeroTitles] Error fetching titles:', error);
        // Continue using fallback titles
      }
    };

    fetchTitles();
  }, []);

  // Auto-rotate titles every 10 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setFade(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % titles.length);
        setFade(true);
      }, 300); // Wait for fade out before changing
    }, 10000); // 10 seconds

    return () => clearInterval(rotationInterval);
  }, [titles.length]);

  return (
    <div className={styles.heroContainer}>
      <h1 className={`${styles.heroTitle} ${fade ? styles.fadeIn : styles.fadeOut}`}>
        <span className={styles.line1}>{titles[currentIndex].line1}</span>
        <span className={styles.line2}>{titles[currentIndex].line2}</span>
      </h1>
    </div>
  );
}
