import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import styles from './SignupPage.module.css';
import { signUp } from '@/lib/firebaseAuth';

// Asset URLs from Figma
const imgSubtract = 'http://localhost:3845/assets/f3535dafaeb56afc37b9c313e41772426cd2e7f1.svg';

// Lock animation data
const lockAnimationUrl = '/lock-animation.json';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockAnimation, setLockAnimation] = useState<any>(null);

  useEffect(() => {
    fetch(lockAnimationUrl)
      .then((res) => res.json())
      .then((data) => setLockAnimation(data))
      .catch((err) => console.error('Failed to load animation:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!formData.email.trim()) {
        setErrorMessage('Please enter your email address');
        setIsLoading(false);
        return;
      }

      if (!formData.password) {
        setErrorMessage('Please enter a password');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Call Firebase signup
      await signUp(formData.email, formData.password);
      
      // On success, redirect to OTP verification page
      navigate('/verify-otp');
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during signup. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth signup
    console.log('Google signup clicked');
  };

  return (
    <div className={styles.container} data-node-id="15:535">
      {/* Background gradient overlay */}
      <div className={styles.backgroundGradient} data-node-id="15:536" />

      {/* Header with logo */}
      <div className={styles.header} data-node-id="15:537">
        <div className={styles.logoSection}>
          <img
            alt="Storyverse logo"
            src={imgSubtract}
            className={styles.logoIcon}
            data-node-id="15:541"
          />
          <div className={styles.brandText}>
            <h1 className={styles.brandName} data-node-id="15:539">
              Storyverse
            </h1>
            <p className={styles.brandTagline} data-node-id="15:540">
              Your words matter
            </p>
          </div>
        </div>
      </div>

      {/* Divider line */}
      <svg
        className={styles.divider}
        data-node-id="15:544"
        viewBox="0 0 358 1"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0" x2="358" y2="0" stroke="#302d2d" />
      </svg>

      {/* Heading section */}
      <div className={styles.headingSection} data-node-id="15:545">
        <p className={styles.headingMain}>Welcome</p>
        <p className={styles.headingSecondary}>aboard!</p>
      </div>

      {/* Security feature info */}
      <div className={styles.securitySection} data-node-id="15:546">
        <div className={styles.lockIconContainer}>
          {lockAnimation && <Lottie animationData={lockAnimation} loop={true} />}
        </div>
        <div className={styles.securityText}>
          <p className={styles.securityTitle}>Private by design</p>
          <p className={styles.securityDescription}>
            Your drafts are encrypted and visible only to you.
          </p>
        </div>
      </div>

      {/* Form section */}
      <form className={styles.form} onSubmit={handleSignup} data-node-id="17:19">
        {/* Error message display */}
        {errorMessage && (
          <div style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}
        
        {/* Email input */}
        <div className={styles.inputWrapper} data-node-id="15:547">
          <svg
            className={styles.inputIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            data-node-id="15:550"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="m20 6-8 5-8-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="email"
            name="email"
            placeholder="john123@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={styles.input}
            data-node-id="15:553"
          />
        </div>

        {/* Password input */}
        <div className={styles.inputWrapper} data-node-id="15:548">
          <svg
            className={styles.inputIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            data-node-id="15:551"
          >
            <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1z" />
            <path d="M12 7v10M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="6 character password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className={styles.input}
            data-node-id="15:554"
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
            data-node-id="15:557"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showPassword ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Confirm password input */}
        <div className={styles.inputWrapper} data-node-id="15:549">
          <svg
            className={styles.inputIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            data-node-id="15:552"
          >
            <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1z" />
            <path d="M12 7v10M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            minLength={6}
            className={styles.input}
            data-node-id="15:555"
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Toggle password visibility"
            data-node-id="15:558"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showConfirmPassword ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Divider text */}
        <p className={styles.dividerText} data-node-id="17:17">
          Or
        </p>

        {/* Google Sign in button */}
        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleSignup}
          disabled={isLoading}
          data-node-id="17:4"
        >
          <span>Sign in with Google</span>
        </button>

        {/* Sign up button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          data-node-id="19:69"
        >
          <span className={styles.submitButtonText} data-node-id="19:70">
            {isLoading ? 'Signing up...' : 'Sign up'}
          </span>
        </button>
      </form>

      {/* Sign in link */}
      <p className={styles.signInLink} data-node-id="19:66">
        You already have an account?{' '}
        <a href="/signin" className={styles.signInLinkText}>
          Sign in
        </a>
      </p>
    </div>
  );
}
