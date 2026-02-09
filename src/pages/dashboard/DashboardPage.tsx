
import styles from './DashboardPage.module.css';
import ScreenLayout from '../ScreenLayout';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import HeroTitles from '../../components/dashboard/HeroTitles';
import StatsCards from '../../components/dashboard/StatsCards';
import WritingActivityHeatmap from '../../components/dashboard/WritingActivityHeatmap';
import CommunityActivity from '../../components/dashboard/CommunityActivity';
import TrendingFeed from '../../components/dashboard/TrendingFeed';
import PWAInstallPrompt from '../../components/pwa/PWAInstallPrompt';
import IOSInstallPrompt from '../../components/pwa/IOSInstallPrompt';


export default function DashboardPage() {
  
  return (
    <ScreenLayout>
      <div className={styles.dashboardRoot}>
        {/* Hero Section with Rotating Titles */}
        <HeroTitles />
        
        {/* Stats Cards */}
        <StatsCards />
        
        {/* Writing Activity Heatmap */}
        <WritingActivityHeatmap />
        
        {/* Community Activity */}
        <CommunityActivity />
        
        {/* Trending Feed */}
        <TrendingFeed />
        
        {/* PWA Install Prompts (shows only one based on platform) */}
        <PWAInstallPrompt />
        <IOSInstallPrompt />
      </div>
      <BottomNavigation activeTab="home" />
    </ScreenLayout>
  );
}
