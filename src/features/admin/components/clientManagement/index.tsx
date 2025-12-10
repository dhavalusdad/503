import { useNavigate } from 'react-router-dom';

import FilterButton from '@/components/layout/Filter/FilterButton';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import { useClientManagement } from '@/features/admin/components/clientManagement/hooks/useClientManagement';
import type {
  ClientManagementDataType,
  ClientManagementFilterDataType,
} from '@/features/admin/components/clientManagement/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import { Table } from '@/stories/Common/Table';

const ClientManagement = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();

  const {
    columns,
    clientManagementData,
    total,
    isClientManagementDataLoading,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    openModal,
    onUpdateStatus,
    onCloseModal,
    handleSearchChange,
    filters,
    filterFields,
    handleApplyFilter,
    onClearFilter,
    isVisible,
    setIsVisible,
    isUpdateStatusLoading,
    isLoading,
  } = useClientManagement();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Client Management</h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          onChange={handleSearchChange}
          iconClassName='text-primarygray'
          parentClassName='w-full sm:w-360px ml-auto'
        />
        <FilterButton<ClientManagementFilterDataType>
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          onClearFilter={onClearFilter}
          handleApplyFilter={handleApplyFilter}
          filterFields={filterFields}
          isLoading={isClientManagementDataLoading}
          defaultValues={filters}
        />
        {hasPermission(PermissionType.PATIENT_ADD) && (
          <Button
            variant='filled'
            title='Add Client'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            onClick={() => navigate(ROUTES.ADD_CLIENT.path)}
          />
        )}
      </div>

      {isClientManagementDataLoading ? (
        <Spinner />
      ) : (
        <Table<ClientManagementDataType>
          data={clientManagementData || []}
          columns={columns}
          className=''
          totalCount={total ?? 0}
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
      {openModal.updateStatus && (
        <AlertModal
          isOpen={openModal.updateStatus}
          onClose={() => onCloseModal('updateStatus')}
          onSubmit={onUpdateStatus}
          alertMessage='Are you sure you want to update the status?'
          title='Confirm Update'
          isSubmitLoading={isUpdateStatusLoading}
          closeButton={false}
          confirmButtonClassName='!bg-primary hover:!bg-primary/85 !border-primary hover:!border-primary/85'
        />
      )}
    </div>
  );
};

export default ClientManagement;
