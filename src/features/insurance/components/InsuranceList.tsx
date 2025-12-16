import { useState } from 'react';

import clsx from 'clsx';

import { useUpdateInsurance, type InsuranceData } from '@/api/insurance';
import { PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import Switch from '@/stories/Common/Switch';

export const InsuranceList = ({
  insurancesData = [],
  isEditable = false,
  isSwitchVisible = true,
  onSelectionChange,
  parentClassName,
  clientId,
  onEdit,
}: {
  insurancesData: InsuranceData[];
  isEditable?: boolean;
  isSwitchVisible?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  parentClassName?: string;
  clientId?: string;
  onEdit?: (insurance: InsuranceData) => void;
}) => {
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingInsurance, setPendingInsurance] = useState<{
    id: string;
    newStatus: boolean;
  } | null>(null);
  const { mutateAsync: updateInsurances, isPending } = useUpdateInsurance(clientId);

  const { hasPermission } = useRoleBasedRouting();

  // is_active
  const handleCardClick = (insuranceId: string) => {
    if (!isEditable) return;

    const newSelected = selectedInsurances.includes(insuranceId)
      ? selectedInsurances.filter(id => id !== insuranceId)
      : [...selectedInsurances, insuranceId];

    setSelectedInsurances(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleSwitchChange = (newStatus: boolean, id: string) => {
    setPendingInsurance({ id, newStatus });
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingInsurance) return;

    try {
      await updateInsurances({
        data: {
          is_active: pendingInsurance.newStatus,
        },
        id: pendingInsurance.id,
      });
      // Only close modal on successful response
      setIsModalOpen(false);
      setPendingInsurance(null);
    } catch (error) {
      // Error is handled by the mutation's showToast option
      // Modal stays open on error so user can retry or cancel
      console.error('Failed to update insurance status:', error);
    }
  };

  const handleCancelStatusChange = () => {
    setIsModalOpen(false);
    setPendingInsurance(null);
  };

  const getModalContent = () => {
    if (!pendingInsurance) return { title: '', message: '' };

    const isActivating = pendingInsurance.newStatus;
    return {
      title: isActivating ? 'Confirm Activation' : 'Confirm Deactivation',
      message: isActivating
        ? 'Are you sure you want to make this insurance active? Once activated, this insurance will be used for all upcoming appointments you book.'
        : 'Are you sure you want to make this insurance inactive? Once inactive, this insurance will not be used for any appointments you book from now on.',
    };
  };

  const modalContent = getModalContent();

  return (
    <>
      {insurancesData && insurancesData?.length > 0 ? (
        <div
          className={clsx('grid gap-5 grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3', parentClassName)}
        >
          {insurancesData.map(insurance => {
            const isSelected = selectedInsurances.includes(insurance.id);
            return (
              <div
                key={insurance.id}
                className={clsx(
                  ' rounded-10px border border-solid p-4 xl:p-5 bg-Graylightdark transition-all duration-300 ease-in-out',
                  isEditable ? 'cursor-pointer' : '',
                  isSelected ? 'border-primary' : 'border-surface'
                )}
                onClick={() => handleCardClick(insurance.id)}
              >
                <div className='flex items-start gap-3 xl:gap-5 justify-between'>
                  <div className='flex items-start gap-3 flex-1 overflow-hidden'>
                    {isEditable && (
                      <CheckboxField
                        id=''
                        isChecked={isSelected}
                        onChange={() => {}}
                        className='mt-0.5'
                      />
                    )}
                    <div className='flex flex-col gap-1.5'>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-base font-bold text-blackdark leading-5 truncate flex-1'>
                          {insurance?.carrier?.carrier_name}
                        </h4>
                        {insurance.is_pverify_verified ? (
                          <span className='px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full'>
                            Verified
                          </span>
                        ) : (
                          <span className='px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full'>
                            Not Verified
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-primarygray leading-18px font-normal'>
                        Code: {insurance?.carrier?.carrier_code}
                      </p>
                    </div>
                  </div>

                  {hasPermission(PermissionType.PATIENT_EDIT) && (
                    <div className='flex items-center gap-3'>
                      {onEdit && (
                        <Button
                          variant='none'
                          onClick={() => onEdit(insurance)}
                          className='!p-0'
                          parentClassName='h-5'
                          icon={<Icon name='edit' />}
                        />
                      )}
                      {isSwitchVisible && (
                        <Switch
                          isChecked={insurance?.is_active}
                          onChange={e => handleSwitchChange(e.target.checked, insurance.id)}
                          isDisabled={isPending}
                        />
                      )}
                    </div>
                  )}
                  {/* {insurance.is_added_to_amd && (
                    <span className='px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 border border-solid border-green-300 rounded-full'>
                      Active
                    </span>
                  )} */}
                </div>
                <div className='flex flex-col gap-3.5 mt-3.5'>
                  <div className='flex items-center justify-between gap-5 pt-3.5 border-t border-solid border-surface'>
                    <p className='text-sm text-blackdark font-normal leading-18px'>Member ID</p>
                    <h6 className='text-sm text-blackdark font-bold leading-18px'>
                      {insurance.member_id}
                    </h6>
                  </div>
                  <div className='flex items-center justify-between gap-5 pt-3.5 border-t border-solid border-surface'>
                    <p className='text-sm text-blackdark font-normal leading-18px'>
                      Insurance Type
                    </p>
                    <h6 className='text-sm text-blackdark font-bold leading-18px capitalize'>
                      {insurance.insurance_type || '-'}
                    </h6>
                  </div>
                  <div className='flex items-center justify-between gap-5 pt-3.5 border-t border-solid border-surface'>
                    <p className='text-sm text-blackdark font-normal leading-18px'>Group ID</p>
                    <h6 className='text-sm text-blackdark font-bold leading-18px capitalize'>
                      {insurance.group_id || '-'}
                    </h6>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='bg-white rounded-10px border border-solid border-surface p-5 flex flex-col items-center justify-center gap-4'>
          <p className='text-lg text-blackdark font-semibold my-5'>No insurance To Show</p>
        </div>
      )}

      <AlertModal
        isOpen={isModalOpen}
        onClose={handleCancelStatusChange}
        title={modalContent.title}
        alertMessage={modalContent.message}
        onSubmit={handleConfirmStatusChange}
        isSubmitLoading={isPending}
        confirmButtonText='Confirm'
        cancelButton={true}
        size='lg'
        // confirmButtonClassName='!bg-primary !border-primary hover:!bg-primary/85 hover:!border-primary/85'
      />
    </>
  );
};
