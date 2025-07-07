import type { ColumnDef } from '@tanstack/react-table';
import type { Client } from '@/features/client/types';
import { StatusBadge } from '@/features/client/components/StatusBadge';
import { formatDate } from '@/helper';

export const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="text-gray-600">
        {row.getValue('email')}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <div className="text-gray-600">
        {row.getValue('phone')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.getValue('status')} />
    ),
  },
  {
    accessorKey: 'joinDate',
    header: 'Join Date',
    cell: ({ row }) => (
      <div className="text-gray-600">
        {formatDate(row.getValue('joinDate'))}
      </div>
    ),
  },
  {
    accessorKey: 'lastVisit',
    header: 'Last Visit',
    cell: ({ row }) => (
      <div className="text-gray-600">
        {formatDate(row.getValue('lastVisit'))}
      </div>
    ),
  },
  {
    accessorKey: 'totalSessions',
    header: 'Sessions',
    cell: ({ row }) => (
      <div className="text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.getValue('totalSessions')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'therapist',
    header: 'Therapist',
    cell: ({ row }) => (
      <div className="text-gray-600">
        {row.getValue('therapist')}
      </div>
    ),
  },
]; 