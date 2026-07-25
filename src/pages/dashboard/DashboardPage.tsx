
import { useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import styles from './DashboardPage.module.css';
import ScreenLayout from '../ScreenLayout';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import HeroTitles from '../../components/dashboard/HeroTitles';
import StatsCards from '../../components/dashboard/StatsCards';
import WritingActivityHeatmap from '../../components/dashboard/WritingActivityHeatmap';
import CommunityActivity from '../../components/dashboard/CommunityActivity';
import RecentlyEdited from '../../components/dashboard/RecentlyEdited';
import TrendingFeed from '../../components/dashboard/TrendingFeed';
import PWAInstallPrompt from '../../components/pwa/PWAInstallPrompt';
import IOSInstallPrompt from '../../components/pwa/IOSInstallPrompt';
import DashboardBackground from '../../components/dashboard/DashboardBackground';
import DashboardErrorBoundary from '../../components/dashboard/DashboardErrorBoundary';

export default function DashboardPage() {
  const { setIsAuthLoading } = useAuth();

  useEffect(() => {
    // Hide auth loading overlay when dashboard is fully rendered
    // This indicates auth is complete and all data is loaded
    setIsAuthLoading(false);
  }, [setIsAuthLoading]);
  
  return (
    <DashboardErrorBoundary>
      <ScreenLayout>
        {/* 
          Cinematic Background Layer
          Always rendered - no network quality gate needed
          Crossfade synced with HeroTitles rotation every 5 seconds
          Loaded asynchronously after main dashboard content
        */}
        <DashboardBackground />

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
          
          {/* Recently Edited Content */}
          <RecentlyEdited />
          
          {/* PWA Install Prompts (shows only one based on platform) */}
          <PWAInstallPrompt />
          <IOSInstallPrompt />
        </div>
        <BottomNavigation activeTab="home" />
      </ScreenLayout>
    </DashboardErrorBoundary>
  );
}
