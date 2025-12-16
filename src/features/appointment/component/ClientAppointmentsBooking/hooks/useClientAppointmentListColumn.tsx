import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import type { ClientAppointmentBooking } from '@/features/admin/components/appointmentList/types';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

import type { ColumnDef } from '@tanstack/react-table';

const useGetAppointmentListColumns = () => {
  const { timezone } = useSelector(currentUser);
  const navigate = useNavigate();
  const columns: ColumnDef<ClientAppointmentBooking>[] = [
    {
      accessorKey: 'therapist_name',
      accessorFn: row => `${row.therapist_name}`,
      header: 'Therapist Name',
      cell: ({ row }) => {
        return (
          <span
            className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
            onClick={() => navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(row.original.id))}
          >
            {row.getValue('therapist_name')}
          </span>
        );
      },
    },
    {
      accessorKey: 'therapy_name',
      accessorFn: row => `${row.therapy_name}`,
      header: 'Therapy Name',
      cell: ({ row }) => <>{row.getValue('therapy_name')}</>,
    },
    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => {
        const time = row.original?.appointment_date;
        return (
          <div className='flex gap-3'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'},</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      accessorFn: row => `${row.status}`,
      cell: ({ row }) => {
        return <AppointmentStatusBadge status={row.getValue('status')} type='appointment_status' />;
      },
    },
    {
      accessorKey: 'session_type',
      header: 'Session Type',
      accessorFn: row => `${row.session_type}`,
      cell: ({ row }) => {
        return <AppointmentStatusBadge status={row.getValue('session_type')} type='session_type' />;
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
        customSkeleton: (
          <div className='flex items-center justify-center'>
            <Button
              variant='none'
              id='tour-chat-icon'
              className='hover:bg-white rounded-full'
              icon={<Icon name='talkIcon' className='icon-wrapper w-5 h-5 text-blackdark' />}
            />
            <Button
              variant='none'
              className='hover:bg-white rounded-full'
              icon={<Icon name='eye' className='icon-wrapper w-5 h-5 text-blackdark' />}
            />
          </div>
        ),
      },
      cell: ({ row }) => {
        return (
          <div className='flex items-center justify-center'>
            <Button
              variant='none'
              id='tour-chat-icon'
              isDisabled={Boolean(!row.original.chat_session_id)}
              className='hover:bg-white rounded-full'
              onClick={() => {
                navigate(`/chat/${row.original.chat_session_id || ''}`);
              }}
              icon={<Icon name='talkIcon' className='icon-wrapper w-5 h-5 text-blackdark' />}
            />
            <Button
              variant='none'
              className='hover:bg-white rounded-full'
              onClick={() => {
                navigate(`/appointment/${row.original.id}`);
              }}
              icon={<Icon name='eye' className='icon-wrapper w-5 h-5 text-blackdark' />}
            />
          </div>
        );
      },
    },
  ];
  return { columns };
};

export default useGetAppointmentListColumns;
