import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';

interface SidebarProps {
  storyTitle: string;
  storyId?: string;
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M3 11L12 4L21 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10V20H19V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Story Brain': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 12L20 7.5M12 12V21M12 12L4 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  'Master Bible': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H20V19H5.5C4.67 19 4 18.33 4 17.5V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 17.5C4 16.67 4.67 16 5.5 16H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Scenes: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  Characters: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20C3 16.68 5.69 14 9 14C12.31 14 15 16.68 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 8.5C17.1 8.5 18 7.6 18 6.5C18 5.4 17.1 4.5 16 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 14.2C17.72 14.7 19.7 17.06 19.7 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Locations: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 19 14.5 19 9.5C19 5.36 15.64 2 11.5 2C7.36 2 4 5.36 4 9.5C4 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="11.5" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  Timeline: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8V12L14.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Research: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 16L9 12L12 14.5L16 10.5L20 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'AI Chat': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V14.5C20 15.33 19.33 16 18.5 16H9L5 19.5V16H5.5C4.67 16 4 15.33 4 14.5V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  'Version History': (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C9.24 21 6.77 19.75 5.13 17.79" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17V21H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV_ITEMS = [
  'Dashboard',
  'Story Brain',
  'Master Bible',
  'Scenes',
  'Characters',
  'Locations',
  'Timeline',
  'Research',
];

export default function StoryEditorSidebar({
  storyTitle,
  storyId,
}: SidebarProps) {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();

  const displayName = userProfile?.displayName || user?.displayName || 'Storyteller';
  const initials = displayName.substring(0, 1).toUpperCase();

  const handleNavClick = (item: string) => {
    if (item === 'Dashboard') navigate('/home');
    else if (item === 'Timeline' && storyId) navigate(`/story/timeline/${storyId}`);
    // Other items don't have dedicated routes yet.
  };

  return (
    <aside className="story-editor-sidebar">
      <div className="sidebar-shell">
        <div className="sidebar-project-header">
          <div className="sidebar-project-label">Project</div>
          <div className="sidebar-project-row">
            <button className="sidebar-project-name-btn">
              <span>{storyTitle || 'Untitled Story'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="sidebar-project-settings" onClick={() => navigate('/profile')} aria-label="Settings">
              {NAV_ICONS.Settings}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav-section">
          <ul className="sidebar-nav-list">
            {NAV_ITEMS.map((item) => (
              <li
                key={item}
                className={item === 'Scenes' ? 'active' : undefined}
                onClick={() => handleNavClick(item)}
              >
                {NAV_ICONS[item]}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-nav-spacer" />

        <div className="sidebar-profile-footer">
          <div className="sidebar-profile-avatar">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt={displayName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{displayName}</div>
            <div className="sidebar-profile-plan">★ Premium</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
