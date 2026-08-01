import React from 'react';

interface FormErrorProps {
  message?: string;
}

/**
 * Inline form error display component
 */
export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      className="text-sm text-red-600 mt-1 flex items-center gap-1"
      role="alert"
      aria-live="polite"
    >
      <span>⚠</span>
      <span>{message}</span>
    </p>
  );
};
