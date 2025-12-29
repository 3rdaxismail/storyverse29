import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OTPVerificationPage.module.css';
import { getCurrentUser } from '@/lib/firebaseAuth';

export function OTPVerificationPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Get current user
      const user = getCurrentUser();

      if (!user) {
        setErrorMessage('No user session found. Please sign up again.');
        setIsLoading(false);
        return;
      }

      // Refresh user state to get latest emailVerified status
      await user.reload();

      // Check if email is verified
      if (user.emailVerified) {
        // Email verified, route to dashboard
        navigate('/app/dashboard');
      } else {
        // Email not verified yet
        setErrorMessage('Please verify your email first. Check your inbox for the verification link.');
      }
    } catch (error: any) {
      setErrorMessage('An error occurred. Please try again later.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = getCurrentUser();

      if (!user) {
        setErrorMessage('No user session found.');
        setIsLoading(false);
        return;
      }

      // Resend verification email
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(user);
      
      setErrorMessage('Verification email has been resent. Check your inbox.');
    } catch (error: any) {
      setErrorMessage('Failed to resend verification email. Please try again.');
      console.error('Resend email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background} />
      
      <div className={styles.frame}>
        {/* Logo only */}
        <svg className={styles.logo} width="132" height="30" viewBox="0 0 132 30">
          <image href="/logo.svg" width="132" height="30" preserveAspectRatio="xMidYMid meet" />
        </svg>

        <div className={styles.divider} />

        <h1 className={styles.title}>
          <span className={styles.titleLine1}>OTP</span>
          <span className={styles.titleLine2}>Verification</span>
        </h1>

        <p className={styles.subtitle}>Enter OTP we've sent to you by email</p>

        <div className={styles.inputBox}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.26 3.64m-5.88-2.88a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div style={{ 
            color: errorMessage.includes('resent') ? '#4CAF50' : '#ff6b6b', 
            fontSize: '13px', 
            marginBottom: '10px', 
            textAlign: 'center',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        <button 
          className={styles.button}
          onClick={handleContinue}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Verifying...' : 'Continue'}
        </button>

        <button 
          className={styles.resendOtp}
          onClick={handleResendOtp}
          disabled={isLoading}
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'none' }}
        >
          Resend OTP
        </button>

        <button 
          className={styles.backToLogin}
          onClick={handleBackToSignup}
          disabled={isLoading}
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'none' }}
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
}
