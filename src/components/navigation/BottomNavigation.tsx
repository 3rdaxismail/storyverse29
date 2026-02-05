/**
 * BottomNavigation - Floating bottom navigation footer
 * Mobile-first design matching Figma specifications
 * Fixed positioning at bottom of viewport with pill-shaped container
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import styles from './BottomNavigation.module.css';

// Import SVG icons
import iconHome from '../../assets/icon-home.svg';
import iconMyPage from '../../assets/my page.svg';
import iconWrite from '../../assets/icon-write.svg';
import communityRead from '../../assets/community_read.svg';
import trendingRead from '../../assets/trending_read.svg';

type NavTab = 'home' | 'stories' | 'write' | 'community' | 'trending' | 'inbox';

interface BottomNavigationProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}


export default function BottomNavigation({ 
  activeTab = 'write',
  onTabChange 
}: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUserProfile();
  const [currentTab, setCurrentTab] = useState<NavTab>(activeTab);

  // Sync tab with route
  useEffect(() => {
    if (location.pathname.startsWith('/community')) {
      setCurrentTab('community');
    } else if (location.pathname.startsWith('/inbox')) {
      setCurrentTab('stories');
    } else if (location.pathname.startsWith('/editor/story') || location.pathname.startsWith('/poem/editor')) {
      setCurrentTab('write');
    } else if (location.pathname === '/' || location.pathname.startsWith('/dashboard')) {
      setCurrentTab('home');
    } else if (location.pathname.startsWith('/story/view') || location.pathname.startsWith('/poem/view')) {
      setCurrentTab('stories');
    } else if (location.pathname.startsWith('/trending')) {
      setCurrentTab('trending');
    }
  }, [location.pathname]);

  const handleTabClick = (tab: NavTab) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
    // Route navigation
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'stories':
        navigate(`/profile/${profile.displayName || 'profile'}`);
        break;
      case 'write':
        navigate('/create');
        break;
      case 'community':
        navigate('/community', { state: { openDrawer: true } });
        break;
      case 'trending':
        navigate('/trending');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.footerContainer}>
      <nav className={styles.navigation} role="navigation" aria-label="Main navigation">
        {/* Home */}
        <button
          className={`${styles.navItem} ${currentTab === 'home' ? styles.active : ''}`}
          onClick={() => handleTabClick('home')}
          aria-label="Home"
          aria-current={currentTab === 'home' ? 'page' : undefined}
        >
          <img src={iconHome} alt="" width="24" height="23" />
        </button>

        {/* Stories / Folder */}
        <button
          className={`${styles.navItem} ${currentTab === 'stories' ? styles.active : ''}`}
          onClick={() => handleTabClick('stories')}
          aria-label="Stories"
          aria-current={currentTab === 'stories' ? 'page' : undefined}
        >
          <img src={iconMyPage} alt="" width="26" height="21" />
        </button>

        {/* Write (Center CTA) */}
        <button
          className={`${styles.navItemWrite} ${currentTab === 'write' ? styles.active : ''}`}
          onClick={() => handleTabClick('write')}
          aria-label="Write"
          aria-current={currentTab === 'write' ? 'page' : undefined}
        >
          <div className={styles.writeButton}>
            <img src={iconWrite} alt="" width="39" height="39" />
          </div>
        </button>

        {/* Community */}
        <button
          className={`${styles.navItem} ${currentTab === 'community' ? styles.active : ''}`}
          onClick={() => handleTabClick('community')}
          aria-label="Community"
          aria-current={currentTab === 'community' ? 'page' : undefined}
        >
          <img 
            src={communityRead} 
            alt="" 
            width="23" 
            height="28" 
          />
        </button>

        {/* Trending */}
        <button
          className={`${styles.navItem} ${currentTab === 'trending' ? styles.active : ''}`}
          onClick={() => handleTabClick('trending')}
          aria-label="Trending"
          aria-current={currentTab === 'trending' ? 'page' : undefined}
        >
          <img 
            src={trendingRead} 
            alt="" 
            width="26" 
            height="35" 
          />
        </button>
      </nav>
    </div>
  );
}
