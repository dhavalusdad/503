import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetUnsignedForms } from '@/api/ amdForm';
import { ROUTES } from '@/constants/routePath';
import { AmdFormDocNames } from '@/enums';
import type {
  TableQueryParams,
  UnsignedFormItem,
} from '@/features/admin/components/clientManagement/types';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { ColumnDef } from '@tanstack/react-table';

export const useAmdAssignTable = () => {
  const { therapist_id = '', timezone } = useSelector(currentUser);
  const navigate = useNavigate();

  const { client_id } = useParams();

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    onSortingChange,
    sorting,
    setSorting,
    searchQuery,
  } = useTableManagement<UnsignedFormItem[], TableQueryParams>({
    apiCall: (queryParams: TableQueryParams) =>
      useGetUnsignedForms(therapist_id, client_id || '', queryParams),
    initialQueryParams: {
      page: 1,
      limit: 10,
    },
  });

  const { data, isLoading, dataUpdatedAt } = apiData ?? {};

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const handleFormClick = (data: UnsignedFormItem) => {
    const appointmentId = data?.appointment?.id;
    const amd_appointment_id = data.appointment?.amd_appointment_id;
    const amd_patient_id = data?.client?.amd_patient_id;
    const patient_id = data?.client?.id;
    const therapist_id = data?.therapist?.id;
    const ehr_note_id = data?.ehr_note_id;
    const assign_id = data.id;

    if (data?.form?.name === AmdFormDocNames.SAFETY_PLAN) {
      navigate(ROUTES.AMD_SAFETY_PLAN.navigatePath(data.id));
      return;
    }

    const formName = (data.form.name as string) || '';
    if (!appointmentId || !formName) return;

    // if(formN)

    const search = new URLSearchParams({
      appointmentId,
      formName,
      therapist_id,
      patient_id,
      amd_patient_id,
      amd_appointment_id,
      ehr_note_id,
      assign_id,
    } as unknown as Record<string, string>).toString();

    navigate(
      `${ROUTES.INTAKE_FORM.navigatePath(client_id || '')}?${search
        .split('&')
        .filter(d => !d.includes('=null'))
        .join('&')}`
    );
  };

  const columns: ColumnDef<UnsignedFormItem>[] = [
    {
      accessorKey: 'form_name',
      header: 'Note name',
      meta: {
        cellClassName: 'capitalize',
      },
      cell: ({ row }) => <>{row.original.form.name}</>,
    },
    {
      accessorKey: 'id',
      header: 'Note ID',
      cell: ({ row }) => <>{row.original.form_id}</>,
      enableSorting: false,
    },

    {
      accessorKey: 'appointment_id',
      header: 'Appointment Id',
      meta: {
        cellClassName: 'capitalize',
      },
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2 block'
          onClick={() =>
            navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(row.original.appointment.id))
          }
        >
          {row.original.appointment ? row.original.appointment.id : null}
        </span>
      ),
      enableSorting: false,
    },

    {
      accessorKey: 'created_at',
      header: 'Added Date',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-3'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'},</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
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
      cell: ({ row }) => (
        <Icon
          name='edit'
          className='cursor-pointer inline-block p-3.5 rounded-full hover:bg-white transition-all duration-300'
          onClick={() => handleFormClick(row.original)}
        />
      ),
    },
  ];

  type ApiResultShape = { data: UnsignedFormItem[]; total: number; currentPage: number | string };
  const typed = (data as unknown as ApiResultShape) || undefined;

  return {
    data: typed?.data || [],
    total: typed?.total || 0,
    isLoading,
    dataUpdatedAt,
    columns,
    onSortingChange,
    sorting,
    setSorting,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
  };
};
