import React from 'react';

import clsx from 'clsx';

import { QueueStatusLabels } from '@/constants/CommonConstant';
import { QueueStatus } from '@/enums';
import Icon from '@/stories/Common/Icon';

interface QueueStatusBadgeProps {
  status: QueueStatus;
  parentClassName?: string;
  showDropdownArrow?: boolean;
  disabled?: boolean;
}

const BADGE_COLOR = {
  GREEN: 'bg-green-500',
  RED: 'bg-red-500',
  YELLOW: 'bg-yellow-500',
  TEAL: 'bg-teal-600',
  GRAY: 'bg-gray-500',
  PRIMARY_LIGHT: 'bg-primarylight',
};

export const QueueStatusBadge: React.FC<QueueStatusBadgeProps> = ({
  status,
  parentClassName,
  showDropdownArrow = false,
  disabled = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case QueueStatus.RESOLVED:
        return BADGE_COLOR.GREEN;
      case QueueStatus.DENIED:
        return BADGE_COLOR.RED;
      case QueueStatus.IN_PROGRESS:
        return BADGE_COLOR.YELLOW;
      case QueueStatus.OPEN:
        return BADGE_COLOR.TEAL;
      case QueueStatus.ESCALATED:
        return BADGE_COLOR.GRAY;
      default:
        return BADGE_COLOR.PRIMARY_LIGHT;
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium leading-4 text-white',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        getStatusColor(),
        parentClassName
      )}
    >
      {QueueStatusLabels[status]}

      {showDropdownArrow && !disabled && (
        <Icon name='chevronRight' className='icon-wrapper w-2.5 h-2.5 rotate-90' />
      )}
    </span>
  );
};
