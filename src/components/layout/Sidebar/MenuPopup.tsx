import { useRef } from 'react';

import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

import type { SidebarMenuItem } from '@/config/sidebarConfig';
import Icon from '@/stories/Common/Icon';

interface MenuPopupProps {
  items: SidebarMenuItem[];
  parentRect: DOMRect;
  level?: number;
  currentSidebarHandler: (item: SidebarMenuItem) => void;
  removePopUp?: () => void;
  setHoveredItem?: React.Dispatch<React.SetStateAction<SidebarMenuItem | null>>;
  setAnchorRect?: React.Dispatch<React.SetStateAction<DOMRect | null>>;
}

const MenuPopup: React.FC<MenuPopupProps> = ({
  items = [],
  parentRect,
  level = 0,
  removePopUp,
  currentSidebarHandler,
}) => {
  const itemRef = useRef<HTMLLIElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string, locationPath: string) => {
    if (path === locationPath) {
      return true;
    } else {
      return false;
    }
  };
  if (!items.length) {
    return null;
  }
  return (
    <div
      className='absolute z-50'
      style={
        level === 1
          ? {
              top: parentRect.top,
              left: parentRect.right,
              paddingLeft: '15px',
            }
          : { left: '100%', paddingLeft: '15px', top: '-6px' }
      }
      onMouseLeave={() => {
        removePopUp?.();
      }}
    >
      <div className='relative bg-white shadow-menupopup rounded-lg p-3 min-w-60'>
        <div className='absolute top-2.5 -left-[9.5px] border-solid border-t-8 border-b-8 border-t-transparent border-b-transparent border-r-gray-300 border-r-[10px]'></div>
        <div className=' absolute top-2.5 -left-[9px] border-solid  border-t-8 border-b-8 border-t-transparent border-b-transparent border-r-white border-r-[10px]'></div>
        <ul className='flex flex-col gap-5'>
          {items.map(item => {
            const isItemActive = isActive(item.path, location.pathname);

            return (
              <li
                key={item.label}
                ref={itemRef}
                className={clsx(
                  'group relative text-blackdark hover:text-primary hover:font-bold transition-all ease-in-out duration-100 cursor-pointer flex items-center justify-between px-3',
                  {
                    '!text-primary !font-bold': isItemActive,
                  }
                )}
                onClick={() => {
                  if (!item.children) navigate(item.path);
                  currentSidebarHandler(item);
                }}
              >
                <span className='flex items-center gap-2 w-full'>
                  <Icon name={item.icon} />
                  <span className='whitespace-nowrap text-base leading-5'>{item.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MenuPopup;
