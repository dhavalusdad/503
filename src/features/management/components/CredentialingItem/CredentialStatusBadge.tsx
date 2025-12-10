import React from 'react';

import { type CredentialingItem } from '@/features/management/types';

interface CredentialStatusBadgeProps {
  status: CredentialingItem['status'];
}

export const CredentialStatusBadge: React.FC<CredentialStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: CredentialingItem['status']) => {
    switch (status) {
      case 'Credentialed':
        return 'bg-green-100 text-green-800';
      case 'Denied':
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Roster':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
