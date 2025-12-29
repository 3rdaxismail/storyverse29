import { useState } from "react";
import styles from "./HeaderFromFigma.module.css";
import logoStoryverse from "@/assets/icons/figma/logo-storyverse.svg";
import btnInboxIcon from "@/assets/icons/figma/btn-inbox-icon.svg";

interface HeaderFromFigmaProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  unreadCount?: number;
}

export function HeaderFromFigma({
  onNotificationClick,
  onProfileClick,
  unreadCount = 0,
}: HeaderFromFigmaProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className={styles.groupHeaderActions}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <img
          src={logoStoryverse}
          alt="Storyverse"
          className={styles.logoStoryverse}
        />
        <div className={styles.brandInfo}>
          <div className={styles.brandName}>Storyverse</div>
          <div className={styles.brandTagline}>Your words matter</div>
        </div>
      </div>

      {/* Spacer */}
      <div className={styles.spacer}></div>

      {/* Right Actions Section */}
      <div className={styles.actionsSection}>
        {/* Inbox Button with Icon */}
        <button
          className={styles.btnInboxIcon}
          onClick={onNotificationClick}
          title="Inbox"
          aria-label="Inbox"
        >
          <img
            src={btnInboxIcon}
            alt="Inbox"
            className={styles.inboxIconImg}
          />

          {/* Unread Indicator Badge */}
          {unreadCount > 0 && (
            <div className={styles.indicatorUnreadInbox}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </button>

        {/* Profile Section - Border + Image */}
        <button
          className={styles.profileContainer}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          onBlur={() => setShowProfileMenu(false)}
          title="Profile"
          aria-label="Profile menu"
        >
          {/* Profile Border Ring */}
          <div className={styles.borderProfile}>
            {/* Profile Image */}
            <div className={styles.imgProfileUser}>
              <svg
                viewBox="0 0 64 64"
                width="29"
                height="29"
                className={styles.profileImage}
              >
                <circle cx="32" cy="32" r="32" fill="#666" />
                <circle cx="32" cy="20" r="10" fill="#999" />
                <path
                  d="M 10 55 Q 10 40 32 40 Q 54 40 54 55"
                  fill="#999"
                />
              </svg>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className={styles.profileMenu}>
              <a href="/profile" className={styles.menuItem}>
                My Profile
              </a>
              <a href="/settings" className={styles.menuItem}>
                Settings
              </a>
              <a href="/help" className={styles.menuItem}>
                Help & Support
              </a>
              <hr className={styles.menuDivider} />
              <button className={styles.menuItem + " " + styles.logout}>
                Sign Out
              </button>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
