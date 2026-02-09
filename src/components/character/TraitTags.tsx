/**
 * TraitTags - Selectable trait tags
 */
import styles from './TraitTags.module.css';

interface TraitTagsProps {
  tags: string[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
}

export default function TraitTags({
  tags,
  selectedTags,
  onChange
}: TraitTagsProps) {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className={styles.traitTags}>
      {tags.map(tag => (
        <button
          key={tag}
          type="button"
          className={`${styles.tag} ${selectedTags.includes(tag) ? styles.selected : ''}`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
