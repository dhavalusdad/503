import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useSyncTherapistFromBambooHR } from '@/api/bambooHR';
import { THERAPIST_KEYS_NAME } from '@/api/common/therapist.queryKey';
import { useRowLoadingTracker } from '@/api/hooks/rowLoadingTracker';
import { useUpdateUserPermission } from '@/api/permissions';
import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import type { TherapistListDataType } from '@/pages/Therapist/TherapistManagement/types';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import OptionsList, { type OptionListItem } from '@/stories/Common/List';
import RowDropdown from '@/stories/Common/RowDropdown';
import StatusTag from '@/stories/Common/StatusTag';
import TagsCell from '@/stories/Common/TagsCell';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

import type { ColumnDef } from '@tanstack/react-table';

const useGetTherapistManagementColumns = ({
  updateStatus,
  syncProvider,
}: {
  updateStatus: (id: string, status: boolean) => void;
  syncProvider: (therapistId: string) => void;
}) => {
  const { timezone } = useSelector(currentUser);
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();

  const { loadingMap, setLoading } = useRowLoadingTracker();

  const { invalidate } = useInvalidateQuery();

  const { mutateAsync: syncTherapistFromBambooHR } = useSyncTherapistFromBambooHR({
    onMutate: variables => setLoading(`synced-therapist-${variables.therapist_id}`, true),
    onSettled: variables => setLoading(`synced-therapist-${variables.therapist_id}`, false),
  });

  const { mutateAsync: updatePermission } = useUpdateUserPermission({
    onSuccess: () => invalidate([THERAPIST_KEYS_NAME.LIST]),
    onMutate: variables => setLoading(`update-permission-${variables.user_id}`, true),
    onSettled: variables => setLoading(`update-permission-${variables.user_id}`, false),
  });
  const columns: ColumnDef<TherapistListDataType>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      meta: {
        cellClassName: 'min-w-48',
      },
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
          onClick={() => navigate(`/therapist-management/view-therapist/${row.original.id}`)}
        >
          {row.getValue('full_name')}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      cell: ({ row }) => <>{row.getValue('email')}</>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone number',
      cell: ({ row }) => <>{row.getValue('phone') || 'Not Specified'}</>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <>{row.getValue('gender') ?? 'Not Specified'}</>,
    },
    {
      accessorKey: 'joined_date',
      header: 'Joined date',
      cell: ({ row }) => {
        const joinDate = row.getValue('joined_date') as string;
        return <>{moment(joinDate).tz(timezone).format('MMM DD, YYYY')}</>;
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
        const isActive = row.original?.active;
        return (
          <>
            {isActive ? (
              <StatusTag status='active' title='Active' />
            ) : (
              <StatusTag status='inactive' title='Inactive' />
            )}
          </>
        );
      },
    },
    {
      accessorKey: 'client_count',
      header: 'No. of Clients',
      meta: { sortingThClassName: 'justify-center', cellClassName: 'text-center' },
      cell: ({ row }) => <>{row.getValue('client_count')}</>,
    },
    {
      accessorKey: 'specialty',
      header: 'Specialties',
      meta: {
        cellClassName: '!whitespace-normal min-w-76 max-w-76',
      },
      cell: ({ row }) => {
        const options = row.original.specialties;
        if (Array.isArray(options)) {
          if (options.length) {
            return <TagsCell tags={options as unknown as TagsDataType[]} />;
          } else {
            return <>Not Specified</>;
          }
        }
      },
      enableSorting: false,
    },
    {
      accessorKey: 'amd_provider_id',
      header: 'AMD Provider ID',
      enableSorting: false,
      cell: ({ row }) => {
        const providerId = row.original.amd_provider_id;
        return <>{providerId || 'Not assigned'}</>;
      },
    },
    {
      accessorKey: 'amd_provider_name',
      header: 'AMD Provider Name',
      enableSorting: false,
      cell: ({ row }) => {
        const providerName = row.original.amd_provider_name;
        return <>{providerName || 'Not assigned'}</>;
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
        const therapist_id = row.original.id;
        const user_id = row.original.user_id;
        const isActive = row.original?.active;
        const canAddPatient = row.original?.permissions.find(
          item => item.name === PermissionType.PATIENT_ADD
        );

        const optionList: OptionListItem[] = [
          {
            label: isActive ? 'In-Active' : 'Active',
            onClick: () => {
              updateStatus(user_id, !isActive);
            },
            icon: 'status',
            hidden: !hasPermission(PermissionType.THERAPIST_EDIT),
          },
          {
            label: 'View',
            onClick: () => navigate(`/therapist-management/view-therapist/${therapist_id}`),
            icon: 'eye',
          },
          {
            label: 'Edit',
            onClick: () => navigate(`/therapist-management/edit-therapist/${therapist_id}`),
            icon: 'edit',
            hidden: !hasPermission(PermissionType.THERAPIST_EDIT),
          },
          {
            label: 'Assign Provider',
            onClick: () => syncProvider(therapist_id),
            icon: 'arrow',
            hidden: !hasPermission(PermissionType.THERAPIST_EDIT),
          },
          {
            label: 'Sync From BambooHR',
            onClick: () => syncTherapistFromBambooHR({ therapist_id }),
            icon: 'sync',
            hidden: !hasPermission(PermissionType.THERAPIST_EDIT),
            isLoading: loadingMap[`synced-therapist-${therapist_id}`],
          },
          {
            label: `${canAddPatient ? 'Disable' : 'Enable'} Adding Patient`,
            onClick: async () =>
              await updatePermission({
                hasPermission: canAddPatient ? false : true,
                user_id,
                permission: PermissionType.PATIENT_ADD,
                role: UserRole.THERAPIST,
              }),
            icon: 'AddUser',
            hidden: !hasPermission(PermissionType.THERAPIST_EDIT),
            isLoading: loadingMap[`update-permission-${user_id}`],
          },
        ];

        return (
          <RowDropdown<HTMLDivElement> content={() => <OptionsList items={optionList} />}>
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

export default useGetTherapistManagementColumns;
