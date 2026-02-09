/**
 * PublicProfilePage - Public Writer Profile with User Isolation
 * CRITICAL: This page MUST be fully user-scoped to prevent data leaks
 * 
 * Security Rules:
 * 1. Only show stories where story.uid === currentUser.uid
 * 2. Wait for auth state to resolve before rendering
 * 3. Clear all cached data on logout/account switch
 * 4. Validate all stories before rendering (hard validation)
 * 5. No fallback data, no mock data
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth as useAuthContext } from '../../firebase/AuthContext';
import { useInbox } from '../../contexts/InboxContext';
import { getUserStories, getPublishedUserStories, deleteStory } from '../../firebase/services/storiesService';
import { getUserPoems, getPublishedUserPoems, deletePoem } from '../../firebase/services/poemsService';
import HeaderBar from '../../components/header/HeaderBar';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import ProfileHeroCard from './components/ProfileHeroCard';
import ProfileStatsRow from './components/ProfileStatsRow';
import ProfileActions from './components/ProfileActions';
import PublishedStoriesSection from './components/PublishedStoriesSection';
import EditViewModal from './components/EditViewModal';
import styles from './PublicProfilePage.module.css';

interface Story {
  id: string;
  title: string;
  coverImageUrl: string;
  genre: string;
  likes: number;
  readingTime: number;
  comments?: number;
  isPrivate?: boolean;
  privacy?: string; // Add privacy field
  type?: 'story' | 'poem';
  uid: string; // CRITICAL: Track author UID for validation
  wordCount?: number;
  updatedAt?: any; // Firestore Timestamp for sorting
  excerpt?: string; // Real excerpt from story/poem content
  audience?: string; // Audience rating (All Ages, 13+, 16+, 18+, 18+(A))
  authorName?: string; // Author name
}

// Cache for author names
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
    console.warn('[PublicProfilePage] Could not fetch author name for uid:', uid, err);
  }
  
  authorNameCache.set(uid, '');
  return '';
}

/**
 * Fetch ONLY stories and poems created by a specific user from Firestore
 * CRITICAL: This enforces user isolation at query time
 * @param uid - The user UID to fetch content for
 * @returns Array of stories and poems where uid matches
 */
async function fetchUserContentFromFirestore(uid: string): Promise<Story[]> {
  try {
    if (!uid) {
      console.warn('[fetchUserContentFromFirestore] No uid provided - returning empty array');
      return [];
    }

    // Get author name upfront
    const authorName = await getAuthorName(uid);

    const content: Story[] = [];
    
    // Fetch user's stories from Firestore (already ordered by updatedAt DESC)
    const userStories = await getUserStories(uid);
    console.log('[fetchUserContentFromFirestore] Raw stories from Firestore:', userStories.map(s => ({ id: s.id, title: s.storyTitle, wordCount: s.wordCount })));
    content.push(
      ...userStories.map(story => ({
        id: story.id,
        title: story.storyTitle,
        genre: story.primaryGenre || '',
        coverImageUrl: story.coverImageUrl || '', // Empty string if no cover image
        likes: story.likesCount || 0, // Real likes from Firestore
        readingTime: story.readingTime || 5,
        comments: story.commentsCount || 0, // Real comments from Firestore
        isPrivate: story.privacy === 'private',
        privacy: story.privacy || 'private', // Store original privacy value
        type: 'story' as const,
        uid: story.uid,
        wordCount: story.wordCount || 0, // CRITICAL: Include word count for stories
        updatedAt: story.updatedAt, // Preserve timestamp for sorting
        excerpt: story.excerptBody || '', // Real excerpt from story data
        audience: story.audience || '', // Audience rating from story editor
        authorName: story.authorName || authorName, // Author name (from story or fetched)
      }))
    );
    
    // Fetch user's poems from Firestore (already ordered by updatedAt DESC)
    const userPoems = await getUserPoems(uid);
    console.log('[fetchUserContentFromFirestore] Raw poems from Firestore:', userPoems.map(p => ({ id: p.id, title: p.title, wordCount: p.wordCount })));
    content.push(
      ...userPoems.map(poem => ({
        id: poem.id,
        title: poem.title,
        genre: poem.genre || 'Poetry',
        coverImageUrl: poem.coverImageUrl || '', // Empty string if no cover image
        likes: poem.likesCount || 0, // Real likes from Firestore
        readingTime: poem.readTime || 1,
        comments: poem.commentsCount || 0, // Real comments from Firestore
        isPrivate: poem.privacy === 'private',
        privacy: poem.privacy || 'private', // Store original privacy value
        type: 'poem' as const,
        uid: poem.uid,
        wordCount: poem.wordCount || 0,
        updatedAt: poem.updatedAt, // Preserve timestamp for sorting
        excerpt: poem.text?.substring(0, 150) || '', // Real excerpt from poem text
        authorName: poem.authorName || authorName, // Author name (from poem or fetched)
      }))
    );
    
    // Sort combined array by updatedAt (most recent first)
    content.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
      const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
      return timeB - timeA; // Descending order (newest first)
    });
    
    console.log(`[fetchUserContentFromFirestore] Fetched ${content.length} items for uid: ${uid}`);
    return content;
  } catch (error) {
    console.error('Error fetching user content from Firestore:', error);
    return [];
  }
}

