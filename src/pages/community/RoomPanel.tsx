
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./CommunityPage.module.css";
import { ROOM_META } from "./roomMeta";
import { useMediaQuery } from '../../hooks/useMediaQuery';


const RoomPanel = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 900px)');
  
  // Open drawer by default when navigating from footer
  const [drawerOpen, setDrawerOpen] = useState(location.state?.openDrawer ?? false);

  const renderRoomsList = () => (
    <>
      <div className={styles.roomsHeader}>
        <h2 className={styles.roomsTitle}>Community Rooms</h2>
      </div>
      <div className={styles.roomsContent}>
        {Object.entries(ROOM_META).map(([id, meta]) => (
          <div
            key={id}
            className={styles.roomItem + (roomId === id ? " " + styles.active : "")}
            onClick={() => {
              navigate(`/community/${id}`);
              if (isMobile) setDrawerOpen(false);
            }}
          >
            <span className={styles.roomIcon}>{meta.icon}</span>
            <span className={styles.roomLabel}>{meta.label}</span>
          </div>
        ))}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div className={styles.roomsDockIndicator} />
        <div
          className={styles.roomsDockTab}
          onClick={() => setDrawerOpen(true)}
          aria-label="Show rooms"
          role="button"
          tabIndex={0}
        >
          <span className={styles.roomsDockIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        {drawerOpen && (
          <div className={styles.roomsDrawerOverlay} onClick={() => setDrawerOpen(false)} />
        )}
        <div
          className={styles.roomsDrawer}
          style={{ transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <button
            className={styles.roomsDrawerClose}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close rooms"
            type="button"
          >
            ×
          </button>
          <aside className={styles.roomsList}>
            {renderRoomsList()}
          </aside>
        </div>
      </>
    );
  }
  
  // Desktop
  return (
    <aside className={styles.roomsList}>
      {renderRoomsList()}
    </aside>
  );
};

export default RoomPanel;
