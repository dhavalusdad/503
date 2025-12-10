import React from 'react';

import clsx from 'clsx';

import type { Transaction } from '@/features/admin/components/transaction/types';

interface StatusBadgeProps {
  status: Transaction['status'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-Green';
      case 'Failed':
        return 'bg-red';
      case 'Pending':
        return 'bg-yellow';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium leading-4 text-white min-w-20',
        getStatusColor(status)
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
