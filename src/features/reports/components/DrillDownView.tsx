/**
 * DrillDownView Component - T113
 * Shows detailed batch information for a specific stage within date range
 * Allows investigation of bottleneck stages
 */

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

export interface BatchDetail {
  batch_id: string;
  stage_name: string;
  entry_timestamp: string;
  exit_timestamp: string;
  duration: number; // hours
  rework_status: boolean;
  quality_result: 'PASS' | 'FAIL' | 'CONDITIONAL' | null;
  defect_count: number;
}

interface DrillDownViewProps {
  stageName: string;
  batches: BatchDetail[];
  totalDuration: number;
  avgDuration: number;
  reworkRate: number;
  isLoading?: boolean;
  onClose?: () => void;
}

type SortColumn = 'batch_id' | 'duration' | 'quality_result' | 'defect_count';
type SortDirection = 'asc' | 'desc';

/**
 * Format duration to readable string
 */
function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

/**
 * Format ISO timestamp to readable date/time
 */
function formatDateTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

/**
 * Get quality result badge styling
 */
function getQualityBadgeClass(result: string | null): string {
  switch (result) {
    case 'PASS':
      return 'bg-green-100 text-green-800';
    case 'FAIL':
      return 'bg-red-100 text-red-800';
    case 'CONDITIONAL':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export const DrillDownView: React.FC<DrillDownViewProps> = ({
  stageName,
  batches,
  totalDuration,
  avgDuration,
  reworkRate,
  isLoading = false,
  onClose,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('duration');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  // Sort batches
  const sortedBatches = [...batches].sort((a, b) => {
    let aVal: number | string = a[sortColumn];
    let bVal: number | string = b[sortColumn];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <span className="text-gray-300">↕</span>;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 inline" />
    );
  };

  // Count batches with issues
  const batchesWithDefects = batches.filter((b) => b.defect_count > 0).length;
  const failedBatches = batches.filter((b) => b.quality_result === 'FAIL').length;
  const reworkBatches = batches.filter((b) => b.rework_status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{stageName} - Drill-Down Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">{batches.length} batches in this stage</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
          >
            Close
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm font-medium">Total Batches</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{batches.length}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-700 text-sm font-medium">Avg Duration</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{formatDuration(avgDuration)}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-medium">Issues Found</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{batchesWithDefects}</p>
          <p className="text-xs text-red-600 mt-1">Batches with defects</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 text-sm font-medium">Rework Rate</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{reworkRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Problem Alert */}
      {failedBatches > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900">⚠️ Quality Issues Detected</h4>
            <p className="text-sm text-red-700 mt-1">
              {failedBatches} batch(es) failed quality inspection in this stage.
              This may indicate process issues requiring investigation.
            </p>
          </div>
        </div>
      )}

      {/* Batch Details Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Batch Details</h3>
          <p className="text-sm text-gray-600 mt-1">Click rows to expand details. Sort by clicking column headers.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('batch_id')}
                    className="flex items-center gap-1 hover:text-teal-600"
                  >
                    Batch ID <SortIcon column="batch_id" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Entry / Exit</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('duration')}
                    className="flex items-center justify-end gap-1 hover:text-teal-600 w-full"
                  >
                    Duration <SortIcon column="duration" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('quality_result')}
                    className="flex items-center justify-center gap-1 hover:text-teal-600 w-full"
                  >
                    Quality <SortIcon column="quality_result" />
                  </button>
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('defect_count')}
                    className="flex items-center justify-end gap-1 hover:text-teal-600 w-full"
                  >
                    Defects <SortIcon column="defect_count" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedBatches.map((batch) => {
                const isExpanded = expandedBatchId === batch.batch_id;

                return (
                  <React.Fragment key={batch.batch_id}>
                    {/* Main Row */}
                    <tr
                      onClick={() =>
                        setExpandedBatchId(isExpanded ? null : batch.batch_id)
                      }
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-teal-600">
                        {batch.batch_id}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div>Entry: {formatDateTime(batch.entry_timestamp)}</div>
                        <div>Exit: {formatDateTime(batch.exit_timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatDuration(batch.duration)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {batch.quality_result ? (
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getQualityBadgeClass(
                              batch.quality_result
                            )}`}
                          >
                            {batch.quality_result}
                          </span>
                        ) : (
                          <span className="text-gray-500">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {batch.defect_count > 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded font-semibold text-xs">
                            {batch.defect_count}
                          </span>
                        ) : (
                          <span className="text-green-600">✓</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {batch.rework_status && (
                          <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                            Rework
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-blue-50 border-b border-gray-200">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-gray-600 font-medium">BATCH ID</p>
                                <p className="text-sm font-mono font-semibold text-gray-900">
                                  {batch.batch_id}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">STAGE</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {batch.stage_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">DURATION</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatDuration(batch.duration)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">QUALITY RESULT</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {batch.quality_result || 'Pending'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">DEFECT COUNT</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {batch.defect_count}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">REWORK STATUS</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {batch.rework_status ? '⚠️ Rework Required' : '✓ No Rework'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedBatches.length === 0 && (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No batches found for this stage</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Investigation Tips</h4>
        <ul className="text-sm text-yellow-800 space-y-1 ml-4">
          <li>• Sort by duration to identify outliers (unusually slow batches)</li>
          <li>• Check batches with quality failures for common factors</li>
          <li>• Review rework batches to understand failure patterns</li>
          <li>• Compare durations to baseline to pinpoint issues</li>
          <li>• Share findings with the production team for corrective actions</li>
        </ul>
      </div>
    </div>
  );
};

export default DrillDownView;
