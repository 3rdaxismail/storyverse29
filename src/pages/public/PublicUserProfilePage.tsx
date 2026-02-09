/**
 * PublicUserProfilePage - SEO-optimized public user profile
 * Accessible via /user/:username
 * No authentication required
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SEOHead from '../../components/seo/SEOHead';
import { generateCanonicalUrl, generateProfileStructuredData, generateUniqueSlug } from '../../utils/seo';
import styles from './PublicUserProfilePage.module.css';

interface UserProfile {
  uid: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  storiesCount: number;
  poemsCount: number;
  followersCount: number;
}

interface ContentItem {
  id: string;
  title: string;
  coverImageUrl?: string;
  type: 'story' | 'poem';
  slug: string;
}

export default function PublicUserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!username) {
        setError('Invalid username');
        setLoading(false);
        return;
      }

      try {
        // Find user by display name (username)
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('displayName', '==', username));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Load published stories
        const storiesRef = collection(db, 'stories');
        const storiesQuery = query(
          storiesRef,
          where('uid', '==', userDoc.id),
          where('status', '==', 'published'),
          where('privacy', 'in', ['Open access', 'Trending'])
        );
        const storiesSnapshot = await getDocs(storiesQuery);

        // Load published poems
        const poemsRef = collection(db, 'poems');
        const poemsQuery = query(
          poemsRef,
          where('uid', '==', userDoc.id),
          where('privacy', 'in', ['Open access', 'Trending'])
        );
        const poemsSnapshot = await getDocs(poemsQuery);

        // Combine content
        const storyItems: ContentItem[] = storiesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.storyTitle || 'Untitled Story',
            coverImageUrl: data.coverImageUrl,
            type: 'story' as const,
            slug: generateUniqueSlug(data.storyTitle || 'untitled', doc.id)
          };
        });

        const poemItems: ContentItem[] = poemsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Poem',
            coverImageUrl: data.coverImageUrl,
            type: 'poem' as const,
            slug: generateUniqueSlug(data.title || 'untitled', doc.id)
          };
        });

        setProfile({
          uid: userDoc.id,
          displayName: userData.displayName || username,
          bio: userData.bio,
          photoURL: userData.photoURL,
          storiesCount: storyItems.length,
          poemsCount: poemItems.length,
          followersCount: userData.followersCount || 0
        });

        setContent([...storyItems, ...poemItems]);
        setLoading(false);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <SEOHead
          title="User Not Found"
          description="The user profile you're looking for could not be found."
          noindex={true}
        />
        <div className={styles.error}>
          <h1>User Not Found</h1>
          <p>{error || 'The user profile you\'re looking for could not be found.'}</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const description = profile.bio 
    ? `${profile.bio.substring(0, 150)}${profile.bio.length > 150 ? '...' : ''}`
    : `${profile.displayName} on Storyverse. ${profile.storiesCount} stories, ${profile.poemsCount} poems.`;
  
  const canonicalUrl = generateCanonicalUrl(`/user/${username}`);
  
  const structuredData = generateProfileStructuredData({
    name: profile.displayName,
    bio: profile.bio,
    photoUrl: profile.photoURL,
    url: canonicalUrl
  });

  return (
    <div className={styles.container}>
      <SEOHead
        title={`${profile.displayName} - Writer Profile`}
        description={description}
        canonical={canonicalUrl}
        ogType="profile"
        ogImage={profile.photoURL}
        structuredData={structuredData}
      />
      
      <div className={styles.profileHeader}>
        {profile.photoURL && (
          <img 
            src={profile.photoURL} 
            alt={profile.displayName}
            className={styles.avatar}
          />
        )}
        
        <h1 className={styles.name}>{profile.displayName}</h1>
        
        {profile.bio && (
          <p className={styles.bio}>{profile.bio}</p>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{profile.storiesCount}</span>
            <span className={styles.statLabel}>Stories</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{profile.poemsCount}</span>
            <span className={styles.statLabel}>Poems</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{profile.followersCount}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
        </div>
      </div>

      {content.length > 0 ? (
        <div className={styles.contentGrid}>
          {content.map((item) => (
            <div 
              key={item.id} 
              className={styles.contentCard}
              onClick={() => navigate(`/${item.type}/${item.slug}`)}
            >
              {item.coverImageUrl && (
                <img 
                  src={item.coverImageUrl} 
                  alt={item.title}
                  className={styles.cardImage}
                />
              )}
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <span className={styles.cardType}>
                {item.type === 'story' ? 'Story' : 'Poem'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No public content yet.</p>
        </div>
      )}

      <div className={styles.cta}>
        <p>Sign in to follow {profile.displayName} and discover more amazing writers on Storyverse.</p>
        <button onClick={() => navigate('/auth/signin')}>Sign In</button>
      </div>
    </div>
  );
}
