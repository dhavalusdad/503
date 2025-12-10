import React, { type ReactNode } from 'react';

import clsx from 'clsx';

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
  style?: React.CSSProperties;
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
  style,
}: ButtonProps) => {
  const classes = clsx(
    className,
    'group font-normal inline-flex items-center text-base justify-center gap-2 py-3.5 px-3.5 leading-none rounded transition-all duration-300 cursor-pointer',
    {
      'select-none': isActive || isLoading,
      'bg-primary text-white hover:bg-primary/85 border border-primary hover:border-primary/75':
        variant === 'filled',
      'border border-primarygray text-primarygray bg-white hover:bg-Gray': variant === 'outline',
      'opacity-50 cursor-not-allowed': isDisabled || isLoading,
    }
  );

  if (isLink && href) return null; // Can replace this with <Link> if using Next.js

  return (
    <div className={clsx('relative', parentClassName)}>
      <button
        style={style}
        onClick={onClick}
        type={type}
        id={id}
        className={classes}
        ref={buttonRef}
        disabled={isDisabled}
      >
        {children}
        {isLoading ? (
          <span className='relative h-4 w-4 border-[3px] border-gray-900 border-b-white rounded-full block animate-spin' />
        ) : isIconFirst && icon ? (
          <span>{icon}</span>
        ) : null}
        {title && <span className={titleClassName}>{title}</span>}
        {!isIconFirst && icon ? <span className='text-lg'>{icon}</span> : null}
      </button>
      {(isDisabled || isLoading) && (
        <div className='absolute inset-0 bg-transparent z-50 cursor-not-allowed'></div>
      )}
    </div>
  );
};

export default Button;
