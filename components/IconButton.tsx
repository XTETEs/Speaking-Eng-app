
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string; // For accessibility
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, variant = 'primary', size = 'md', className, ...props }) => {
  const baseStyle = "flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-150 ease-in-out";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500";
      break;
    case 'secondary':
      variantStyle = "bg-slate-600 hover:bg-slate-500 text-slate-100 focus:ring-slate-500";
      break;
    case 'ghost':
      variantStyle = "bg-transparent hover:bg-slate-700 text-slate-300 hover:text-slate-100 focus:ring-sky-500";
      break;
    case 'danger':
      variantStyle = "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500";
      break;
  }

  let sizeStyle = "";
  switch (size) {
    case 'sm':
      sizeStyle = "p-1.5"; // SVG children should be h-4 w-4 or h-5 w-5
      break;
    case 'md':
      sizeStyle = "p-2.5"; // SVG children should be h-5 w-5 or h-6 w-6
      break;
    case 'lg':
      sizeStyle = "p-3"; // SVG children should be h-6 w-6 or h-7 w-7
      break;
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`}
      {...props}
    >
      {icon}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
};

export default IconButton;
