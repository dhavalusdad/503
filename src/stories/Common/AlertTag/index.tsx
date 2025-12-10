import React from 'react';

// TypeScript interfaces
interface AlertTagProps {
  tag: string;
  variant?: 'filled' | 'none' | 'outline';
  color?: 'red' | 'yellow' | 'green' | 'blue' | 'orange' | 'purple' | 'gray' | 'indigo' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

// Main AlertTag Component
export const AlertTag: React.FC<AlertTagProps> = ({
  tag,
  variant = 'none',
  color = 'gray',
  size = 'md',
  icon,
  className = '',
}) => {
  const getColorStyles = (colorName: string, variantType: string) => {
    const colorMap = {
      red: {
        filled: 'bg-red-500 text-white border-red-500',
        outline: 'bg-transparent text-red-600 border-red-300 hover:bg-red-50',
        none: 'bg-red-50 text-red-700 border-red-200',
      },
      yellow: {
        filled: 'bg-yellow-500 text-white border-yellow-500',
        outline: 'bg-transparent text-yellow-600 border-yellow-300 hover:bg-yellow-50',
        none: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      green: {
        filled: 'bg-green-500 text-white border-green-500',
        outline: 'bg-transparent text-green-600 border-green-300 hover:bg-green-50',
        none: 'bg-green-50 text-green-700 border-green-200',
      },
      blue: {
        filled: 'bg-blue-500 text-white border-blue-500',
        outline: 'bg-transparent text-blue-600 border-blue-300 hover:bg-blue-50',
        none: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      orange: {
        filled: 'bg-orange-500 text-white border-orange-500',
        outline: 'bg-transparent text-orange-600 border-orange-300 hover:bg-orange-50',
        none: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      purple: {
        filled: 'bg-purple-500 text-white border-purple-500',
        outline: 'bg-transparent text-purple-600 border-purple-300 hover:bg-purple-50',
        none: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      indigo: {
        filled: 'bg-indigo-500 text-white border-indigo-500',
        outline: 'bg-transparent text-indigo-600 border-indigo-300 hover:bg-indigo-50',
        none: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      },
      pink: {
        filled: 'bg-pink-500 text-white border-pink-500',
        outline: 'bg-transparent text-pink-600 border-pink-300 hover:bg-pink-50',
        none: 'bg-pink-50 text-pink-700 border-pink-200',
      },
      gray: {
        filled: 'bg-gray-500 text-white border-gray-500',
        outline: 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50',
        none: 'bg-gray-50 text-gray-700 border-gray-200',
      },
    };

    return colorMap[colorName]?.[variantType] || colorMap?.gray[variantType] || '';
  };

  const getSizeStyles = (sizeType: string) => {
    const sizeMap = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-4 py-1 text-xs',
      lg: 'px-4 py-2 text-sm',
    };
    return sizeMap[sizeType] || sizeMap.md;
  };

  const colorStyles = getColorStyles(color, variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border transition-colors duration-200 ${colorStyles} ${sizeStyles} ${className}`}
    >
      {icon && <span className='mr-1.5'>{icon}</span>}

      {tag}
    </span>
  );
};

export default AlertTag;
