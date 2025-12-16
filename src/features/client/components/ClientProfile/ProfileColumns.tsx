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
      header: 'Full Name',
      cell: ({ row }) => <>{row.original.user.full_name || '-'}</>,
    },
    {
      id: 'email',
      accessorKey: 'email',
      enableSorting: true,
      header: 'Email',
      cell: ({ row }) => <>{row.original.user.email}</>,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      enableSorting: true,
      header: 'Phone',
      cell: ({ row }) => <>{row.original.user.phone || '-'}</>,
    },
    {
      id: 'relationship',
      accessorKey: 'relationship',
      enableSorting: true,
      header: 'Relationship',
      cell: ({ row }) => <>{row.original.relationship}</>,
    },
    {
      id: 'dob',
      accessorKey: 'dob',
      enableSorting: true,
      header: ' Date of Birth',
      cell: ({ row }) => <>{moment(row.original.user.dob).format('MMM DD, YYYY')}</>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
        cellClassName: 'text-center',
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
