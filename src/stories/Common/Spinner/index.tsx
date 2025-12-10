import React from 'react';

export interface SpinnerProps {
  size?: string;
  color?: string;
  speed?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'w-8 h-8',
  color = 'text-red-500',
  speed = 'animate-spin',
  className = '',
}) => {
  return (
    <svg
      className={`${speed} ${size} ${color} ${className}`}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      {/* Background circle */}
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth={3} />
      {/* Moving arc */}
      <circle
        className='opacity-75'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth={3}
        strokeLinecap='round'
        strokeDasharray='31.416' // 2 * π * 10 ≈ 62.83, half of that
        strokeDashoffset='47.124' // 3/4 of the circumference
      />
    </svg>
  );
};

export default Spinner;
