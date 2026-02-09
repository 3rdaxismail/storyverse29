import styles from "./HeaderBar.module.css";
import brandLogo from "../../assets/frame-brand-logo.svg";
import { useNavigate } from 'react-router-dom';

export default function PublicHeader() {
  const navigate = useNavigate();
  
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.left}>
          <img 
            src={brandLogo} 
            alt="Storyverse" 
            className={styles.logo} 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className={styles.right}>
          <button
            onClick={() => navigate('/auth/welcome')}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--brand-secondary, rgba(165, 183, 133, 1))',
              color: 'var(--text-dark, rgba(27, 28, 30, 1))',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-primary)',
              fontSize: 'var(--font-caption-size, 14px)',
              fontWeight: 600,
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-primary, rgba(167, 186, 136, 1))'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-secondary, rgba(165, 183, 133, 1))'}
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
