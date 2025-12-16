import React from 'react';

import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-Green';
      case 'Failed':
        return 'bg-red';
      case 'Pending':
        return 'bg-yellow';
      case 'Void':
        return 'bg-gray-500';
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

export const TransactionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const baseClass =
    'px-3 py-1 text-xs font-medium rounded-full inline-flex items-center justify-center min-w-20';

  const statusMap: Record<string, string> = {
    Success: 'bg-green-100 text-green-600',
    Charge: 'bg-lime-500/40 text-lime-800',
    Refund: 'bg-orange-200 text-orange-700',
    Unsettled: 'bg-yellow-500/30 text-yellow-700',
    Settled: 'bg-green-600/30 text-green-800',
    Void: 'bg-blackdark/30 text-blackdark',
  };

  return <span className={`${baseClass} ${statusMap[status] || ''}`}>{status}</span>;
};
