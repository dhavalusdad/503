import moment from 'moment';

import type { DependentsResponse } from '@/api/types/dependents.dto';
import { ActionDropDown } from '@/stories/Common/ActionDropDown';

import type { ColumnDef } from '@tanstack/react-table';

interface UseGetClientDependentColumnsProps {
  handleView: (id: string) => void;
  handleEdit: (id: string) => void;
}

export const useGetClientDependentColumns = ({
  handleView,
  handleEdit,
}: UseGetClientDependentColumnsProps) => {
  const columns: ColumnDef<DependentsResponse>[] = [
    {
      id: 'full_name',
      accessorKey: 'full_name',
      enableSorting: true,
      header: () => (
        <div className='flex items-center gap-1 cursor-pointer'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap font-bold'>Full Name</div>
        </div>
      ),
      cell: ({ row }) => (
        <div className='font-medium text-gray-900'>{row.original.user.full_name || '-'}</div>
      ),
    },
    {
      id: 'email',
      accessorKey: 'email',
      enableSorting: true,
      header: () => (
        <div className='flex items-center gap-1 cursor-pointer'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap font-bold'>Email</div>
        </div>
      ),
      cell: ({ row }) => <div className='font-medium text-gray-900'>{row.original.user.email}</div>,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      enableSorting: true,
      header: () => (
        <div className='flex items-center gap-1 cursor-pointer'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap font-bold'>Phone</div>
        </div>
      ),
      cell: ({ row }) => (
        <div className='font-medium text-gray-900'>{row.original.user.phone || '-'}</div>
      ),
    },
    {
      id: 'relationship',
      accessorKey: 'relationship',
      enableSorting: true,
      header: () => (
        <div className='flex items-center gap-1 cursor-pointer'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap font-bold'>
            Relationship
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className='font-medium text-gray-900'>{row.original.relationship}</div>
      ),
    },
    {
      id: 'dob',
      accessorKey: 'dob',
      enableSorting: true,
      header: () => (
        <div className='flex items-center gap-1 cursor-pointer'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap font-bold'>
            Date of Birth
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className='font-medium text-gray-900'>
          {moment(row.original.user.dob).format('MMM DD, YYYY')}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center !pr-5',
      },
      cell: ({ row }) => {
        const dependent_id = row?.original?.user_id;
        return (
          <ActionDropDown
            showThreeDotView={false}
            actions={[
              {
                label: 'View',
                icon: 'eye',
                onClick: () => handleView(dependent_id),
                show: true,
              },
              {
                label: 'Edit',
                icon: 'edit',
                onClick: () => handleEdit(dependent_id),
                show: true,
              },
            ]}
          />
        );
      },
    },
  ];
  return { columns };
};
