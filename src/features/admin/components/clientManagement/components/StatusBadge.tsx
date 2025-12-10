import React from 'react';

import type { AppointmentHistory } from '@/features/admin/components/clientManagement/types';

interface StatusBadgeProps {
  status: AppointmentHistory['status'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: AppointmentHistory['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-Green';
      case 'Cancelled':
        return 'bg-red';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium leading-4 text-white min-w-20 ${getStatusColor(status)}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
