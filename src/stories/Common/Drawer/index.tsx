import React from 'react';

import clsx from 'clsx';

import Icon from '@/stories/Common/Icon';

export type DrawerPosition = 'left' | 'right';

export interface DrawerHeaderProps {
  title: string;
  onClose: () => void;
  showCloseButton?: boolean;
  subTitle?: string;
}

export interface DrawerProps {
  title?: string;
  subTitle?: string;
  className?: string;
  parentClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void | React.Dispatch<React.SetStateAction<boolean>>;
  closeButton?: boolean;
  footer?: React.ReactElement;
  footerClassName?: string;
  titleClassName?: string;
  parentTitleClassName?: string;
  position?: DrawerPosition;
  width?: string;
  id?: string;
}

const DRAWER_POSITIONS: Record<DrawerPosition, string> = {
  right: 'right-0',
  left: 'left-0',
};

const DRAWER_TRANSFORMS = {
  right: {
    open: 'translate-x-0 ',
    closed: 'translate-x-full',
  },
  left: {
    open: 'translate-x-0',
    closed: '-translate-x-full',
  },
};

export const Drawer: React.FC<DrawerProps> = ({
  title,
  subTitle,
  className,
  parentClassName = '',
  children,
  isOpen,
  onClose,
  contentClassName,
  closeButton = true,
  footer,
  footerClassName,
  titleClassName,
  parentTitleClassName,
  position = 'right',
  width = 'w-96',
  id = 'drawer-root',
}) => {
  // const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (e.target === e.currentTarget) {
  //     onClose();
  //   }
  // };

  return (
    <div
      id={id}
      className={clsx(
        'fixed inset-0 bg-black/50 z-[999] transition-opacity duration-300 ease-in-out',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        parentClassName
      )}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={clsx(
          'fixed top-2.5 bottom-2.5 right-2 bg-white rounded-20px transition-transform duration-300 ease-in-out overflow-hidden',
          width,
          DRAWER_POSITIONS[position],
          isOpen ? DRAWER_TRANSFORMS[position].open : DRAWER_TRANSFORMS[position].closed,
          className
        )}
      >
        {(title || subTitle) && (
          <div
            className={clsx(
              'flex items-center justify-between p-4 sm:p-5 border-b border-solid border-surface',
              parentTitleClassName
            )}
          >
            <div className='flex flex-col gap-1.5'>
              {title && (
                <h2 className={clsx('text-2xl font-bold text-blackdark leading-7', titleClassName)}>
                  {title}
                </h2>
              )}
              {subTitle && (
                <p className='text-base leading-4 font-normal text-primarygray'>{subTitle}</p>
              )}
            </div>
            {closeButton && (
              <div
                onClick={onClose}
                className='cursor-pointer w-11 h-11 rounded-full bg-Gray flex items-center justify-center'
              >
                <Icon name='close' className='icon-wrapper w-6 h-6' />
              </div>
            )}
          </div>
        )}

        <div
          className={clsx(
            'overflow-y-auto p-4 sm:p-5 pb-0 sm:pb-0 scrollbar-hide',
            footer ? 'h-[calc(100%-171px)]' : 'h-[calc(100%-105px)]',
            contentClassName
          )}
        >
          {children}
        </div>

        {footer && (
          <div className={clsx('p-4 sm:p-5 flex items-center justify-between', footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
