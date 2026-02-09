import React, { useState } from 'react';
import AppLoader from '../../components/common/AppLoader';
import styles from './LoaderTestPage.module.css';

/**
 * Test page for the AppLoader component
 * Demonstrates different sizes and usage scenarios
 */
const LoaderTestPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`${styles.testPage} ${darkMode ? styles.dark : styles.light}`}>
      <div className={styles.controls}>
        <h1 className={styles.title}>Storyverse App Loader</h1>
        <button 
          className={styles.toggleButton}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'} Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Default Size (120px)</h2>
        <div className={styles.demo}>
          <AppLoader />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Small (80px)</h2>
        <div className={styles.demo}>
          <AppLoader size={80} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Large (200px)</h2>
        <div className={styles.demo}>
          <AppLoader size={200} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Full Page Loading State</h2>
        <div className={styles.fullPageDemo}>
          <AppLoader size={150} />
          <p className={styles.loadingText}>Loading your story...</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>In Card Context</h2>
        <div className={styles.cardDemo}>
          <div className={styles.card}>
            <AppLoader size={60} />
            <p className={styles.cardText}>Processing...</p>
          </div>
          <div className={styles.card}>
            <AppLoader size={60} />
            <p className={styles.cardText}>Generating content...</p>
          </div>
          <div className={styles.card}>
            <AppLoader size={60} />
            <p className={styles.cardText}>Saving draft...</p>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <h3>Implementation Details</h3>
        <ul>
          <li>✅ Pure CSS animation (no JavaScript libraries)</li>
          <li>✅ Uses existing Logo mask.svg</li>
          <li>✅ Diagonal gradient movement</li>
          <li>✅ Smooth fade-in</li>
          <li>✅ Respects prefers-reduced-motion</li>
          <li>✅ Optimized for dark UI</li>
          <li>✅ Transparent background</li>
          <li>✅ Accessible (ARIA labels)</li>
        </ul>
      </div>
    </div>
  );
};

export default LoaderTestPage;
