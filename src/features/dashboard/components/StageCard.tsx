// T065: Create StageCard component - T072/T073: Responsive + Accessible
import React from 'react';
import { Stage } from '../types/dashboard.types';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { formatTime } from '../../shared/utils/formatters';
import { ManufacturingStage } from '../../shared/types/domain.types';

interface StageCardProps {
  stage: Stage;
  onClick?: () => void;
}

export const StageCard: React.FC<StageCardProps> = React.memo(({ stage, onClick }) => {
  const formatStageName = (stage: ManufacturingStage): string => {
    return stage.replace(/_/g, ' ').charAt(0).toUpperCase() + stage.replace(/_/g, ' ').slice(1).toLowerCase();
  };

  const getTrendIndicator = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
    }
  };

  const getTrendAriaLabel = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return 'increasing';
      case 'down':
        return 'decreasing';
      case 'stable':
        return 'stable';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer p-4 sm:p-6 space-y-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Manufacturing stage: ${formatStageName(stage.stage_name)}, ${stage.batch_count} batch${stage.batch_count !== 1 ? 'es' : ''} in progress, status ${stage.status}`}
    >
      {/* Header - T072: Responsive text sizes */}
      <div className="flex items-start justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{formatStageName(stage.stage_name)}</h3>
        <StatusBadge status={stage.status} label={stage.status} />
      </div>

      {/* Batch Count - T073: Better accessibility */}
      <div className="border-t border-gray-100 pt-4">
        {stage.batch_count > 0 ? (
          <>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900" aria-label={`${stage.batch_count} batches in progress`}>
              {stage.batch_count}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {stage.batch_count === 1 ? 'batch in progress' : 'batches in progress'}
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-xs sm:text-sm italic">No active batches</p>
          </div>
        )}
      </div>

      {/* Duration and Trend - T073: Better accessibility labels */}
      {stage.batch_count > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Avg. Duration</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900" aria-label={`Average duration ${stage.avg_duration_hours.toFixed(1)} hours`}>
              {stage.avg_duration_hours.toFixed(1)}h
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Trend</span>
            <span
              className={`text-base sm:text-lg font-bold ${
                stage.trend === 'up'
                  ? 'text-green-600'
                  : stage.trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
              aria-label={getTrendAriaLabel(stage.trend)}
            >
              {getTrendIndicator(stage.trend)}
            </span>
          </div>
        </div>
      )}

      {/* Last Update - T072: Better mobile display */}
      {stage.last_update && (
        <div className="border-t border-gray-100 pt-2 text-xs text-gray-500">
          <time dateTime={stage.last_update}>Updated: {new Date(stage.last_update).toLocaleTimeString()}</time>
        </div>
      )}
    </div>
  );
});

StageCard.displayName = 'StageCard';
