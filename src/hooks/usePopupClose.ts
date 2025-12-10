import { useEffect, useState } from 'react';

type UsePopupCloseParams = {
  popupRef: React.RefObject<HTMLElement>;
  buttonRef?: React.RefObject<HTMLElement>;
};

export const usePopupClose = ({ popupRef, buttonRef }: UsePopupCloseParams) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef?.current) {
        if (
          popupRef.current &&
          !popupRef.current.contains(event.target as Node) &&
          (!buttonRef?.current || !buttonRef.current.contains(event.target as Node))
        ) {
          setIsOpen(false);
        }
      } else {
        if (
          popupRef.current &&
          !popupRef.current.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('.react-datepicker')
        ) {
          setIsOpen(false);
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, popupRef, buttonRef, setIsOpen]);
  return { isOpen, setIsOpen };
};
