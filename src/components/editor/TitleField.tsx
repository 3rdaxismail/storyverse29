/**
 * TitleField Component
 * 
 * DEPRECATED: This component uses the old generic content API.
 * For Story Editor, use the title input with useStoryTitle hook instead.
 * 
 * Temporarily returns simple input to avoid breaking imports.
 */

import styles from './TitleField.module.css';

interface TitleFieldProps {
  sectionId?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
}

export default function TitleField({
  placeholder = 'Untitled',
  disabled = false,
  readOnly = false,
  fontSize = 'medium',
}: TitleFieldProps) {
  return (
    <input
      type="text"
      className={`${styles.titleField} ${styles[fontSize]}`}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      spellCheck
      aria-label="Title field"
    />
  );
}
