import React, { Suspense, lazy } from "react";
const CommunityPageWrapper = lazy(() => import('./pages/CommunityPageWrapper'));
const TrendingPage = lazy(() => import('./pages/trending/TrendingPage'));
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateProjectPage from './pages/create/CreateProjectPage';
import StoryEditorPage from './pages/story-editor/StoryEditorPage';
import StoryReaderPage from './pages/story-reader/StoryReaderPage';
import PoemEditorPage from './pages/poem-editor/PoemEditorPage';
import PoemReaderPage from './pages/poem-reader/PoemReaderPage';
import CharacterProfilePage from './pages/character-profile/CharacterProfilePage';

import ProfilePage from './pages/profile/ProfilePage';
import PublicProfilePage from './pages/profile/PublicProfilePage';
import ScreenLayout from './pages/ScreenLayout';
import { useInboxState } from './hooks/useInboxState';
import PWAUpdateNotification from './components/pwa/PWAUpdateNotification';

// Auth pages
import WelcomePage from './pages/auth/WelcomePage';
import SignUpPage from './pages/auth/SignUpPage';
import SignInPage from './pages/auth/SignInPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import FirstTimeProfileSetupPage from './pages/auth/FirstTimeProfileSetupPage';

// Route guards
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

const InboxPage = lazy(() => import('./pages/inbox/InboxPage'));
const InboxThreadPage = lazy(() => import('./pages/inbox/InboxThreadPage'));

function App() {
  // Provide inbox state at top level for header badge
  useInboxState();
  return (
    <BrowserRouter>
      <PWAUpdateNotification />
      <Suspense fallback={null}>
        <Routes>
          {/* Auth Routes - redirect to home if authenticated */}
          <Route path="/auth/welcome" element={<PublicRoute><WelcomePage /></PublicRoute>} />
          <Route path="/auth/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
          <Route path="/auth/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
          <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/auth/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/auth/profile-setup" element={<ProtectedRoute requireProfileComplete={false}><FirstTimeProfileSetupPage /></ProtectedRoute>} />

          {/* Main App Routes - require authentication */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
          <Route
            path="/editor/story/:storyId"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <StoryEditorPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/story/view/:storyId"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <StoryReaderPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/poem/editor"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <PoemEditorPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/poem/view/:poemId"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <PoemReaderPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <InboxPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox/:threadId"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <InboxThreadPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <CommunityPageWrapper />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:roomId"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <CommunityPageWrapper />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/profile/:username"
            element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <ScreenLayout>
                  <TrendingPage />
                </ScreenLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/character-profile/:characterId"
            element={<ProtectedRoute><CharacterProfilePage /></ProtectedRoute>}
          />
          {/* fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
