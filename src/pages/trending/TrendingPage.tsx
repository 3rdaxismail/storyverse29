import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import HeaderBar from '../../components/header/HeaderBar';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import { StoryCard } from '../../components/cards';
import { 
  toggleBookmark, 
  getSavedReads
} from '../../firebase/services/engagementService';
import { getStory } from '../../firebase/services/storiesService';
import { getPoem } from '../../firebase/services/poemsService';
import styles from './TrendingPage.module.css';

// Story genre options - match Story Editor
const STORY_GENRES = [
  'Drama',
  'Romance',
  'Thriller',
  'Mystery',
  'Crime',
  'Horror',
  'Adventure',
  'Fantasy',
  'Sci-fi',
  'Historical',
  'Contemporary',
  'Coming-of-age',
  'Family drama',
  'Social drama',
  'Political drama',
  'Musical',
  'Comedy',
  'Tragedy',
  'Action',
  'Suspense',
  'Mythology',
  'Dystopian',
  'Cyberpunk',
  'Steampunk',
  'Space Opera',
  'Solarpunk',
  'Noir',
  'Psychological drama',
  'Cosy Mystery',
  'Legal Thriller',
  'Techno-thriller',
  'Urban Fantasy',
  'Grimdark',
  'Magical Realism',
  'Dark Fantasy',
  'Folklore',
  'Satire',
  'Epistolary',
  'Slice of Life',
  'Erotica',
  'Gothic',
  'Memoir',
  'Travel Story',
  'Auto-fiction',
  'Western',
  'Utopian'
];

// Poem genre options - match Poem Editor
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

interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  genres: string[];
  wordCount: number;
  readTime: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Timestamp | null;
  publishedAt: Timestamp | null;
  authorUid: string;
  authorName?: string;
  audience?: string;
  type: 'story' | 'poem';
  trendingScore?: number;
}

// Cache for author names to avoid repeated fetches
const authorNameCache = new Map<string, string>();

// Helper function to get author name from users collection
async function getAuthorName(uid: string): Promise<string> {
  if (!uid) return '';
  
  // Check cache first
  if (authorNameCache.has(uid)) {
    return authorNameCache.get(uid) || '';
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const displayName = userDoc.data().displayName || '';
      authorNameCache.set(uid, displayName);
      return displayName;
    }
  } catch (err) {
    console.warn('[Trending] Could not fetch author name for uid:', uid, err);
  }
  
  authorNameCache.set(uid, '');
  return '';
}

