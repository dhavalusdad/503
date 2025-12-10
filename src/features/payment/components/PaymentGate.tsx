import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetUserPaymentProfileStatus } from '@/api/payment';
import { UserRole } from '@/api/types/user.dto';
import { currentUser } from '@/redux/ducks/user';

import { PaymentSetupModal } from './PaymentSetupModal';

const PaymentGate = ({
  setModalOpen,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<'payment' | 'insurance' | ''>>;
}) => {
  const { role, client_id } = useSelector(currentUser);
  const isClient = role === UserRole.CLIENT;

  const {
    data: paymentProfileStatus,
    isLoading,
    dataUpdatedAt,
  } = useGetUserPaymentProfileStatus(isClient);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && paymentProfileStatus && !paymentProfileStatus.has_payment_method) {
      setIsModalOpen(true);
    }
  }, [isLoading, dataUpdatedAt]);

  const handlePaymentAdded = () => {
    setIsModalOpen(false);
    setModalOpen('insurance');
  };

  // Show modal whenever explicitly opened. The modal handles its own close logic.
  if (isModalOpen && paymentProfileStatus) {
    return (
      <PaymentSetupModal
        isOpen={true}
        onClose={handlePaymentAdded}
        clientId={client_id || ''}
        // closeButton={false}
      />
    );
  }

  return null;
};

export default PaymentGate;
