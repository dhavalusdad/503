import { useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetCustomerPaymentProfile } from '@/api/payment';
import type { CustomerPaymentProfileData, PaymentProfileDetails } from '@/api/types/payment.dto';
import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import { AddPaymentMethodModal } from '@/features/payment/components/AddPaymentMethodModal';
import { PaymentMethodList } from '@/features/payment/components/PaymentMethodList';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import { Button } from '@/stories/Common/Button';
import { Icon } from '@/stories/Common/Icon';
import Skeleton from '@/stories/Common/Skeleton';

const PaymentMethod = ({ clientId }: { clientId: string }) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [addPaymentProfileModal, setAddPaymentProfileModal] = useState<{
    isOpen: boolean;
    paymentProfile: PaymentProfileDetails | null;
    isEditMode: boolean;
  }>({
    isOpen: false,
    paymentProfile: null,
    isEditMode: false,
  });
  const { client_id, role } = useSelector(currentUser);
  const { hasPermission } = useRoleBasedRouting();

  const { data, isLoading } = useGetCustomerPaymentProfile({ clientId: client_id || clientId });

  const customerData: CustomerPaymentProfileData | undefined = data;
  const paymentProfiles = customerData?.paymentProfiles || [];

  return (
    <div className='bg-white p-5 rounded-20px border border-solid border-surface'>
      <div className='mb-5 flex items-center justify-between'>
        <div className='flex flex-col gap-1.5'>
          <h2 className='text-lg font-bold text-blackdark leading-6'>Payment Methods</h2>
          <p className='text-blackdark text-base font-normal leading-5'>
            {role == UserRole.CLIENT ? 'Manage your payment methods' : `Manage payment methods`}
          </p>
        </div>
        {(role === UserRole.BACKOFFICE
          ? hasPermission(PermissionType.PATIENT_ADD) || hasPermission(PermissionType.PATIENT_EDIT)
          : true) && (
          <Button
            variant='filled'
            title='Add New Payment Method'
            onClick={() =>
              setAddPaymentProfileModal({ isOpen: true, paymentProfile: null, isEditMode: false })
            }
            icon={<Icon name='plus' className='w-5 h-5 icon-wrapper' />}
            isIconFirst
            className='rounded-10px'
          />
        )}
      </div>

      {isLoading ? (
        <Skeleton count={3} className='h-20 w-full' parentClassName='flex flex-col gap-5' />
      ) : (
        <PaymentMethodList
          paymentProfiles={paymentProfiles}
          client_id={client_id || clientId}
          setAddPaymentProfileModal={(data: {
            isOpen: boolean;
            paymentProfile: PaymentProfileDetails | null;
            isEditMode: boolean;
          }) => setAddPaymentProfileModal(data)}
        />
      )}

      {addPaymentProfileModal.isOpen && (
        <AddPaymentMethodModal
          isOpen={addPaymentProfileModal.isOpen}
          onClose={() =>
            setAddPaymentProfileModal({ isOpen: false, paymentProfile: null, isEditMode: false })
          }
          clientId={client_id || clientId}
          paymentProfileDetails={addPaymentProfileModal.paymentProfile}
          isEditMode={addPaymentProfileModal.isEditMode}
          onSuccess={() =>
            setAddPaymentProfileModal({ isOpen: false, paymentProfile: null, isEditMode: false })
          }
        />
      )}
    </div>
  );
};

export default PaymentMethod;
