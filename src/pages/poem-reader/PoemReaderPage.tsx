import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './PoemReaderPage.module.css';
import HeaderBar from '../../components/header/HeaderBar';
import PublicHeader from '../../components/header/PublicHeader';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import ReaderActionBar from '../../components/reader/ReaderActionBar';
import ShareModal from '../../components/common/ShareModal';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getPoem } from '../../firebase/services/poemsService';
import { 
  togglePoemLike, 
  hasUserLikedPoem, 
  addPoemComment, 
  getPoemComments 
} from '../../firebase/services/engagementService';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export default function PoemReaderPage() {
  const navigate = useNavigate();
  const { poemId } = useParams<{ poemId: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { profile } = useUserProfile();
  
  // State for poem data
  const [poemTitle, setPoemTitle] = useState('Untitled Poem');
  const [text, setText] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('Unknown Author');
  const [authorUid, setAuthorUid] = useState<string | null>(null);
  const [authorUsername, setAuthorUsername] = useState<string | null>(null);
  const [readTime, setReadTime] = useState(1);
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
  const [genre, setGenre] = useState('');
  
  // Privacy and public view state
  const [poemPrivacy, setPoemPrivacy] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  
  // Determine if this is public view mode
  const isPublicView = !isAuthenticated && poemPrivacy.toLowerCase() === 'trending';

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[PoemReaderPage] Auth state changed:', { isAuthenticated: !!user });
      setIsAuthenticated(!!user);
      setAuthInitialized(true);
    });
    
    return () => unsubscribe();
  }, []);

  // Load poem data from Firestore using poemId from URL
  useEffect(() => {
    // CRITICAL: Wait for auth to initialize before loading poem
    if (!authInitialized) {
      return;
    }
    
    if (!poemId) {
      setError('No poem ID provided');
      setLoading(false);
      return;
    }

    const loadPoem = async () => {
      try {
        // Get current user after auth initialization
        const user = auth.currentUser;
        
        // Load poem from Firestore
        const poem = await getPoem(poemId);

        if (!poem) {
          setError('Poem not found');
          setLoading(false);
          return;
        }
        
        // Store privacy for public view logic
        const privacyValue = poem.privacy || '';
        setPoemPrivacy(privacyValue);
        
        console.log('[PoemReaderPage] Poem loaded:', {
          poemId,
          privacy: privacyValue,
          privacyLower: privacyValue.toLowerCase(),
          isAuthenticated: !!user,
          isTrending: privacyValue.toLowerCase() === 'trending'
        });
        
        // Privacy enforcement for non-authenticated users
        if (!user && privacyValue.toLowerCase() !== 'trending') {
          console.log('[PoemReaderPage] Blocking non-public poem for unauthenticated user');
          setError('This poem is not publicly available. Please sign in to view.');
          setLoading(false);
          return;
        }
        
        console.log('[PoemReaderPage] Access granted - loading poem content');

        // Check authorization for preview mode
        if (isPreview) {
          if (!user || poem.uid !== user.uid) {
            setError('Unauthorized: You can only preview your own poems');
            setLoading(false);
            return;
          }
        }

        setPoemTitle(poem.title || 'Untitled Poem');
        setText(poem.text || '');
        setCoverImageUrl(poem.coverImageUrl || '');
        setReadTime(poem.readTime || 1);
        setGenre(poem.genre || '');
        
        // Load real engagement stats from poem data
        setLikes(poem.likesCount || 0);
        setCommentsCount(poem.commentsCount || 0);
        
        // Only load user-specific data if authenticated
        if (user) {
          // Check if current user has liked this poem
          const userHasLiked = await hasUserLikedPoem(poemId);
          setIsLiked(userHasLiked);
        }
        
        // Load author name and username from user profile
        if (poem.uid) {
          setAuthorUid(poem.uid);
          
          // Fetch author profile for name and username
          try {
            const userDoc = await getDoc(doc(db, 'users', poem.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setAuthorName(poem.authorName || userData.displayName || 'Unknown Author');
              setAuthorUsername(userData.displayName || null); // Use displayName as username
            }
          } catch (err) {
            console.warn('[PoemReaderPage] Could not load author profile:', err);
            setAuthorName(poem.authorName || 'Unknown Author');
          }
        } else {
          setAuthorName(poem.authorName || 'Unknown Author');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('[PoemReaderPage] Error loading poem:', err);
        setError('Failed to load poem');
        setLoading(false);
      }
    };

    loadPoem();
  }, [poemId, isPreview, authInitialized]);

  // Load saved bookmark on mount
  useEffect(() => {
    if (!poemId) return;
    
    const savedBookmark = localStorage.getItem(`storyverse:bookmark:poem:${poemId}`);
    if (savedBookmark) {
      const index = parseInt(savedBookmark);
      setBookmarkIndex(index);
      setIsSaved(true);
    }
  }, [poemId]);

  // Load comments from Firestore
  useEffect(() => {
    if (!poemId) return;
    
    const loadComments = async () => {
      try {
        const firestoreComments = await getPoemComments(poemId);
        
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
        console.log('[PoemReader] Loaded', displayComments.length, 'comments from Firestore');
      } catch (error) {
        console.error('[PoemReader] Failed to load comments:', error);
      }
    };
    
    loadComments();
  }, [poemId]);
  
  const handleLike = async () => {
    if (!poemId) return;
    
    try {
      const result = await togglePoemLike(poemId);
      setIsLiked(result.isLiked);
      setLikes(result.likesCount);
      console.log('[PoemReader] Like toggled:', result);
    } catch (error) {
      console.error('[PoemReader] Error toggling like:', error);
    }
  };

  const handleSave = () => {
    if (!poemId) return;
    
    if (isSaved) {
      // Remove bookmark
      setIsSaved(false);
      setBookmarkIndex(null);
      localStorage.removeItem(`storyverse:bookmark:poem:${poemId}`);
    } else {
      // Add bookmark at the text position below action bar (460px from top: 88px header + 60px action bar + ~312px for offset)
      setIsSaved(true);
      const actionBarBottomPosition = window.scrollY + 460; // Position where text is visible below sticky action bar
      
      // Find which stanza is at this position
      const stanzaElements = document.querySelectorAll('[class*="stanza"]');
      let targetIndex = 0;
      
      stanzaElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        if (elementTop <= actionBarBottomPosition) {
          targetIndex = index;
        }
      });
      
      setBookmarkIndex(targetIndex);
      localStorage.setItem(`storyverse:bookmark:poem:${poemId}`, targetIndex.toString());
    }
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !poemId) return;

    try {
      // Add comment to Firestore
      const newComment = await addPoemComment(poemId, commentInput.trim());
      
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

      console.log('[PoemReader] Comment added:', { id: newComment.id, author: newComment.authorName });
    } catch (error) {
      console.error('[PoemReader] Error adding comment:', error);
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

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };
  
  // Parse text into stanzas (separated by blank lines)
  const parseStanzas = (text: string) => {
    if (!text.trim()) return [];
    
    const lines = text.split(/\r?\n/);
    const stanzas: string[][] = [];
    let currentStanza: string[] = [];
    
    for (const line of lines) {
      if (line.trim()) {
        currentStanza.push(line);
      } else if (currentStanza.length > 0) {
        stanzas.push(currentStanza);
        currentStanza = [];
      }
    }
    
    // Don't forget the last stanza if it exists
    if (currentStanza.length > 0) {
      stanzas.push(currentStanza);
    }
    
    return stanzas;
  };
  
  const stanzas = parseStanzas(text);

  // Show error state
  if (error) {
    return (
      <div className={styles.poemReaderRoot}>
        {!isAuthenticated ? (
          <PublicHeader />
        ) : (
          <HeaderBar />
        )}
        <div className={styles.errorContainer}>
          <h2>{error}</h2>
          {!isAuthenticated ? (
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
                fontWeight: 600,
                marginTop: '20px'
              }}
            >
              Sign In to View
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className={styles.backToEditorButton}>
              Go Back
            </button>
          )}
        </div>
        {isAuthenticated && <BottomNavigation />}
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className={styles.poemReaderRoot}>
        {!isAuthenticated ? (
          <PublicHeader />
        ) : (
          <HeaderBar />
        )}
        <div className={styles.loadingContainer}>
          <p>Loading poem...</p>
        </div>
        {!isPublicView && <BottomNavigation />}
      </div>
    );
  }
  
  return (
    <div className={styles.poemReaderRoot}>
      {/* Header - Show different header for public view */}
      {isPublicView ? (
        <PublicHeader />
      ) : (
        <HeaderBar />
      )}
      
      {/* Back Button */}
      <button
        className={styles.backButton}
        onClick={() => navigate(-1)}
        aria-label="Go back"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      {/* Hero Section with Cover Image */}
      <div className={styles.readerHero}>
        {coverImageUrl ? (
          <div className={styles.heroImageWrapper}>
            <img src={coverImageUrl} alt={poemTitle} className={styles.heroImage} />
            <div className={styles.heroOverlay} />
          </div>
        ) : (
          <div className={styles.heroPlaceholder} />
        )}
        
        {/* Title Overlay */}
        <div className={styles.heroContent}>
          <h1 className={styles.poemTitle}>{poemTitle}</h1>
          {genre && (
            <div className={styles.poemGenre}>{genre}</div>
          )}
          <div className={styles.poemMeta}>
            <span 
              className={styles.authorName} 
              onClick={() => authorUsername && navigate(`/profile/${authorUsername}`)}
              style={{ cursor: authorUsername ? 'pointer' : 'default' }}
            >
              by {authorName}
            </span>
            <span className={styles.metaDivider}>•</span>
            <span className={styles.readTime}>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Action Bar - Sticky after cover image */}
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

      <main className={styles.readerMain}>
        <div className={styles.readingContainer}>
          {stanzas.length > 0 ? (
            stanzas.map((stanza, i) => {
              const isBookmarked = bookmarkIndex !== null && i === bookmarkIndex;
              
              return (
                <div 
                  className={`${styles.stanza} ${isBookmarked ? styles.bookmarkedStanza : ''}`} 
                  key={i}
                >
                  {stanza.map((line, j) => (
                    <div className={styles.line} key={j}>{line}</div>
                  ))}
                  {isBookmarked && (
                    <span className={styles.bookmarkMarker} title="Reading bookmark">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No poem content yet. Start writing in the editor.</p>
          )}
        </div>
      </main>
      
      {/* Comments Modal */}
      {showComments && (
        <div className={styles.commentsOverlay} onClick={() => setShowComments(false)}>
          <div className={styles.commentsModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.commentsHeader}>
              <h3>Comments</h3>
              <button className={styles.closeButton} onClick={() => setShowComments(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className={styles.commentsBody}>
              {comments.map((comment) => (
                <div className={styles.commentItem} key={comment.id}>
                  <div className={styles.commentAvatar}>
                    {comment.avatar && typeof comment.avatar === 'string' && (comment.avatar.startsWith('data:image') || comment.avatar.startsWith('http')) ? (
                      <img src={comment.avatar} alt={comment.author} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span>{comment.avatar}</span>
                    )}
                  </div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentAuthor}>{comment.author}</div>
                    <div className={styles.commentText}>{comment.text}</div>
                    <div className={styles.commentTime}>{formatTimeAgo(comment.timestamp)}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '40px 20px' }}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
            <div className={styles.commentsFooter}>
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className={styles.commentInput}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={handleCommentKeyPress}
              />
              <button className={styles.sendButton} onClick={handleCommentSubmit}>
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
        title={poemTitle}
        type="poem"
      />

      {/* Footer - Hide for public view */}
      {!isPublicView && <BottomNavigation activeTab="write" />}
    </div>
  );
}
