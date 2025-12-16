import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import { formatDate } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import type { TherapistClientsListDataType } from '@/pages/Client/types';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import TagsCell from '@/stories/Common/TagsCell';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

import type { ColumnDef } from '@tanstack/react-table';

const useGetTherapistClientsColumns = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();

  const columns: ColumnDef<TherapistClientsListDataType>[] = [
    {
      accessorKey: 'full_name',
      header: 'Client Name',
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
          onClick={() => navigate(ROUTES.MY_CLIENT_DETAIL.navigatePath(row.original.id))}
        >
          {row.getValue('full_name')}
        </span>
      ),
    },

    {
      accessorKey: 'joined_date',
      header: 'Joined date',
      cell: ({ row }) => {
        const joinDate = row.getValue('joined_date') as string;
        return <>{formatDate(joinDate)}</>;
      },
    },
    {
      accessorKey: 'appointment_count',
      header: 'Session Completed',
      meta: { sortingThClassName: 'justify-center', cellClassName: 'text-center' },
    },
    ...(hasPermission(PermissionType.ALERT_TAGS_VIEW)
      ? [
          {
            accessorKey: 'tags',
            enableSorting: false,
            header: 'Alert Tags',
            meta: {
              cellClassName: 'max-w-464px min-w-450px !whitespace-normal',
            },
            cell: ({ row }) => {
              if (row.original.tags.length === 0) return <>Not Assigned</>;
              return <TagsCell tags={row.original.tags as unknown as TagsDataType[]} />;
            },
          },
        ]
      : []),
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
      },
      cell: ({ row }) => {
        const client_id = row?.original?.id;
        const chat_session_id = row?.original?.chat_session_id || '';
        return (
          <div className='flex items-center justify-center'>
            <Button
              variant='none'
              isDisabled={!chat_session_id}
              className=' hover:bg-white rounded-full'
              onClick={() => navigate(`/chat/${chat_session_id}`)}
            >
              <Icon name='talkIcon' className='w-5 h-5 text-blackdark' />
            </Button>
            <Button
              variant='none'
              className='hover:bg-white rounded-full'
              onClick={() => navigate(`/my-client/${client_id}`)}
            >
              <Icon name='eye' className='w-5 h-5 text-blackdark' />
            </Button>
          </div>
        );
      },
    },
  ];
  return { columns };
};

export default useGetTherapistClientsColumns;
