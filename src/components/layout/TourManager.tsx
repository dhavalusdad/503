import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetUserPendingAgreements } from '@/api/agreement';
import { useGetUserInsuranceStatus } from '@/api/insurance';
import { useGetCustomerPaymentProfile, useGetUserPaymentProfileStatus } from '@/api/payment';
import { UserRole } from '@/api/types/user.dto';
import { useCompleteTour } from '@/api/user';
import { TOURS_MAP, type TourKey, TOUR_KEYS } from '@/constants/onboardingTours';
import { dispatchSetTourActive } from '@/redux/dispatch/tourDispatchers';
import { currentUser } from '@/redux/ducks/user';
import Tour from '@/stories/Common/Tour';

const TourManager = () => {
  const user = useSelector(currentUser);
  const isClient = user.role === UserRole.CLIENT;

  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [activeTourKey, setActiveTourKey] = useState<TourKey | null>(null);

  // Fetch all gate statuses
  const { data: pendingAgreements = [], isLoading: isLoadingAgreements } =
    useGetUserPendingAgreements(isClient);
  const { data: paymentProfileStatus, isLoading: isLoadingPayment } =
    useGetUserPaymentProfileStatus(isClient);
  const { data: insuranceStatus, isLoading: isLoadingInsurance } =
    useGetUserInsuranceStatus(isClient);

  const { mutate: completeTour } = useCompleteTour();

  const { data: paymentProfileData } = useGetCustomerPaymentProfile({ clientId: user.client_id });

  // Check if any hardstop is active
  const hasActiveHardstop = () => {
    if (!isClient) return false;

    // Check if still loading
    if (isLoadingAgreements || isLoadingPayment || isLoadingInsurance) {
      return true; // Wait until all data is loaded
    }

    // Check PendingAgreementsGate
    if (pendingAgreements.length > 0) {
      return true;
    }

    // Check PaymentGate
    if (paymentProfileStatus && !paymentProfileStatus.has_payment_method) {
      return true;
    }

    // Check InsuranceGate
    if (insuranceStatus && !insuranceStatus.has_insurance) {
      return true;
    }

    return false;
  };

  const handleTourSkipAndFinish = async () => {
    if (!activeTourKey) return;
    setActiveTourKey(null);
    setIsTourOpen(false);
    dispatchSetTourActive(false);
    completeTour(activeTourKey);
  };

  // Start tour only if no hardstops are active
  useEffect(() => {
    if (user.pending_tours.length > 0 && !hasActiveHardstop()) {
      const first = user.pending_tours[0] as TourKey;
      setActiveTourKey(first);
      setIsTourOpen(true);
      dispatchSetTourActive(true);
    } else if (hasActiveHardstop() && isTourOpen) {
      // Close tour if a hardstop becomes active
      setIsTourOpen(false);
      dispatchSetTourActive(false);
      setActiveTourKey(null);
    }
  }, [
    user.pending_tours,
    pendingAgreements,
    paymentProfileStatus,
    insuranceStatus,
    isLoadingAgreements,
    isLoadingPayment,
    isLoadingInsurance,
  ]);

  const getFilteredSteps = () => {
    if (!activeTourKey) return [];

    let steps = TOURS_MAP[activeTourKey];

    // Only apply filters for client_onboard_tour
    if (activeTourKey === TOUR_KEYS.CLIENT_ONBOARD) {
      steps = steps.filter(step => {
        if (
          step.target === '#tour-pendingprofile-info' &&
          paymentProfileData?.paymentProfiles?.length !== 0
        ) {
          return false;
        }

        return true;
      });
    }

    return steps;
  };

  const steps = getFilteredSteps();

  if (!isTourOpen) return null;

  return (
    <Tour
      steps={steps}
      isOpen={isTourOpen}
      onClose={() => setIsTourOpen(false)}
      onFinish={handleTourSkipAndFinish}
      onSkip={handleTourSkipAndFinish}
      persistKey={activeTourKey as string}
    />
  );
};

export default TourManager;
