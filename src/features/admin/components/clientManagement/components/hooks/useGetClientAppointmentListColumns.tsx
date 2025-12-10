import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import type { AppointmentHistoryDataType } from '@/features/admin/components/clientManagement/types';
import { currentUser } from '@/redux/ducks/user';
import CheckboxField from '@/stories/Common/CheckBox';

import type { ColumnDef } from '@tanstack/react-table';

const useGetClientAppointmentListColumns = (
  selectedIds: string[],
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const { timezone } = useSelector(currentUser);
  const navigate = useNavigate();
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(item => item !== id)));
  };

  const therapistClientsAppointmentColumns: ColumnDef<AppointmentHistoryDataType>[] = [
    {
      id: 'select',
      header: () => <span>Select</span>,
      cell: ({ row }) => (
        <CheckboxField
          id={row.original.id}
          isChecked={selectedIds.some(item => item === row.original.id)}
          onChange={e => handleCheckboxChange(row.original.id, e.target.checked)}
        />
      ),
    },
    {
      accessorKey: 'id',
      header: 'Appointment ID',
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:font-bold hover:underline cursor-pointer underline-offset-2 block w-full'
          onClick={() => navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(row.getValue('id')))}
        >
          {row.getValue('id')}
        </span>
      ),
    },
    {
      accessorKey: 'appointment_date',
      header: 'Appointment Date',
      cell: ({ row }) => (
        <>{moment(row.original.appointment_date).tz(timezone).format('MMM D, YYYY, h:mm A')}</>
      ),
    },
  ];

  return {
    therapistClientsAppointmentColumns,
  };
};

export default useGetClientAppointmentListColumns;
