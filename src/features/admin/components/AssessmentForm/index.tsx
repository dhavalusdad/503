// import { useNavigate } from 'react-router-dom';

import FilterButton from '@/components/layout/Filter/FilterButton';
// import { ROUTES } from '@/constants/routePath';
import { useAssessmentFormList } from '@/features/admin/components/AssessmentForm/hooks/useAssessmentFormList';
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
      <div className='flex flex-wrap gap-5 justify-between items-center mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark'>Assessment Form</h2>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          name='search'
          parentClassName='w-full sm:w-360px ml-auto'
        />
        <FilterButton
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          onClearFilter={onClearFilter}
          handleApplyFilter={handleApplyFilter}
          filterFields={filterFields}
          isLoading={isAppointmentListLoading}
          defaultValues={filters}
        />

        {/* <Button
            variant='filled'
            title='Add Form'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            onClick={() => {
              navigate(ROUTES.ADD_ASSESSMENT_FORM.path);
            }}
          /> */}
      </div>

      {/* Table */}
      {isAppointmentListLoading ? (
        <Spinner />
      ) : (
        <Table
          // id={'assessment-list'}
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
          skeletonCount={5}
        />
      )}
    </div>
  );
};

export default AssessmentFormList;