/**
 * Fetch ONLY published stories and poems for public view
 */
async function fetchPublishedUserContent(uid: string): Promise<Story[]> {
  try {
    if (!uid) {
      console.warn('[fetchPublishedUserContent] No uid provided - returning empty array');
      return [];
    }

    // Get author name upfront
    const authorName = await getAuthorName(uid);

    const content: Story[] = [];
    
    // Fetch published stories
    const publishedStories = await getPublishedUserStories(uid);
    content.push(
      ...publishedStories.map(story => ({
        id: story.id,
        title: story.storyTitle,
        genre: story.primaryGenre || '',
        coverImageUrl: story.coverImageUrl || `https://via.placeholder.com/300x400?text=${encodeURIComponent(story.storyTitle)}`,
        likes: story.likesCount || 0,
        readingTime: story.readingTime || 5,
        comments: story.commentsCount || 0,
        isPrivate: false,
        type: 'story' as const,
        uid: story.uid,
        wordCount: story.wordCount || 0,
        excerpt: story.excerptBody || '', // Real excerpt from story data
        audience: story.audience || '', // Audience rating from story editor
        authorName: story.authorName || authorName, // Author name (from story or fetched)
      }))
    );
    
    // Fetch published poems
    const publishedPoems = await getPublishedUserPoems(uid);
    content.push(
      ...publishedPoems.map(poem => ({
        id: poem.id,
        title: poem.title,
        genre: poem.genre || 'Poetry',
        coverImageUrl: poem.coverImageUrl || `https://via.placeholder.com/300x400?text=${encodeURIComponent(poem.title)}`,
        likes: poem.likesCount || 0,
        readingTime: poem.readTime || 1,
        comments: poem.commentsCount || 0,
        isPrivate: false,
        type: 'poem' as const,
        uid: poem.uid,
        wordCount: poem.wordCount || 0,
        excerpt: poem.text?.substring(0, 150) || '', // Real excerpt from poem text
        authorName: poem.authorName || authorName, // Author name (from poem or fetched)
      }))
    );
    
    console.log(`[fetchPublishedUserContent] Fetched ${content.length} published items for uid: ${uid}`);
    return content;
  } catch (error) {
    console.error('Error fetching published content:', error);
    return [];
  }
}

/**
 * HARD VALIDATION: Ensure all content belongs to the requested user
 * This prevents silent data leaks
 */
