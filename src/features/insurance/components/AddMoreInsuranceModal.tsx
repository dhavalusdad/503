import { useState } from 'react';

import { useAddInsurancesToAppointment, useGetInsurancesNotInAppointment } from '@/api/insurance';
import AddInsuranceModal from '@/pages/Preferences/components/AddInsuranceModal';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Skeleton from '@/stories/Common/Skeleton';

import { InsuranceList } from './InsuranceList';

export const AddMoreInsuranceModal = ({
  isOpen,
  onClose,
  appointmentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
}) => {
  const {
    data: { insurances: insurancesData = [], clientId } = { insurances: [], clientId: '' },
    isLoading,
  } = useGetInsurancesNotInAppointment(appointmentId);
  const { mutateAsync: addInsurances, isPending } = useAddInsurancesToAppointment(appointmentId);
  const [selectedInsuranceIds, setSelectedInsuranceIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyInsurance = async () => {
    try {
      await addInsurances({ insurance_ids: selectedInsuranceIds });
      onClose();
    } catch (error) {
      console.error('Failed to add insurances:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Apply Insurance'
      size='lg'
      closeButton={false}
      contentClassName='pt-30px'
      footerClassName='flex items-center justify-end gap-5 pt-30px border-t border-solid border-surface'
      footer={
        <>
          <Button
            variant='outline'
            title='Cancel'
            onClick={() => {
              onClose();
            }}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            variant='filled'
            title='Apply Insurance'
            onClick={handleApplyInsurance}
            isLoading={isPending}
            isDisabled={selectedInsuranceIds.length === 0}
            className='rounded-10px !leading-5 !px-6'
          />
        </>
      }
    >
      <div className='flex flex-col gap-5'>
        {isLoading ? (
          <Skeleton count={2} className='h-56 w-full' parentClassName='flex gap-5' />
        ) : (
          <>
            <Button
              variant='filled'
              title='Add Insurance'
              icon={<Icon name='plus' />}
              isIconFirst
              onClick={() => setIsModalOpen(true)}
              className='rounded-10px'
              parentClassName='ml-auto'
            />
            <InsuranceList
              insurancesData={insurancesData}
              isEditable={true}
              onSelectionChange={setSelectedInsuranceIds}
              parentClassName='!grid-cols-1'
              isSwitchVisible={false}
            />
          </>
        )}
      </div>

      {isModalOpen && (
        <AddInsuranceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clientId={clientId}
          appointmentId={appointmentId}
        />
      )}
    </Modal>
  );
};
