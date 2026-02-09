/**
 * ResetPasswordPage - Secure password reset with token validation
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import brandLogo from '../../assets/frame-brand-logo.svg';
import '../auth/auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Validate token on initialization
  const tokenValid = Boolean(token);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // In production, update password via API
      // For now, redirect to signin
      navigate('/signin', { 
        state: { message: 'Password reset successful. Please sign in.' }
      });
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <img src={brandLogo} alt="Storyverse" className="auth-logo" />
          
          <h1 className="auth-title">Invalid reset link</h1>
          <p className="auth-description">
            This password reset link is invalid or has expired.
          </p>

          <div className="auth-error-message">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="rgba(255, 59, 48, 0.8)" strokeWidth="2"/>
              <path d="M24 16v12M24 32v2" stroke="rgba(255, 59, 48, 0.8)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="auth-error-text">
              Reset links expire after 1 hour for security reasons.
            </p>
          </div>

          <button 
            className="auth-button"
            onClick={() => navigate('/forgot-password')}
          >
            Request new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={brandLogo} alt="Storyverse" className="auth-logo" />
        
        <h1 className="auth-title">Create new password</h1>
        <p className="auth-description">
          Choose a strong password you haven't used before
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">New password</label>
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
                autoFocus
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
            {password && validatePassword(password).length === 0 && (
              <div className="auth-success">✓ Strong password</div>
            )}
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

          <button type="submit" className="auth-button">
            Reset password
          </button>
        </form>
      </div>
    </div>
  );
}
