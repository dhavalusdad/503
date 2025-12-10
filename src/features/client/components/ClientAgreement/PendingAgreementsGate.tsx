import { useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { useGetUserPendingAgreements } from '@/api/agreement';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import AgreementModal from '@/pages/Dashboard/AgreementModal';
import { currentUser } from '@/redux/ducks/user';

const PendingAgreementsGate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useSelector(currentUser);
  const isClient = role === UserRole.CLIENT;

  if (!isClient) return null;

  const { data: pendingAgreements = [], isLoading } = useGetUserPendingAgreements(true);
  const hasPending = !isLoading && pendingAgreements.length > 0;

  useEffect(() => {
    if (hasPending && location.pathname !== ROUTES.CLIENT_DASHBOARD.path) {
      navigate(ROUTES.CLIENT_DASHBOARD.path, { replace: true });
      window.location.reload();
    }
  }, [hasPending, location.pathname]);

  if (hasPending) {
    return <AgreementModal isOpen={true} pendingAgreements={pendingAgreements} />;
  }

  return null;
};

export default PendingAgreementsGate;
