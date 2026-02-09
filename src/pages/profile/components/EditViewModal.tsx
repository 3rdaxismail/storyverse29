/**
 * EditViewModal - Modal dialog to choose between editing or viewing a story/poem
 */

import { useEffect } from 'react';
import styles from './EditViewModal.module.css';

interface EditViewModalProps {
  isOpen: boolean;
  title: string;
  type: 'story' | 'poem';
  onEdit: () => void;
  onView: () => void;
  onClose: () => void;
}

export default function EditViewModal({
  isOpen,
  title,
  type,
  onEdit,
  onView,
  onClose
}: EditViewModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    console.log('EditViewModal - isOpen state changed to:', isOpen);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        console.log('Escape pressed, closing modal');
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>
              {type === 'poem' ? '📝 ' : '📖 '}
              {title}
            </h2>
            <button 
              className={styles.closeButton} 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <p className={styles.message}>What would you like to do?</p>
          </div>

          {/* Footer - Action Buttons */}
          <div className={styles.footer}>
            <button className={styles.viewButton} onClick={onView}>
              <span className={styles.icon}>👁️</span>
              <span>View</span>
            </button>
            <button className={styles.editButton} onClick={onEdit}>
              <span className={styles.icon}>✏️</span>
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
