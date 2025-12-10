import React from 'react';

import clsx from 'clsx';

import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

export type ModalSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
// export type DrawerPosition = 'left' | 'right';

// export interface ModalHeaderProps {
//   title: string;
//   onClose: () => void;
//   showCloseButton?: boolean;
//   titleClassName?: string;
//   subTitle?: string;
//   onBack?: () => void;
//   showBackIcon?: boolean;
// }

export interface ModalProps {
  title?: string | React.ReactNode;
  // subTitle?: string;
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
  // header?: React.ReactElement;
  size?: ModalSizeType;
  id?: string;
  // onBack?: () => void;
  // showBackIcon?: boolean;
  isLoading?: boolean;
  closeButtonClassName?: string;
}

const MODAL_SIZES: Record<ModalSizeType, string> = {
  xs: 'sm:max-w-501px',
  sm: 'md:max-w-699px',
  md: 'max-w-md',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-7xl',
};

export const Modal: React.FC<ModalProps> = ({
  title = '',
  // subTitle,
  className,
  parentClassName = '',
  children,
  size = 'xs',
  isOpen,
  onClose,
  contentClassName,
  closeButton = true,
  footer,
  footerClassName,
  titleClassName,
  parentTitleClassName,
  closeButtonClassName,
  // header,
  id = 'modal-root',
  // onBack,
  // showBackIcon,
  isLoading = false,
}) => {
  if (!isOpen) return null;
  // const modalClass = clsx(
  //   'bg-white rounded-20px shadow-xl mx-4 md:mx-0 w-full transition-all duration-300 ease-in-out transform',
  //   MODAL_SIZES[size],
  //   isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
  //   className
  // );

  // const backdropClass = clsx(
  //   'fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out flex items-center z-[9999] justify-center p-4',
  //   isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
  //   parentClassName
  // );

  // This fuction closed the modal while clicking outside modal area

  // const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (e.target === e.currentTarget) {
  //     onClose();
  //   }
  // };

  // const headerToRender =
  //   header ??
  //   (title ? (
  //     <ModalHeader
  //       title={title}
  //       onClose={onClose}
  //       showCloseButton={closeButton}
  //       subTitle={subTitle}
  //       titleClassName={titleClassName}
  //       onBack={onBack}
  //       showBackIcon={showBackIcon}
  //     />
  //   ) : null);

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className='flex flex-col items-center justify-center space-y-3'>
      <div className='relative'>
        <div className='w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin'></div>
      </div>
    </div>
  );
  return (
    <div
      id={id}
      className={clsx(
        'fixed inset-0 bg-blackdark/80 z-9999 transition-opacity duration-300 ease-in-out flex items-center justify-center',
        parentClassName
      )}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={clsx(
          'bg-white rounded-20px mx-4 md:mx-0 w-[calc(100%-32px)] transition-all duration-300 ease-in-out overflow-hidden',
          MODAL_SIZES[size],
          className
        )}
      >
        {(title || closeButton) && (
          <div
            className={clsx(
              'flex justify-between items-center border-b border-surface p-30px pb-5',
              parentTitleClassName
            )}
          >
            {title && (
              <h2
                className={clsx(
                  'text-lg md:text-xl xl:text-2xl font-bold text-blackdark',
                  titleClassName
                )}
              >
                {title}
              </h2>
            )}
            {closeButton && (
              <Button
                onClick={onClose}
                variant='none'
                className='text-blackdark !p-0'
                parentClassName={clsx('h-30px', closeButtonClassName)}
                aria-label='Close modal'
                icon={<Icon name='close' className='w-30px h-30px icon-wrapper' />}
              />
            )}
          </div>
        )}
        {/* {headerToRender && (
          <div className={clsx('flex-shrink-0', titleClassName)}>{headerToRender}</div>
        )} */}
        <div
          className={clsx(
            'p-30px pt-5 overflow-y-auto',
            contentClassName,
            footer ? 'max-h-[calc(100dvh-206px)]' : 'max-h-[calc(100dvh-126px)]'
          )}
        >
          {isLoading ? <LoadingSpinner /> : children}
        </div>
        {footer && !isLoading && (
          <div className={clsx('p-30px pt-0', footerClassName)}>{footer}</div>
        )}
      </div>
    </div>
  );
};

// const ModalHeader: React.FC<ModalHeaderProps> = ({
//   title,
//   onClose,
//   subTitle,
//   titleClassName,
//   showCloseButton = true,
//   showBackIcon = false,
//   onBack,
// }) => (
//   <div className='flex items-center justify-between p-4 '>
//     {showBackIcon ? (
//       <>
//         <div className='flex flex-row items-center gap-2.5'>
//           <Button
//             variant='none'
//             onClick={onBack}
//             icon={
//               <Icon
//                 name='arrowLeft'
//                 color='#2E3139'
//                 className='text-gray-500 w-7 h-7 icon-wrapper'
//               />
//             }
//             className='p-2 hover:bg-gray-100 rounded-full transition-colors duration-200'
//           />
//           <h2 className={clsx('text-xl font-semibold text-gray-900', titleClassName)}>{title}</h2>
//           {subTitle && <p className='text-sm text-gray-500'>{subTitle}</p>}
//         </div>
//       </>
//     ) : (
//       <div className='flex flex-col gap-2.5'>
//         <h2 className={clsx('text-xl font-semibold text-gray-900', titleClassName)}>{title}</h2>
//         {subTitle && <p className='text-sm text-gray-500'>{subTitle}</p>}
//       </div>
//     )}
//     {showCloseButton ? (
//       <Button
//         variant='none'
//         onClick={onClose}
//         icon={<Icon name='close' className='text-gray-500 icon-wrapper w-7 h-7 ' />}
//         className='p-2 hover:bg-gray-100 rounded-full transition-colors duration-200'
//       />
//     ) : (
//       <div className='flex flex-col gap-2.5'></div>
//     )}
//   </div>
// );

export default Modal;
