import React from 'react';

import type { MenuItem, StatusMenuProps } from '@/features/chat/types';
import Icon from '@/stories/Common/Icon';

const MENU_ITEMS: MenuItem[] = [
  { id: 'online', label: 'Online', icon: 'checked', action: 'Online', color: '#08A045' },
  { id: 'offline', label: 'Offline', icon: 'offline', action: 'Offline', color: '#6B6B6B' },
];

const StatusMenu: React.FC<StatusMenuProps> = React.memo(({ isVisible, onMenuClick, menuRef }) => {
  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className='absolute z-50 right-0 mt-2 bg-white rounded-10px shadow-surfaceshadow border border-solid border-surface min-w-48'
    >
      <ul>
        {MENU_ITEMS.map(item => (
          <li
            key={item.id}
            className='flex items-center gap-2 py-2.5 px-3.5 cursor-pointer hover:bg-surface'
            onClick={() => onMenuClick(item.action)}
          >
            <Icon name={item.icon} color={item.color} className='icon-wrapper w-4 h-4' />
            <span className='text-base font-normal text-blackdark'>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default StatusMenu;
