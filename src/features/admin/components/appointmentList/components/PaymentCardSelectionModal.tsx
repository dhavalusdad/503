import { useEffect, useMemo, useState, type ReactElement } from 'react';

import clsx from 'clsx';
import { useSelector } from 'react-redux';

import type { AmdAppointmentClientPayment } from '@/api/advancedMd';
import { useChargeAppointment, useGetCustomerPaymentProfile } from '@/api/payment';
import type { CustomerPaymentProfileData, PaymentProfileDetails } from '@/api/types/payment.dto';
import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import type { AppointmentDataType } from '@/features/admin/components/appointmentList/types';
import { AddPaymentMethodModal } from '@/features/payment/components/AddPaymentMethodModal';
import { PaymentMethodList } from '@/features/payment/components/PaymentMethodList';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import RadioField from '@/stories/Common/RadioBox';
import Skeleton from '@/stories/Common/Skeleton';
import { StepCompletionRange } from '@/stories/Common/StepCompletionRange';

interface AddChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentData: AppointmentDataType;
  clientId?: string;
  amdPatientPaymentData?: AmdAppointmentClientPayment;
}

const PaymentCardSelectionModal = ({
  isOpen,
  onClose,
  clientId,
  appointmentData,
  amdPatientPaymentData,
}: AddChargeModalProps) => {
  const { data, isLoading } = useGetCustomerPaymentProfile({ clientId });
  const { role } = useSelector(currentUser);

  // const [openAddPaymentModal, setOpen] = useState(false);
  const [addPaymentProfileModal, setAddPaymentProfileModal] = useState<{
    isOpen: boolean;
    paymentProfile: PaymentProfileDetails | null;
    isEditMode: boolean;
  }>({
    isOpen: false,
    paymentProfile: null,
    isEditMode: false,
  });
  const { hasPermission } = useRoleBasedRouting();
  const { mutate: chargeAppointment, isPending: isLoadingCharge } = useChargeAppointment({
    close: onClose,
  });
  const [payment, setPayment] = useState({
    isPartialPayment: false,
    amount: 0,
    paymentProfileId: '',
  });
  const [stepValue, setStepValue] = useState(1);
  const customerData: CustomerPaymentProfileData | undefined = data;
  const paymentProfiles = customerData?.paymentProfiles || [];
  const onNext = () => {
    if (payment?.paymentProfileId) {
      setStepValue(stepValue + 1);
    }
  };
  const appointmentRemainingCharges =
    appointmentData?.amd_remaining_charge == null
      ? 0
      : Number(appointmentData?.amd_remaining_charge);
  const onCharge = () => {
    chargeAppointment({
      ...payment,
      amount: `${payment?.amount}`,
      appointmentId: appointmentData?.id,
      paymentProfileId: payment?.paymentProfileId || '',
    });
  };

  useEffect(() => {
    if (data) {
      data.paymentProfiles.map(d => {
        if (d.defaultPaymentProfile) {
          setPayment(prev => ({ ...prev, paymentProfileId: d.customerPaymentProfileId }));
        }
      });
    }
    if (amdPatientPaymentData) {
      const totalAmount = +amdPatientPaymentData?.amd_total_charge;
      const remainingBalance = appointmentRemainingCharges;
      if (Math.abs(totalAmount - remainingBalance) > 0) {
        setPayment(prev => ({ ...prev, isPartialPayment: true }));
      } else {
        setPayment(prev => ({
          ...prev,
          amount: Number(amdPatientPaymentData?.amd_patient_balance),
          isPartialPayment: false,
        }));
      }
    }
  }, [data, amdPatientPaymentData]);

  const renderStep = useMemo<Record<number, ReactElement>>(
    () => ({
      1: (
        <>
          {isLoading ? (
            <Skeleton count={2} className='h-26 w-full' parentClassName='flex flex-col gap-5' />
          ) : (
            <>
              {paymentProfiles?.length > 0 ? (
                <div className='flex flex-col gap-5'>
                  <PaymentMethodList
                    paymentProfiles={paymentProfiles}
                    isSelectable={true}
                    client_id={clientId || ''}
                    selectedPayment={payment?.paymentProfileId}
                    onSelectedPayment={d => setPayment(prev => ({ ...prev, paymentProfileId: d }))}
                    setAddPaymentProfileModal={(data: {
                      isOpen: boolean;
                      paymentProfile: PaymentProfileDetails | null;
                    }) => setAddPaymentProfileModal(data)}
                  />
                  {(role === UserRole.ADMIN ||
                    (role === UserRole.BACKOFFICE &&
                      (hasPermission(PermissionType.PATIENT_ADD) ||
                        hasPermission(PermissionType.PATIENT_EDIT)))) && (
                    <Button
                      variant='filled'
                      title='Add New Payment Method'
                      parentClassName='w-full'
                      className='rounded-10px w-full'
                      onClick={() =>
                        setAddPaymentProfileModal({
                          isOpen: true,
                          paymentProfile: null,
                          isEditMode: false,
                        })
                      }
                      icon={<Icon name='plus' />}
                      isIconFirst
                    />
                  )}
                </div>
              ) : (
                <>
                  <div className='text-center py-8 text-primarygray text-base font-bold flex flex-col gap-5'>
                    No payment methods found
                    {(role === UserRole.ADMIN ||
                      (role === UserRole.BACKOFFICE &&
                        (hasPermission(PermissionType.PATIENT_ADD) ||
                          hasPermission(PermissionType.PATIENT_EDIT)))) && (
                      <Button
                        variant='filled'
                        title='Add New Payment Method'
                        parentClassName='w-full'
                        className='rounded-10px w-full'
                        onClick={() =>
                          setAddPaymentProfileModal({
                            isOpen: true,
                            paymentProfile: null,
                            isEditMode: false,
                          })
                        }
                        icon={<Icon name='plus' />}
                        isIconFirst
                      />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      ),
      2: (
        <div className='flex flex-col gap-5'>
          {Math.abs(
            Number(amdPatientPaymentData?.amd_total_charge) - appointmentRemainingCharges
          ) == 0 && (
            <>
              <RadioField
                isChecked={!payment.isPartialPayment}
                id={`${payment.paymentProfileId} Full Payment` as string}
                label={'Full Payment'}
                name={payment.paymentProfileId}
                onChange={() => setPayment(prev => ({ ...prev, isPartialPayment: false }))}
              />
              {!payment.isPartialPayment && (
                <InputField
                  type='number'
                  placeholder=''
                  iconFirst
                  icon={'dollar'}
                  label='Total Amount'
                  inputParentClassName='w-full'
                  labelClass='!text-base'
                  inputClass='!text-base !leading-5'
                  iconClassName='text-primarygray'
                  onChange={e =>
                    setPayment(prev => ({
                      ...prev,
                      isPartialPayment: false,
                      amount: +e.target.value,
                    }))
                  }
                  name='search'
                  value={payment?.amount}
                  isDisabled={true}
                  parentClassName='w-full '
                />
              )}
            </>
          )}

          <RadioField
            isChecked={payment.isPartialPayment}
            id={`${payment.paymentProfileId}Part Payment` as string}
            label={'Part Payment'}
            name={payment.paymentProfileId}
            onChange={() => setPayment(prev => ({ ...prev, isPartialPayment: true }))}
          />
          {payment.isPartialPayment && (
            <div className='grid grid-cols-2 gap-5'>
              <InputField
                type='number'
                placeholder=''
                iconFirst
                icon='dollar'
                label='Enter Amount'
                labelClass='!text-base'
                inputClass='!text-base !leading-5'
                inputParentClassName='w-full '
                iconClassName='text-primarygray'
                onChange={e =>
                  setPayment(prev => ({
                    ...prev,
                    isPartialPayment: true,
                    amount:
                      +e.target.value <= Number(appointmentData?.amd_remaining_charge)
                        ? +e.target.value
                        : Number(appointmentData?.amd_remaining_charge),
                  }))
                }
                name='search'
                value={payment.amount}
                max={Number(appointmentData?.amd_remaining_charge)}
                parentClassName='w-full '
              />
              <InputField
                type='number'
                placeholder=''
                iconFirst
                icon={'dollar'}
                label='Remaining Amount'
                labelClass='!text-base'
                inputParentClassName='w-full  pointer-events-none'
                iconClassName='text-primarygray'
                inputClass='!text-base !leading-5'
                onChange={() => {}}
                name='search'
                value={appointmentRemainingCharges - payment?.amount}
                parentClassName='w-full '
              />
            </div>
          )}
        </div>
      ),
    }),
    [data, isLoading, stepValue, payment]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Add Charge to Appointment'
      size='xs'
      closeButton={true}
      contentClassName='pt-30px'
      footerClassName={clsx('flex items-center gap-5 justify-end')}
      footer={
        <>
          {stepValue > 1 && (
            <Button
              variant='outline'
              className='!px-6 rounded-10px min-h-50px'
              // isLoading={isPending}
              isDisabled={!payment.paymentProfileId}
              onClick={() => setStepValue(stepValue - 1)}
              title='Back'
            />
          )}
          <Button
            type='submit'
            variant='filled'
            className='!px-6 rounded-10px min-h-50px'
            isLoading={isLoadingCharge}
            isDisabled={
              stepValue < 2
                ? !payment.paymentProfileId
                : (payment.isPartialPayment && payment.amount == 0) ||
                  (!payment.isPartialPayment &&
                    payment.amount < Number(amdPatientPaymentData?.amd_patient_balance))
            }
            onClick={stepValue > 1 ? onCharge : onNext}
            title={stepValue > 1 ? 'Charge' : 'Next'}
          />
        </>
      }
    >
      {paymentProfiles?.length ? (
        <StepCompletionRange currentStep={stepValue} totalSteps={2} />
      ) : (
        <></>
      )}
      {renderStep?.[stepValue as number]}
      {addPaymentProfileModal.isOpen && (
        <AddPaymentMethodModal
          isOpen={addPaymentProfileModal.isOpen}
          onClose={() =>
            setAddPaymentProfileModal({ isOpen: false, paymentProfile: null, isEditMode: false })
          }
          isEditMode={addPaymentProfileModal.isEditMode}
          paymentProfileDetails={addPaymentProfileModal.paymentProfile}
          clientId={clientId}
          onSuccess={() =>
            setAddPaymentProfileModal({ isOpen: false, paymentProfile: null, isEditMode: false })
          }
        />
      )}
    </Modal>
  );
};

export default PaymentCardSelectionModal;
