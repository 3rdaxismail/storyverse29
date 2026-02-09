/**
 * StoryReaderPage - Beautiful mobile-first story reader
 * Features cover image, title overlay, and immersive reading experience
 */
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import HeaderBar from '../../components/header/HeaderBar';
import PublicHeader from '../../components/header/PublicHeader';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import ReaderActionBar from '../../components/reader/ReaderActionBar';
import ShareModal from '../../components/common/ShareModal';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getStory, loadActsAndChapters, loadChapterContent } from '../../firebase/services/storiesService';
import { 
  toggleStoryLike, 
  hasUserLikedStory, 
  addStoryComment, 
  getStoryComments 
} from '../../firebase/services/engagementService';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './StoryReaderPage.css';

interface Chapter {
  chapterId: string;
  title: string;
  content: string;
}

interface Act {
  actId: string;
  title: string;
  chapters: Chapter[];
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export default function StoryReaderPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get('preview') === 'true';
  const { profile } = useUserProfile();

  const [storyTitle, setStoryTitle] = useState('');
  const [primaryGenre, setPrimaryGenre] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [readingTime, setReadingTime] = useState(0);
  const [authorName, setAuthorName] = useState('Unknown Author');
  const [authorUid, setAuthorUid] = useState<string | null>(null);
  const [authorUsername, setAuthorUsername] = useState<string | null>(null);
  const [acts, setActs] = useState<Act[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkIndex, setBookmarkIndex] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentsCount, setCommentsCount] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  // Privacy and public view state
  const [storyPrivacy, setStoryPrivacy] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  
  // Determine if this is public view mode
  const isPublicView = !isAuthenticated && storyPrivacy.toLowerCase() === 'trending';

  // Set noindex meta tag for preview mode
  useEffect(() => {
    if (isPreview) {
      // Add noindex meta tag
      const metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      metaRobots.content = 'noindex';
      document.head.appendChild(metaRobots);

      // Cleanup on unmount
      return () => {
        document.head.removeChild(metaRobots);
      };
    }
  }, [isPreview]);

  // Set page title
  useEffect(() => {
    if (storyTitle) {
      document.title = `${storyTitle} - Storyverse`;
    }
    return () => {
      document.title = 'Storyverse';
    };
  }, [storyTitle]);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[StoryReaderPage] Auth state changed:', { isAuthenticated: !!user });
      setIsAuthenticated(!!user);
      setAuthInitialized(true);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // CRITICAL: Wait for auth to initialize before loading story
    if (!authInitialized) {
      return;
    }
    
    if (!storyId) {
      setError('No story ID provided');
      setLoading(false);
      return;
    }
    
    const loadStoryData = async () => {
      try {
        // Get current user after auth initialization
        const user = auth.currentUser;
        
        // Load story metadata from Firestore
        const story = await getStory(storyId);
        
        if (!story) {
          setError('Story not found');
          setLoading(false);
          return;
        }
        
        // Store privacy for public view logic
        const privacyValue = story.privacy || '';
        setStoryPrivacy(privacyValue);
        
        console.log('[StoryReaderPage] Story loaded:', {
          storyId,
          privacy: privacyValue,
          privacyLower: privacyValue.toLowerCase(),
          isAuthenticated: !!user,
          isTrending: privacyValue.toLowerCase() === 'trending'
        });
        
        // Privacy enforcement for non-authenticated users
        if (!user && privacyValue.toLowerCase() !== 'trending') {
          console.log('[StoryReaderPage] Blocking non-public story for unauthenticated user');
          setError('This story is not publicly available. Please sign in to view.');
          setLoading(false);
          return;
        }
        
        console.log('[StoryReaderPage] Access granted - loading story content');

        // Check authorization for preview mode
        if (isPreview) {
          // In preview mode, verify current user is the author
          if (!user || story.uid !== user.uid) {
            setError('Unauthorized: You can only preview your own stories');
            setLoading(false);
            return;
          }
        }

        setStoryTitle(story.storyTitle || 'Untitled Story');
        setPrimaryGenre(story.primaryGenre || '');
        setCoverImageUrl(story.coverImageUrl || '');
        setReadingTime(story.readingTime || 0);
        
        // Load real engagement stats from story data
        setLikes(story.likesCount || 0);
        setCommentsCount(story.commentsCount || 0);
        
        // Only load user-specific data if authenticated
        if (user) {
          // Check if current user has liked this story
          const userHasLiked = await hasUserLikedStory(storyId);
          setIsLiked(userHasLiked);
        }
        
        // Load author name and username from user profile
        if (story.uid) {
          setAuthorUid(story.uid);
          
          // Fetch author profile for name and username
          try {
            const userDoc = await getDoc(doc(db, 'users', story.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setAuthorName(story.authorName || userData.displayName || 'Unknown Author');
              setAuthorUsername(userData.displayName || null); // Use displayName as username
            }
          } catch (err) {
            console.warn('[StoryReaderPage] Could not load author profile:', err);
            setAuthorName(story.authorName || 'Unknown Author');
          }
        } else {
          setAuthorName(story.authorName || 'Unknown Author');
        }
        
        // Load acts and chapters from Firestore
        const { acts: loadedActs, chapters: loadedChapters } = await loadActsAndChapters(storyId);
        
        // Transform data for reader view - load actual chapter text
        const readerActs: Act[] = await Promise.all(
          loadedActs.map(async (act) => ({
            actId: act.actId,
            title: act.actTitle || 'Untitled Act',
            chapters: await Promise.all(
              loadedChapters
                .filter(ch => ch.actId === act.actId)
                .sort((a, b) => a.chapterOrder - b.chapterOrder)
                .map(async (ch) => {
                  // Load the actual chapter text content from Firestore
                  const chapterContent = await loadChapterContent(storyId, ch.chapterId);
                  return {
                    chapterId: ch.chapterId,
                    title: ch.chapterTitle || 'Untitled Chapter',
                    content: chapterContent?.text || ''
                  };
                })
            )
          }))
        );

        setActs(readerActs);
        
        // Calculate total word count
        const totalWords = readerActs.reduce((total, act) => {
          return total + act.chapters.reduce((actTotal, chapter) => {
            const words = chapter.content.split(/\s+/).filter(w => w.trim()).length;
            return actTotal + words;
          }, 0);
        }, 0);
        setWordCount(totalWords);
        
        setLoading(false);
      } catch (err) {
        console.error('[StoryReaderPage] Error loading story:', err);
        setError('Failed to load story');
        setLoading(false);
      }
    };

    loadStoryData();
  }, [storyId, isPreview, authInitialized]);

  // Load saved bookmark on mount
  useEffect(() => {
    if (!storyId) return;
    
    const savedBookmark = localStorage.getItem(`storyverse:bookmark:story:${storyId}`);
    if (savedBookmark) {
      const index = parseInt(savedBookmark);
      setBookmarkIndex(index);
      setIsSaved(true);
    }
  }, [storyId]);

  // Load comments from Firestore
  useEffect(() => {
    if (!storyId) return;
    
    const loadComments = async () => {
      try {
        const firestoreComments = await getStoryComments(storyId);
        
        // Map Firestore comments to display format
        const displayComments = firestoreComments.map(comment => {
          // Handle Timestamp properly
          let timestampValue = Date.now();
          if (comment.createdAt) {
            if (typeof comment.createdAt.toMillis === 'function') {
              timestampValue = comment.createdAt.toMillis();
            } else if (typeof comment.createdAt.toDate === 'function') {
              timestampValue = comment.createdAt.toDate().getTime();
            } else if (comment.createdAt.seconds) {
              timestampValue = comment.createdAt.seconds * 1000;
            }
          }
          
          return {
            id: comment.id,
            author: comment.authorName,
            avatar: comment.authorPhotoURL || '',
            text: comment.text,
            timestamp: timestampValue
          };
        });
        
        setComments(displayComments);
        // Update count with actual comments loaded (fixes stale count issue)
        setCommentsCount(displayComments.length);
        console.log('[StoryReader] Loaded', displayComments.length, 'comments from Firestore');
      } catch (error) {
        console.error('[StoryReader] Failed to load comments:', error);
      }
    };
    
    loadComments();
  }, [storyId]);

  const handleLike = async () => {
    if (!storyId) return;
    
    try {
      const result = await toggleStoryLike(storyId);
      setIsLiked(result.isLiked);
      setLikes(result.likesCount);
      console.log('[StoryReader] Like toggled:', result);
    } catch (error) {
      console.error('[StoryReader] Error toggling like:', error);
    }
  };

  const handleSave = () => {
    if (!storyId) return;
    
    if (isSaved) {
      // Remove bookmark
      setIsSaved(false);
      setBookmarkIndex(null);
      localStorage.removeItem(`storyverse:bookmark:story:${storyId}`);
    } else {
      // Add bookmark at the text position below action bar (460px from top: 88px header + 60px action bar + ~312px for offset)
      setIsSaved(true);
      const actionBarBottomPosition = window.scrollY + 460; // Position where text is visible below sticky action bar
      
      // Find which paragraph is at this position
      const paragraphElements = document.querySelectorAll('.story-content p');
      let targetIndex = 0;
      
      paragraphElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        if (elementTop <= actionBarBottomPosition) {
          targetIndex = index;
        }
      });
      
      setBookmarkIndex(targetIndex);
      localStorage.setItem(`storyverse:bookmark:story:${storyId}`, targetIndex.toString());
    }
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !storyId) return;

    try {
      // Add comment to Firestore
      const newComment = await addStoryComment(storyId, commentInput.trim());
      
      // Handle Timestamp properly
      let timestampValue = Date.now();
      if (newComment.createdAt) {
        if (typeof newComment.createdAt.toMillis === 'function') {
          timestampValue = newComment.createdAt.toMillis();
        } else if (typeof newComment.createdAt.toDate === 'function') {
          timestampValue = newComment.createdAt.toDate().getTime();
        } else if (newComment.createdAt.seconds) {
          timestampValue = newComment.createdAt.seconds * 1000;
        }
      }
      
      // Add to local state immediately for instant feedback
      const commentForDisplay = {
        id: newComment.id,
        author: newComment.authorName,
        avatar: newComment.authorPhotoURL || '',
        text: newComment.text,
        timestamp: timestampValue
      };

      // Add to end of comments array (newest at bottom)
      setComments([...comments, commentForDisplay]);
      setCommentsCount(commentsCount + 1);
      setCommentInput('');

      console.log('[StoryReader] Comment added:', { id: newComment.id, author: newComment.authorName });
    } catch (error) {
      console.error('[StoryReader] Error adding comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommentSubmit();
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Format likes count
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="story-reader-page">
        <div className="reader-loading">Loading story...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-reader-page">
        {/* Show public header with Sign In for unauthenticated users */}
        {!isAuthenticated ? (
          <PublicHeader />
        ) : (
          <HeaderBar />
        )}
        <div className="reader-error" style={{ marginTop: isAuthenticated ? '0' : '80px', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-subheading-size, 18px)', fontFamily: 'var(--font-primary)', color: 'var(--text-tertiary, rgba(162, 162, 162, 1))', marginBottom: '20px' }}>{error}</div>
          {!isAuthenticated && (
            <button 
              onClick={() => navigate('/auth/welcome')} 
              style={{ 
                padding: '12px 24px', 
                backgroundColor: 'var(--brand-secondary, rgba(165, 183, 133, 1))', 
                color: 'var(--text-dark, rgba(27, 28, 30, 1))', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontFamily: 'var(--font-primary)',
                fontSize: 'var(--font-body-size, 16px)', 
                fontWeight: 600 
              }}
            >
              Sign In to View
            </button>
          )}
          {isAuthenticated && (
            <button onClick={handleBack} className="back-button">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="story-reader-page">
      {/* Header - Show different header for public view */}
      {isPublicView ? (
        <PublicHeader />
      ) : (
        <HeaderBar />
      )}
      
      {/* Back Button */}
      <button
        className="story-back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      {/* Cover Hero Section */}
      <div className="reader-hero">
        {coverImageUrl ? (
          <div className="hero-image-wrapper">
            <img src={coverImageUrl} alt={storyTitle} className="hero-image" />
            <div className="hero-overlay" />
          </div>
        ) : (
          <div className="hero-placeholder" />
        )}
        
        {/* Title & Meta Overlay */}
        <div className="hero-content">
          <h1 className="story-title">{storyTitle}</h1>
          {primaryGenre && (
            <div className="story-genre">{primaryGenre}</div>
          )}
          <div className="story-meta">
            <span 
              className="author-name"
              onClick={() => authorUsername && navigate(`/profile/${authorUsername}`)}
              style={{ cursor: authorUsername ? 'pointer' : 'default' }}
            >
              by {authorName}
            </span>
            <span className="meta-divider">•</span>
            <span className="word-count">{wordCount.toLocaleString()} words</span>
            <span className="meta-divider">•</span>
            <span className="read-time">{readingTime || 1} min read</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <ReaderActionBar
        likes={likes}
        isLiked={isLiked}
        onLike={handleLike}
        commentsCount={commentsCount}
        onComments={handleComments}
        isSaved={isSaved}
        onSave={handleSave}
        onShare={handleShare}
        stickyOffset={380}
      />

      {/* Story Content */}
      <main className="reader-main">
        <article className="story-content">
          {acts.flatMap((act, actIndex) => 
            act.chapters.flatMap((chapter, chapterIndex) => {
              const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
              const previousChaptersParagraphs = acts.slice(0, actIndex).flatMap(a => 
                a.chapters.flatMap(c => c.content.split('\n\n').filter(p => p.trim()))
              ).length + act.chapters.slice(0, chapterIndex).flatMap(c => 
                c.content.split('\n\n').filter(p => p.trim())
              ).length;
              
              return paragraphs.map((paragraph, idx) => {
                const globalIdx = previousChaptersParagraphs + idx;
                // First paragraph gets drop cap
                const isFirstParagraph = actIndex === 0 && chapterIndex === 0 && idx === 0;
                const isBookmarked = bookmarkIndex !== null && globalIdx === bookmarkIndex;
                
                return (
                  <p 
                    key={`${chapter.chapterId}-${idx}`}
                    className={`${isFirstParagraph ? 'first-paragraph' : ''} ${isBookmarked ? 'bookmarked-paragraph' : ''}`}
                  >
                    {paragraph}
                    {isBookmarked && (
                      <span className="bookmark-marker" title="Reading bookmark">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                      </span>
                    )}
                  </p>
                );
              });
            })
          )}
        </article>
      </main>

      {/* Comments Modal */}
      {showComments && (
        <div className="comments-overlay" onClick={() => setShowComments(false)}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="comments-header">
              <h3>Comments ({comments.length})</h3>
              <button className="close-button" onClick={() => setShowComments(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="comments-body">
              {comments.map((comment) => (
                <div className="comment-item" key={comment.id}>
                  <div className="comment-avatar">
                    {comment.avatar && typeof comment.avatar === 'string' && (comment.avatar.startsWith('data:image') || comment.avatar.startsWith('http')) ? (
                      <img src={comment.avatar} alt={comment.author} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span>{comment.avatar}</span>
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-author">{comment.author}</div>
                    <div className="comment-text">{comment.text}</div>
                    <div className="comment-time">{formatTimeAgo(comment.timestamp)}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '40px 20px' }}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
            <div className="comments-footer">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="comment-input"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={handleCommentKeyPress}
              />
              <button className="send-button" onClick={handleCommentSubmit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        shareUrl={window.location.href}
        title={storyTitle}
        type="story"
      />

      {/* Footer - Hide for public view */}
      {!isPublicView && <BottomNavigation />}
    </div>
  );
}
