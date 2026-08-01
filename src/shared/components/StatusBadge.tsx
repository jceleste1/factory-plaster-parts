import React from 'react';

interface StatusBadgeProps {
  status: 'GREEN' | 'YELLOW' | 'RED';
  label: string;
}

/**
 * Status badge component for stage indicators
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    GREEN: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: '✓',
    },
    YELLOW: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: '⚠',
    },
    RED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: '✕',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span aria-label={`Status: ${status}`}>{config.icon}</span>
      <span>{label}</span>
    </span>
  );
};
