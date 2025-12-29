import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PreviewLandingPage, SignupPage, SigninPage, ForgotPasswordPage, OTPVerificationPage } from '@/pages/public';
import { DashboardPage } from '@/pages/app';
import '@/styles/global.css';

/**
 * App Component
 * 
 * Root application shell with routing configuration.
 * Sets up React Router and Helmet for SEO metadata management.
 */
export const App: React.FC = () => {
  console.log('App component rendering');
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PreviewLandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />

          {/* Protected App Routes */}
          <Route path="/app/dashboard" element={<DashboardPage />} />
          
          {/* 404 - Not Found */}
          <Route 
            path="*" 
            element={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh',
                background: '#0D0D0F',
                color: '#ffffff',
                fontSize: '24px'
              }}>
                <h1>404 - Page Not Found</h1>
              </div>
            } 
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;
