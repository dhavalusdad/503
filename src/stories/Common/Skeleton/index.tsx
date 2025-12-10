import React from 'react';

import clsx from 'clsx';

interface CommonSkeletonProps {
  count?: number;
  className?: string;
  parentClassName?: string;
}

const Skeleton: React.FC<CommonSkeletonProps> = ({
  count = 3,
  className = '',
  parentClassName = '',
}) => {
  return (
    // <div className={clsx(`flex-col gap-3`, parentClassName)}>
    //   {Array.from({ length: count }).map((_, i) => (
    //     <div
    //       key={i}
    //       className={clsx(
    //         "rounded-xl animate-pulse bg-gray-200",
    //         className
    //       )}
    //     />
    //   ))}
    // </div>

    <div className={clsx('', parentClassName)}>
      {Array.from({ length: count }).map(() => (
        <div className={`relative bg-Gray h-5 rounded overflow-hidden ${className}`}>
          <span className='absolute top-2/4 -translate-y-2/4 h-[200%] w-24 bg-white/70 blur-lg animate-skeleton -skew-x-[25deg] '></span>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
