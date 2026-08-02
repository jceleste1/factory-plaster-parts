// T149: Touch-Optimized Stage Card Component
import React from 'react';
import { ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Stage, StageStatus } from '../features/production/types/production.types';

interface MobileStageCardProps {
  stage: Stage;
  onClick?: (stageId: string) => void;
  className?: string;
}

const statusConfig = {
  GREEN: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: CheckCircle2, label: 'On Time' },
  YELLOW: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: AlertCircle, label: 'Attention Needed' },
  RED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: AlertCircle, label: 'Urgent' },
};

/**
 * Mobile-optimized stage card with touch targets ≥44px
 * 
 * Features:
 * - Large touch target (min 44px height)
 * - Status indicator with icon
 * - Quick metrics display
 * - Tap to expand on mobile
 */
export const MobileStageCard: React.FC<MobileStageCardProps> = ({
  stage,
  onClick,
  className = '',
}) => {
  const config = statusConfig[stage.status as StageStatus] || statusConfig.GREEN;
  const StatusIcon = config.icon;

  return (
    <button
      onClick={() => onClick?.(stage.stage_name)}
      className={`w-full p-4 md:p-6 text-left border-2 rounded-lg transition-all active:scale-95 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${config.bg} ${config.border} ${className}`}
      aria-label={`${stage.stage_name} stage - ${config.label}`}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Stage Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">
              {stage.stage_name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${config.text}`}>
              {config.label}
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
            {/* Batch Count */}
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Batches:</span>
              <span className="font-bold text-gray-900">{stage.batch_count}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
              <span className="text-gray-600 truncate">
                Avg: <span className="font-medium">{stage.avg_duration_hours}h</span>
              </span>
            </div>

            {/* Trend */}
            {stage.trend && (
              <div className="col-span-2 flex items-center gap-1 text-xs">
                <span className="text-gray-600">Trend:</span>
                <span className={stage.trend === 'UP' ? 'text-red-600' : stage.trend === 'DOWN' ? 'text-green-600' : 'text-gray-600'}>
                  {stage.trend === 'UP' && '📈 Increasing'}
                  {stage.trend === 'DOWN' && '📉 Decreasing'}
                  {stage.trend === 'STABLE' && '➡️ Stable'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Status Icon & Chevron */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <StatusIcon className={`w-6 h-6 md:w-8 md:h-8 ${config.text}`} />
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
        </div>
      </div>

      {/* Current Batches (if any) */}
      {stage.current_batches && stage.current_batches.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-50">
          <p className="text-xs text-gray-600 mb-2">Currently processing:</p>
          <div className="flex flex-wrap gap-1">
            {stage.current_batches.slice(0, 2).map((batchId) => (
              <span
                key={batchId}
                className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs font-medium text-gray-900"
              >
                {batchId}
              </span>
            ))}
            {stage.current_batches.length > 2 && (
              <span className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs font-medium text-gray-600">
                +{stage.current_batches.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
};

/**
 * Horizontal Scrollable Stage List (Mobile)
 * Optimized for touch and small screens
 */
export const HorizontalStageScroll: React.FC<{ stages: Stage[] }> = ({ stages }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-4 py-4 md:hidden pb-2">
        {stages.map((stage) => (
          <div key={stage.stage_name} className="flex-shrink-0 w-64">
            <MobileStageCard stage={stage} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileStageCard;
