/**
 * ForgotPasswordPage - Password recovery request
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import brandLogo from '../../assets/frame-brand-logo.svg';
import '../auth/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: window.location.origin + '/signin',
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log('[ForgotPassword] Password reset email sent to:', email);
      setSubmitted(true);
    } catch (err: any) {
      console.error('[ForgotPassword] Error sending reset email:', err);
      console.error('[ForgotPassword] Error code:', err.code);
      console.error('[ForgotPassword] Error message:', err.message);
      
      // Show actual error to user for debugging
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/user-not-found') {
        // For security, still show success even if user not found
        setSubmitted(true);
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <img src={brandLogo} alt="Storyverse" className="auth-logo" />
          
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-description">
            If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
          </p>

          <div className="auth-success-message">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="rgba(165, 183, 133, 1)" strokeWidth="2"/>
              <path d="M16 24l6 6 10-12" stroke="rgba(165, 183, 133, 1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="auth-success-text">
              Please check your inbox and spam/junk folder for the password reset email. The link expires in 1 hour.
            </p>
          </div>

          <Link to="/signin" className="auth-button">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={brandLogo} alt="Storyverse" className="auth-logo" />
        
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-description">
          Enter your email and we'll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error auth-error-general">{error}</div>}

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
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="auth-link-center">
          Remember your password? <Link to="/signin" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
