import React from 'react';

import clsx from 'clsx';

import { AppointmentStatusLabels } from '@/constants/CommonConstant';
import { AppointmentStatus, SessionType } from '@/enums';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus | SessionType;
  type: 'session_type' | 'appointment_status';
}

const BADGE_COLOR = {
  GREEN: 'bg-Green',
  RED: 'bg-red-500',
  YELLOW: 'bg-yellow-500',
  BLUE: 'bg-blue-500',
  GRAY: 'bg-primarygray',
  PRIMARY_LIGHT: 'bg-primarylight',
};

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ status, type }) => {
  const getStatusColor = () => {
    if (type === 'appointment_status') {
      switch (status) {
        case AppointmentStatus.COMPLETED:
          return BADGE_COLOR.GREEN;
        case AppointmentStatus.CANCELLED:
          return BADGE_COLOR.RED;
        case AppointmentStatus.SCHEDULED:
          return BADGE_COLOR.YELLOW;
        case AppointmentStatus.IN_PROGRESS:
          return BADGE_COLOR.BLUE;
        case AppointmentStatus.NO_SHOW:
          return BADGE_COLOR.GRAY;
        default:
          return BADGE_COLOR.PRIMARY_LIGHT;
      }
    } else if (type === 'session_type') {
      switch (status) {
        case SessionType.CLINIC:
          return BADGE_COLOR.GREEN;
        case SessionType.VIRTUAL:
          return BADGE_COLOR.YELLOW;
        default:
          return BADGE_COLOR.PRIMARY_LIGHT;
      }
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium leading-4 text-white min-w-20',
        getStatusColor()
      )}
    >
      {type === 'appointment_status'
        ? AppointmentStatusLabels[status as AppointmentStatus]
        : status}
    </span>
  );
};
