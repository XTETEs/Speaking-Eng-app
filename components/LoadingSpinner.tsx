
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. text-sky-500
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-sky-400', text }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'w-6 h-6 border-2';
      break;
    case 'md':
      sizeClasses = 'w-10 h-10 border-4';
      break;
    case 'lg':
      sizeClasses = 'w-16 h-16 border-[6px]';
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full ${sizeClasses} border-solid ${color} border-t-transparent`}
      >
      </div>
      {text && <p className={`mt-2 text-sm ${color}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
