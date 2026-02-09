/**
 * WelcomePage - Emotional entry point to Storyverse
 * First page users see when visiting the app
 */
import { useNavigate } from 'react-router-dom';
import '../auth/auth.css';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page welcome-page">
      <div className="auth-container welcome-container">
        <div className="welcome-image-wrapper">
          <img 
            src="/dashboard-image.png" 
            alt="Storyverse Dashboard" 
            className="auth-dashboard-image" 
          />
          <div className="welcome-image-fade"></div>
        </div>
        
        <div className="welcome-content">
          <h1 className="auth-headline">
            Millions start stories.<br />
            <span className="brand-green">Few return to them.</span><br />
            You just did.
          </h1>

          <p className="auth-subtext">
            Create stories, track your progress,<br />
            and build worlds.
          </p>

          <div className="auth-form">
            <button 
              className="auth-button"
              onClick={() => navigate('/auth/signup')}
            >
              Get started
            </button>

            <button 
              className="auth-button auth-button-secondary"
              onClick={() => navigate('/auth/signin')}
            >
              I already have an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
