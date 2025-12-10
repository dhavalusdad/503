import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
// import { ROUTES_BASE_PATH } from '@/constants/routePathConstant';
import { AppointmentStatus } from '@/enums';
import type {
  AssessmentFormDataType,
  UserAssessmentFormDataType,
} from '@/features/admin/components/AssessmentForm/type';
import { AssessmentFormStatusBadge } from '@/features/admin/components/clientManagement/components/AssessFormStatusBadge';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import RowDropdown from '@/stories/Common/RowDropdown';

import type { ColumnDef, Row } from '@tanstack/react-table';

const useGetAssessmentFormListColumns = (
  therapistPanel: boolean,
  selectedForms: { id: string; name: string }[],
  setSelectedForms: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
) => {
  const { timezone, role } = useSelector(currentUser);

  const navigate = useNavigate();
  const handleCheckboxChange = (id: string, name: string, checked: boolean) => {
    setSelectedForms(
      prev =>
        checked
          ? [...prev, { id, name }] // add both id + name
          : prev.filter(item => item.id !== id) // remove by id
    );
  };

  const baseColumns: ColumnDef<UserAssessmentFormDataType>[] = [
    {
      accessorKey: 'form_title',
      accessorFn: row => `${row.form_title}`,
      header: 'Form Title',
      meta: {
        cellClassName: '!whitespace-normal min-w-56 max-w-56 3xl:min-w-64 3xl:max-w-64',
      },
      cell: ({ row }) => {
        const isSubmitted = row.original.submitted_at;
        const isCancelled = row.original.appointment?.status === AppointmentStatus.CANCELLED;
        return (
          <span
            onClick={() => {
              if (!isSubmitted && !isCancelled) {
                navigate(ROUTES.SUBMIT_FORM_RESPONSE.navigatePath(row.original.id));
              }
            }}
            className={`${!isSubmitted && !isCancelled ? 'cursor-pointer hover:text-primary hover:underline underline-offset-2' : 'cursor-not-allowed'}`}
          >
            {`${row.getValue('form_title')}`}
          </span>
        );
      },
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Appointment Date & Time',
      cell: ({ row }) => {
        const start = row.original?.appointment?.slot?.start_time;
        const end = row.original?.appointment?.slot?.end_time;

        if (!start || !end) {
          return '-';
        }

        const startTime = moment.tz(start, timezone);
        const endTime = moment.tz(end, timezone);

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
      accessorKey: 'appointment_status',
      header: 'Appointment Status',
      cell: ({ row }) => {
        const status = row.original?.appointment?.status;

        return status ? <AppointmentStatusBadge status={status} type='appointment_status' /> : '-';
      },
    },
    {
      accessorKey: 'assigned_by',
      header: 'Assigned By',
      cell: ({ row }) => {
        return (
          <>{`${row.original.assignedByUser.first_name} ${row.original.assignedByUser.last_name}`}</>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <AssessmentFormStatusBadge status={row.getValue('status')} type='status' />;
      },
    },
    ...(!therapistPanel
      ? [
          {
            accessorKey: 'action' as const,
            header: 'Action',
            enableSorting: false,
            meta: {
              headerClassName: '!text-center',
            },
            cell: ({ row }: { row: Row<UserAssessmentFormDataType> }) => {
              return (
                <Button
                  variant='none'
                  isDisabled={Boolean(
                    row.original.submitted_at ||
                      row.original.appointment?.status === AppointmentStatus.CANCELLED
                  )}
                  className='p-1 hover:bg-white rounded-full transition-colors'
                  onClick={() => {
                    navigate(ROUTES.SUBMIT_FORM_RESPONSE.navigatePath(row.original.id));
                  }}
                  icon={<Icon name='edit' className='w-5 h-5 text-blackdark' />}
                  parentClassName='text-center'
                />
              );
            },
          },
        ]
      : []),
    ...(therapistPanel
      ? [
          {
            accessorKey: 'action' as const,
            header: 'Action',
            enableSorting: false,
            meta: {
              headerClassName: '!text-center !pr-5',
            },
            cell: ({ row }: { row: Row<UserAssessmentFormDataType> }) => {
              return (
                <RowDropdown<HTMLDivElement>
                  content={() => (
                    <ul className='flex flex-col min-w-32 rounded-lg shadow-md bg-white border border-gray-200'>
                      {/* <li
                        className='flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 cursor-pointer'
                        onClick={() => {
                          navigate(`${ROUTES_BASE_PATH.APPOINTMENT_VIEW.path}/${row.original.id}`);
                        }}
                      >
                        <Icon name='eye' className='w-5 h-5 text-gray-700' />
                        <span className='text-sm font-normal text-blackdark'>View</span>
                      </li> */}

                      {row.original.submitted_at && (
                        <li
                          className='flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 cursor-pointer'
                          onClick={() => {
                            navigate(ROUTES.VIEW_FORM_RESPONSE.navigatePath(row.original.id));
                          }}
                        >
                          <Icon name='eye' className='w-5 h-5 text-gray-700' />
                          <span className='text-sm font-normal'>View</span>
                        </li>
                      )}
                      {role === UserRole.CLIENT && (
                        <li
                          className='flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 cursor-pointer'
                          onClick={() => {
                            const path = row.original.submitted_at
                              ? ROUTES.EDIT_FORM_RESPONSE.navigatePath(row.original.id)
                              : ROUTES.SUBMIT_FORM_RESPONSE.navigatePath(row.original.id);
                            navigate(path);
                          }}
                        >
                          <Icon name='chat' className='w-5 h-5 text-gray-700' />
                          <span className='text-sm font-normal'>
                            {row.original.submitted_at ? 'Edit Form' : 'Fill Form'}
                          </span>
                        </li>
                      )}
                    </ul>
                  )}
                >
                  {({ onToggle, targetRef }) => (
                    <div className='flex items-center justify-center'>
                      <div
                        ref={targetRef}
                        onClick={() => onToggle()}
                        className='cursor-pointer inline-block py-2'
                      >
                        <Icon name='threedots' className='text-blackdark' />
                      </div>
                    </div>
                  )}
                </RowDropdown>
              );
            },
          },
        ]
      : []),
  ];
  const checkboxColumn: ColumnDef<AssessmentFormDataType>[] = [
    {
      id: 'select',
      header: () => <span>Select</span>, // could use a master checkbox here
      cell: ({ row }) => (
        <CheckboxField
          id={row.original.id}
          isChecked={selectedForms.some(item => item.id === row.original.id)}
          onChange={e => handleCheckboxChange(row.original.id, row.original.name, e.target.checked)}
        />
      ),
    },
    {
      accessorKey: 'name',
      accessorFn: row => `${row.name}`,
      header: 'Form Title',
      cell: ({ row }) => {
        return <>{`${row.getValue('name')}`}</>;
      },
    },
  ];
  const columns = therapistPanel ? checkboxColumn : baseColumns;

  return { columns };
};

export default useGetAssessmentFormListColumns;
