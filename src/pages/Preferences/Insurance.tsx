import { useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetClientInsurances, type InsuranceData } from '@/api/insurance';
import { InsuranceList } from '@/features/insurance/components/InsuranceList';
import AddInsuranceModal from '@/pages/Preferences/components/AddInsuranceModal';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Skeleton from '@/stories/Common/Skeleton';

const Insurance = () => {
  const { client_id } = useSelector(currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceData | null>(null);

  const { data: insurancesData, isLoading } = useGetClientInsurances(client_id);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInsurance(null);
  };

  const handleAddInsurance = () => {
    setEditingInsurance(null);
    setIsModalOpen(true);
  };

  const handleEditInsurance = (insurance: InsuranceData) => {
    setEditingInsurance(insurance);
    setIsModalOpen(true);
  };

  return (
    <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
      <div className='flex flex-col gap-5 overflow-hidden h-[calc(100dvh-227px)]'>
        <div className='flex items-center flex-wrap'>
          <h3 className='text-lg font-bold text-blackdark leading-6'>My Insurance</h3>
          <Button
            variant='filled'
            id='tour-addInsurance-btn'
            title='Add Insurance'
            icon={<Icon name='plus' />}
            isIconFirst
            onClick={handleAddInsurance}
            className='rounded-10px'
            parentClassName='ml-auto'
          />
        </div>

        {isLoading ? (
          <Skeleton count={2} className='h-34 w-full' parentClassName='flex gap-5' />
        ) : (
          <div className='flex-1 overflow-y-auto pr-1'>
            <InsuranceList
              insurancesData={insurancesData || []}
              clientId={client_id as string}
              onEdit={handleEditInsurance}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddInsuranceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          clientId={client_id || ''}
          insuranceData={editingInsurance}
        />
      )}
    </div>
  );
};

export default Insurance;
