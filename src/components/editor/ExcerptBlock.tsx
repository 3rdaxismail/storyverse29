/**
 * ExcerptBlock (273:146) from Figma
 * 
 * Excerpt display with persistence via WritingSessionEngine
 * 
 * VERTICAL layout, 4px itemSpacing, w=380, h=90
 * Contains: Heading text (12px light) + Body text (12px light, multi-line)
 */

import { useExcerptHeading, useExcerptBody } from '../../hooks/useWritingSession';
import styles from './ExcerptBlock.module.css';

interface ExcerptBlockProps {
  excerptHeadingSectionId: string;
  excerptBodySectionId: string;
  readOnly?: boolean;
}

export default function ExcerptBlock({
  readOnly = false,
}: ExcerptBlockProps) {
  const [headingContent, setHeadingContent] = useExcerptHeading();
  const [bodyContent, setBodyContent] = useExcerptBody();

  const MAX_EXCERPT_LENGTH = 160;

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Limit to 160 characters
    if (newValue.length <= MAX_EXCERPT_LENGTH) {
      setBodyContent(newValue);
    }
  };

  return (
    <div className={styles.excerptBlock}>
      <input
        type="text"
        className={styles.excerptHeading}
        placeholder="Excerpt"
        value={headingContent}
        onChange={(e) => setHeadingContent(e.target.value)}
        readOnly={readOnly}
      />
      <div className={styles.textareaWrapper}>
        <textarea
          className={styles.excerptBody}
          placeholder="Every evening, the 6:42 local left Dadar crowded with bodies and unspoken decisions..."
          value={bodyContent}
          onChange={handleBodyChange}
          readOnly={readOnly}
          rows={4}
          maxLength={MAX_EXCERPT_LENGTH}
        />
        <div className={styles.characterCount}>
          {bodyContent.length}/{MAX_EXCERPT_LENGTH}
        </div>
      </div>
    </div>
  );
}

