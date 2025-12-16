import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import { useAgreementList } from '@/api/agreement';
import { ROUTES } from '@/constants/routePath';
import type { Agreement } from '@/features/management/components/agreement/hooks';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { CellContext, ColumnDef } from '@tanstack/react-table';

const ClientAgreementList = () => {
  const navigate = useNavigate();
  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = useTableManagement<Agreement, object>({
    apiCall: useAgreementList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      type: 'Agreement',
    },
  });

  const { data: AgreementData, isLoading } = apiData;

  const SERVER_URL = import.meta.env.VITE_BASE_URL;

  const columns: ColumnDef<Agreement>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
          onClick={() => navigate(ROUTES.MY_AGREEMENTS_DETAIL.navigatePath(row.original.id))}
        >
          {row.getValue('title')}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      enableSorting: true,
      cell: (info: CellContext<Agreement, unknown>) =>
        moment(info?.getValue() as Date).format('MMM DD, YYYY'),
    },
    {
      accessorKey: 'doc',
      header: 'Doc',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.doc ? (
          <a
            className='text-blue-600 font-bold hover:underline'
            href={`${SERVER_URL}/${row.original.doc_path}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {row.original.doc}
          </a>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
      },
      cell: ({ row }) => {
        return (
          <Button
            variant='none'
            className='p-1 hover:bg-gray-100 cur rounded-full transition-colors'
            parentClassName='text-center'
            onClick={() => {
              navigate(`/preferences/my-agreements/${row.original.id}`);
            }}
            icon={<Icon name='eye' className='w-5 h-5 text-gray-600' />}
          />
        );
      },
    },
  ];

  if (!AgreementData || !AgreementData?.data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='flex items-center flex-wrap gap-5 mb-5'>
          <h3 className='text-lg font-bold leading-6 text-blackdark mr-auto'>My Agreements</h3>
          <InputField
            type='Search'
            placeholder='Search'
            icon='search'
            onChange={e => setSearchQuery(e.target.value)}
            iconFirst
            value={searchQuery}
            iconClassName='text-primarygray'
            parentClassName='w-76 xl:w-360px'
          />
        </div>

        <Table
          data={apiData?.data?.data}
          columns={columns}
          className='w-full'
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={apiData?.data?.total}
          onSortingChange={onSortingChange}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default ClientAgreementList;
