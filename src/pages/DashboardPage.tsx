// T069: Create DashboardPage with real-time production data
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { DashboardGrid } from '../features/dashboard/components/DashboardGrid';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useProductionStatus } from '../features/dashboard/hooks/useProductionStatus';
import { useDashboardRefresh } from '../features/dashboard/hooks/useDashboardRefresh';
import { UserRole } from '../features/auth/types/auth.types';
import { AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, isFetching } = useProductionStatus();
  const { refresh, isRefreshing } = useDashboardRefresh();
  const navigate = useNavigate();

  // Check if user has permission to view dashboard
  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner text="Initializing..." />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Not authenticated. Redirecting...</p>
        </div>
      </AppLayout>
    );
  }

  const isAuthorized = [
    UserRole.SUPERVISOR,
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.WORKER,
  ].includes(user.role);

  if (!isAuthorized) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-800">Your role does not have access to the dashboard.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.full_name}!</p>
        </div>

        {/* Error State */}
        {error && !data && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
              <p className="text-sm text-red-800 mt-1">{error.message || 'Unknown error occurred'}</p>
              <button
                onClick={() => refresh()}
                className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <DashboardGrid
            data={data}
            isLoading={isLoading || isFetching}
            onRefresh={refresh}
            isRefreshing={isRefreshing}
            onStageClick={(stage) => {
              // TODO: Navigate to stage details page in future phase
              console.log('Stage clicked:', stage);
            }}
          />
        )}

        {/* Loading State */}
        {isLoading && !data && (
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner text="Loading production dashboard..." />
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">✅ Phase 3 Complete: Authentication</h3>
          <p className="text-blue-800 text-sm">
            User authentication via Google OAuth2 is now complete. Phase 4 has been initiated with real-time production
            dashboard. The dashboard updates automatically every 30 seconds with live batch tracking data from the manufacturing stages.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
