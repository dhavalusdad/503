import { useState } from 'react';

import { useAmdAssignTable } from '@/features/admin/components/clientManagement/components/hooks/useAmdAssignTable';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Table from '@/stories/Common/Table';

import AddAmdFormsModal from './AddAmdForm';

const AmdForms = ({ clientId }: { clientId: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    columns,
    total,
    pageIndex,
    pageSize,
    onSortingChange,
    sorting,
    setSorting,
    setPageSize,
    setPageIndex,
    isLoading,
  } = useAmdAssignTable();

  return (
    <div className='flex flex-col gap-5'>
      <div className=' flex items-center flex-wrap gap-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto'>Clinical Notes</h5>
        <Button
          variant='filled'
          isIconFirst
          title='Add AMD Note'
          icon={<Icon name='plus' />}
          className='rounded-lg'
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      <Table
        data={data}
        columns={columns}
        className={'w-full'}
        totalCount={total ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        setSorting={setSorting}
        onSortingChange={onSortingChange}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />
      {/* update modal  */}
      {isModalOpen && (
        <AddAmdFormsModal
          clientId={clientId}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default AmdForms;
