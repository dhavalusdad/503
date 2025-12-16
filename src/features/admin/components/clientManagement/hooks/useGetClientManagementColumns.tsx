import { useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useDeleteAssignmentById } from '@/api/assessment-forms';
import { useSetClientFlag } from '@/api/clientManagement';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { ROUTES_BASE_PATH } from '@/constants/routePathConstant';
import { FormStatusType, PermissionType } from '@/enums';
import { AssessmentFormStatusBadge } from '@/features/admin/components/clientManagement/components/AssessFormStatusBadge';
import type {
  AssessmentForm,
  SessionNotes,
  ClientManagement,
  AppointmentHistoryDataType,
} from '@/features/admin/components/clientManagement/types';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import { extractNumber, isAdminPanelRole, showToast } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import { ActionDropDown } from '@/stories/Common/ActionDropDown';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import StatusTag from '@/stories/Common/StatusTag';
import TagsCell from '@/stories/Common/TagsCell';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

import type { ColumnDef } from '@tanstack/react-table';

const useGetClientManagementColumns = ({
  updateStatus,
}: {
  updateStatus?: (id: string, status: boolean) => void;
} = {}) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: setClientFlag } = useSetClientFlag();
  const { mutateAsync: deleteAssignment } = useDeleteAssignmentById();
  const { client_id: clientId } = useParams();

  const navigate = useNavigate();
  const { timezone, role } = useSelector(currentUser);
  const { hasPermission } = useRoleBasedRouting();

  const toggleAction = () => setOpen(prev => !prev);

  const handleUserManagementDetails = (id: string) => {
    navigate(`${ROUTES_BASE_PATH.CLIENT_MANAGEMENT_DETAILS.path}/${id}`);
  };
  const [formId, setFormId] = useState<string>('');

  const [deleteAssessmentFormsModal, setDeleteAssessmentFormsModal] = useState<boolean>(false);

  const handleAppointmentDetails = (id: string) => {
    navigate(`${ROUTES_BASE_PATH.APPOINTMENT_VIEW.path}/${id}`);
  };
  const handleAssessmentFormDetails = () => navigate(ROUTES.ASSESSMENT_FORM.path);

  const handleFlag = async (id: string, isFlag: boolean) => {
    try {
      await setClientFlag({ id, isFlag });
    } catch (error) {
      if (error instanceof Error) {
        showToast(error?.message, 'ERROR');
      }
    }
  };

  const handleDeleteForm = async (id: string) => {
    const response = await deleteAssignment(id);
    if (response.success) {
      setDeleteAssessmentFormsModal(false);
    }
  };

  const columns: ColumnDef<ClientManagement>[] = [
    {
      accessorKey: 'full_name',
      header: 'Client Name',
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
          onClick={() => handleUserManagementDetails(row.original.id)}
        >
          {row.getValue('full_name')}
        </span>
      ),
    },
    ...(hasPermission(PermissionType.PATIENT_EDIT)
      ? [
          {
            accessorKey: 'isFlag',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
              const isFlagged = row.getValue<boolean>('isFlag');
              const id = row.original.id;
              return (
                <div className='group cursor-pointer' onClick={() => handleFlag(id, !isFlagged)}>
                  <Icon
                    name={isFlagged ? 'flagfill' : 'flag'}
                    className={`text-black ${!isFlagged && 'opacity-0 group-hover:opacity-100'}`}
                  />
                </div>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: 'created_at',
      header: 'Joined Date',
      cell: ({ row }) => moment(row.original.created_at).tz(timezone).format('MMM D, YYYY'),
    },

    {
      accessorKey: 'email',
      header: 'Email Address',
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
          onClick={() => handleUserManagementDetails(row.original.id)}
        >
          {row.getValue('email')}
        </span>
      ),
    },
    {
      accessorKey: 'appointments_count',
      header: 'Appointments',
      meta: { sortingThClassName: 'justify-center', cellClassName: 'text-center' },
    },
    {
      accessorKey: 'cancelled_count',
      header: 'Cancelled',
      meta: { sortingThClassName: 'justify-center', cellClassName: 'text-center' },
    },
    ...(hasPermission(PermissionType.ALERT_TAGS_VIEW)
      ? [
          {
            accessorKey: 'tags',
            header: 'Alert Tags',
            enableSorting: false,
            meta: {
              cellClassName: 'max-w-464px min-w-450px !whitespace-normal',
            },
            cell: ({ row }) => {
              return row.original.tags && row.original.tags.length > 0 ? (
                <TagsCell tags={row.original.tags as unknown as TagsDataType[]} />
              ) : (
                'Not assigned'
              );
            },
          },
        ]
      : []),
    ...(isAdminPanelRole(role)
      ? [
          {
            accessorKey: 'customer_profile_id',
            header: 'Payment Profile ID',
            enableSorting: false,
            cell: ({ row }) => <>{row?.original?.customer_profile_id || 'Not assigned'}</>,
          },
        ]
      : []),
    {
      accessorKey: 'amd_patient_id',
      header: 'AMD Patient ID',
      enableSorting: false,
      cell: ({ row }) => {
        const amdPatientName = extractNumber(row.original?.amd_patient_id || '');
        return <>{amdPatientName || 'Not assigned'}</>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
      },
      cell: ({ row }) => {
        const isActive = row.original?.is_active;
        return (
          <>
            {isActive ? (
              <StatusTag status='active' title='Active' parentClassName='text-center' />
            ) : (
              <StatusTag status='inactive' title='Inactive' parentClassName='text-center' />
            )}
          </>
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
      cell: ({ row }) => {
        const user_id = row.original?.user_id;
        const isActive = row.original?.is_active;
        return (
          <>
            <ActionDropDown
              actions={[
                {
                  label: isActive ? 'In-Active' : 'Active',
                  icon: 'status',
                  onClick: () => updateStatus?.(user_id, !isActive),
                  show: hasPermission(PermissionType.PATIENT_EDIT),
                },
                {
                  label: 'View',
                  icon: 'eye',
                  onClick: () => handleUserManagementDetails(row.original.id),
                  show: true,
                },
                {
                  label: 'Edit',
                  icon: 'edit',
                  onClick: () => navigate(`/client-management/edit-client/${row.original.id}`),
                  show: hasPermission(PermissionType.PATIENT_EDIT),
                },
              ]}
            />
          </>
        );
      },
    },
    // {
    //   accessorKey: 'action',
    //   header: 'Action',
    //   enableSorting: false,
    //   meta: { sortingThClassName: 'justify-center' },
    //   cell: ({ row }) => (
    //     <div className='flex items-center justify-center'>
    //       <Icon
    //         name='eye'
    //         className='cursor-pointer'
    //         onClick={() => handleUserManagementDetails(row.original.id)}
    //       />
    //     </div>
    //   ),
    // },
  ];

  const appointmentHistoryCommonColumns: { [key: string]: ColumnDef<AppointmentHistoryDataType> } =
    {
      id: {
        accessorKey: 'id',
        header: 'Appointment ID',
        cell: ({ row }) => (
          <span
            className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
            onClick={() => navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(row.getValue('id')))}
          >
            {`AP${row.getValue('id')}`}
          </span>
        ),
      },

      appointment_date: {
        accessorKey: 'appointment_date',
        header: 'Date & Time',
        cell: ({ row }) => (
          <>{moment(row.original.appointment_date).tz(timezone).format('MMM D, YYYY, h:mm A')}</>
        ),
      },
      action: {
        accessorKey: 'action',
        header: 'Action',
        meta: {
          headerClassName: '!text-center',
          cellClassName: 'text-center',
        },
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <ActionDropDown
              actions={[
                {
                  icon: 'eye',
                  show: hasPermission(PermissionType.APPOINTMENT_VIEW),
                  onClick: () => handleAppointmentDetails(row.getValue('id')),
                  label: '',
                },
              ]}
            />
          );
        },
      },
    };

  const historyColumn: ColumnDef<AppointmentHistoryDataType>[] = [
    appointmentHistoryCommonColumns.id,
    {
      accessorKey: 'therapist_name',
      accessorFn: row => `${row.therapist_name}`,
      header: 'Therapist Name',
      cell: ({ row }) => <>{row.getValue('therapist_name')}</>,
    },
    appointmentHistoryCommonColumns.appointment_date,
    {
      accessorKey: 'status',
      header: 'Status',
      meta: {
        sortingThClassName: 'justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        return <AppointmentStatusBadge status={row.getValue('status')} type='appointment_status' />;
      },
    },
    appointmentHistoryCommonColumns.action,
  ];

  const therapistClientsAppointmentHistoryColumns = [
    appointmentHistoryCommonColumns.id,
    appointmentHistoryCommonColumns.appointment_date,
    {
      accessorKey: 'area_of_focus',
      header: 'Focus Area',
      enableSorting: false,
      cell: ({ row }) => {
        if (row.original.area_of_focus.length > 0) {
          return <TagsCell tags={row.original.area_of_focus} />;
        } else {
          return '-';
        }
      },
    },
    appointmentHistoryCommonColumns.action,
  ];

  const sessionNotesColumns: ColumnDef<SessionNotes>[] = [
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
      accessorKey: 'notestitle',
      header: 'Memo Title',
      cell: ({ row }) => <>{row.getValue('notestitle')}</>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      meta: {
        sortingThClassName: 'justify-center',
      },
      enableSorting: false,
      cell: () => {
        return (
          <div className='flex items-center justify-center'>
            <Icon name='eye' className='cursor-pointer' />
          </div>
        );
      },
    },
  ];

  const assessmentFormsColumns: ColumnDef<AssessmentForm>[] = [
    {
      accessorKey: 'select',
      header: '',
      cell: () => <CheckboxField id='select' label='' className='border-primarylight' />,
      enableSorting: false,
    },
    {
      accessorKey: 'formname',
      header: 'Form Name',
      cell: ({ row }) => <>{row.getValue('formname')}</>,
    },

    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => <>{row.getValue('date')}</>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      meta: {
        sortingThClassName: 'justify-center',
      },
      cell: () => {
        return (
          <ActionDropDown
            actions={[
              {
                icon: 'eye',
                show: true,
                label: '',
                onClick: handleAssessmentFormDetails,
              },
            ]}
          />
        );
      },
    },
  ];

  const assessmentFormsColumnsForClient: ColumnDef<AssessmentForm>[] = [
    {
      accessorKey: 'form_title',
      header: 'Form Name',
      meta: {
        cellClassName: '!whitespace-normal min-w-56',
      },
      cell: ({ row }) => <>{row.getValue('form_title')}</>,
    },
    {
      accessorKey: 'assignTo',
      header: 'Assign To',
      cell: ({ row }) => {
        return (
          <>
            {[row.original?.assignedUser?.first_name, row.original?.assignedUser?.last_name].join(
              ' '
            )}
          </>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Assigned Date',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-3'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'} , </span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted Date',
      cell: ({ row }) => {
        const time = row.original?.submitted_at;
        return (
          <div className='flex gap-3'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'}</span>
            <span>{time && moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
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
            <span>{startTime.format('MMM DD, YYYY')} ,</span>
            <span>
              {startTime.format('hh:mm A')} - {endTime.format('hh:mm A')}
            </span>
          </div>
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
  ];
  if (role !== UserRole.CLIENT) {
    assessmentFormsColumnsForClient.push({
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        const isSubmitted = row.original.submitted_at;
        return (
          <ActionDropDown
            actions={[
              {
                label: 'View',
                icon: 'eye',
                iconClassName: `${isSubmitted ? 'text-primary' : 'text-gray-500 cursor-not-allowed'}`,
                onClick: () => {
                  if (isSubmitted) {
                    if (isAdminPanelRole(role)) {
                      navigate(ROUTES.VIEW_FORM_RESPONSE_ADMIN.navigatePath(row.original.id));
                    } else {
                      navigate(
                        ROUTES.VIEW_FORM_RESPONSE_THERAPIST.navigatePath(
                          clientId as string,
                          row.original.id
                        )
                      );
                    }
                  }
                },
              },
              {
                label: 'Remove',
                icon: 'delete',
                show:
                  row.original.status === FormStatusType.PENDING &&
                  hasPermission(PermissionType.PATIENT_EDIT),
                onClick: () => {
                  setFormId(row.original.id);
                  setDeleteAssessmentFormsModal(true);
                },
              },
            ]}
          />
        );
      },
    });
  }

  return {
    columns,
    historyColumn,
    sessionNotesColumns,
    assessmentFormsColumns,
    toggleAction,
    open,
    therapistClientsAppointmentHistoryColumns,
    assessmentFormsColumnsForClient,
    deleteAssessmentFormsModal,
    setDeleteAssessmentFormsModal,
    handleDeleteForm,
    formId,
  };
};

export default useGetClientManagementColumns;
