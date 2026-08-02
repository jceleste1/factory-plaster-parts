// T068: Create DashboardGrid component
import React from 'react';
import { StageCard } from './StageCard';
import { ProductionVelocity } from './ProductionVelocity';
import { BottleneckAlert } from './BottleneckAlert';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { DashboardResponse } from '../types/dashboard.types';
import { RefreshCw } from 'lucide-react';

interface DashboardGridProps {
  data: DashboardResponse;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onStageClick?: (stageName: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = React.memo(({
  data,
  isLoading,
  onRefresh,
  isRefreshing,
  onStageClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen md:min-h-96" role="status" aria-live="polite" aria-label="Loading production dashboard">
        <LoadingSpinner text="Loading production dashboard..." />
      </div>
    );
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button - T072: Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Production Status</h2>
          <p className="text-sm text-gray-600 mt-1" role="status">Last updated: {formatTimestamp(data.timestamp)}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label={isRefreshing ? 'Refreshing dashboard' : 'Manually refresh dashboard'}
            aria-busy={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            <span className="sm:hidden text-sm">{isRefreshing ? 'Loading...' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {/* Bottleneck Alert */}
      {data.bottleneck_stage && (
        <BottleneckAlert bottleneckStage={data.bottleneck_stage} />
      )}

      {/* Production Metrics - T072: Responsive grid with better mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Production Velocity */}
        <div className="lg:col-span-4">
          <ProductionVelocity
            velocity={data.production_velocity}
            trend={data.stages.length > 0 ? 'stable' : 'stable'}
            changePercentage={0}
          />
        </div>

        {/* Total Active Batches - T073: Accessibility enhanced */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 focus-within:ring-2 focus-within:ring-blue-500">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Active Batches</h3>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900" aria-label={`${data.total_active_batches} total active batches`}>{data.total_active_batches}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Across all stages</p>
          </div>
        </div>

        {/* Efficiency Rate - T073: Accessibility enhanced */}
        {data.efficiency_rate !== undefined && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 focus-within:ring-2 focus-within:ring-blue-500">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Efficiency Rate</h3>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900" aria-label={`${data.efficiency_rate.toFixed(1)} percent efficiency rate`}>{data.efficiency_rate.toFixed(1)}%</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">On-time completion</p>
            </div>
          </div>
        )}
      </div>

      {/* Stage Cards Grid - T072: Responsive layout */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4" id="stages-heading">Manufacturing Stages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="region" aria-labelledby="stages-heading">
          {data.stages.map(stage => (
            <StageCard
              key={stage.stage_name}
              stage={stage}
              onClick={() => onStageClick?.(stage.stage_name)}
            />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center py-4 border-t border-gray-200">
        <p>Dashboard updates automatically every 30 seconds</p>
      </div>
    </div>
  );
});
