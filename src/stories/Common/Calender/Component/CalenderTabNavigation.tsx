// components/TabNavigation.tsx
import React from 'react';

import clsx from 'clsx';

import Button from '@/stories/Common/Button';

export interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  containerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
}

const CalenderTabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  activeTabClassName = '',
  containerClassName = '',
  tabClassName = '',
}) => {
  const activeIndex = tabs.indexOf(activeTab);
  return (
    <div className={clsx('p-1 rounded-lg bg-Gray w-52', containerClassName)}>
      <div className='flex items-center relative'>
        <div
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
          className={clsx(
            'absolute top-0 left-0 h-full bg-white rounded-md transition-transform duration-300'
          )}
        ></div>
        {tabs.map(tab => (
          <Button
            variant='none'
            title={tab}
            key={tab}
            onClick={() => onTabChange(tab)}
            className={clsx(
              'rounded-md !py-[0.60rem] !px-2.5 !leading-22px w-full',
              activeTab === tab
                ? activeTabClassName
                  ? activeTabClassName
                  : 'text-blackdark !font-bold'
                : 'text-primarygray !font-medium',
              tabClassName
            )}
            parentClassName='w-1/3'
          />
        ))}
      </div>
    </div>
  );
};

export default CalenderTabNavigation;
