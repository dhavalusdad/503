import { useState } from 'react';

import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import type { Appointment } from '@/features/appointment/types';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';

import type { ColumnDef } from '@tanstack/react-table';

const appointmentManagement = () => {
  const [openAppointmentDetailModal, setOpenAppointmentDetailModal] = useState(false);

  const toggleAppointmentDetailModal = () => {
    setOpenAppointmentDetailModal(!openAppointmentDetailModal);
  };

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'select',
      header: '',
      cell: () => (
        <div className=''>
          <CheckboxField id='select' label='' className='border-primarylight' />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'therapistname',
      header: 'Therapist Name',
      cell: ({ row }) => <>{row.getValue('therapistname')}</>,
    },
    {
      accessorKey: 'therapyname',
      header: 'Therapy Name',
      cell: ({ row }) => <>{row.getValue('therapyname')}</>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <>{row.getValue('date')}</>,
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ row }) => <>{row.getValue('time')}</>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <AppointmentStatusBadge status={row.getValue('status')} type='appointment_status' />
      ),
    },
    {
      accessorKey: 'sessiontype',
      header: 'Session Type',
      cell: ({ row }) => <>{row.getValue('sessiontype')}</>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: () => {
        return (
          <div className='flex items-center gap-2.5'>
            <div className='relative cursor-pointer'>
              <Icon name='doublemessage' className='text-blackdark' />
            </div>
            <div
              onClick={() => setOpenAppointmentDetailModal(true)}
              className='relative cursor-pointer'
            >
              <Icon name='eye' className='text-primarygray' />
            </div>
          </div>
        );
      },
    },
  ];

  return {
    columns,
    openAppointmentDetailModal,
    setOpenAppointmentDetailModal,
    toggleAppointmentDetailModal,
  };
};

export default appointmentManagement;
