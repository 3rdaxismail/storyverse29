/**
 * SignUpPage - Account creation for new writers
 * Uses Firebase Authentication (Email/Password and Google OAuth)
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import brandLogo from '../../assets/frame-brand-logo.svg';
import '../auth/auth.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Sign up with Firebase
      await signUp(email, password);
      // User document is created automatically in AuthContext
      // PublicRoute will redirect to profile setup
    } catch (error: any) {
      console.error('Sign up error:', error);
      setErrors({ 
        email: error.code === 'auth/email-already-in-use' 
          ? 'This email is already registered' 
          : error.message || 'Failed to create account'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    console.log('Google sign-up button clicked');
    setLoading(true);
    setErrors({}); // Clear previous errors
    try {
      console.log('Attempting Google sign-in...');
      await signInWithGoogle();
      console.log('Google sign-in successful');
      // User document is created automatically if it doesn't exist
      // PublicRoute will redirect based on profileCompleted status
    } catch (error: unknown) {
      console.error('Google sign up error:', error);
      
      let errorMessage = 'Failed to sign up with Google';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        
        switch (firebaseError.code) {
          case 'auth/unauthorized-domain':
            errorMessage = 'This domain is not authorized. Please add localhost:5175 to Firebase Console > Authentication > Settings > Authorized domains';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Only one pop-up request is allowed at a time';
            break;
          default:
            errorMessage = firebaseError.message || errorMessage;
        }
      }
      
      setErrors({ email: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={brandLogo} alt="Storyverse" className="auth-logo" />
        
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-description">
          Your drafts belong to you. Always private. Always yours.
        </p>

        <button 
          className="auth-button auth-button-google"
          onClick={handleGoogleSignUp}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line"></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && <div className="auth-error">{errors.email}</div>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">Confirm password</label>
            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <div className="auth-error">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="auth-link-center">
          Already have an account? <Link to="/auth/signin" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
