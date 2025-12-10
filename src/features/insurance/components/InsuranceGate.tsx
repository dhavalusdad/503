import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetUserInsuranceStatus } from '@/api/insurance';
import { UserRole } from '@/api/types/user.dto';
import { currentUser } from '@/redux/ducks/user';

import { InsuranceSetupModal } from './InsuranceSetupModal';

const InsuranceGate = ({
  setModalOpen,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<'payment' | 'insurance' | ''>>;
}) => {
  const { role, client_id } = useSelector(currentUser);
  const isClient = role === UserRole.CLIENT;

  const { data: insuranceStatus, isLoading } = useGetUserInsuranceStatus(isClient);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && insuranceStatus && !insuranceStatus.has_insurance) {
      setIsModalOpen(true);
    }
  }, [isLoading, insuranceStatus]);

  const handleInsuranceAdded = () => {
    setIsModalOpen(false);
    setModalOpen('');
  };

  // Only show modal once triggered; keep it open even if status flips to true
  if (isModalOpen && insuranceStatus) {
    return (
      <InsuranceSetupModal
        isOpen={true}
        onClose={handleInsuranceAdded}
        clientId={client_id || ''}
      />
    );
  }

  return null;
};

export default InsuranceGate;
