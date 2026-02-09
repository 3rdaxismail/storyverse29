/**
 * PublicStoryPage - SEO-optimized public story view
 * Accessible via /story/:slug
 * No authentication required for published stories
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SEOHead from '../../components/seo/SEOHead';
import { extractIdFromSlug, generateExcerpt, sanitizeForMeta, generateCanonicalUrl, generateStoryStructuredData } from '../../utils/seo';
import styles from './PublicStoryPage.module.css';

interface Story {
  id: string;
  uid: string;
  storyTitle: string;
  excerptBody: string;
  coverImageUrl?: string;
  primaryGenre: string;
  wordCount: number;
  readingTime: number;
  status: 'draft' | 'published';
  privacy: string;
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function PublicStoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStory() {
      if (!slug) {
        setError('Invalid story URL');
        setLoading(false);
        return;
      }

      try {
        // Extract ID from slug
        const idPrefix = extractIdFromSlug(slug);
        
        if (!idPrefix) {
          setError('Story not found');
          setLoading(false);
          return;
        }

        // Query stories that start with this ID prefix
        const storiesRef = collection(db, 'stories');
        const q = query(
          storiesRef,
          where('status', '==', 'published'),
          where('privacy', 'in', ['Open access', 'Trending'])
        );
        
        const snapshot = await getDocs(q);
        
        // Find the story with matching ID prefix
        const matchingDoc = snapshot.docs.find(doc => 
          doc.id.startsWith(idPrefix)
        );

        if (!matchingDoc) {
          setError('Story not found or not publicly available');
          setLoading(false);
          return;
        }

        const storyData = { id: matchingDoc.id, ...matchingDoc.data() } as Story;
        
        // Verify it's actually public
        if (storyData.status !== 'published' || 
            !['Open access', 'Trending'].includes(storyData.privacy)) {
          setError('Story not publicly available');
          setLoading(false);
          return;
        }

        setStory(storyData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading story:', err);
        setError('Failed to load story');
        setLoading(false);
      }
    }

    loadStory();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading story...</div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className={styles.container}>
        <SEOHead
          title="Story Not Found"
          description="The story you're looking for could not be found."
          noindex={true}
        />
        <div className={styles.error}>
          <h1>Story Not Found</h1>
          <p>{error || 'The story you\'re looking for could not be found.'}</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const description = sanitizeForMeta(story.excerptBody || 'Read this story on Storyverse');
  const excerpt = generateExcerpt(description, 160);
  const canonicalUrl = generateCanonicalUrl(`/story/${slug}`);
  
  const structuredData = generateStoryStructuredData({
    title: story.storyTitle,
    excerpt,
    authorName: story.authorName || 'Anonymous',
    publishedDate: story.createdAt.toDate(),
    updatedDate: story.updatedAt.toDate(),
    imageUrl: story.coverImageUrl
  });

  return (
    <div className={styles.container}>
      <SEOHead
        title={story.storyTitle}
        description={excerpt}
        canonical={canonicalUrl}
        ogType="article"
        ogImage={story.coverImageUrl}
        structuredData={structuredData}
      />
      
      <div className={styles.content}>
        {story.coverImageUrl && (
          <img 
            src={story.coverImageUrl} 
            alt={story.storyTitle}
            className={styles.coverImage}
          />
        )}
        
        <h1 className={styles.title}>{story.storyTitle}</h1>
        
        <div className={styles.metadata}>
          <span className={styles.author}>
            By {story.authorName || 'Anonymous'}
          </span>
          <span className={styles.genre}>{story.primaryGenre}</span>
          <span className={styles.readTime}>{story.readingTime} min read</span>
          <span className={styles.words}>{story.wordCount} words</span>
        </div>

        <div className={styles.excerpt}>
          {story.excerptBody}
        </div>

        <div className={styles.cta}>
          <p>Sign in to read the full story and discover more amazing content on Storyverse.</p>
          <button onClick={() => navigate('/auth/signin')}>Sign In to Read</button>
        </div>
      </div>
    </div>
  );
}
