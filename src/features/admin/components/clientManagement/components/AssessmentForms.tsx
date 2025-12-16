import { useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useSelector } from 'react-redux';

import { useAssignFormToClient, useGetClientsAssessmentForms } from '@/api/assessment-forms';
import CommonFilter, { type CommonFilterField } from '@/components/layout/Filter';
import { FIELD_TYPE, ASSESSMENT_FORM_STATUS_OPTIONS } from '@/constants/CommonConstant';
import { PermissionType } from '@/enums';
import AssignFormDetails from '@/features/admin/components/clientManagement/components/AssignFormDetails';
import appointmentHistory from '@/features/admin/components/clientManagement/hooks/useGetClientManagementColumns';
import type {
  AssessmentFormDataType,
  AssessmentFormFilterDataType,
} from '@/features/admin/components/clientManagement/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Spinner from '@/stories/Common/Spinner';
import { Table } from '@/stories/Common/Table';
import useTableWithFilters from '@/stories/Common/Table/hook/useTableWithFilters';

type Props = {
  clientId: string;
  isTherapistPanel?: boolean;
  userId?: string;
  therapistId?: string;
  clientData?: { first_name: string; last_name: string };
};

const AssessmentForms = ({
  clientId,
  isTherapistPanel = false,
  userId = '',
  therapistId = '',
  clientData,
}: Props) => {
  const {
    assessmentFormsColumnsForClient,
    setDeleteAssessmentFormsModal,
    deleteAssessmentFormsModal,
    handleDeleteForm,
    formId,
  } = appointmentHistory();
  const [assessmentModalOpen, setAssessmentModalOpen] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<{ value: string; label: string }[]>([]);
  const [appointmentIds, setAppointmentIds] = useState<string[]>([]);
  const [userDependentIds, setUserDependentIds] = useState<{ value: string; label: string }[]>({
    value: clientId,
    label: `${clientData?.first_name} ${clientData?.last_name} (Main Client)`,
  });

  const { mutateAsync: createAssignment } = useAssignFormToClient(clientId);
  const { timezone } = useSelector(currentUser);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const { hasPermission } = useRoleBasedRouting();

  const handleToggle = () => {
    setIsVisible(prev => !prev);
  };

  const handleAssignForms = () => {
    setAssessmentModalOpen(true);
  };

  const filterFields: CommonFilterField<AssessmentFormFilterDataType> = useMemo(() => {
    return [
      {
        type: FIELD_TYPE.SELECT,
        label: 'Status',
        name: 'status',
        options: ASSESSMENT_FORM_STATUS_OPTIONS,
        isMulti: true,
      },
    ];
  }, []);

  const { filterManager, tableManager, handleSearchChange } = useTableWithFilters<
    AssessmentFormDataType,
    object
  >({
    apiCall: useGetClientsAssessmentForms,
    initialQueryParams: {
      user_id: clientId, // required to fetch this user's data
      therapistId: therapistId,
    },
  });

  const { filters, handleApplyFilter, isVisible, setIsVisible, onClearFilter } = filterManager;

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = tableManager;

  const { data, isLoading } = apiData ?? {};
  const appointmentHistoryData = data?.data ?? [];
  const total = data?.total ?? 0;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count += filters.status.length;
    return count;
  }, [filters]);

  const handleSubmit = () => {
    const data = {
      assigned_to: [userDependentIds?.value],
      formData: selectedIds.map(id => {
        return {
          id: id.value,
          name: id.label,
        };
      }),
      appointmentData: appointmentIds,
      clientId: clientId,
    };
    setUserDependentIds({
      value: clientId,
      label: `${clientData?.first_name} ${clientData?.last_name} (Main Client)`,
    });
    createAssignment(data);
    setAssessmentModalOpen(false);
    setSelectedIds([]);
    setAppointmentIds([]);
  };

  return (
    <div className='flex flex-col gap-5  min-h-[380px]'>
      <div className='flex items-center flex-wrap gap-5 lg:gap-4 2xl:gap-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Assessment Forms
        </h5>
        {!isTherapistPanel && (
          <InputField
            type='search'
            placeholder='Search'
            value={searchQuery}
            iconFirst
            onChange={handleSearchChange}
            iconClassName='text-primarygray'
            icon='search'
            parentClassName={clsx(
              '',
              !isTherapistPanel
                ? 'w-full lg:w-72 xl:w-360px order-4 lg:order-none'
                : 'w-full lg:w-76 xl:w-360px'
            )}
          />
        )}
        <div className={clsx('relative order-3 lg:order-none')}>
          <Button
            buttonRef={filterButtonRef}
            variant='none'
            icon={<Icon name='dropdownArrow' />}
            className='rounded-lg border-primary border border-solid py-3.5 px-6 !leading-5'
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
            <CommonFilter<AssessmentFormFilterDataType>
              fields={filterFields}
              timezone={timezone}
              isLoading={isLoading}
              defaultValues={filters}
              onApply={handleApplyFilter}
              onClear={() => {
                setIsVisible(false);
                onClearFilter();
              }}
              onClose={() => setIsVisible(false)}
              buttonRef={filterButtonRef}
            />
          )}
        </div>
        {hasPermission(PermissionType.PATIENT_ASSIGN_FORM) && (
          <Button
            buttonRef={filterButtonRef}
            variant='filled'
            title='Add Assessment Form'
            isIconFirst
            icon={<Icon name='plus' />}
            className='rounded-lg'
            onClick={handleAssignForms}
            parentClassName='order-2 lg:order-none'
          />
        )}
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Spinner />
        </div>
      ) : (
        <Table<AssessmentFormDataType>
          data={appointmentHistoryData || []}
          columns={assessmentFormsColumnsForClient || []}
          className={'w-full min-h-[320px]'}
          parentClassName='min-h-[320px]'
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
      {/* updated modal  */}
      {assessmentModalOpen && (
        <Modal
          isOpen={assessmentModalOpen}
          id='assign-assessment-form-modal'
          size='xs'
          title='Assign Assessment Form'
          onClose={() => setAssessmentModalOpen(false)}
          closeButton={false}
          contentClassName='pt-30px !overflow-visible'
          footerClassName='flex items-center justify-end gap-5'
          footer={
            <>
              <Button
                variant='outline'
                title='Cancel'
                onClick={() => setAssessmentModalOpen(false)}
                className='rounded-10px !leading-5 !px-6'
              />
              <Button
                variant='filled'
                title='Assign'
                onClick={() => handleSubmit()}
                isDisabled={selectedIds.length == 0 || !userDependentIds?.value}
                className='rounded-10px !leading-5 !px-6'
              />
            </>
          }
        >
          <AssignFormDetails
            selectedIds={selectedIds}
            setUserDependentIds={setUserDependentIds}
            setSelectedIds={setSelectedIds}
            appointmentIds={appointmentIds}
            setAppointmentIds={setAppointmentIds}
            clientId={userId}
            clientData={clientData}
            userDependentIds={userDependentIds}
          />
        </Modal>
      )}
      {deleteAssessmentFormsModal && (
        <DeleteModal
          isOpen={deleteAssessmentFormsModal}
          onClose={() => setDeleteAssessmentFormsModal(false)}
          onSubmit={() => {
            handleDeleteForm(formId);
          }}
          isSubmitLoading={false}
          message={`Are you sure you want to delete this Assessment form ?`}
          cancelButton={true}
          confirmButtonText='Delete'
          size='xs'
          title='Delete Assessment forms'
        />
      )}
    </div>
  );
};

export default AssessmentForms;
