import React, { Suspense, lazy } from "react";
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateProjectPage from './pages/create/CreateProjectPage';
import StoryEditorPage from './pages/story-editor/StoryEditorPage';
import StoryReaderPage from './pages/story-reader/StoryReaderPage';
import PoemEditorPage from './pages/poem-editor/PoemEditorPage';
import PoemReaderPage from './pages/poem-reader/PoemReaderPage';
import HeaderBar from './components/header/HeaderBar';
import { useInboxState } from './hooks/useInboxState';

const InboxPage = lazy(() => import('./pages/inbox/InboxPage'));
const InboxThreadPage = lazy(() => import('./pages/inbox/InboxThreadPage'));

function App() {
  // Provide inbox state at top level for header badge
  useInboxState();
  return (
    <BrowserRouter>
      <HeaderBar />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create" element={<CreateProjectPage />} />
          <Route path="/story/editor" element={<StoryEditorPage />} />
          <Route path="/story/view" element={<StoryReaderPage />} />
          <Route path="/poem/editor" element={<PoemEditorPage />} />
          <Route path="/poem/view" element={<PoemReaderPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:threadId" element={<InboxThreadPage />} />
          {/* fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
