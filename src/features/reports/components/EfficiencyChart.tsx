/**
 * EfficiencyChart Component - T109
 * Bar chart showing average duration per stage with historical baseline
 * Color-coded: green (on-target), yellow (attention), red (behind-schedule)
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export interface StageMetric {
  stage_name: string;
  avg_duration: number;
  historical_avg: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  bottleneck_flag: boolean;
}

interface EfficiencyChartProps {
  stages: StageMetric[];
  isLoading?: boolean;
}

/**
 * Determine color based on performance vs baseline
 */
function getStageColor(stage: StageMetric | undefined): string {
  if (!stage) return '#9CA3AF'; // GRAY (fallback)
  if (stage.bottleneck_flag) return '#EF5350'; // RED
  const percentDifference = ((stage.avg_duration - stage.historical_avg) / stage.historical_avg) * 100;
  if (percentDifference >= 10) return '#FFA726'; // YELLOW (≥10% slower)
  return '#4CAF50'; // GREEN (on-target)
}

/**
 * Format chart data for Recharts
 */
function formatChartData(stages: StageMetric[]) {
  return stages.map((stage) => ({
    name: stage.stage_name,
    current: Math.round(stage.avg_duration * 10) / 10, // Round to 1 decimal
    historical: Math.round(stage.historical_avg * 10) / 10,
    trend: stage.trend,
    bottleneck: stage.bottleneck_flag,
  }));
}

/**
 * Custom tooltip showing detailed info on hover
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
        <p className="text-sm text-gray-600">
          Current: <span className="font-medium">{payload[0].value}h</span>
        </p>
        {payload[1] && (
          <p className="text-sm text-gray-600">
            Historical Avg: <span className="font-medium">{payload[1].value}h</span>
          </p>
        )}
        {payload[0].payload.bottleneck && (
          <p className="text-sm text-red-600 font-medium">⚠️ Bottleneck Stage</p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * Custom label showing trend indicator
 */
const CustomLabel: React.FC<any> = (props) => {
  const { x, y, width, value, payload } = props;
  
  // Guard against undefined payload
  if (!payload) {
    return null;
  }
  
  const trendIcon = payload.trend === 'UP' ? '↑' : payload.trend === 'DOWN' ? '↓' : '→';
  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="#666"
      textAnchor="middle"
      className="text-xs font-medium"
    >
      {trendIcon}
    </text>
  );
};

export const EfficiencyChart: React.FC<EfficiencyChartProps> = ({ stages, isLoading = false }) => {
  const chartData = useMemo(() => formatChartData(stages), [stages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-gray-600">Generating chart...</p>
        </div>
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No data available for selected date range</p>
        </div>
      </div>
    );
  }

  const hasBottlenecks = stages.some((s) => s.bottleneck_flag);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Production Duration by Stage
          {hasBottlenecks && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              Bottlenecks Detected
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Green: on-target | Yellow: ≥10% slower | Red: bottleneck
        </p>
      </div>

      <div className="w-full h-96 overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="current"
              fill="#8884d8"
              name="Current Avg Duration"
              label={<CustomLabel />}
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStageColor(stages[index])} />
              ))}
            </Bar>
            <Bar
              dataKey="historical"
              fill="#d4d4d8"
              name="Historical Baseline"
              opacity={0.6}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for colors */}
      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-700">On Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded" />
          <span className="text-gray-700">Needs Attention (≥10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-700">Bottleneck</span>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyChart;
