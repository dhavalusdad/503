import clsx from 'clsx';
import { type ReactNode } from 'react';

export interface ButtonProps {
  isLink?: boolean;
  href?:
    | string
    | {
        pathname: string;
        query: object;
      };
  className?: string;
  title?: string;
  icon?: ReactNode;
  isIconFirst?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  titleClassName?: string;
  type?: 'submit' | 'reset' | 'button';
  variant: 'filled' | 'outline' | 'none';
  isDisabled?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  buttonRef?: React.LegacyRef<HTMLButtonElement>;
  id?: string;
  parentClassName?: string;
}

export const Button = ({
  isLink = false,
  href,
  className = '',
  title,
  icon = false,
  isIconFirst = false,
  variant,
  onClick,
  isActive = false,
  titleClassName,
  type = 'button',
  isDisabled,
  isLoading = false,
  children,
  buttonRef,
  id,
  parentClassName,
}: ButtonProps) => {
  const classes = clsx(
    className,
    'group font-semibold inline-flex items-center text-sm justify-center gap-2 px-4 py-2 leading-none rounded-md transition-all duration-300',
    {
      'select-none': isActive || isLoading,
      'bg-blue-600 text-white hover:bg-blue-500 border border-blue-600 hover:border-blue-500':
        variant === 'filled',
      'border border-blue-600 text-blue-600 bg-blue-100 hover:bg-blue-200 hover:text-white hover:border-blue-500':
        variant === 'outline',
      'bg-transparent border-none': variant === 'none',
      'opacity-50 cursor-not-allowed': isDisabled || isLoading,
    }
  );

  if (isLink && href) return null; // Can replace this with <Link> if using Next.js

  return (
    <div className={clsx('relative', parentClassName)}>
      <button
        onClick={onClick}
        type={type}
        id={id}
        className={classes}
        ref={buttonRef}
        disabled={isDisabled}
      >
        {children}
        {isLoading ? (
          <span className="relative h-4 w-4 border-[3px] border-gray-900 border-b-white rounded-full block animate-spin" />
        ) : isIconFirst && icon ? (
          <span>{icon}</span>
        ) : null}
        {title && <span className={titleClassName}>{title}</span>}
        {!isIconFirst && icon ? <span className="text-lg">{icon}</span> : null}
      </button>
      {(isDisabled || isLoading) && (
        <div className="absolute inset-0 bg-transparent z-50 cursor-not-allowed"></div>
      )}
    </div>
  );
};

export default Button;
