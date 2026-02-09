import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import HeaderBar from '../../components/header/HeaderBar';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import { ShareModal, ProjectCover, CoverImageCropper } from '../../components/common';
import PoemIdentityHeader from '../../components/poem/PoemIdentityHeader';
import writingSessionEngine from '../../engine/WritingSessionEngine';
import { usePoemEngine } from '../../hooks/useWritingEngine';
import { useAuth } from '../../firebase/AuthContext';
import { exportPoemAsPDF } from '../../utils/exportStoryPDF';
import styles from './PoemEditorPage.module.css';

// Poem Genre Options
const POEM_GENRES = [
  'Abstract',
  'Anxious',
  'Bittersweet',
  'Body Horror',
  'Cinematic',
  'Romance',
  'Confessional',
  'Cozy & Warm',
  'Cyberpunk/Futuristic',
  'Dark & Macabre',
  'Dreamy/Ethereal',
  'Empowering',
  'Existential Crisis',
  'Experimental',
  'Fairy-Tale/Fable',
  'Feminist/Political',
  'Folklore & Myth',
  'Gothic',
  'Grief & Loss',
  'Healing/Growth',
  'Heartbreak',
  'High-Energy/Chaotic',
  'Historical',
  'Hopeful',
  'Inspirational',
  'Intense/Aggressive',
  'Kids',
  'Loneliness',
  'Love',
  'Longing/Desire',
  'Lyrical/Song-like',
  'Melancholic',
  'Midnight Thoughts',
  'Minimalist',
  'Motivational',
  'Mystical/Spiritual',
  'Nature/Wilderness',
  'Nostalgic',
  'Peaceful/Serene',
  'Philosophical',
  'Protest/Rebellion',
  'Rainy Day',
  'Raw/Unfiltered',
  'Sarcastic/Witty',
  'Social Justice',
  'Spoken Word',
  'Stream of Consciousness',
  'Surrealist',
  'Travel/Wanderlust',
  'Uplifting',
  'Urban/City Life',
  'Whimsical',
  'War'
];

