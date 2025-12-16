// DropdownMenu.jsx
import clsx from 'clsx';

import Icon, { type IconNameType } from '@/stories/Common/Icon';

export interface OptionsListProps {
  items: OptionListItem[];
  listClassName?: string;
  parentClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
}

export interface OptionListItem {
  label: string;
  icon?: IconNameType;
  onClick?: () => void;
  hidden?: boolean;
  isLoading?: boolean;
}

export default function OptionsList({
  items = [],
  labelClassName,
  iconClassName,
  listClassName,
  parentClassName,
}: OptionsListProps) {
  return (
    <ul className={clsx('bg-white shadow rounded-10px overflow-hidden min-w-40', parentClassName)}>
      {items
        .filter(item => !item.hidden)
        .map((item, index) => (
          <li
            key={index}
            onClick={item.onClick}
            className={clsx(
              'flex items-center gap-2 p-2.5 hover:bg-gray-100 cursor-pointer rounded',
              listClassName,
              item.isLoading ? 'cursor-not-allowed opacity-50' : ''
            )}
          >
            {item.icon && (
              <Icon name={item.icon} className={clsx('icon-wrapper w-5 h-5', iconClassName)} />
            )}
            <span className={clsx('', labelClassName)}>{item.label}</span>
            {item.isLoading && (
              <span className='relative h-4 w-4 border-[3px] border-gray-900 border-b-white rounded-full block animate-spin' />
            )}
          </li>
        ))}
    </ul>
  );
}
