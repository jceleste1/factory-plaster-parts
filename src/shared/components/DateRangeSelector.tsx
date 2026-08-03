/**
 * DateRangeSelector Component - T115
 * Provides preset date range options and custom date range picker
 * Used for filtering reports by date
 */

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

type PresetOption = 'last-7' | 'last-30' | 'last-90' | 'custom';

/**
 * Get date in YYYY-MM-DD format
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate date X days ago
 */
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

/**
 * Get today's date
 */
function getToday(): string {
  return formatDate(new Date());
}

export const DateRangeSelector: React.FC<DateRangeProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [preset, setPreset] = useState<PresetOption>(() => {
    const today = getToday();
    if (startDate === getDaysAgo(7) && endDate === today) return 'last-7';
    if (startDate === getDaysAgo(30) && endDate === today) return 'last-30';
    if (startDate === getDaysAgo(90) && endDate === today) return 'last-90';
    return 'custom';
  });

  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const handlePresetChange = (selectedPreset: PresetOption) => {
    setPreset(selectedPreset);
    const today = getToday();

    switch (selectedPreset) {
      case 'last-7':
        onDateRangeChange(getDaysAgo(7), today);
        setCustomStart(getDaysAgo(7));
        setCustomEnd(today);
        break;
      case 'last-30':
        onDateRangeChange(getDaysAgo(30), today);
        setCustomStart(getDaysAgo(30));
        setCustomEnd(today);
        break;
      case 'last-90':
        onDateRangeChange(getDaysAgo(90), today);
        setCustomStart(getDaysAgo(90));
        setCustomEnd(today);
        break;
      case 'custom':
        // Keep showing custom inputs
        break;
    }
  };

  const handleCustomDateChange = (newStart: string, newEnd: string) => {
    setCustomStart(newStart);
    setCustomEnd(newEnd);
    setPreset('custom');

    // Validate: start_date <= end_date
    if (newStart && newEnd && new Date(newStart) <= new Date(newEnd)) {
      onDateRangeChange(newStart, newEnd);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h3>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
          {[
            { value: 'last-7' as PresetOption, label: 'Last 7 Days' },
            { value: 'last-30' as PresetOption, label: 'Last 30 Days' },
            { value: 'last-90' as PresetOption, label: 'Last 90 Days' },
            { value: 'custom' as PresetOption, label: 'Custom' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handlePresetChange(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                preset === option.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={preset === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {preset === 'custom' && (
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => handleCustomDateChange(e.target.value, customEnd)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  aria-label="Start date"
                />
              </div>
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => handleCustomDateChange(customStart, e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  aria-label="End date"
                />
              </div>
            </div>
          </div>

          {/* Validation Message */}
          {customStart && customEnd && new Date(customStart) > new Date(customEnd) && (
            <p className="text-sm text-red-600" role="alert">
              ⚠️ Start date must be before end date
            </p>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-600">
        📊 Showing data from <strong>{customStart}</strong> to <strong>{customEnd}</strong>
      </div>
    </div>
  );
};

export default DateRangeSelector;
