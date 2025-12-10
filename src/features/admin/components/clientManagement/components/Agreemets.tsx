import moment from 'moment';
import { useSelector } from 'react-redux';

import { useAgreementList } from '@/api/agreement';
import { useGetClientAgreements } from '@/api/clientManagement';
import type { Agreement } from '@/features/management/components/agreement/hooks';
import { currentUser } from '@/redux/ducks/user';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Spinner';
import Table, { useTableManagement } from '@/stories/Common/Table';

import type { ColumnDef } from '@tanstack/react-table';

type Props = {
  clientId: string;
  isTherapistPanel?: boolean;
};

const Agreements = ({ clientId, isTherapistPanel = false }: Props) => {
  // const [isVisible, setIsVisible] = useState(false);
  // const [filters, setFilters] = useState<Agreement>();

  const { timezone } = useSelector(currentUser);
  // const filterButtonRef = useRef<HTMLButtonElement | null>(null);

  const { data: clientData, isLoading: isClientDataLoading } = useGetClientAgreements(clientId);

  // const handleToggle = () => {
  //   setIsVisible(prev => !prev);
  // };

  const columns: ColumnDef<Agreement>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => moment(row.original.created_at).tz(timezone).format('MMM D, YYYY'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const agreement = clientData?.user?.agreements?.find(
          (agreementId: string) => agreementId === row.original.id
        );
        if (isClientDataLoading) return 'Loading...';

        return agreement ? (
          <div className='bg-Green text-white px-3 py-1 rounded-full text-center text-sm font-medium w-20'>
            Signed
          </div>
        ) : (
          <div className='bg-yellow-500 text-white px-3 py-1 rounded-full text-center text-sm font-medium w-20'>
            Pending
          </div>
        );
      },
    },
  ];

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
  } = useTableManagement<Agreement, object>({
    apiCall: useAgreementList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      type: 'Agreement',
    },
  });

  const { data, isLoading } = apiData ?? {};
  const appointmentHistoryData = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  // const handleApplyFilter = (vals: Agreement) => {
  //   setIsVisible(false);
  //   setFilters({ ...vals });
  //   setPageIndex(1);
  // };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center flex-wrap gap-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Agreements</h5>
        {!isTherapistPanel && (
          <InputField
            type='search'
            placeholder='Search'
            value={searchQuery}
            iconFirst
            onChange={handleSearchChange}
            iconClassName='text-primarygray'
            icon='search'
            parentClassName='w-full sm:w-360px ml-auto'
          />
        )}

        {/* <div className={`relative ${isTherapistPanel ? 'ml-auto' : ''}`}>
          <Button
            buttonRef={filterButtonRef}
            variant='none'
            icon={<Icon name='dropdownArrow' />}
            className='rounded-lg border-primary border border-solid py-4 px-6 flex items-center gap-2'
            onClick={handleToggle}
          >
            Filter By
            {activeFilterCount > 0 && (
              <span className='inline-flex items-center justify-center w-5 h-5 text-white text-xs font-semibold bg-primary rounded-full'>
                {activeFilterCount}
              </span>
            )}
          </Button>
          {isVisible && (
            <CommonFilter<Agreement>
              // fields={filterFields}
              timezone={timezone}
              isLoading={isLoading}
              defaultValues={filters}
              onApply={handleApplyFilter}
              onClear={() => {
                setFilters({});
                setIsVisible(false);
              }}
              onClose={() => setIsVisible(false)}
              buttonRef={filterButtonRef}
            />
          )}
        </div> */}
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Spinner />
        </div>
      ) : (
        <Table<Agreement>
          data={appointmentHistoryData}
          columns={columns}
          className='w-full'
          totalCount={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}
    </div>
  );
};

export default Agreements;
