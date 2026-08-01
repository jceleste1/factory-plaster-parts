// T067: Create BottleneckAlert component
import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ManufacturingStage } from '../../shared/types/domain.types';

interface BottleneckAlertProps {
  bottleneckStage?: ManufacturingStage;
  onDismiss?: () => void;
}

export const BottleneckAlert: React.FC<BottleneckAlertProps> = ({ bottleneckStage, onDismiss }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!bottleneckStage || isDismissed) {
    return null;
  }

  const formatStageName = (stage: ManufacturingStage): string => {
    return stage.replace(/_/g, ' ').charAt(0).toUpperCase() + stage.replace(/_/g, ' ').slice(1).toLowerCase();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start gap-4"
      role="alert"
      aria-live="polite"
      aria-label={`Bottleneck alert: ${formatStageName(bottleneckStage)} is behind schedule`}
    >
      <div className="flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-amber-900">Production Bottleneck</h3>
        <p className="text-sm text-amber-800 mt-1">
          <strong>{formatStageName(bottleneckStage)}</strong> stage is behind schedule and requires attention.
        </p>
        <p className="text-xs text-amber-700 mt-2">
          Consider allocating additional resources or adjusting upstream batch flow.
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 ml-2 text-amber-600 hover:text-amber-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
        aria-label="Dismiss bottleneck alert"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
