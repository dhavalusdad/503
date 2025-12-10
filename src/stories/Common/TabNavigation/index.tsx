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
  parentTabClassName?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  activeTabClassName = '',
  containerClassName = '',
  tabClassName = '',
  parentTabClassName,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-wrap gap-2 mb-5 bg-white border border-solid border-surface p-1 rounded-10px',
        containerClassName
      )}
    >
      {tabs.map(tab => (
        <Button
          variant={`${activeTab === tab ? 'none' : 'none'}`}
          title={tab}
          key={tab}
          onClick={() => onTabChange(tab)}
          className={clsx(
            'rounded-10px',
            activeTab === tab
              ? activeTabClassName
                ? activeTabClassName
                : 'bg-primary text-white'
              : 'text-primarygray',
            tabClassName
          )}
          parentClassName={clsx('', parentTabClassName)}
        />
      ))}
    </div>
  );
};

export default TabNavigation;
