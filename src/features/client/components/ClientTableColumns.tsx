import { useNavigate } from 'react-router-dom';

import type { Client, Session } from '@/features/client/types';
import { AlertTag } from '@/stories/Common/AlertTag';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

import type { ColumnDef } from '@tanstack/react-table';

export const ActionMenu = ({ route }: { route: string }) => {
  const navigate = useNavigate();
  return (
    <div className='flex '>
      <Button
        variant='none'
        className='p-1 hover:bg-gray-100 cur rounded-full transition-colors'
        onClick={() => navigate(route)}
        icon={<Icon name='eye' className='w-5 h-5 text-gray-600' />}
      />
    </div>
  );
};

export const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client Name',
    cell: ({ row }) => (
      <div className='font-medium text-gray-900'>{row.getValue('clientName')}</div>
    ),
  },
  {
    accessorKey: 'joinDate',
    header: 'Join Date',
    cell: ({ row }) => <div className='text-gray-700'>{row.getValue('joinDate')}</div>,
  },
  {
    accessorKey: 'sessionCount',
    header: 'Session Count',
    cell: ({ row }) => (
      <div className='text-start font-medium text-gray-900'>{row.getValue('sessionCount')}</div>
    ),
  },
  {
    accessorKey: 'alertTags',
    header: 'Alert Tags',
    cell: ({ row }) => {
      const tags = row.getValue('alertTags') as string[];
      return (
        <div className='flex flex-wrap gap-1 max-w-xs'>
          {tags.map((tag, index) => (
            <AlertTag key={`${tag}-${index}`} tag={tag} />
          ))}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => <ActionMenu route={`/my-client/${row.original.id}`} />,
  },
];

export const clientSessionColumns: ColumnDef<Session>[] = [
  {
    accessorKey: 'sessionId',
    header: ({ column }) => (
      <div className='flex items-center gap-1 text-gray-600 font-medium'>
        Session ID
        <Button
          variant='none'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:text-gray-900'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='font-mono text-gray-900 text-sm'>{row.getValue('sessionId')}</div>
    ),
  },
  {
    accessorKey: 'sessionDate',
    header: ({ column }) => (
      <div className='flex items-center gap-1 text-gray-600 font-medium'>
        Session Date
        <Button
          variant='none'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:text-gray-900'
        />
      </div>
    ),
    cell: ({ row }) => <div className='text-gray-700'>{row.getValue('sessionDate')}</div>,
  },
  {
    accessorKey: 'focusArea',
    header: ({ column }) => (
      <div className='flex items-center gap-1 text-gray-600 font-medium'>
        Focus Area
        <Button
          variant='none'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:text-gray-900'
        />
      </div>
    ),
    cell: ({ row }) => {
      const focusArea = row.getValue('focusArea') as string;

      return <span className={`inline-flex px-3 py-1  text-xs font-medium `}>{focusArea}</span>;
    },
  },
  {
    accessorKey: 'wellness',
    header: ({ column }) => (
      <div className='flex items-center gap-1 text-gray-600 font-medium'>
        Wellness
        <Button
          variant='none'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:text-gray-900'
        />
      </div>
    ),
    cell: ({ row }) => {
      const wellness = row.getValue('wellness') as string;

      return <span className={`inline-flex px-3 py-1  text-xs font-medium `}>{wellness}</span>;
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <div className='flex items-center gap-1 text-gray-600 font-medium'>
        Action
        <Button
          variant='none'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:text-gray-900'
        />
      </div>
    ),
    cell: ({ row }) => <ActionMenu route={`/appointment/${row.original.id}`} />,
  },
];
