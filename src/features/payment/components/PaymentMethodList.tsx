import { useState } from 'react';

import { useDeletePaymentMethod, useUpdatePaymentMethod } from '@/api/payment';
import type { PaymentProfile, PaymentProfileDetails } from '@/api/types/payment.dto';
import { PermissionType } from '@/enums';
import { renderCardIcon } from '@/features/payment/utils/paymentHelpers';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Modal from '@/stories/Common/Modal';

interface PaymentMethodListProps {
  paymentProfiles?: PaymentProfile[] | null;
  onSelectedPayment?: (value: PaymentProfile['customerPaymentProfileId']) => void;
  selectedPayment?: PaymentProfile['customerPaymentProfileId'];
  isSelectable?: boolean;
  client_id: string;

  setAddPaymentProfileModal: (data: {
    isOpen: boolean;
    paymentProfile: PaymentProfileDetails | null;
    isEditMode: boolean;
  }) => void;
}

export const PaymentMethodList = ({
  paymentProfiles,
  onSelectedPayment,
  client_id,
  selectedPayment,
  isSelectable = false,

  setAddPaymentProfileModal,
}: PaymentMethodListProps) => {
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    profileId: string | null;
    cardInfo: { type: string; number: string } | null;
  }>({
    isOpen: false,
    profileId: null,
    cardInfo: null,
  });
  const [confirmModalSetAsDefault, setConfirmModalSetAsDefault] = useState<{
    isOpen: boolean;
    paymentProfileId: string | null;
  }>({
    isOpen: false,
    paymentProfileId: null,
  });

  const { hasPermission } = useRoleBasedRouting();

  const { mutateAsync: deletePaymentMethod, isPending } = useDeletePaymentMethod();

  const { mutateAsync: setAsDefault, isPending: isPendingSetAsDefault } = useUpdatePaymentMethod();

  const handleDeleteClick = (profile: PaymentProfile) => {
    setDeleteConfirmModal({
      isOpen: true,
      profileId: profile.customerPaymentProfileId,
      cardInfo: {
        type: profile.payment.creditCard.cardType,
        number: profile.payment.creditCard.cardNumber,
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmModal.profileId) {
      await deletePaymentMethod(
        {
          customerPaymentProfileId: deleteConfirmModal.profileId,
          client_id,
        },
        {
          onSuccess: () => {
            setDeleteConfirmModal({ isOpen: false, profileId: null, cardInfo: null });
          },
        }
      );
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, profileId: null, cardInfo: null });
  };

  const handleSetAsDefault = (profile: PaymentProfile) => {
    setConfirmModalSetAsDefault({
      isOpen: true,
      paymentProfileId: profile.customerPaymentProfileId,
    });
  };
  const handleEditPaymentProfile = (profile: PaymentProfileDetails) => {
    setAddPaymentProfileModal({ isOpen: true, paymentProfile: profile, isEditMode: true });
  };

  if (paymentProfiles?.length === 0) {
    return (
      <div className='text-center py-8 text-primarygray text-base font-bold'>
        No payment methods found
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-5'>
        {paymentProfiles?.map((profile: PaymentProfileDetails) => (
          <div
            onClick={
              isSelectable
                ? () => onSelectedPayment?.(profile?.customerPaymentProfileId)
                : () => null
            }
            key={profile.customerPaymentProfileId}
            className={`${selectedPayment == profile?.customerPaymentProfileId ? 'border-primary' : 'border-surface'} border flex flex-row justify-between border-solid  rounded-10px p-4 ${isSelectable ? 'cursor-pointer' : ''}`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-start gap-3'>
                <div className='relative'>
                  {renderCardIcon(profile.payment.creditCard.cardType)}
                </div>
                <div className='flex flex-col gap-1'>
                  <h6 className='text-sm font-bold leading-18px text-blackdark'>
                    {profile.payment.creditCard.cardType}
                    {''} ending in {''} {profile.payment.creditCard.cardNumber}
                  </h6>
                  <p className='text-sm font-semibold leading-18px text-primarygray'>
                    Expiry {''}
                    {profile.payment.creditCard.expirationDate}
                  </p>
                  <div className='flex items-center gap-2.5'>
                    {!profile.defaultPaymentProfile &&
                    hasPermission(PermissionType.PATIENT_EDIT) ? (
                      <>
                        <Button
                          variant='none'
                          title='Set as Default'
                          className='!p-0 !text-sm !text-blackdark !font-bold'
                          onClick={() => handleSetAsDefault(profile)}
                        />
                        <div className='w-1px h-4 bg-primarylight'></div>
                        <Button
                          variant='none'
                          title='Edit'
                          className='!p-0 !text-sm !text-primary !font-bold'
                          onClick={() => handleEditPaymentProfile(profile)}
                        />
                        <div className='w-1px h-4 bg-primarylight'></div>
                        <Button
                          variant='none'
                          title='Delete'
                          onClick={() => handleDeleteClick(profile)}
                          className='!p-0 !text-sm !text-red !font-bold'
                        />
                      </>
                    ) : (
                      <>
                        {profile.defaultPaymentProfile && (
                          <span className='bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold'>
                            Default
                          </span>
                        )}
                        {hasPermission(PermissionType.PATIENT_EDIT) && (
                          <>
                            <div className='w-1px h-4 bg-primarylight'></div>
                            <Button
                              variant='none'
                              title='Edit'
                              className='!p-0 !text-sm !text-primary !font-bold'
                              onClick={() => handleEditPaymentProfile(profile)}
                            />{' '}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isSelectable && (
              <CheckboxField
                parentClassName='flex items-start'
                id={profile.customerPaymentProfileId}
                isChecked={selectedPayment == profile?.customerPaymentProfileId}
              />
            )}
          </div>
        ))}
      </div>
      <DeleteModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleCancelDelete}
        onSubmit={handleConfirmDelete}
        isSubmitLoading={isPending}
        message='Are you sure you want to delete this payment method?'
        title='Delete Payment Method'
      />
      <Modal
        title='Set As Default'
        closeButton={false}
        size='xs'
        isOpen={confirmModalSetAsDefault.isOpen}
        onClose={() => setConfirmModalSetAsDefault({ isOpen: false, paymentProfileId: null })}
        contentClassName='pt-30px'
        footer={
          <div className='flex items-center justify-end gap-5'>
            {' '}
            <Button
              title='Cancel'
              onClick={() => setConfirmModalSetAsDefault({ isOpen: false, paymentProfileId: null })}
              variant='outline'
              className='!px-8 rounded-lg'
            />
            <Button
              title='Yes'
              onClick={async () => {
                await setAsDefault({
                  data: { defaultPaymentProfile: true, client_id: client_id || '' },
                  id: confirmModalSetAsDefault?.paymentProfileId,
                });
                setConfirmModalSetAsDefault({ isOpen: false, paymentProfileId: null });
              }}
              isLoading={isPendingSetAsDefault}
              variant='filled'
              className='!px-8 rounded-lg'
            />
          </div>
        }
      >
        <p>Are you sure you want to set this card as default ?</p>
      </Modal>
    </>
  );
};
