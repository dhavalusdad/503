import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { useGetClientInsurances, type InsuranceData } from '@/api/insurance';
import { PermissionType } from '@/enums';
import { InsuranceList } from '@/features/insurance/components/InsuranceList';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import AddInsuranceModal from '@/pages/Preferences/components/AddInsuranceModal';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Skeleton from '@/stories/Common/Skeleton';

export const AdminInsuranceList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceData | null>(null);
  const { hasPermission } = useRoleBasedRouting();

  const { id: client_id } = useParams<{ id: string }>();
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInsurance(null);
  };

  const handleEditInsurance = (insurance: InsuranceData) => {
    setEditingInsurance(insurance);
    setIsModalOpen(true);
  };

  const { data: insurancesData, isLoading } = useGetClientInsurances(client_id);

  return (
    <>
      <div className='flex items-center justify-between mb-5'>
        <h3 className='text-xl font-bold text-blackdark'>Insurance</h3>
        {(hasPermission(PermissionType.PATIENT_ADD) ||
          hasPermission(PermissionType.PATIENT_EDIT)) && (
          <Button
            variant='filled'
            title='Add Insurance'
            icon={<Icon name='plus' />}
            isIconFirst
            onClick={() => setIsModalOpen(true)}
            className='rounded-10px !px-6'
          />
        )}
      </div>
      {isLoading ? (
        <Skeleton count={2} className='h-34 w-full' parentClassName='flex gap-5' />
      ) : (
        <InsuranceList
          insurancesData={insurancesData || []}
          clientId={client_id as string}
          onEdit={handleEditInsurance}
        />
      )}{' '}
      {isModalOpen && client_id && (
        <AddInsuranceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          clientId={client_id as string}
          insuranceData={editingInsurance}
        />
      )}
    </>
  );
};
