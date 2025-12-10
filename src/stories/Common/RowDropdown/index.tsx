import React, { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import clsx from 'clsx';

type RowDropdownProps<T extends HTMLElement> = {
  defaultDirection?: 'auto' | 'up' | 'down';
  placement?: 'auto' | 'left' | 'right';
  content: (args: {
    onToggle: () => void;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
  }) => ReactNode;
  children: (args: {
    onToggle: () => void;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    targetRef: React.RefObject<T>;
  }) => ReactNode;
  dropdownContentClassName?: string;
};

// ✅ Updated hook
const useOutsideClick = (
  ref: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        targetRef.current &&
        !targetRef.current.contains(target)
      ) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, targetRef, callback]);
};

export const RowDropdown = <T extends HTMLElement>({
  defaultDirection = 'auto',
  children,
  placement = 'left',
  content,
  dropdownContentClassName,
}: RowDropdownProps<T>) => {
  const targetRef = useRef<T>(null) as React.RefObject<T>;
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [direction, setDirection] =
    useState<RowDropdownProps<T>['defaultDirection']>(defaultDirection);

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const calculatePosition = () => {
    if (!targetRef.current || !dropdownRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const dropdownWidth = dropdownRef.current.offsetWidth || 160; // Get actual dropdown width
    const dropdownHeight = dropdownRef.current.offsetHeight || 120; // Get actual dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;

    let newDirection = direction;
    if (defaultDirection === 'auto') {
      newDirection = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight ? 'up' : 'down';
      setDirection(newDirection);
    }

    let calculatedX = 0;
    if (placement === 'left') {
      calculatedX = rect.right - dropdownWidth;
    } else if (placement === 'right') {
      calculatedX = rect.left;
    } else if (placement === 'auto') {
      if (spaceRight >= dropdownWidth) {
        calculatedX = rect.left;
      } else if (spaceLeft >= dropdownWidth) {
        calculatedX = rect.right - dropdownWidth;
      } else {
        calculatedX = rect.left + (rect.width - dropdownWidth) / 2;
      }
    }

    const y = newDirection === 'up' ? rect.top - dropdownHeight : rect.bottom;
    setPosition({ x: calculatedX, y });
  };

  // ✅ Fixed toggle logic
  const onToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setTimeout(() => calculatePosition(), 0);
    }
  };

  useOutsideClick(dropdownRef, targetRef, () => {
    if (isOpen) setIsOpen(false);
  });

  useLayoutEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleUpdate = () => calculatePosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpen, direction, placement]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
      className={clsx(
        'bg-white border border-solid border-surface shadow-cardshadow rounded-10px',
        direction === 'down' ? 'mt-1' : '-mt-1',
        dropdownContentClassName
      )}
    >
      <div className='relative w-full'>{content({ isOpen, onToggle, setIsOpen })}</div>
    </div>
  );

  return (
    <>
      {children({
        targetRef,
        onToggle,
        isOpen,
        setIsOpen,
      })}
      {isOpen && dropdownContent}
    </>
  );
};

export default RowDropdown;