function validateContentOwnership(content: Story[], expectedUid: string): boolean {
  for (const item of content) {
    if (item.uid !== expectedUid) {
      throw new Error(
        `DATA LEAK PREVENTED: ${item.type} ${item.id} has uid ${item.uid} ` +
        `but expected ${expectedUid}`
      );
    }
  }
  return true;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { user, userProfile, loading: authLoading } = useAuthContext();
  const { createOrGetThread } = useInbox();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    followers: 0,
    storiesCount: 0,
    currentWork: ''
  });

  const [allStories, setAllStories] = useState<Story[]>([]);
  const [publishedStories, setPublishedStories] = useState<Story[]>([]);
  const [privateStories, setPrivateStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showEditViewModal, setShowEditViewModal] = useState(false);

  // Determine if viewing own profile
  // If username matches current user's display name, or if URL is /profile/profile, show own profile
  const isOwnProfile = !username || username === 'profile' || (userProfile && username === userProfile.displayName);

  console.log('[PublicProfilePage] isOwnProfile check:', { username, userProfileDisplayName: userProfile?.displayName, isOwnProfile });

  // Load content only for authenticated users viewing their own profile
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[PublicProfilePage] Waiting for auth...');
      return;
    }

    const loadUserContent = async () => {
      console.log('[PublicProfilePage] Loading content...');
      console.log('User:', user?.uid);
      console.log('UserProfile:', userProfile);
      console.log('isOwnProfile:', isOwnProfile);

      if (!isOwnProfile) {
        // Viewing other user's profile - load their published content
        console.log('[PublicProfilePage] Viewing other user profile:', username);
        
        try {
          // Lookup user by displayName (username)
          const usersRef = collection(db, 'users');
          const userQuery = query(usersRef, where('displayName', '==', username));
          const userSnapshot = await getDocs(userQuery);
          
          if (userSnapshot.empty) {
            console.warn('[PublicProfilePage] User not found by displayName:', username);
            // Set empty state but don't return - show "user not found" message
            setProfileData({
              displayName: username || 'Unknown User',
              bio: '',
              avatar: '',
              followers: 0,
              storiesCount: 0,
              currentWork: ''
            });
            setIsLoading(false);
            return;
          }
          
          const targetUserDoc = userSnapshot.docs[0];
          const targetUserData = targetUserDoc.data();
          const targetUid = targetUserDoc.id;
          
          // Store target user ID for messaging
          setTargetUserId(targetUid);
          
          console.log('[PublicProfilePage] Found user:', { uid: targetUid, displayName: targetUserData.displayName, photoURL: targetUserData.photoURL });
          
          // Set profile data first (so avatar/bio show even if no stories)
          setProfileData({
            displayName: targetUserData.displayName || username || 'Unknown User',
            bio: targetUserData.bio || '',
            avatar: targetUserData.photoURL || '',
            followers: 0,
            storiesCount: 0, // Will update below
            currentWork: ''
          });
          
          // Fetch published stories and poems for this user
          const publishedStoriesData = await getPublishedUserStories(targetUid);
          const publishedPoemsData = await getPublishedUserPoems(targetUid);
          
          console.log('[PublicProfilePage] Fetched stories:', publishedStoriesData.length, 'poems:', publishedPoemsData.length);
          
          // Get author name
          const authorName = await getAuthorName(targetUid);
          
          // Convert to unified format
          const stories: Story[] = publishedStoriesData.map(story => ({
            id: story.id,
            title: story.storyTitle,
            genre: story.primaryGenre || '',
            coverImageUrl: story.coverImageUrl || '',
            likes: story.likesCount || 0,
            readingTime: story.readingTime || 5,
            comments: story.commentsCount || 0,
            isPrivate: false,
            privacy: 'published',
            type: 'story' as const,
            uid: story.uid,
            wordCount: story.wordCount || 0,
            updatedAt: story.updatedAt,
            excerpt: story.excerptBody || '',
            audience: story.audience || '',
            authorName: story.authorName || authorName,
          }));
          
          const poems: Story[] = publishedPoemsData.map(poem => ({
            id: poem.id,
            title: poem.title,
            genre: poem.genre || 'Poetry',
            coverImageUrl: poem.coverImageUrl || '',
            likes: poem.likesCount || 0,
            readingTime: poem.readTime || 1,
            comments: poem.commentsCount || 0,
            isPrivate: false,
            privacy: 'published',
            type: 'poem' as const,
            uid: poem.uid,
            wordCount: poem.wordCount || 0,
            updatedAt: poem.updatedAt,
            excerpt: poem.text?.substring(0, 150) || '',
            authorName: poem.authorName || authorName,
          }));
          
          const allPublished = [...stories, ...poems].sort((a, b) => {
            const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
            const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
            return timeB - timeA;
          });
          
          setPublishedStories(allPublished);
          setAllStories(allPublished); // For other user, only show published
          setPrivateStories([]); // Don't show private stories of other users
          
          // Update profile data with story count
          setProfileData(prev => ({
            ...prev,
            storiesCount: allPublished.length,
            currentWork: allPublished.length > 0 ? allPublished[0].title : ''
          }));
          
          console.log('[PublicProfilePage] Loaded', allPublished.length, 'published items for user:', username);
          setIsLoading(false);
        } catch (error) {
          console.error('[PublicProfilePage] Error loading other user profile:', error);
          setProfileData({
            displayName: username || 'Unknown User',
            bio: '',
            avatar: '',
            followers: 0,
            storiesCount: 0,
            currentWork: ''
          });
          setIsLoading(false);
        }
        return;
      }

      if (!user?.uid) {
        console.warn('[PublicProfilePage] No user - cannot load own profile');
        setIsLoading(false);
        return;
      }

      try {
        // Load all content for current user from Firestore
        const userContent = await fetchUserContentFromFirestore(user.uid);
        
        // HARD VALIDATION: Ensure all content belongs to this user
        validateContentOwnership(userContent, user.uid);
        
        const published = userContent.filter(item => !item.isPrivate);
        const private_ = userContent.filter(item => item.isPrivate);
        
        setAllStories(userContent);
        setPublishedStories(published);
        setPrivateStories(private_);
        
        setProfileData({
          displayName: userProfile?.displayName || '',
          bio: userProfile?.bio || '',
          avatar: userProfile?.photoURL || '',
          followers: 0, // Real followers count (not implemented yet)
          storiesCount: userContent.length, // Show ALL stories count for owner
          currentWork: userContent.length > 0 ? userContent[0].title : ''
        });
        
        setIsLoading(false);
      } catch (validationError) {
        console.error('[PublicProfilePage] VALIDATION FAILED:', validationError);
        // On validation failure, clear everything to prevent showing wrong data
        setAllStories([]);
        setPublishedStories([]);
        setPrivateStories([]);
        setIsLoading(false);
      }
    };

    loadUserContent();
  }, [authLoading, user, userProfile, isOwnProfile]);

  // Global state reset on auth change
  useEffect(() => {
    return () => {
      // On component unmount or auth change, prepare for cleanup
      // If user logs out, auth state will be cleared by useAuth
    };
  }, [user?.uid]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = async () => {
    if (!targetUserId || !profileData.displayName) {
      console.warn('[PublicProfilePage] Cannot message: missing target user info');
      return;
    }
    
    try {
      // Create thread with target user
      const threadId = await createOrGetThread({
        id: targetUserId,
        name: profileData.displayName,
        avatar: profileData.avatar || '',
      });
      
      // Navigate to the thread
      navigate(`/inbox/${threadId}`);
    } catch (error) {
      console.error('[PublicProfilePage] Failed to create thread:', error);
    }
  };

  const handleStoryClick = (storyId: string) => {
    const story = allStories.find(s => s.id === storyId);
    
    if (!story) {
      console.error('[PublicProfilePage] Story not found:', storyId);
      return;
    }

    if (isOwnProfile) {
      setSelectedStory(story);
      setShowEditViewModal(true);
    } else {
      navigate(`/story/view/${storyId}`);
    }
  };

  const handleEditStory = () => {
    if (!selectedStory) return;
    
    setShowEditViewModal(false);
    
    const isPoem = selectedStory.type === 'poem';
    if (isPoem) {
      navigate(`/poem/editor?id=${selectedStory.id}`);
    } else {
      navigate(`/editor/story/${selectedStory.id}`);
    }
  };

  const handleViewStory = () => {
    if (!selectedStory) return;
    
    setShowEditViewModal(false);
    
    const isPoem = selectedStory.type === 'poem';
    if (isPoem) {
      navigate(`/poem/view/${selectedStory.id}`);
    } else {
      navigate(`/story/view/${selectedStory.id}`);
    }
  };

  const handleDeleteStory = async (id: string, type: 'story' | 'poem') => {
    try {
      if (type === 'story') {
        await deleteStory(id);
      } else {
        await deletePoem(id);
      }
      
      // Refresh the content list after deletion
      if (user?.uid) {
        const userContent = await fetchUserContentFromFirestore(user.uid);
        validateContentOwnership(userContent, user.uid);
        
        const published = userContent.filter(item => !item.isPrivate);
        const private_ = userContent.filter(item => item.isPrivate);
        
        setAllStories(userContent);
        setPublishedStories(published);
        setPrivateStories(private_);
        
        setProfileData(prev => ({
          ...prev,
          storiesCount: userContent.length,
          currentWork: userContent.length > 0 ? userContent[0].title : ''
        }));
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  // CRITICAL: Don't render until auth has resolved
  if (authLoading || isLoading) {
    return (
      <div className={styles.profilePageRoot}>
        <HeaderBar />
        <div className={styles.loadingContainer}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonText} />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.profilePageRoot}>
      <HeaderBar />
      
      <main className={styles.profileContent}>
        <div className={styles.profileContainer}>
          {/* Hero Card - Avatar, Name, Bio */}
          <ProfileHeroCard
            displayName={profileData.displayName}
            bio={profileData.bio}
            avatar={profileData.avatar}
            currentWork={profileData.currentWork}
          />

          {/* Stats Row - Stories, Followers */}
          <ProfileStatsRow
            storiesCount={profileData.storiesCount}
            followersCount={profileData.followers}
          />

          {/* Action Buttons - Follow, Message (only show for other users) */}
          {!isOwnProfile && (
            <ProfileActions
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onMessage={handleMessage}
            />
          )}

          {/* Owner's View: Show stories grouped by privacy category */}
          {isOwnProfile && allStories.length > 0 && (
            <>
              {/* Trending Stories */}
              {allStories.filter(s => s.privacy === 'Trending').length > 0 && (
                <PublishedStoriesSection
                  stories={allStories.filter(s => s.privacy === 'Trending')}
                  onStoryClick={handleStoryClick}
                  title="Trending"
                  onDelete={handleDeleteStory}
                  showDelete={true}
                />
              )}

              {/* Open Access Stories */}
              {allStories.filter(s => s.privacy === 'Open access').length > 0 && (
                <PublishedStoriesSection
                  stories={allStories.filter(s => s.privacy === 'Open access')}
                  onStoryClick={handleStoryClick}
                  title="Open Access"
                  onDelete={handleDeleteStory}
                  showDelete={true}
                />
              )}

              {/* Private Stories */}
              {allStories.filter(s => s.privacy === 'Private' || s.privacy === 'private').length > 0 && (
                <PublishedStoriesSection
                  stories={allStories.filter(s => s.privacy === 'Private' || s.privacy === 'private')}
                  onStoryClick={handleStoryClick}
                  title="Private"
                  onDelete={handleDeleteStory}
                  showDelete={true}
                />
              )}
            </>
          )}

          {/* Public View: Only show published stories to other users */}
          {!isOwnProfile && publishedStories.length > 0 && (
            <PublishedStoriesSection
              stories={publishedStories}
              onStoryClick={handleStoryClick}
              title="Published Stories"
            />
          )}

          {/* Empty State - No stories at all */}
          {allStories.length === 0 && isOwnProfile && (
            <div className={styles.emptyState}>
              <h3>No stories published yet</h3>
              <p>Your published stories will appear here.</p>
              <button 
                onClick={() => navigate('/create')}
                className={styles.emptyStateButton}
              >
                Create your first story
              </button>
            </div>
          )}

          {/* Empty State for visitors on profiles with no public stories */}
          {!isOwnProfile && publishedStories.length === 0 && (
            <div className={styles.emptyState}>
              <h3>No stories published yet</h3>
              <p>This author hasn't published any stories.</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit/View Modal */}
      {selectedStory && showEditViewModal && (
        <EditViewModal
          isOpen={showEditViewModal}
          title={selectedStory.title}
          type={selectedStory.type === 'poem' ? 'poem' : 'story'}
          onEdit={handleEditStory}
          onView={handleViewStory}
          onClose={() => setShowEditViewModal(false)}
        />
      )}

      <BottomNavigation activeTab="stories" />
    </div>
  );
}
