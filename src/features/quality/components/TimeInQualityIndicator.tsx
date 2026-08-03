// Phase 8: T131 - TimeInQualityIndicator Component
// Displays elapsed time a batch has been in quality stage

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeInQualityIndicatorProps {
  enteredQualityAt: string; // ISO timestamp
  showAlert?: boolean; // Show alert if >24 hours
  updateInterval?: number; // Update frequency in ms (default 10000ms)
}

/**
 * Component that displays elapsed time in quality stage
 * Updates in real-time, flags batches that are taking too long
 */
export function TimeInQualityIndicator({
  enteredQualityAt,
  showAlert = true,
  updateInterval = 10000,
}: TimeInQualityIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAlert, setIsAlert] = useState(false);

  // Calculate elapsed time
  useEffect(() => {
    const updateElapsed = () => {
      const enteredTime = new Date(enteredQualityAt).getTime();
      const nowTime = new Date().getTime();
      const diffMs = nowTime - enteredTime;
      const diffSeconds = Math.floor(diffMs / 1000);

      setElapsedSeconds(diffSeconds);

      // Check if over 24 hours (86400 seconds)
      setIsAlert(showAlert && diffSeconds > 86400);
    };

    updateElapsed();

    const interval = setInterval(updateElapsed, updateInterval);
    return () => clearInterval(interval);
  }, [enteredQualityAt, showAlert, updateInterval]);

  // Format seconds into readable time
  const formatElapsedTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  };

  const displayText = formatElapsedTime(elapsedSeconds);

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        ${
          isAlert
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }
      `}
      role="status"
      aria-live="polite"
      aria-label={`Time in quality: ${displayText}`}
    >
      {isAlert ? (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{displayText}</span>
      {isAlert && <span className="ml-1 font-semibold">URGENT</span>}
    </div>
  );
}

export default TimeInQualityIndicator;
