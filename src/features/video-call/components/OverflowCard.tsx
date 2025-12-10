import { clsx } from 'clsx';

export interface OverflowCardProps {
  additionalCount: number;
  onClick: () => void;
  className?: string;
}

export function OverflowCard({ additionalCount, onClick, className }: OverflowCardProps) {
  return (
    <div
      className={clsx(
        'relative bg-gradient-to-br from-gray-400 to-blackdarklight !flex-1 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden flex items-center justify-center',
        className
      )}
    >
      <div
        onClick={onClick}
        className='cursor-pointer w-20 h-20 capitalize bg-gray-600 rounded-full flex items-center justify-center'
      >
        <div className='flex flex-col items-center gap-1.5'>
          <p className='text-white text-xl leading-5 font-bold text-center'>+{additionalCount}</p>
          <p className='text-white text-lg leading-18px font-normal'>more</p>
        </div>
      </div>
    </div>
  );
}
