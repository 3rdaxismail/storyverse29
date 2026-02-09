/**
 * PublishedStoriesSection - Grid of story cards with header
 * Responsive layout with staggered animations
 * Supports both published and private story sections
 */

import { StoryCard } from '../../../components/cards';
import styles from './PublishedStoriesSection.module.css';

interface Story {
  id: string;
  title: string;
  coverImageUrl: string;
  genre: string;
  likes: number;
  readingTime: number;
  comments?: number;
  type?: 'story' | 'poem';
  excerpt?: string;
  audience?: string;
  wordCount?: number;
  authorName?: string;
}

interface PublishedStoriesSectionProps {
  stories: Story[];
  onStoryClick: (id: string) => void;
  title?: string;
  onDelete?: (id: string, type: 'story' | 'poem') => void;
  showDelete?: boolean;
}

export default function PublishedStoriesSection({
  stories,
  onStoryClick,
  title = 'Published Stories',
  onDelete,
  showDelete = false
}: PublishedStoriesSectionProps) {
  return (
    <section className={styles.section}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>

      {/* Stories Grid */}
      <div className={styles.storiesGrid}>
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            title={story.title}
            coverImageUrl={story.coverImageUrl}
            genre={story.genre}
            likes={story.likes}
            comments={story.comments || 0}
            wordCount={story.wordCount || 0}
            type={story.type || 'story'}
            excerpt={story.excerpt}
            audience={story.audience}
            authorName={story.authorName}
            onClick={onStoryClick}
            onDelete={onDelete}
            showDelete={showDelete}
          />
        ))}
      </div>
    </section>
  );
}
