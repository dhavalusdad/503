import { useEffect, useState } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getInfiniteStaffAsync } from '@/api/staff';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { ActiveStatusEnum, PermissionType, QueueRequestType, QueueStatus } from '@/enums';
import { QueueStatusBadge } from '@/features/admin/components/backofficeQueue/components/QueueStatusBadge';
import { STATUS_OPTION } from '@/features/admin/components/backofficeQueue/constant';
import type { QueueDataType, ModalType } from '@/features/admin/components/backofficeQueue/types';
import type { OptionType } from '@/features/calendar/types';
import { formatLabel } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser, userRole } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import RowDropdown from '@/stories/Common/RowDropdown';
import { CustomAsyncSelect } from '@/stories/Common/Select';

import type { ColumnDef } from '@tanstack/react-table';

type Props = {
  openCloseModal: (
    modalName: keyof ModalType,
    modal?: string,
    actionBool?: boolean,
    id?: string,
    role?: string,
    changeStatus?: boolean
  ) => void;
};

const useGetQueueListColumns = (props: Props) => {
  const { timezone } = useSelector(currentUser);
  const navigate = useNavigate();
  const { openCloseModal } = props;
  const { hasPermission } = useRoleBasedRouting();
  const role = useSelector(userRole);

  // Changed: Using a Map to track selected staff per row
  const [selectedStaffMembers, setSelectedStaffMembers] = useState<
    Record<string, OptionType | null>
  >({});

  // Changed: Track which dropdown is open by row ID

  useEffect(() => {
    if (selectedStaffMembers && selectedStaffMembers?.label && selectedStaffMembers?.value) {
      openCloseModal(
        selectedStaffMembers.value,
        'staffMemberModal',
        true,
        selectedStaffMembers.rowId
      );
    }
  }, [selectedStaffMembers]);

  const columns: ColumnDef<QueueDataType>[] = [
    {
      accessorKey: 'requester_role',
      accessorFn: row => row?.requester?.roles?.[0]?.name || '',
      header: 'Requester',
      enableSorting: false,
      cell: ({ row }) => {
        const role = row?.original?.request_type.includes('therapist') ? 'Therapist' : 'Client';
        const userRequested = row.original.requester.roles?.find(
          d => d.name.toLocaleLowerCase() == role.toLocaleLowerCase()
        )
          ? role
          : row.original.requester.roles?.[0]?.name;
        return (
          <span
            className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
            onClick={() => navigate(ROUTES.QUEUE_DETAILS_VIEW.navigatePath(row.original.id))}
          >
            {[
              QueueRequestType.MISSING_SESSION_NOTE,
              QueueRequestType.INSURANCE_VERIFICATION_FAILED,
              QueueRequestType.INCOMPLETE_CLIENT_PROFILE,
            ].includes(row?.original?.request_type) ||
            (row?.original?.request_type === QueueRequestType.APPOINTMENT_CANCEL &&
              !!row?.original?.metadata?.is_system_generated)
              ? 'System Generated'
              : `${row.original.requester.first_name} ${row.original.requester.last_name} (${userRequested})`}
          </span>
        );
      },
    },
    {
      accessorKey: 'request_type',
      accessorFn: row => `${row.request_type}`,
      header: 'Request Type',
      cell: ({ row }) => <>{formatLabel(row.getValue('request_type'))}</>,
    },
    {
      accessorKey: 'created_at',
      header: 'Ticket Raised',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-3'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'} ,</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Ticket Updated',
      cell: ({ row }) => {
        const createdAt = row.original?.created_at;
        const updatedAt = row.original?.updated_at;

        const isActuallyUpdated = updatedAt !== createdAt;

        if (!isActuallyUpdated) {
          return <span>-</span>;
        }

        return (
          <div className='flex gap-3'>
            <span>{moment(updatedAt).tz(timezone).format('MMM DD, YYYY')},</span>
            <span>{moment(updatedAt).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    ...(role === UserRole.ADMIN
      ? [
          {
            accessorKey: 'assigned_to',
            header: 'Assigned To',
            enableSorting: false,
            meta: {
              cellClassName: 'min-w-72',
            },
            cell: ({ row }) => {
              const rowId = row.original.id;
              const assignedToId = row.original?.assigned_to_id;
              const assignedToName = row.original?.assignee
                ? `${row.original.assignee.first_name} ${row.original.assignee.last_name}`
                : null;

              const value = assignedToId
                ? { label: assignedToName || 'Unknown', value: assignedToId }
                : null;

              return (
                <CustomAsyncSelect
                  id={rowId}
                  queryKey={'backoffice-staff-list'}
                  loadOptions={(page, searchTerm) =>
                    getInfiniteStaffAsync(page, searchTerm, ActiveStatusEnum.ACTIVE)
                  }
                  value={value}
                  placeholder='Select staff member'
                  onChange={e => setSelectedStaffMembers({ ...e, rowId })}
                  name='staff_list'
                  labelClassName='!text-base !leading-22px'
                  StylesConfig={{
                    control: () => ({
                      minHeight: '50px',
                      padding: '4px 6px',
                    }),
                    singleValue: () => ({
                      fontSize: '16px',
                    }),
                    option: () => ({
                      fontSize: '16px',
                    }),
                    loadingIndicator: () => ({
                      display: 'none',
                    }),
                  }}
                  isSearchable={true}
                  filterOption={() => true}
                  menuPosition='fixed'
                />
              );
            },
          },
        ]
      : []),
    {
      accessorKey: 'status',
      header: 'Status',
      accessorFn: row => `${row.status}`,
      cell: ({ row }) => {
        const queue_id = row?.original?.id;
        const roleName = row.original?.assigned_to_role;
        const currentStatus = row.original?.status;

        return (
          <RowDropdown<HTMLDivElement>
            placement='auto'
            content={() => (
              <ul className='flex flex-col min-w-32'>
                {STATUS_OPTION.filter(status => status.value !== currentStatus).map(status => (
                  <li
                    key={status.value}
                    className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                    onClick={() => openCloseModal(status.value, 'status', true, queue_id, roleName)}
                  >
                    <span className='text-sm'>{status.label}</span>
                  </li>
                ))}
              </ul>
            )}
          >
            {({ onToggle, targetRef }) => {
              const canToggle =
                hasPermission(PermissionType.BACKOFFICE_QUEUE_EDIT) &&
                currentStatus !== QueueStatus.RESOLVED;

              return (
                <div ref={targetRef} onClick={canToggle ? onToggle : undefined}>
                  <QueueStatusBadge
                    status={currentStatus}
                    parentClassName='min-w-20 justify-center'
                    showDropdownArrow={canToggle}
                    disabled={!canToggle}
                  />
                </div>
              );
            }}
          </RowDropdown>
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
        return (
          <RowDropdown<HTMLDivElement>
            content={() => (
              <ul className='flex flex-col min-w-28'>
                <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => navigate(ROUTES.QUEUE_DETAILS_VIEW.navigatePath(row.original.id))}
                >
                  <Icon name='eye' className='w-5 h-5 icon-wrapper' />
                  <span className='text-sm font-normal leading-18px text-blackdark'>View</span>
                </li>
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

export default useGetQueueListColumns;
