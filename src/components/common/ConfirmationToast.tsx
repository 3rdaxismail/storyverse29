/**
 * ConfirmationToast Component
 * Animated confirmation dialog for destructive actions
 * Replaces browser confirm() with styled toast notifications
 */
import styles from './ConfirmationToast.module.css';

interface ConfirmationToastProps {
  message: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
  show: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationToast({
  message,
  title = 'Confirm',
  onConfirm,
  onCancel,
  show,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: ConfirmationToastProps) {
  if (!show) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div 
        className={`${styles.confirmationToast} ${show ? styles.slideIn : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.confirmButton}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
          <button 
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
