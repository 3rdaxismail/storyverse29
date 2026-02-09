import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import ScreenLayout from '../ScreenLayout';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import CommunityShell from './CommunityShell';

function CommunityPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auth guard: redirect to sign-in if not authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Don't render community until auth is confirmed
  if (!auth.currentUser) {
    return null;
  }

  return (
    <ScreenLayout>
      <CommunityShell />
      <BottomNavigation activeTab="community" />
    </ScreenLayout>
  );
}

export default CommunityPage;
