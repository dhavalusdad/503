import { useState } from 'react';

import { useSelector } from 'react-redux';

import { useInfiniteDependents } from '@/api/dependents';
import { AddClientDependentForm } from '@/features/client/components/ClientProfile/AddClientDependentForm';
import { useGetClientDependentColumns } from '@/features/client/components/ClientProfile/ProfileColumns';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { InfiniteTable } from '@/stories/Common/InfiniteTable';
import useInfiniteTableManagement from '@/stories/Common/InfiniteTable/hook';

export const ClientDependentListing = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);
  const { client_id } = useSelector(currentUser);

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loaderRef,
    sorting,
    setSorting,
    onSortingChange,
  } = useInfiniteTableManagement({
    apiCall: params =>
      useInfiniteDependents({
        sortColumn: params.sortColumn,
        sortOrder: params.sortOrder,
        enabled: true,
      }),
    initialQueryParams: {
      sortColumn: 'created_at',
      sortOrder: 'DESC',
    },
    defaultPageSize: 10,
  });

  const handleView = async (dependent_id: string) => {
    setSelectedDependentId(dependent_id);
    setMode('view');
    setIsOpen(true);
  };

  const handleEdit = (dependent_id: string) => {
    setSelectedDependentId(dependent_id);
    setMode('edit');
    setIsOpen(true);
  };

  const { columns } = useGetClientDependentColumns({ handleView, handleEdit });

  return (
    <>
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='flex justify-end mb-5'>
          <Button
            variant='filled'
            title='Add Dependent'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            onClick={() => {
              setMode('create');
              setSelectedDependentId(null);
              setIsOpen(true);
            }}
          />
        </div>

        <InfiniteTable
          columns={columns}
          setSorting={setSorting}
          data={data}
          sorting={sorting}
          onSortingChange={onSortingChange}
          onLoadMore={fetchNextPage}
          loadingText='Loading dependents...'
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loaderRef={loaderRef}
        />
      </div>

      {isOpen && (
        <AddClientDependentForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mode={mode}
          setMode={setMode}
          patient_id={client_id}
          selectedDependentId={selectedDependentId}
          setSelectedDependentId={setSelectedDependentId}
        />
      )}
    </>
  );
};
