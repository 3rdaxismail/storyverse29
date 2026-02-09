import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateProjectPage.module.css';
import ScreenLayout from '../ScreenLayout';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import Toast from '../../components/common/Toast';
import writingEngine from '../../engine/WritingSessionEngine';
import { canCreateStory, canCreatePoem } from '../../firebase/services/contentLimits';
import { useAuth } from '../../firebase/AuthContext';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'warning' | 'error' | 'success' | 'info'>('warning');

  /**
   * Create a new story and navigate to story editor
   */
  const handleCreateStory = async () => {
    if (!user) {
      console.error('No user logged in');
      setToastMessage('Please log in to create a story');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      setIsCreating(true);

      // Check if user can create a new story
      const limitCheck = await canCreateStory(user.uid);
      if (!limitCheck.allowed) {
        setToastMessage(limitCheck.message || 'Story limit reached');
        setToastType('warning');
        setShowToast(true);
        setIsCreating(false);
        return;
      }

      // Create new story with unique ID
      const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await writingEngine.initStory(storyId);
      
      // Navigate to story editor
      navigate(`/editor/story/${storyId}`);
    } catch (error) {
      console.error('Error creating story:', error);
      setIsCreating(false);
    }
  };

  /**
   * Create a new poem and navigate to poem editor
   */
  const handleCreatePoem = async () => {
    if (!user) {
      console.error('No user logged in');
      setToastMessage('Please log in to create a poem');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      setIsCreating(true);

      // Check if user can create a new poem
      const limitCheck = await canCreatePoem(user.uid);
      if (!limitCheck.allowed) {
        setToastMessage(limitCheck.message || 'Poem limit reached');
        setToastType('warning');
        setShowToast(true);
        setIsCreating(false);
        return;
      }

      // Create new poem with unique ID
      const poemId = `poem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await writingEngine.initPoem(poemId, 'poem');
      
      // Navigate to poem editor
      navigate(`/poem/editor?id=${poemId}`);
    } catch (error) {
      console.error('Error creating poem:', error);
      setIsCreating(false);
    }
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <ScreenLayout>
        <div className={styles.createRoot}>
          <h1 className={styles.question}>Loading...</h1>
        </div>
        <BottomNavigation activeTab="write" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <div className={styles.createRoot}>
        <h1 className={styles.question}>What do you want to create?</h1>
        
        <div className={styles.options}>
          <button
            className={styles.card}
            onClick={handleCreateStory}
            disabled={isCreating}
          >
            <span className={styles.cardTitle}>Story</span>
          </button>
          <button
            className={styles.card}
            onClick={handleCreatePoem}
            disabled={isCreating}
          >
            <span className={styles.cardTitle}>Poem / Lyrics</span>
          </button>
        </div>
      </div>
      <BottomNavigation activeTab="write" />
      
      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
      />
    </ScreenLayout>
  );
}
