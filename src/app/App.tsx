// T056: Update App.tsx to include auth initialization
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import queryClient from '../shared/services/queryClient';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { useAuth } from '../features/auth/hooks/useAuth';
import { UserRole } from '../features/auth/types/auth.types';
import LoginPage from '../pages/LoginPage';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
);

const BatchDetailPage = lazy(() =>
  import('../pages/BatchDetailPage').then(m => ({ default: m.BatchDetailPage }))
);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Main app content with routing
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Initializing application..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={[UserRole.WORKER, UserRole.SUPERVISOR, UserRole.MANAGER, UserRole.ADMIN]}>
            <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batches/:batch_id"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPERVISOR, UserRole.MANAGER, UserRole.ADMIN]}>
            <Suspense fallback={<LoadingSpinner text="Loading batch details..." />}>
              <BatchDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/404" element={<div>Page not found</div>} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
};

export default App;
