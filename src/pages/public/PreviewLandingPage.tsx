import { useNavigate } from 'react-router-dom';
import styles from './PreviewLandingPage.module.css';

// Figma file ID and node ID for the hero image
const FIGMA_FILE_ID = 'zuWEY4gNbhwescluD1WZAC';
const FIGMA_NODE_ID = '2:3'; // The image node from Figma Preview design

// Use a placeholder image - in production this should be the exported image from Figma
// The image should show with gradient opacity mask
const imgHeroImage = '/storyverse-hero.png.jpg'; // Place your image in /public folder

export function PreviewLandingPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.container} data-node-id="0:3">
      {/* Background gradient overlay */}
      <div className={styles.backgroundGradient} data-node-id="0:4" />
      <div className={styles.overlayGradient} data-node-id="0:5" />

      {/* Hero section with masked image */}
      <div className={styles.heroSection} data-node-id="0:13">
        <>
          <div className={styles.maskedImage} data-node-id="0:15" />
          <div className={styles.imageContainer} data-node-id="2:3">
            <img
              alt="Storyverse hero"
              src={imgHeroImage}
              className={styles.heroImg}
            />
          </div>
        </>
      </div>

      {/* Heading section */}
      <div className={styles.headingSection} data-node-id="0:11">
        <p className={styles.headingMain}>Millions start stories.</p>
        <p className={styles.headingAccent}>Few return to them.</p>
        <p className={styles.headingAccent}>You just did.</p>
      </div>

      {/* Description */}
      <div className={styles.description} data-node-id="0:6">
        <p>Create stories, track your progress,</p>
        <p>and build worlds.</p>
      </div>

      {/* Primary CTA Button */}
      <button className={styles.primaryBtn} data-node-id="18:62" onClick={() => navigate('/signup')}>
        <span className={styles.primaryBtnText}>Get started</span>
      </button>

      {/* Secondary CTA Button */}
      <button className={styles.secondaryBtn} data-node-id="18:61" onClick={() => navigate('/signin')}>
        <span className={styles.secondaryBtnText}>I already have an account</span>
      </button>
    </div>
  );
}
