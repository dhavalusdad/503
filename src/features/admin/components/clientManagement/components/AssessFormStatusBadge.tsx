import React from 'react';

import clsx from 'clsx';

import { AssessmentFormStatusLabels } from '@/constants/CommonConstant';
import { FormStatusType } from '@/enums';

interface AssessmentFormStatusBadgeProps {
  status: FormStatusType;
  type: 'status';
}

const BADGE_COLOR = {
  GREEN: 'bg-green-500',
  RED: 'bg-red-500',
  YELLOW: 'bg-yellow-500',
  BLUE: 'bg-blue-500',
  GRAY: 'bg-gray-500',
  PRIMARY_LIGHT: 'bg-primarylight',
};

export const AssessmentFormStatusBadge: React.FC<AssessmentFormStatusBadgeProps> = ({
  status,
  type,
}) => {
  const getStatusColor = () => {
    if (type === 'status') {
      switch (status) {
        case FormStatusType.SUBMITTED:
          return BADGE_COLOR.GREEN;
        case FormStatusType.PENDING:
          return BADGE_COLOR.YELLOW;
        default:
          return BADGE_COLOR.PRIMARY_LIGHT;
      }
    }
  };

  return (
    <span
      className={clsx(
        'min-w-20 inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium leading-4 text-white cursor-pointer',
        getStatusColor()
      )}
    >
      {type === 'status' ? AssessmentFormStatusLabels[status as FormStatusType] : status}
    </span>
  );
};
