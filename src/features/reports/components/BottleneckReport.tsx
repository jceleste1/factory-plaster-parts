/**
 * BottleneckReport Component - T111
 * Highlights stages that are ≥10% slower than baseline
 * Provides drill-down links to investigate issues
 */

import React from 'react';
import { AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';

export interface StageMetric {
  stage_name: string;
  avg_duration: number;
  historical_avg: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  bottleneck_flag: boolean;
}

interface BottleneckReportProps {
  stages: StageMetric[];
  onDrillDown?: (stageName: string) => void;
  isLoading?: boolean;
}

/**
 * Filter to bottleneck stages only
 */
function getBottlenecks(stages: StageMetric[]): StageMetric[] {
  return stages.filter((s) => {
    const percentDiff = ((s.avg_duration - s.historical_avg) / s.historical_avg) * 100;
    return s.bottleneck_flag || percentDiff >= 10;
  });
}

/**
 * Format duration in hours or days
 */
function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = (hours / 24).toFixed(1);
  return `${days}d`;
}

export const BottleneckReport: React.FC<BottleneckReportProps> = ({
  stages,
  onDrillDown,
  isLoading = false,
}) => {
  const bottlenecks = getBottlenecks(stages);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-gray-600">Analyzing bottlenecks...</p>
        </div>
      </div>
    );
  }

  if (bottlenecks.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-green-600 text-2xl">✅</div>
          <div>
            <h3 className="font-semibold text-green-900">No Bottlenecks Detected</h3>
            <p className="text-green-700 text-sm mt-1">
              All stages are operating within or above their historical baseline performance. Great work!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">⚠️ {bottlenecks.length} Bottleneck(s) Identified</h3>
            <p className="text-sm text-amber-700 mt-1">
              The following stages are running ≥10% slower than baseline. These require immediate attention to
              improve production efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Bottleneck Cards */}
      <div className="grid grid-cols-1 gap-4">
        {bottlenecks.map((stage) => {
          const percentDiff = ((stage.avg_duration - stage.historical_avg) / stage.historical_avg) * 100;
          const timeLoss = stage.avg_duration - stage.historical_avg;
          const severity = percentDiff >= 20 ? 'critical' : percentDiff >= 15 ? 'high' : 'medium';

          const severityColors = {
            critical: {
              bg: 'bg-red-50',
              border: 'border-red-200',
              badge: 'bg-red-100 text-red-700',
              text: 'text-red-700',
            },
            high: {
              bg: 'bg-orange-50',
              border: 'border-orange-200',
              badge: 'bg-orange-100 text-orange-700',
              text: 'text-orange-700',
            },
            medium: {
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              badge: 'bg-amber-100 text-amber-700',
              text: 'text-amber-700',
            },
          };

          const colors = severityColors[severity];

          return (
            <div
              key={stage.stage_name}
              className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{stage.stage_name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.badge}`}>
                      {percentDiff > 0 ? '+' : ''}
                      {percentDiff.toFixed(1)}%
                    </span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">CURRENT AVERAGE</p>
                      <p className="text-lg font-bold text-gray-900">{formatDuration(stage.avg_duration)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">BASELINE</p>
                      <p className="text-lg font-bold text-gray-900">{formatDuration(stage.historical_avg)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">TIME LOSS</p>
                      <p className={`text-lg font-bold ${colors.text}`}>{formatDuration(timeLoss)}</p>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Trend:</span>
                    <span className="font-semibold">
                      {stage.trend === 'UP' && (
                        <span className="text-red-600 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" /> Getting Worse
                        </span>
                      )}
                      {stage.trend === 'DOWN' && (
                        <span className="text-green-600">↓ Improving</span>
                      )}
                      {stage.trend === 'STABLE' && (
                        <span className="text-gray-600">→ Stable</span>
                      )}
                    </span>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-700 font-medium mb-1">💡 Recommendations:</p>
                    <ul className="text-xs text-gray-700 space-y-1 ml-4">
                      <li>• Review staffing levels during this stage</li>
                      <li>• Check equipment maintenance status</li>
                      <li>• Identify and resolve quality holdups</li>
                    </ul>
                  </div>
                </div>

                {/* Drill-Down Button */}
                {onDrillDown && (
                  <button
                    onClick={() => onDrillDown(stage.stage_name)}
                    className={`px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${colors.badge} hover:opacity-80`}
                    aria-label={`Investigate ${stage.stage_name} bottleneck`}
                  >
                    Investigate
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Items */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Recommended Actions</h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>1. Prioritize bottleneck investigation based on severity level</li>
          <li>2. Schedule team meeting to discuss root causes</li>
          <li>3. Implement targeted improvements (staffing, equipment, process)</li>
          <li>4. Monitor progress and track improvements</li>
          <li>5. Share findings with management for resource allocation</li>
        </ul>
      </div>
    </div>
  );
};

export default BottleneckReport;
