import { PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

import type { ClinicAddressInterface } from './index';
import type { CellContext, ColumnDef } from '@tanstack/react-table';

interface UseGetClinicAddressColumnsProps {
  handleRowClick: (rowData: ClinicAddressInterface) => void;
  openCloseModal: (
    modalName: 'addEdit' | 'delete',
    actionBool: boolean,
    id?: string,
    data?: ClinicAddressInterface
  ) => void; // Update this line
}

const useGetClinicAddressColumns = ({
  handleRowClick,
  openCloseModal,
}: UseGetClinicAddressColumnsProps) => {
  const { hasPermission } = useRoleBasedRouting();

  const columns: ColumnDef<ClinicAddressInterface>[] = [
    {
      accessorKey: 'name',
      header: 'Clinic Name',
      meta: {
        cellClassName: '!whitespace-normal',
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = (rowA.getValue(columnId) as string).toLowerCase();
        const b = (rowB.getValue(columnId) as string).toLowerCase();
        return a.localeCompare(b);
      },
      cell: (info: CellContext<ClinicAddressInterface, unknown>) => (
        <span
          className='cursor-pointer hover:text-primary hover:underline'
          onClick={() => handleRowClick(info.row.original)}
          title={info.getValue() as string}
        >
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Clinic Address',
      meta: {
        cellClassName: '!whitespace-normal',
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = (rowA.getValue(columnId) as string).toLowerCase();
        const b = (rowB.getValue(columnId) as string).toLowerCase();
        return a.localeCompare(b);
      },
      cell: (info: CellContext<ClinicAddressInterface, unknown>) => (
        <span
          className='cursor-pointer hover:text-primary'
          onClick={() => handleRowClick(info.row.original)}
          title={info.getValue() as string}
        >
          {info.getValue() as string}
        </span>
      ),
    },
    ...(hasPermission(PermissionType.CLINIC_ADDRESSES_EDIT) ||
    hasPermission(PermissionType.CLINIC_ADDRESSES_DELETE)
      ? [
          {
            accessorKey: 'actions',
            header: 'Actions',
            meta: {
              headerClassName: '!text-center',
            },
            cell: (info: CellContext<ClinicAddressInterface, unknown>) => {
              return (
                <div className='flex items-center justify-center'>
                  {hasPermission(PermissionType.CLINIC_ADDRESSES_EDIT) && (
                    <Button
                      variant='none'
                      onClick={() => {
                        openCloseModal('addEdit', true, info.row.original.id);
                      }}
                      icon={<Icon name='edit' />}
                      className='hover:bg-white rounded-full'
                    />
                  )}
                  {hasPermission(PermissionType.CLINIC_ADDRESSES_DELETE) && (
                    <Button
                      variant='none'
                      onClick={() => {
                        openCloseModal('delete', true, info.row.original.id, info.row.original);
                      }}
                      icon={<Icon name='delete' />}
                      className='hover:bg-white rounded-full'
                    />
                  )}
                </div>
              );
            },
            enableSorting: false,
          },
        ]
      : []),
  ];

  return { columns };
};

export default useGetClinicAddressColumns;
