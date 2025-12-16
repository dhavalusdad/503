import Icon from '@/stories/Common/Icon';
import RowDropdown from '@/stories/Common/RowDropdown';

export const useRolePermissionTable = ({
  onDelete,
  onEdit,
  onView,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}) => {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => {
        return (
          <span
            className='hover:text-primary hover:underline cursor-pointer underline-offset-2 block'
            onClick={() => onView(row.original.id)}
          >
            {row.getValue('name')}
          </span>
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
              <ul className='flex flex-col min-w-32'>
                <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => onView(row.original.id)}
                >
                  <div className='w-5'>{<Icon name='eye' className='w-5 h-5 icon-wrapper' />}</div>
                  <span className='text-sm font-normal leading-18px text-blackdark '>View</span>
                </li>
                <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => onEdit(row.original.id)}
                >
                  <div className='w-5'>{<Icon name='edit' className='w-5 h-5 icon-wrapper' />}</div>
                  <span className='text-sm font-normal leading-18px text-blackdark'>Edit</span>
                </li>
                <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => onDelete(row.original.id)}
                >
                  <div className='w-5'>
                    {<Icon name='delete' className='w-4 h-4 icon-wrapper' />}
                  </div>
                  <span className='text-sm font-normal leading-18px text-blackdark'>Delete</span>
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
      size: 20,
    },
  ];
  return { columns };
};
