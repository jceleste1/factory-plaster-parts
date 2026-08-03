// Phase 8: T129 - DefectCodeSelector Component
// Dropdown for selecting standardized defect reason codes

import React, { useState, useEffect } from 'react';
import { DefectType } from '@/features/quality/types/quality.types';
import qualityService from '@/features/quality/services/qualityService';

interface DefectCodeSelectorProps {
  value?: string;
  onChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

const defaultDefectOptions = [
  {
    code: DefectType.SURFACE_DEFECTS,
    label: 'Surface Defects',
    description: 'Scratches, dents, discoloration on surface',
  },
  {
    code: DefectType.DIMENSIONAL_OOT,
    label: 'Dimensional Out-of-Tolerance',
    description: 'Size or thickness deviation from spec',
  },
  {
    code: DefectType.STRUCTURAL_FAILURE,
    label: 'Structural Failure',
    description: 'Cracks, breaks, or structural weakness',
  },
  {
    code: DefectType.COLOR_ISSUE,
    label: 'Color Issue',
    description: 'Color mismatch or fading',
  },
  {
    code: DefectType.CONTAMINATION,
    label: 'Contamination',
    description: 'Foreign material or particles present',
  },
  {
    code: DefectType.OTHER,
    label: 'Other',
    description: 'Other defect type',
  },
];

/**
 * Dropdown component for selecting defect codes
 * Displays standardized defect reason codes with descriptions
 */
export function DefectCodeSelector({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  label = 'Defect Type',
  placeholder = 'Select defect type...',
}: DefectCodeSelectorProps) {
  const [options, setOptions] = useState(defaultDefectOptions);
  const [isLoading, setIsLoading] = useState(false);

  // Load defect codes from API on mount
  useEffect(() => {
    const loadCodes = async () => {
      try {
        setIsLoading(true);
        const codes = await qualityService.getQualityDefectCodes();
        if (codes && codes.length > 0) {
          setOptions(
            codes.map((code) => ({
              code: code.code,
              label: code.label,
              description: code.description,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load defect codes, using defaults', err);
        // Keep default options on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCodes();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor="defect-type-select" className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id="defect-type-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        required={required}
        aria-describedby={error ? 'defect-type-error' : undefined}
        aria-invalid={!!error}
        className={`
          px-3 py-2 border rounded-md shadow-sm text-sm
          focus:outline-none focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white'
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.code}
            value={option.code}
            title={option.description}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Show description of selected option */}
      {value && (
        <p className="text-xs text-gray-600">
          {options.find((o) => o.code === value)?.description}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id="defect-type-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default DefectCodeSelector;
