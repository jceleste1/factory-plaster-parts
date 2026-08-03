/**
 * WasteAnalysis Component - T110
 * Displays scrap and waste analysis by stage
 * Shows defect counts, rework rates, and cost impact
 */

import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface ScrapData {
  stage: string;
  defect_count: number;
  rework_rate: number; // percentage 0-100
  cost_impact: number; // USD
}

interface WasteAnalysisProps {
  scrapData: ScrapData[];
  isLoading?: boolean;
}

type SortColumn = 'stage' | 'defect_count' | 'rework_rate' | 'cost_impact';
type SortDirection = 'asc' | 'desc';

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Prepare pie chart data
 */
function preparePieData(scrapData: ScrapData[]) {
  const colors = ['#EF5350', '#FFA726', '#FBC02D', '#7CB342', '#29B6F6', '#AB47BC'];
  return scrapData.map((item, index) => ({
    name: item.stage,
    value: item.defect_count,
    fill: colors[index % colors.length],
  }));
}

export const WasteAnalysis: React.FC<WasteAnalysisProps> = ({ scrapData, isLoading = false }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('cost_impact');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-gray-600">Analyzing waste data...</p>
        </div>
      </div>
    );
  }

  if (!scrapData || scrapData.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-700 font-semibold">✅ No waste data found</div>
        <p className="text-green-600 text-sm mt-1">Excellent! No defects or rework detected in this period.</p>
      </div>
    );
  }

  // Sort data
  const sortedData = [...scrapData].sort((a, b) => {
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

  // Calculate totals
  const totalDefects = scrapData.reduce((sum, item) => sum + item.defect_count, 0);
  const totalCost = scrapData.reduce((sum, item) => sum + item.cost_impact, 0);
  const avgReworkRate =
    scrapData.length > 0 ? scrapData.reduce((sum, item) => sum + item.rework_rate, 0) / scrapData.length : 0;

  // Find most problematic stage
  const mostProblematicStage = sortedData[0];

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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 text-sm font-medium">Total Defects</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{totalDefects}</div>
          <p className="text-xs text-red-600 mt-2">Across all stages</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-amber-700 text-sm font-medium">Avg Rework Rate</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{avgReworkRate.toFixed(1)}%</div>
          <p className="text-xs text-amber-600 mt-2">Batches requiring rework</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-orange-700 text-sm font-medium">Total Cost Impact</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalCost)}</div>
          <p className="text-xs text-orange-600 mt-2">Loss from defects</p>
        </div>
      </div>

      {/* Alert for most problematic stage */}
      {mostProblematicStage && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900">⚠️ Priority Stage</h4>
            <p className="text-sm text-red-700 mt-1">
              <strong>{mostProblematicStage.stage}</strong> has the highest waste impact with{' '}
              <strong>{mostProblematicStage.defect_count} defects</strong> and{' '}
              <strong>{formatCurrency(mostProblematicStage.cost_impact)}</strong> in losses.
              Consider investigation and corrective actions.
            </p>
          </div>
        </div>
      )}

      {/* Defect Distribution Pie Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Defect Distribution by Stage</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={preparePieData(scrapData)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {preparePieData(scrapData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} defects`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Waste Details by Stage</h3>
          <p className="text-sm text-gray-600 mt-1">Click column headers to sort</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('stage')}
                    className="flex items-center gap-1 hover:text-teal-600"
                  >
                    Stage <SortIcon column="stage" />
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
                <th className="px-6 py-3 text-right font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('rework_rate')}
                    className="flex items-center justify-end gap-1 hover:text-teal-600 w-full"
                  >
                    Rework Rate <SortIcon column="rework_rate" />
                  </button>
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('cost_impact')}
                    className="flex items-center justify-end gap-1 hover:text-teal-600 w-full"
                  >
                    Cost Impact <SortIcon column="cost_impact" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={row.stage}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedStage(selectedStage === row.stage ? null : row.stage)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{row.stage}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded font-semibold text-sm">
                      {row.defect_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-900 font-medium">{row.rework_rate.toFixed(1)}%</span>
                      {row.rework_rate > avgReworkRate && (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-orange-600">
                    {formatCurrency(row.cost_impact)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WasteAnalysis;
