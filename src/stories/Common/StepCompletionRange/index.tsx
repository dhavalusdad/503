import clsx from 'clsx';

interface StepCompletionRangeProps {
  currentStep: number;
  totalSteps: number;
  color?: string;
  className?: string;
  parentClassName?: string;
}

export const StepCompletionRange: React.FC<StepCompletionRangeProps> = ({
  currentStep,
  totalSteps,
  className = '',
  parentClassName = '',
}) => {
  return (
    <div className='max-w-3/5 mx-auto'>
      <div className={clsx('inline-flex items-center w-full mb-5', parentClassName)}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index + 1 <= currentStep;
          const isCompleted = index + 1 < currentStep;
          return (
            <>
              {/* Step Circle */}
              <span
                className={clsx(
                  'flex items-center justify-center w-10 h-10 rounded-full font-semibold text-white transition-all duration-300',
                  isActive ? 'bg-primary' : 'bg-primary/40'
                )}
              >
                {index + 1}
              </span>
              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div className={clsx('flex-1 overflow-hidden bg-primary/40 h-0.5', className)}>
                  <div
                    className={clsx(
                      'h-full transition-all duration-300 ease-in-out',
                      isCompleted ? 'bg-primary' : 'bg-primary/40'
                    )}
                    style={{
                      width: `${isCompleted ? 100 : 0}%`,
                    }}
                  />
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};
