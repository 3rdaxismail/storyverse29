
import styles from "./HeaderBar.module.css";
import brandLogo from "../../assets/frame-brand-logo.svg";
import headerLine from "../../assets/header_line.svg";
import InboxHeaderIcon from "./InboxHeaderIcon";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useState, useRef, useEffect } from 'react';

interface HeaderBarProps {
  onBackClick?: () => void;
  pageTitle?: string;
}


export default function HeaderBar({ onBackClick, pageTitle }: HeaderBarProps) {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigate('/auth/signin');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.left}>
          {onBackClick ? (
            <>
              <button className={styles.backButton} onClick={onBackClick} aria-label="Go back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
            </>
          ) : (
            <img src={brandLogo} alt="Storyverse" className={styles.logo} />
          )}
        </div>

        <div className={styles.right}>
          <InboxHeaderIcon />
          <div className={styles.profileDropdown} ref={dropdownRef}>
            <button
              className={styles.avatarButton}
              aria-label="Profile"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              type="button"
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatarRing} />
                <div className={styles.avatarContainer}>
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Profile" 
                      className={styles.avatarPhoto}
                    />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(165, 183, 133, 1)" stroke="none">
                      <circle cx="12" cy="8" r="5"/>
                      <path d="M3 21c0-4 4-7 9-7s9 3 9 7"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={handleProfileClick}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile
                </button>
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <img src={headerLine} alt="" className={styles.headerLine} />
    </header>
  );
}
