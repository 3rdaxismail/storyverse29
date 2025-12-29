import React from 'react';
import styles from './PrimaryButton.module.css';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
 * Primary Button Component
 * 
 * Main action button with green accent gradient background.
 * Used for primary CTAs like "Get Started"
 * 
 * Usage:
 * ```
 * <PrimaryButton onClick={handleClick}>
 *   Get Started
 * </PrimaryButton>
 * ```
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
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

export default PrimaryButton;
