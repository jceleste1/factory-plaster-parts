import { format, formatDistance } from 'date-fns';

/**
 * Format date to ISO string or readable format
 */
export function formatDate(date: Date | string, pattern: 'ISO' | 'local' | 'relative' = 'local'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (pattern === 'ISO') {
    return dateObj.toISOString();
  }

  if (pattern === 'relative') {
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  }

  return format(dateObj, 'PPpp');
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format batch ID for display
 */
export function formatBatchId(id: string): string {
  return id.toUpperCase();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
