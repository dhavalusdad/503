// import { useNavigate } from 'react-router-dom';

import FilterButton from '@/components/layout/Filter/FilterButton';
// import { ROUTES } from '@/constants/routePath';
import { useAssessmentFormList } from '@/features/client/components/AssessmentForm/hooks/useAssessmentFormList';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Table from '@/stories/Common/Table';

const AssessmentFormList = ({
  therapistPanel = false,
  selectedIds = [],
  setSelectedIds = () => {},
}) => {
  // const navigate = useNavigate();

  const {
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    columns,
    assessmentFormData,
    total,
    isAppointmentListLoading,
    isVisible,
    handleSearchChange,
    setIsVisible,
    filterFields,
    handleApplyFilter,
    filters,
    onClearFilter,
    isLoading,
  } = useAssessmentFormList(therapistPanel, selectedIds, setSelectedIds);

  return (
    <div className='p-5 bg-white rounded-20px border border-solid border-surface'>
      {/* Header */}
      <div className='flex flex-wrap gap-5 items-center mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark mr-auto order-1 lg:order-none'>
          Assessment Form
        </h2>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
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
            isLoading={isAppointmentListLoading}
            defaultValues={filters}
          />
        </div>
      </div>

      {/* Table */}
      {isAppointmentListLoading ? (
        <Spinner />
      ) : (
        <Table
          data={assessmentFormData || []}
          columns={columns}
          className={'w-full'}
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
    </div>
  );
};

export default AssessmentFormList;
