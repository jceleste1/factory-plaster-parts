// T065: Create StageCard component
import React from 'react';
import { Stage } from '../types/dashboard.types';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { formatTime } from '../../shared/utils/formatters';
import { ManufacturingStage } from '../../shared/types/domain.types';

interface StageCardProps {
  stage: Stage;
  onClick?: () => void;
}

export const StageCard: React.FC<StageCardProps> = ({ stage, onClick }) => {
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer p-6 space-y-4"
      role="article"
      aria-label={`Manufacturing stage: ${formatStageName(stage.stage_name)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{formatStageName(stage.stage_name)}</h3>
        <StatusBadge status={stage.status} label={stage.status} />
      </div>

      {/* Batch Count */}
      <div className="border-t border-gray-100 pt-4">
        {stage.batch_count > 0 ? (
          <>
            <p className="text-3xl font-bold text-slate-900">{stage.batch_count}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stage.batch_count === 1 ? 'batch in progress' : 'batches in progress'}
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm italic">No active batches</p>
          </div>
        )}
      </div>

      {/* Duration and Trend */}
      {stage.batch_count > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg. Duration</span>
            <span className="text-sm font-medium text-gray-900">
              {stage.avg_duration_hours.toFixed(1)}h
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Trend</span>
            <span
              className={`text-lg font-bold ${
                stage.trend === 'up'
                  ? 'text-green-600'
                  : stage.trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {getTrendIndicator(stage.trend)}
            </span>
          </div>
        </div>
      )}

      {/* Last Update */}
      {stage.last_update && (
        <div className="border-t border-gray-100 pt-2 text-xs text-gray-500">
          Updated: {new Date(stage.last_update).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
