import clsx from 'clsx';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';

import type { Appointment } from '@/api/types/calendar.dto';
import { ROUTES_BASE_PATH } from '@/constants/routePathConstant';
import { AppointmentStatus } from '@/enums';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import type { SessionNote } from '@/features/appointment/types';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

import type { ColumnDef } from '@tanstack/react-table';

export const ActionMenu = ({
  appointmentId,
  textType = false,
}: {
  appointmentId: string;
  isAdminPanel: boolean;
  textType?: boolean;
}) => {
  const navigate = useNavigate();

  if (textType) {
    return (
      <span
        className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
        onClick={() => navigate(`${ROUTES_BASE_PATH.APPOINTMENT_VIEW.path}/${appointmentId}`)}
      >
        {appointmentId}
      </span>
    );
  }

  return (
    <Button
      variant='none'
      parentClassName='text-center'
      className='hover:bg-white rounded-full'
      onClick={() => {
        navigate(`${ROUTES_BASE_PATH.APPOINTMENT_VIEW.path}/${appointmentId}`);
      }}
      icon={<Icon name='eye' className='w-5 h-5 text-blackdark' />}
    />
  );
};

export const getAppointmentColumns = (params: { isAdminPanel?: boolean; timezone: string }) => {
  const { isAdminPanel = false, timezone } = params;
  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'appointment_id',
      id: 'id',
      header: 'Appointment ID',
      cell: ({ row }) => (
        <ActionMenu appointmentId={row.original?.id} isAdminPanel={isAdminPanel} textType={true} />
      ),
    },
    {
      id: 'client_name',
      accessorKey: 'first_name',
      header: 'Client Name',
      cell: ({ row }) => (
        <>
          {row.original?.client?.user?.first_name} {row.original?.client?.user?.last_name}
        </>
      ),
    },
    {
      id: 'therapy_type',
      accessorKey: 'therapy_type',
      header: 'Therapy Type',
      cell: ({ row }) => <>{row.original?.therapy_type?.name}</>,
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => {
        const startTime = moment.tz(row.original?.slot?.start_time, timezone);
        const endTime = moment.tz(row.original?.slot?.end_time, timezone);
        return (
          <div className='flex gap-3'>
            <span>{startTime.format('MMM DD, YYYY')},</span>
            <span>
              {startTime.format('hh:mm A')} - {endTime.format('hh:mm A')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => {
        const { status, logged_start_time, logged_end_time, actual_start_time, actual_end_time } =
          row.original;

        if (status !== AppointmentStatus.COMPLETED) {
          return <>-</>;
        }

        const startTime =
          logged_start_time && logged_end_time ? logged_start_time : actual_start_time;
        const endTime = logged_start_time && logged_end_time ? logged_end_time : actual_end_time;

        if (!startTime || !endTime) return <>-</>;

        const duration = moment
          .tz(endTime, timezone)
          .diff(moment.tz(startTime, timezone), 'minutes');
        if (!duration) return <>-</>;
        return <>{duration} minutes</>;
      },
    },
    {
      accessorKey: 'payment_method',
      enableSorting: false,
      header: 'Payment Method',
      cell: ({ row }) => {
        return (
          <>{row.original?.payment_method ? row.original?.payment_method?.name : 'Not specified'}</>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <AppointmentStatusBadge
            status={row.original?.status as AppointmentStatus}
            type='appointment_status'
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Action',
      meta: {
        headerClassName: '!text-center',
      },
      cell: ({ row }) => (
        <ActionMenu appointmentId={row.original?.id} isAdminPanel={isAdminPanel} />
      ),
      enableSorting: false,
    },
  ];
  return columns;
};

export const useGetNotesColumns = (selectedNoteId: string | null) => {
  const columns: ColumnDef<SessionNote>[] = [
    {
      accessorKey: 'title',
      header: 'Memo Title',
      cell: ({ row }) => {
        const note = row?.original;
        const isSelected = note?.id === selectedNoteId;
        const title = note?.title;
        const isDraft = note?.is_draft;

        return (
          <div className={clsx(isSelected ? 'text-white' : 'text-blackdark')}>
            {title}
            {isDraft && (
              <span className='ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded'>
                Draft
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Action',
      meta: {
        headerClassName: '!text-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        const isSelected = row.original.id === selectedNoteId;
        return (
          <Button
            variant='none'
            className='!p-0 rounded-none'
            icon={
              <Icon
                name='eye'
                className={clsx('w-5 h-5', isSelected ? 'text-white' : 'text-blackdark')}
              />
            }
          />
        );
      },
      enableSorting: false,
    },
  ];
  return { columns };
};
