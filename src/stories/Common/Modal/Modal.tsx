import clsx from 'clsx';
import React from 'react';

type ModalProps = {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const Modal = ({ title, className, children, size="md" }: ModalProps) => {
    const modalSize = {
        sm:'w-max-sm',
        md:'w-max-md',
        lg:'w-max-3xl'
    }[size]

  return (
    <div className={clsx(`fixed bottom-0 left-0 right-0 top-0 z-[9999] bg-[#0000009f]  flex justify-center items-center`)}>
    <div className={ clsx('modal bg-white rounded-md',className,modalSize)}>
      {title && <h2>{title}</h2>}
      <div>{children}</div>
    </div>
    </div>
  );
};

export default Modal;
