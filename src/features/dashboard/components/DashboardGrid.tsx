// T068: Create DashboardGrid component
import React from 'react';
import { StageCard } from './StageCard';
import { ProductionVelocity } from './ProductionVelocity';
import { BottleneckAlert } from './BottleneckAlert';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { DashboardResponse } from '../types/dashboard.types';
import { RefreshCw } from 'lucide-react';

interface DashboardGridProps {
  data: DashboardResponse;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onStageClick?: (stageName: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  data,
  isLoading,
  onRefresh,
  isRefreshing,
  onStageClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Production Status</h2>
          <p className="text-sm text-gray-600 mt-1">Last updated: {formatTimestamp(data.timestamp)}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Manually refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {/* Bottleneck Alert */}
      {data.bottleneck_stage && (
        <BottleneckAlert bottleneckStage={data.bottleneck_stage} />
      )}

      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Production Velocity */}
        <div className="lg:col-span-4">
          <ProductionVelocity
            velocity={data.production_velocity}
            trend={data.stages.length > 0 ? 'stable' : 'stable'}
            changePercentage={0}
          />
        </div>

        {/* Total Active Batches */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Active Batches</h3>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">{data.total_active_batches}</p>
            <p className="text-sm text-gray-500 mt-2">Across all stages</p>
          </div>
        </div>

        {/* Efficiency Rate */}
        {data.efficiency_rate !== undefined && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Efficiency Rate</h3>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{data.efficiency_rate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-2">On-time completion</p>
            </div>
          </div>
        )}
      </div>

      {/* Stage Cards Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manufacturing Stages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
};
