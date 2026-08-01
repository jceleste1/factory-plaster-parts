import React, { ReactNode } from 'react';
import { Header } from '../shared/components/Header';
import { Footer } from '../shared/components/Footer';
import { Navigation } from '../shared/components/Navigation';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { UserRole } from '../shared/types/domain.types';

interface AppLayoutProps {
  children: ReactNode;
  userName?: string;
  userRole?: UserRole;
  onLogout?: () => void;
}

/**
 * Main app layout with header, nav, footer
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  userName,
  userRole,
  onLogout,
}) => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header userName={userName} userRole={userRole} onLogout={onLogout} />
        <Navigation userRole={userRole} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};
