import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';
import { resetPassword } from '@/lib/firebaseAuth';

/**
 * Forgot Password Page Component
 * Figma Node ID: 23-110
 * 
 * Exact Figma Implementation:
 * - 411px × 917px frame with radial gradient background
 * - LEFT-aligned layout (not centered)
 * - SVG logo from Figma
 * - Pill-shaped input with exact gradient
 * - White send button with dark text
 * - Text-only signup link (not a button)
 */

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (!formData.email.trim()) {
        setErrorMessage('Please enter your email address');
        setIsLoading(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        setErrorMessage('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Call Firebase password reset
      await resetPassword(formData.email);
      
      // Redirect to signin after success
      navigate('/signin');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send verification link. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className={styles.frame}>
      {/* Radial Gradient Background */}
      <div className={styles.backgroundGradient} />

      {/* Main Content - 411px × 917px frame */}
      <div className={styles.content}>
        {/* Header - Logo & Tagline (LEFT-aligned) */}
        <div className={styles.header}>
          {/* Storyverse Logo - SVG includes tagline text */}
          <div className={styles.logoContainer}>
            <img src="/logo.svg" alt="Storyverse" className={styles.fullLogo} />
          </div>
        </div>

        {/* Divider Line - starts from left margin */}
        <div className={styles.divider} />

        {/* Title - LEFT-aligned with "Forgot" in accent + "Password" in white */}
        <h2 className={styles.title}>
          Forgot<br />
          <span className={styles.passwordWhite}>Password</span>
        </h2>

        {/* Description - LEFT-aligned */}
        <p className={styles.description}>
          Don't worry we got you! As long as you{'\n'}still remember your email.
        </p>

        {/* Form */}
        <form onSubmit={handleSendVerification} className={styles.form}>
          {/* Input - Pill shape (height 50px, 358px wide) */}
          <div className={styles.inputField}>
            <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
            </svg>
            <input
              type="email"
              name="email"
              placeholder="john123@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className={styles.errorMsg}>{errorMessage}</p>
          )}

          {/* Send Button - White with dark text */}
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send verification link'}
          </button>

          {/* Signup Link - TEXT style with "Sign up" bolded */}
          <p className={styles.signupLine}>
            Go to <button type="button" onClick={handleGoToSignup} className={styles.signupLink} disabled={isLoading}>Sign up</button> page
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
