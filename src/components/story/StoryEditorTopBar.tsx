import { useNavigate } from 'react-router-dom';

interface StoryEditorTopBarProps {
  storyTitle: string;
  isSaving?: boolean;
  onShare?: () => void;
  onFocusMode?: () => void;
  onMenu?: () => void;
}

export default function StoryEditorTopBar({
  storyTitle,
  isSaving = false,
  onShare,
  onFocusMode,
  onMenu,
}: StoryEditorTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="story-editor-appbar">
      <div className="story-editor-appbar-left">
        <button className="story-editor-appbar-brand" onClick={() => navigate('/dashboard')}>
          <span className="story-editor-appbar-mark">S</span>
          <span className="story-editor-appbar-brand-text">
            <span className="story-editor-appbar-title">Storyverse</span>
            <span className="story-editor-appbar-subtitle">Words well told</span>
          </span>
        </button>

        <div className="story-editor-appbar-divider" />

        <button className="story-editor-project-switch">
          <span>{storyTitle}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="story-editor-appbar-right">
        <span className="story-editor-saved-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isSaving ? 'Saving...' : 'Saved 2m ago'}
        </span>

        <button className="story-editor-appbar-button" onClick={onFocusMode}>
          Focus Mode
        </button>

        <button className="story-editor-appbar-button story-editor-appbar-share" onClick={onShare}>
          Share
        </button>

        <button className="story-editor-appbar-icon-button" onClick={onMenu} aria-label="More options">
          ⋯
        </button>
      </div>
    </header>
  );
}
