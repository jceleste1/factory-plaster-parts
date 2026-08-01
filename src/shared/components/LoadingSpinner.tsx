import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'md',
}) => {
  const sizeConfig = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status">
      <div
        className={`${sizeConfig[size]} border-4 border-gray-200 border-t-primary-900 rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
