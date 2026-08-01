// T066: Create ProductionVelocity component - T072/T073/T074: Responsive + Accessible + Performance
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProductionVelocityProps {
  velocity: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage?: number;
}

export const ProductionVelocity: React.FC<ProductionVelocityProps> = React.memo(({
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5" aria-hidden="true" />;
      case 'down':
        return <TrendingDown className="w-5 h-5" aria-hidden="true" />;
      case 'stable':
        return <div className="w-5 h-5" aria-hidden="true">→</div>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-indigo-200 shadow-sm p-4 sm:p-6 focus-within:ring-2 focus-within:ring-blue-500">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Production Velocity</h3>
          <div
            className={`flex items-center gap-1 flex-shrink-0 ${getTrendColor(trend)}`}
            aria-label={`Trend: ${getTrendAriaLabel(trend)}`}
          >
            {getTrendIcon(trend)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl sm:text-4xl font-bold text-slate-900" aria-label={`${velocity.toFixed(1)} batches per day`}>
            {velocity.toFixed(1)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">batches per day</p>
        </div>

        {changePercentage !== undefined && (
          <div className="border-t border-indigo-100 pt-3">
            <p className={`text-xs sm:text-sm font-medium ${getTrendColor(trend)}`}>
              <span aria-label={`${changePercentage > 0 ? 'increase' : 'decrease'} of ${Math.abs(changePercentage).toFixed(1)} percent from last period`}>
                {changePercentage > 0 ? '+' : ''}
                {changePercentage.toFixed(1)}% from last period
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ProductionVelocity.displayName = 'ProductionVelocity';

export default ProductionVelocity;
