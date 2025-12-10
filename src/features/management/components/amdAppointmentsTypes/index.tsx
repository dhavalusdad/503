import { useSyncAmdAppointmentsTypes } from '@/api/advancedMd';
import { PermissionType } from '@/enums';
import {
  useAmdAppointmentsTypes,
  type AmdAppointmentsTypesType,
} from '@/features/management/components/amdAppointmentsTypes/hooks/useAmdAppointmentsTypes';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

export const AmdAppointmentsTypes = () => {
  const {
    data,
    columns,
    pageSize,
    onSortingChange,
    sorting,
    setSorting,
    setPageSize,
    searchQuery,
    handleSearchChange,
    pageIndex,
    setPageIndex,
    total,
    isLoading,
  } = useAmdAppointmentsTypes();

  const { hasPermission } = useRoleBasedRouting();

  const { mutate: syncAmdAppointmentsTypes, isPending: isSyncAmdAppointmentsTypesLoading } =
    useSyncAmdAppointmentsTypes();

  return (
    <div className='p-5 bg-white rounded-20px border border-solid border-surface'>
      <div className='flex flex-wrap gap-5 items-center mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark'>Appointments Types</h2>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          name='search'
          value={searchQuery}
          parentClassName='w-full sm:w-360px ml-auto'
        />
        {hasPermission(PermissionType.APPOINTMENT_TYPES_SYNC) && (
          <Button
            variant='filled'
            title='Sync'
            onClick={() => syncAmdAppointmentsTypes()}
            isLoading={isSyncAmdAppointmentsTypesLoading}
            className='min-h-50px rounded-10px !px-6'
          />
        )}
      </div>
      <Table
        data={data as AmdAppointmentsTypesType[]}
        columns={columns}
        className={'w-full'}
        totalCount={total ?? 0}
        pageIndex={+pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        setSorting={setSorting}
        onSortingChange={onSortingChange}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AmdAppointmentsTypes;
