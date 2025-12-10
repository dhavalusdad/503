import React from 'react';

import FilterButton from '@/components/layout/Filter/FilterButton';
import useClientList from '@/pages/Client/hooks';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import { Table } from '@/stories/Common/Table';

const ClientList: React.FC = () => {
  const {
    columns,
    data,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isTherapistClientListFetching,
    handleApplyFilter,
    isVisible,
    setIsVisible,
    filters,
    onClearFilter,
    filterFields,
    isLoading,
  } = useClientList();

  return (
    <div className='bg-white border border-solid border-surface rounded-20px p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg font-bold text-blackdark mr-auto order-1 lg:order-none'>
          My Clients
        </h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          value={searchQuery}
          name='search'
          parentClassName='w-full lg:w-76 xl:w-360px order-3 lg:order-none'
        />
        <div className='order-2 lg:order-none'>
          <FilterButton
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            onClearFilter={onClearFilter}
            handleApplyFilter={handleApplyFilter}
            filterFields={filterFields}
            isLoading={isTherapistClientListFetching}
            defaultValues={filters}
          />
        </div>
      </div>
      {isTherapistClientListFetching ? (
        <Spinner />
      ) : (
        <Table
          data={data}
          columns={columns}
          className={'w-full'}
          totalCount={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ClientList;
