/**
 * PublicPoemPage - SEO-optimized public poem view
 * Accessible via /poem/:slug
 * No authentication required for published poems
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SEOHead from '../../components/seo/SEOHead';
import { extractIdFromSlug, generateExcerpt, sanitizeForMeta, generateCanonicalUrl, generatePoemStructuredData } from '../../utils/seo';
import styles from './PublicPoemPage.module.css';

interface Poem {
  id: string;
  uid: string;
  title: string;
  text: string;
  coverImageUrl?: string;
  genre: string;
  tags: string[];
  privacy: string;
  lineCount: number;
  stanzaCount: number;
  wordCount: number;
  readTime: number;
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function PublicPoemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoem() {
      if (!slug) {
        setError('Invalid poem URL');
        setLoading(false);
        return;
      }

      try {
        // Extract ID from slug
        const idPrefix = extractIdFromSlug(slug);
        
        if (!idPrefix) {
          setError('Poem not found');
          setLoading(false);
          return;
        }

        // Query poems that start with this ID prefix
        const poemsRef = collection(db, 'poems');
        const q = query(
          poemsRef,
          where('privacy', 'in', ['Open access', 'Trending'])
        );
        
        const snapshot = await getDocs(q);
        
        // Find the poem with matching ID prefix
        const matchingDoc = snapshot.docs.find(doc => 
          doc.id.startsWith(idPrefix)
        );

        if (!matchingDoc) {
          setError('Poem not found or not publicly available');
          setLoading(false);
          return;
        }

        const poemData = { id: matchingDoc.id, ...matchingDoc.data() } as Poem;
        
        // Verify it's actually public
        if (!['Open access', 'Trending'].includes(poemData.privacy)) {
          setError('Poem not publicly available');
          setLoading(false);
          return;
        }

        setPoem(poemData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading poem:', err);
        setError('Failed to load poem');
        setLoading(false);
      }
    }

    loadPoem();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading poem...</div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className={styles.container}>
        <SEOHead
          title="Poem Not Found"
          description="The poem you're looking for could not be found."
          noindex={true}
        />
        <div className={styles.error}>
          <h1>Poem Not Found</h1>
          <p>{error || 'The poem you\'re looking for could not be found.'}</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const description = sanitizeForMeta(poem.text || 'Read this poem on Storyverse');
  const excerpt = generateExcerpt(description, 160);
  const canonicalUrl = generateCanonicalUrl(`/poem/${slug}`);
  
  const structuredData = generatePoemStructuredData({
    title: poem.title,
    text: poem.text,
    authorName: poem.authorName || 'Anonymous',
    publishedDate: poem.createdAt.toDate(),
    updatedDate: poem.updatedAt.toDate()
  });

  return (
    <div className={styles.container}>
      <SEOHead
        title={poem.title}
        description={excerpt}
        canonical={canonicalUrl}
        ogType="article"
        ogImage={poem.coverImageUrl}
        structuredData={structuredData}
      />
      
      <div className={styles.content}>
        {poem.coverImageUrl && (
          <img 
            src={poem.coverImageUrl} 
            alt={poem.title}
            className={styles.coverImage}
          />
        )}
        
        <h1 className={styles.title}>{poem.title}</h1>
        
        <div className={styles.metadata}>
          <span className={styles.author}>
            By {poem.authorName || 'Anonymous'}
          </span>
          <span className={styles.genre}>{poem.genre}</span>
          <span className={styles.readTime}>{poem.readTime} min read</span>
          <span className={styles.lines}>{poem.lineCount} lines</span>
        </div>

        {poem.tags && poem.tags.length > 0 && (
          <div className={styles.tags}>
            {poem.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className={styles.poemText}>
          {poem.text.split('\n').map((line, index) => (
            <p key={index}>{line || '\u00A0'}</p>
          ))}
        </div>

        <div className={styles.cta}>
          <p>Sign in to discover more amazing poems and writers on Storyverse.</p>
          <button onClick={() => navigate('/auth/signin')}>Sign In to Explore</button>
        </div>
      </div>
    </div>
  );
}