export default function TrendingPage() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<'stories' | 'poems' | 'myReads'>('stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [savedReads, setSavedReads] = useState<ContentItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Auth guard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load saved reads (My Reads)
  const loadSavedReads = useCallback(async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      
      // Get saved read references
      const savedReadRefs = await getSavedReads();
      console.log('[Trending] Saved reads:', savedReadRefs.length);
      
      // Resolve references to actual content
      const items: ContentItem[] = [];
      
      for (const savedRead of savedReadRefs) {
        try {
          if (savedRead.type === 'story') {
            const story = await getStory(savedRead.id);
            if (story) {
              // Get author name if not stored
              let authorName = story.authorName;
              if (!authorName && story.uid) {
                authorName = await getAuthorName(story.uid);
              }
              items.push({
                id: story.id,
                title: story.storyTitle || 'Untitled',
                excerpt: story.excerptBody || '',
                coverImage: story.coverImageUrl,
                genres: [story.primaryGenre, story.secondaryGenre, story.tertiaryGenre].filter(Boolean),
                wordCount: story.wordCount || 0,
                readTime: story.readingTime || 0,
                likesCount: story.likesCount || 0,
                commentsCount: story.commentsCount || 0,
                createdAt: story.createdAt,
                publishedAt: story.createdAt,
                authorUid: story.uid,
                authorName: authorName,
                audience: story.audience,
                type: 'story'
              });
            }
          } else if (savedRead.type === 'poem') {
            const poem = await getPoem(savedRead.id);
            if (poem) {
              // Get author name if not stored
              let poemAuthorName = poem.authorName;
              if (!poemAuthorName && poem.uid) {
                poemAuthorName = await getAuthorName(poem.uid);
              }
              items.push({
                id: poem.id,
                title: poem.title || 'Untitled',
                excerpt: poem.text?.substring(0, 150) || '',
                coverImage: poem.coverImageUrl,
                genres: [poem.genre].filter(Boolean),
                wordCount: poem.wordCount || 0,
                readTime: poem.readTime || 0,
                likesCount: poem.likesCount || 0,
                commentsCount: poem.commentsCount || 0,
                createdAt: poem.createdAt,
                publishedAt: poem.createdAt,
                authorUid: poem.uid,
                authorName: poemAuthorName,
                type: 'poem'
              });
            }
          }
        } catch (err) {
          console.warn('[Trending] Failed to load saved item:', savedRead.id, err);
        }
      }
      
      // Sort by savedAt (most recent first)
      setSavedReads(items);
      setLoading(false);
    } catch (error) {
      console.error('[Trending] Error loading saved reads:', error);
      setLoading(false);
    }
  }, []);

  // Calculate trending score
  const calculateTrendingScore = (item: ContentItem): number => {
    const likes = item.likesCount || 0;
    const comments = item.commentsCount || 0;
    
    // Recency boost (last 7 days)
    const now = Date.now();
    const publishedTime = item.publishedAt?.toMillis() || item.createdAt?.toMillis() || now;
    const daysSincePublished = (now - publishedTime) / (1000 * 60 * 60 * 24);
    const recencyBoost = daysSincePublished <= 7 ? 10 : 0;
    
    // Weighted score: likes * 3 + comments * 2 + recencyBoost
    return (likes * 3) + (comments * 2) + recencyBoost;
  };

  // Load content from Firestore
  const loadContent = useCallback(async (reset = false) => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      
      const collectionName = contentType;
      const contentRef = collection(db, collectionName);
      
      // Build query constraints array
      const constraints: any[] = [where('privacy', '==', 'Trending')];
      
      // Add genre filter at Firestore level if genres are selected (and not 'All')
      if (selectedGenres.length > 0 && !selectedGenres.includes('All')) {
        // For stories: check primaryGenre
        // For poems: check genre field
        if (contentType === 'stories') {
          if (selectedGenres.length <= 10) {
            constraints.push(where('primaryGenre', 'in', selectedGenres));
          }
        } else if (contentType === 'poems') {
          if (selectedGenres.length <= 10) {
            constraints.push(where('genre', 'in', selectedGenres));
          }
        }
      }
      
      constraints.push(limit(10));
      
      // Build query with all constraints
      let q = query(contentRef, ...constraints);

      // Pagination
      if (!reset && lastDoc) {
        q = query(contentRef, ...constraints, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      console.log('[Trending] Query result:', {
        empty: snapshot.empty,
        docsCount: snapshot.docs.length,
        contentType,
        selectedGenres,
        searchQuery
      });
      
      if (snapshot.empty) {
        if (reset) {
          setContent([]);
        }
        setHasMore(false);
        setLoading(false);
        return;
      }

      const items: ContentItem[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        console.log('[Trending] Story doc:', {
          id: docSnap.id,
          storyTitle: data.storyTitle,
          privacy: data.privacy,
          status: data.status,
          primaryGenre: data.primaryGenre,
          wordCount: data.wordCount // DEBUG: Log word count from Firestore
        });
        
        // Stories set to Trending are shown regardless of draft status
        
        const authorUid = data.uid || data.authorUid;
        // Get author name - use stored value or fetch from users collection
        let authorName = data.authorName;
        if (!authorName && authorUid) {
          authorName = await getAuthorName(authorUid);
        }
        
        // Build genres array differently for stories vs poems
        const genres = contentType === 'stories'
          ? [data.primaryGenre, data.secondaryGenre, data.tertiaryGenre].filter(Boolean)
          : [data.genre].filter(Boolean);
        
        const item: ContentItem = {
          id: docSnap.id,
          title: data.storyTitle || data.title || 'Untitled',
          excerpt: data.excerptBody || data.excerpt || data.text?.substring(0, 150) || '',
          coverImage: data.coverImageUrl || data.coverImage,
          genres: genres,
          wordCount: data.wordCount || 0,
          readTime: data.readingTime || data.readTime || Math.ceil((data.wordCount || 0) / 200),
          likesCount: data.likesCount || 0,
          commentsCount: data.commentsCount || 0,
          createdAt: data.createdAt,
          publishedAt: data.publishedAt,
          authorUid: authorUid,
          authorName: authorName,
          audience: data.audience,
          type: contentType === 'stories' ? 'story' : 'poem'
        };
        
        // Calculate trending score
        item.trendingScore = calculateTrendingScore(item);
        
        items.push(item);
      }

      // Sort by trending score
      items.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      
      console.log('[Trending] Items loaded from Firestore:', items.length);
      
      // Apply filters
      let filteredItems = items;
      
      // Genre filter is already applied at Firestore level
      // No need for client-side genre filtering
      
      // Search filter (client-side only)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(query)
        );
        console.log('[Trending] After search filter:', filteredItems.length);
      }
      
      console.log('[Trending] Final filtered items:', filteredItems.length);
      
      if (reset) {
        setContent(filteredItems);
      } else {
        setContent(prev => [...prev, ...filteredItems]);
      }
      
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, [contentType, selectedGenres]); // Added selectedGenres to dependency array

  // Debounced search - trigger reload when search/filters change
  useEffect(() => {
    if (contentType === 'myReads') {
      loadSavedReads();
    } else {
      const timer = setTimeout(() => {
        loadContent(true);
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGenres, contentType]);

  // Handle content type toggle
  const handleTypeToggle = (type: 'stories' | 'poems' | 'myReads') => {
    setContentType(type);
    setContent([]);
    setSavedReads([]);
    setLastDoc(null);
    setHasMore(true);
    setSelectedGenres([]); // Clear genre selection when switching tabs
  };

  // Get the appropriate genres list based on content type
  const currentGenres = contentType === 'poems' ? POEM_GENRES : STORY_GENRES;

  // Handle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      if (genre === 'All') {
        // If 'All' is clicked, toggle it exclusively
        return prev.includes('All') ? [] : ['All'];
      } else {
        // If any other genre is clicked, remove 'All' and toggle the genre
        const withoutAll = prev.filter(g => g !== 'All');
        return withoutAll.includes(genre)
          ? withoutAll.filter(g => g !== genre)
          : [...withoutAll, genre];
      }
    });
  };

  // Handle card click
  const handleCardClick = (id: string) => {
    // Determine route based on the item type in the current view
    const item = contentType === 'myReads' 
      ? savedReads.find(i => i.id === id)
      : content.find(i => i.id === id);
    
    const route = item?.type === 'poem' ? `/poem/view/${id}` : `/story/view/${id}`;
    navigate(route);
  };

  // Handle bookmark toggle
  const handleBookmark = async (id: string, type: 'story' | 'poem', authorId: string) => {
    if (!auth.currentUser) {
      alert('Please sign in to bookmark content');
      return;
    }

    try {
      const result = await toggleBookmark(id, type, authorId);
      
      // Update local state
      if (result.isSaved) {
        setBookmarkedIds(prev => new Set([...prev, id]));
      } else {
        setBookmarkedIds(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
        
        // If in My Reads view, remove item immediately
        if (contentType === 'myReads') {
          setSavedReads(prev => prev.filter(item => item.id !== id));
        }
      }
      
      console.log('[Trending] Bookmark toggled:', { id, type, isSaved: result.isSaved });
    } catch (error) {
      console.error('[Trending] Error toggling bookmark:', error);
      alert('Failed to bookmark. Please try again.');
    }
  };

  // Load bookmarked IDs on mount
  useEffect(() => {
    const loadBookmarkedIds = async () => {
      if (!auth.currentUser) return;
      
      try {
        const savedReadRefs = await getSavedReads();
        const ids = new Set(savedReadRefs.map(r => r.id));
        setBookmarkedIds(ids);
      } catch (error) {
        console.error('[Trending] Error loading bookmarked IDs:', error);
      }
    };
    
    loadBookmarkedIds();
  }, []);

  // Load more (infinite scroll)
  const loadMore = () => {
    if (!loading && hasMore && contentType !== 'myReads') {
      loadContent(false);
    }
  };

  if (!auth.currentUser) {
    return null;
  }

  return (
    <div className={styles.trendingPage}>
      <HeaderBar />
      
      <div className={styles.content}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Trending</h1>
          <p className={styles.pageSubtitle}>Discover popular stories and poems from the community</p>
        </div>

        {/* Type Toggle */}
        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeButton} ${contentType === 'stories' ? styles.active : ''}`}
            onClick={() => handleTypeToggle('stories')}
          >
            📖 Stories
          </button>
          <button
            className={`${styles.typeButton} ${contentType === 'poems' ? styles.active : ''}`}
            onClick={() => handleTypeToggle('poems')}
          >
            📝 Poems
          </button>
          <button
            className={`${styles.typeButton} ${styles.myReadsButton} ${contentType === 'myReads' ? styles.activeMyReads : ''}`}
            onClick={() => handleTypeToggle('myReads')}
          >
            🔖 My Reads
          </button>
        </div>

        {/* Genre Filter Dropdown - Hide for My Reads */}
        {contentType !== 'myReads' && (
          <div className={styles.genreSection}>
            <div className={styles.genreDropdown}>
              <button
                className={styles.genreDropdownButton}
                onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
              >
                <span>
                  {selectedGenres.length === 0
                    ? 'Select Genres'
                    : selectedGenres.includes('All')
                    ? 'All Genres'
                    : `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              {genreDropdownOpen && (
                <>
                  <div className={styles.genreDropdownOverlay} onClick={() => setGenreDropdownOpen(false)} />
                  <div className={styles.genreDropdownMenu}>
                    {/* All option at top */}
                    <label key="All" className={styles.genreCheckboxItem}>
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes('All')}
                        onChange={() => toggleGenre('All')}
                      />
                      <span>All</span>
                    </label>
                    {/* Genre-specific options */}
                    {currentGenres.map((genre) => (
                      <label key={genre} className={styles.genreCheckboxItem}>
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => toggleGenre(genre)}
                          disabled={selectedGenres.includes('All')}
                        />
                        <span>{genre}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {loading && (contentType === 'myReads' ? savedReads.length === 0 : content.length === 0) ? (
            // Loading skeleton
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </>
          ) : contentType === 'myReads' && savedReads.length === 0 ? (
            // Empty state for My Reads
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>You haven't saved anything yet</h3>
              <p>Bookmark stories or poems to read later.</p>
            </div>
          ) : content.length === 0 && contentType !== 'myReads' ? (
            // Empty state for Stories/Poems
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <h3>No {contentType} found</h3>
              <p>
                {selectedGenres.length > 0
                  ? 'Try removing some genre filters'
                  : `No ${contentType} trending yet. Be the first to publish!`}
              </p>
            </div>
          ) : (
            <>
              {(contentType === 'myReads' ? savedReads : content).map((item) => (
                <div key={item.id} className={styles.cardWrapper}>
                  <StoryCard
                    id={item.id}
                    title={item.title}
                    coverImageUrl={item.coverImage || ''}
                    genre={item.genres[0] || ''}
                    likes={item.likesCount}
                    comments={item.commentsCount}
                    wordCount={item.wordCount}
                    readingTime={item.readTime}
                    excerpt={item.excerpt}
                    type={item.type}
                    audience={item.audience}
                    authorId={item.authorUid}
                    authorName={item.authorName}
                    showDelete={false}
                    isBookmarked={bookmarkedIds.has(item.id)}
                    onClick={handleCardClick}
                    onBookmark={handleBookmark}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Load More Button - Hide for My Reads */}
        {hasMore && (contentType === 'myReads' ? savedReads.length : content.length) > 0 && contentType !== 'myReads' && (
          <div className={styles.loadMoreSection}>
            <button
              className={styles.loadMoreButton}
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      <BottomNavigation activeTab="trending" />
    </div>
  );
}