export default function PoemEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userProfile } = useAuth();
  const isOnline = useOnlineStatus();
  
  // Get poem ID from URL query parameter, fallback to generated ID if not present
  const [poemId] = useState(() => 
    searchParams.get('id') || `poem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  // UI-only state (NOT content data)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Subscribe to engine state - this is the ONLY source of content truth
  const poemState = usePoemEngine();

  // Initialize engine on mount
  useEffect(() => {
    console.log('[PoemEditorPage] 🔧 Initializing engine with poemId:', poemId);
    // Initialize engine asynchronously
    writingSessionEngine.initPoem(poemId, 'poem').catch((error) => {
      console.error('[PoemEditorPage] Failed to initialize poem:', error);
    });
  }, [poemId]);

  // Derived data from engine state
  const text = poemState?.text || '';
  const title = poemState?.title || '';
  const privacy = poemState?.privacy || '';
  const genre = poemState?.genre || '';
  const coverImageUrl = poemState?.coverImageUrl || '';
  
  // Calculate max words in line
  const calculateMaxWordsInLine = (poemText: string): number => {
    if (!poemText.trim()) return 0;
    const lines = poemText.split('\n');
    let maxWords = 0;
    for (const line of lines) {
      const wordCount = line.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > maxWords) {
        maxWords = wordCount;
      }
    }
    return maxWords;
  };
  
  const stats = poemState ? {
    lines: poemState.lineCount,
    stanzas: poemState.stanzaCount,
    words: poemState.wordCount,
    maxWordsInLine: calculateMaxWordsInLine(text),
    readTime: poemState.readTime
  } : { lines: 0, stanzas: 0, words: 0, maxWordsInLine: 0, readTime: 0 };

  const handleViewPoem = () => {
    // CRITICAL: Only allow viewing if poem has been saved
    if (!poemId) {
      alert('Save your poem to preview it');
      return;
    }
    
    // Navigate to reader mode with poem ID
    navigate(`/poem/view/${poemId}?preview=true`);
  };

  const handleOpenDropdown = (dropdownName: string) => {
    setOpenDropdown(dropdownName || null);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  // Generate shareable URL for the poem
  const shareUrl = `${window.location.origin}/poem/view/${poemId}`;

  // Cover image handlers
  const handleCoverUpload = (file: File) => {
    setCoverImageFile(file);
  };

  const handleCoverSave = (imageDataUrl: string) => {
    // Generate unique ID for cover image
    const coverImageId = `poemCover_${Date.now()}`;
    
    // Delete old cover image if exists
    const oldCoverImageId = localStorage.getItem(`storyverse:poem:${poemId}:coverImageId`);
    if (oldCoverImageId && oldCoverImageId !== coverImageId) {
      const oldImageKey = `storyverse:image:${oldCoverImageId}`;
      localStorage.removeItem(oldImageKey);
    }
    
    // Store new image in localStorage
    const imageKey = `storyverse:image:${coverImageId}`;
    localStorage.setItem(imageKey, imageDataUrl);
    localStorage.setItem(`storyverse:poem:${poemId}:coverImageId`, coverImageId);
    
    // Update engine state (which triggers auto-save)
    writingSessionEngine.setPoemCoverImage(imageDataUrl);
    setCoverImageFile(null);
    
    console.log('[PoemEditorPage] Cover image saved:', coverImageId);
  };

  const handleCoverDelete = () => {
    // Delete image from storage
    const coverImageId = localStorage.getItem(`storyverse:poem:${poemId}:coverImageId`);
    if (coverImageId) {
      const imageKey = `storyverse:image:${coverImageId}`;
      localStorage.removeItem(imageKey);
      localStorage.removeItem(`storyverse:poem:${poemId}:coverImageId`);
    }
    
    // Update engine state
    writingSessionEngine.setPoemCoverImage('');
  };

  const handleCoverCancel = () => {
    setCoverImageFile(null);
  };

  // Content change handlers - dispatch to engine
  const handleTextChange = (newText: string) => {
    writingSessionEngine.setPoemText(newText);
  };

  const handleTitleChange = (newTitle: string) => {
    writingSessionEngine.setPoemTitle(newTitle);
  };

  const handlePrivacyChange = (newPrivacy: string) => {
    writingSessionEngine.setPoemPrivacy(newPrivacy);
  };

  const handleGenreChange = (newGenre: string) => {
    writingSessionEngine.setPoemGenre(newGenre);
  };

  // Export poem as PDF
  const handleExportPDF = async () => {
    try {
      // Show loading notification
      showNotification('Preparing PDF export...', 'info');
      
      // Get author name from userProfile (more reliable than user.displayName)
      const authorName = userProfile?.displayName || user?.displayName || 'Unknown Author';

      // Prepare data for PDF export
      const pdfData = {
        title: title || 'Untitled Poem',
        authorName: authorName,
        text: text,
        // Stats
        wordCount: stats.words,
        lineCount: stats.lines,
        stanzaCount: stats.stanzas,
        readTime: stats.readTime,
        genre: genre,
        coverImageUrl: coverImageUrl
      };

      await exportPoemAsPDF(pdfData);
      showNotification('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('[Export PDF] Error:', error);
      showNotification('Failed to export PDF. Please try again.', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className={styles.poemEditorRoot}>
      <HeaderBar />
      <div className={styles.content}>
        {/* Project Cover - above title */}
        <ProjectCover
          coverImageUrl={coverImageUrl}
          onUpload={handleCoverUpload}
          onDelete={handleCoverDelete}
          projectType="poem"
        />
        
        <PoemIdentityHeader
          privacy={privacy}
          onPrivacyChange={handlePrivacyChange}
          genre={genre}
          genreOptions={POEM_GENRES}
          onGenreChange={handleGenreChange}
          onViewPoem={handleViewPoem}
          onOpenDropdown={handleOpenDropdown}
          openDropdown={openDropdown}
          onShareClick={handleShareClick}
        />
        
        <div className={styles.titleInputBlock}>
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Poem title"
            aria-label="Poem title"
          />
        </div>
        
        <div className={styles.statsStrip}>
          <div className={styles.statItem}><span>Lines</span><span>{stats.lines}</span></div>
          <div className={styles.statItem}><span>Stanzas</span><span>{stats.stanzas}</span></div>
          <div className={styles.statItem}><span>Words</span><span>{stats.words}</span></div>
          <div className={styles.statItem}><span>Max words in line</span><span>{stats.maxWordsInLine}</span></div>
          <div className={styles.statItem}><span>Read time</span><span>{stats.readTime > 0 ? `${stats.readTime} min` : '--'}</span></div>
        </div>
        
        <div className={styles.card}>
          <textarea
            className={styles.poemTextarea}
            placeholder="Start writing your poem or lyrics..."
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            rows={12}
            spellCheck
            autoFocus
            readOnly={!isOnline}
            style={!isOnline ? { 
              resize: 'vertical', 
              minHeight: 180, 
              cursor: 'not-allowed', 
              opacity: 0.6 
            } : { 
              resize: 'vertical', 
              minHeight: 180 
            }}
          />
        </div>
        
        <button 
          className={styles.exportPdfBtn}
          onClick={handleExportPDF}
          title="Export as PDF"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Export PDF</span>
        </button>
      </div>
      <BottomNavigation activeTab="write" />
      
      {/* Notification Toast */}
      {notification && (
        <div 
          className={styles.notificationToast}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {notification.message}
        </div>
      )}
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        shareUrl={shareUrl}
        title={title || 'Untitled Poem'}
        type="poem"
      />
      
      {coverImageFile && (
        <CoverImageCropper
          imageFile={coverImageFile}
          onSave={handleCoverSave}
          onCancel={handleCoverCancel}
        />
      )}
    </div>
  );
}
