import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import type { ModalType, StaffListDataType } from '@/pages/Admin/StaffManagement/types';
import { currentUser } from '@/redux/ducks/user';
import { ActionDropDown } from '@/stories/Common/ActionDropDown';
import StatusTag from '@/stories/Common/StatusTag';

import type { ColumnDef } from '@tanstack/react-table';

type Props = {
  openCloseModal: (
    modalName: keyof ModalType,
    actionBool?: boolean,
    id?: string,
    role?: string,
    changeStatus?: boolean
  ) => void;
};
const useGetStaffManagementColumns = (props: Props) => {
  const { timezone } = useSelector(currentUser);
  const { openCloseModal } = props;
  const navigate = useNavigate();
  const columns: ColumnDef<StaffListDataType>[] = [
    {
      accessorKey: 'full_name',
      accessorFn: row => `${row.first_name} ${row.last_name}`,
      header: 'Staff Name',
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
          onClick={() => navigate(ROUTES.STAFF_MANAGEMENT_DETAILS.navigatePath(row?.original?.id))}
        >
          {row.getValue('full_name')}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
    },
    {
      accessorKey: 'phone',
      header: 'Phone number',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const roleName = row.original?.role?.name;
        return <>{roleName}</>;
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      meta: {
        sortingThClassName: 'justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        const isActive = row.original?.is_active;
        return (
          <>
            {isActive ? (
              <StatusTag status='active' title='Active' parentClassName='inline-block' />
            ) : (
              <StatusTag status='inactive' title='In Active' parentClassName='inline-block' />
            )}
          </>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Added date',
      cell: ({ row }) => {
        const joinDate = row.getValue('created_at') as string;
        return <>{moment(joinDate).tz(timezone).format('MMM DD, YYYY')}</>;
      },
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
        const staff_id = row?.original?.id;
        const isActive = row.original?.is_active;
        const roleName = row.original?.role.name;
        return (
          <ActionDropDown
            actions={[
              {
                label: isActive ? 'In-Active' : 'Active',
                icon: 'status',
                onClick: () => openCloseModal('statusConfirm', true, staff_id, roleName, !isActive),
                show: true,
              },
              {
                label: 'View',
                icon: 'eye',
                onClick: () => navigate(ROUTES.STAFF_MANAGEMENT_DETAILS.navigatePath(staff_id)),
                show: true,
              },
              {
                label: 'Edit',
                icon: 'edit',
                onClick: () => navigate(ROUTES.EDIT_STAFF_MEMBER.navigatePath(staff_id)),
                show: true,
              },
              {
                label: 'Delete',
                icon: 'delete',
                onClick: () => openCloseModal('deleteStaff', true, staff_id),
                show: true,
                iconClassName: '!w-4 !h-4',
              },
            ]}
          />
        );
      },
    },
  ];
  return { columns };
};

export default useGetStaffManagementColumns;
