// T148/T150: Mobile-Optimized Dashboard Layout
import React, { useState } from 'react';
import { Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useConnectionStatus } from '../shared/hooks/useConnectionStatus';
import { useDashboardRefresh } from '../features/dashboard/hooks/useDashboardRefresh';
import { useProductionStatus } from '../features/production/hooks/productionHooks';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { DashboardGrid } from '../features/dashboard/components/DashboardGrid';
import { BottleneckAlert } from '../features/dashboard/components/BottleneckAlert';
import { Navigation } from '../shared/components/Navigation';

export const DashboardPageMobile: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useConnectionStatus();
  const { refresh, isRefreshing } = useDashboardRefresh();
  const { data: dashboard, isLoading, error } = useProductionStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading production data..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      {/* Mobile Menu Button (visible on mobile) */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">Manufacturing Tracking</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <Navigation />
          </div>
        )}
      </div>

      {/* Desktop Navigation (hidden on mobile) */}
      <nav className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Manufacturing Tracking</h1>
        </div>
        <Navigation />
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 md:py-3 flex items-center gap-2">
            <WifiOff className="w-4 h-4 md:w-5 md:h-5 text-amber-700 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-medium text-amber-900">
                Offline Mode - Changes will sync automatically
              </p>
              <p className="text-xs text-amber-800 mt-0.5">Using cached data</p>
            </div>
          </div>
        )}

        {/* Online Indicator */}
        {isOnline && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-700" />
            <p className="text-xs md:text-sm text-green-900">Live updates enabled</p>
          </div>
        )}

        {/* User Welcome */}
        <div className="px-4 md:px-8 py-4 md:py-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600">Welcome back,</p>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                {user?.full_name || 'User'}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Role: <span className="font-medium">{user?.role}</span>
              </p>
            </div>
            <button
              onClick={() => refresh()}
              disabled={isRefreshing}
              aria-label="Refresh dashboard"
              className="p-2 md:p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 transition-transform ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 md:mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm md:text-base text-red-900 font-medium">Failed to load dashboard</p>
            <p className="text-xs md:text-sm text-red-700 mt-1">
              {error instanceof Error ? error.message : 'Please try again later'}
            </p>
            <button
              onClick={() => refresh()}
              className="mt-3 px-3 py-2 bg-red-600 text-white text-xs md:text-sm rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bottleneck Alert */}
        {dashboard?.bottleneck_stage && (
          <div className="mx-4 md:mx-8 mt-4">
            <BottleneckAlert stage={dashboard.bottleneck_stage} />
          </div>
        )}

        {/* Dashboard Grid */}
        {dashboard && (
          <div className="flex-1 px-4 md:px-8 py-4 md:py-6">
            <div className="mb-4">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                Production Status - {new Date().toLocaleDateString()}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Active Batches: <span className="font-bold text-blue-600">{dashboard.total_active_batches}</span>
                {' '} | Production Velocity:{' '}
                <span className="font-bold text-green-600">{dashboard.production_velocity} units/hour</span>
              </p>
            </div>
            <DashboardGrid stages={dashboard.stages} />
          </div>
        )}

        {/* Bottom Padding for Mobile */}
        <div className="h-8 md:h-4" />
      </main>
    </div>
  );
};

export default DashboardPageMobile;
