/**
 * Dropdown - Reusable dropdown component
 * Used for Privacy, Genre, and Audience selectors
 */
import { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

interface DropdownProps {
  label: string;
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
  variant?: 'privacy' | 'genre' | 'audience';
  onOpenChange?: (isOpen: boolean) => void;
  isOpen?: boolean;
  disabled?: boolean;
}

export default function Dropdown({
  label,
  value,
  options = [],
  onChange,
  variant = 'genre',
  onOpenChange,
  isOpen = false,
  disabled = false
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use controlled state if provided, otherwise use internal state
  const open = onOpenChange !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  const handleSelect = (option: string) => {
    onChange?.(option);
    setOpen(false);
  };

  const displayText = value || label;

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span className={styles.dropdownLabel}>{displayText}</span>
        <svg 
          width="8" 
          height="4" 
          viewBox="0 0 8 4" 
          fill="none"
          className={open ? styles.chevronUp : ''}
        >
          <path 
            d="M1 0.5L4 3.5L7 0.5" 
            stroke="white" 
            strokeWidth="1" 
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && options.length > 0 && !disabled && (
        <div className={styles.dropdownMenu} role="listbox">
          {options.map((option) => (
            <button
              key={option}
              className={styles.dropdownOption}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
