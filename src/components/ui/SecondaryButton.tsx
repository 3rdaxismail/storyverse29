import React from 'react';
import styles from './SecondaryButton.module.css';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button text/label
   */
  children: React.ReactNode;
  
  /**
   * Whether button is loading
   */
  isLoading?: boolean;
  
  /**
   * Optional left icon
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Optional right icon
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

/**
 * Secondary Button Component
 * 
 * Secondary action button with dark gradient background and light border.
 * Used for secondary CTAs like "I already have an account"
 * 
 * Usage:
 * ```
 * <SecondaryButton onClick={handleClick}>
 *   I already have an account
 * </SecondaryButton>
 * ```
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={styles.loading}>
          <span className={styles.spinner} />
          Loading...
        </span>
      ) : (
        <>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default SecondaryButton;
