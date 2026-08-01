import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Auth layout - for login page (no nav/header/footer)
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 px-4">
        <div className="w-full max-w-md">
          {/* Company branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-4">
              <span className="text-lg font-bold text-primary-900">MFG</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Manufacturing Tracking System</h1>
            <p className="text-primary-100 mt-2">Real-time production visibility</p>
          </div>

          {/* Auth form */}
          <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
