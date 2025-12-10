import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ROUTES_BASE_PATH } from '@/constants/routePathConstant';
import { AppointmentStatus, PermissionType } from '@/enums';
import type { AppointmentDataType } from '@/features/admin/components/appointmentList/types';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import RowDropdown from '@/stories/Common/RowDropdown';

import type { ColumnDef } from '@tanstack/react-table';

type Props = {
  openCloseModal: (
    modalName: 'editAppointment' | 'addCharge',
    action: boolean,
    appointment: AppointmentDataType
  ) => void;
};
const useGetAdminAppointmentListColumns = (props: Props) => {
  const { timezone } = useSelector(currentUser);
  const { openCloseModal } = props;
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();
  const columns: ColumnDef<AppointmentDataType>[] = [
    {
      accessorKey: 'client_name',
      accessorFn: row => `${row.client.user.first_name} ${row.client.user.last_name}`,
      header: 'Client Name',
      meta: {
        cellClassName: 'w-72',
      },
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:font-bold hover:underline cursor-pointer underline-offset-2 block w-full'
          onClick={() => navigate(`${ROUTES_BASE_PATH.APPOINTMENT_VIEW.path}/${row.original.id}`)}
        >
          {row.getValue('client_name')}
        </span>
      ),
    },

    {
      accessorKey: 'therapist_name',
      accessorFn: row => `${row.therapist.user.first_name} ${row.therapist.user.last_name}`,
      header: 'Therapist',
      cell: ({ row }) => <>{row.getValue('therapist_name')}</>,
    },
    {
      accessorKey: 'date',
      header: 'Date & Time',
      accessorFn: row => {
        const time = row?.slot?.start_time;
        return time ? new Date(time) : null;
      },
      cell: ({ row }) => {
        const time = row.original?.slot?.start_time;
        return time ? (
          <div className='flex gap-3'>
            <span>{moment(time).tz(timezone).format('MMM DD, YYYY')},</span>
            <span>{moment(time).tz(timezone).format('hh:mm A')}</span>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'therapy_type',
      accessorFn: row => `${row.therapy_type.name}`,
      header: 'Therapy Type',
      cell: ({ row }) => <>{row.getValue('therapy_type')}</>,
    },
    {
      accessorKey: 'session_type',
      accessorFn: row => `${row.session_type}`,
      header: 'Session Type',
      cell: ({ row }) => <>{row.getValue('session_type')}</>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <AppointmentStatusBadge status={row.original.status} type='appointment_status' />;
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
        return (
          <RowDropdown<HTMLDivElement>
            content={() => (
              <ul className='flex flex-col min-w-32'>
                <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => {
                    navigate(`${ROUTES_BASE_PATH.APPOINTMENT_VIEW.path}/${row.original.id}`);
                  }}
                >
                  <div className='w-5'>
                    <Icon name='eye' className='icon-wrapper w-5 h-5 text-blackdark' />
                  </div>
                  <span className='text-sm font-normal leading-18px text-blackdark'>View</span>
                </li>
                {hasPermission(PermissionType.APPOINTMENT_EDIT) &&
                  row.original.status === AppointmentStatus.SCHEDULED && (
                    <li
                      className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                      onClick={() => {
                        if (
                          ![AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW].includes(
                            row.original.status
                          )
                        ) {
                          openCloseModal('editAppointment', true, row.original);
                        }
                      }}
                    >
                      <div className='w-5'>
                        <Icon name='edit' className={`icon-wrapper w-5 h-5 text-blackdark`} />
                      </div>
                      <span className={`text-sm font-normal leading-18px text-blackdark`}>
                        Edit
                      </span>
                    </li>
                  )}
                {/* <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => {
                    openCloseModal('addCharge', true, row.original);
                  }}
                >
                  <div className='w-5'>
                    <Icon name='dollar' className='icon-wrapper w-5 h-5 text-blackdark' />
                  </div>
                  <span className='text-sm font-normal leading-18px text-blackdark'>
                    Add Charge
                  </span>
                </li> */}
              </ul>
            )}
          >
            {({ onToggle, targetRef }) => (
              <div
                ref={targetRef}
                onClick={() => onToggle()}
                className='cursor-pointer inline-block py-2'
              >
                <Icon name='threedots' className='text-blackdark' />
              </div>
            )}
          </RowDropdown>
        );
      },
    },
  ];
  return { columns };
};

export default useGetAdminAppointmentListColumns;
