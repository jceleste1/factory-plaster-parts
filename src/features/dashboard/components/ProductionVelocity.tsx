// T066: Create ProductionVelocity component
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProductionVelocityProps {
  velocity: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage?: number;
}

export const ProductionVelocity: React.FC<ProductionVelocityProps> = ({
  velocity,
  trend,
  changePercentage,
}) => {
  const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5" />;
      case 'down':
        return <TrendingDown className="w-5 h-5" />;
      case 'stable':
        return <div className="w-5 h-5">→</div>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-indigo-200 shadow-sm p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Production Velocity</h3>
          <div className={`flex items-center gap-1 ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-4xl font-bold text-slate-900">{velocity.toFixed(1)}</p>
          <p className="text-sm text-gray-600">batches per day</p>
        </div>

        {changePercentage !== undefined && (
          <div className="border-t border-indigo-100 pt-3">
            <p className={`text-sm font-medium ${getTrendColor(trend)}`}>
              {changePercentage > 0 ? '+' : ''}
              {changePercentage.toFixed(1)}% from last period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
