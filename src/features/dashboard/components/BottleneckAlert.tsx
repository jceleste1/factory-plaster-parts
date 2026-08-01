// T067: Create BottleneckAlert component - T072/T073/T074: Responsive + Accessible + Performance
import React, { useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ManufacturingStage } from '../../shared/types/domain.types';

interface BottleneckAlertProps {
  bottleneckStage?: ManufacturingStage;
  onDismiss?: () => void;
}

export const BottleneckAlert: React.FC<BottleneckAlertProps> = React.memo(({ bottleneckStage, onDismiss }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const formatStageName = useCallback((stage: ManufacturingStage): string => {
    return stage.replace(/_/g, ' ').charAt(0).toUpperCase() + stage.replace(/_/g, ' ').slice(1).toLowerCase();
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (!bottleneckStage || isDismissed) {
    return null;
  }

  return (
    <div
      className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 rounded-r-lg flex items-start gap-3 sm:gap-4 focus-within:ring-2 focus-within:ring-amber-500"
      role="alert"
      aria-live="polite"
      aria-label={`Bottleneck alert: ${formatStageName(bottleneckStage)} stage is behind schedule`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-semibold text-amber-900">Production Bottleneck</h3>
        <p className="text-xs sm:text-sm text-amber-800 mt-1">
          <strong>{formatStageName(bottleneckStage)}</strong> stage is behind schedule and requires attention.
        </p>
        <p className="text-xs text-amber-700 mt-2 hidden sm:block">
          Consider allocating additional resources or adjusting upstream batch flow.
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 ml-2 text-amber-600 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-1"
        aria-label="Dismiss bottleneck alert"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
      </button>
    </div>
  );
});

BottleneckAlert.displayName = 'BottleneckAlert';

export default BottleneckAlert;
