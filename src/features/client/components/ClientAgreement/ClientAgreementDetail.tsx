import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAgreementById } from '@/api/agreement';
import { useUpdateUserAgreement } from '@/api/user';
import ClientAgreementRenderer from '@/features/client/components/ClientAgreement/ClientAgreementRenderer';
import { currentUser } from '@/redux/ducks/user';

const ClientAgreementDetail = () => {
  const { agreementId } = useParams<{ agreementId: string }>();
  const { agreements } = useSelector(currentUser);

  const { data: agreement, isLoading } = useGetAgreementById(agreementId!);
  const { mutateAsync: updateUserAgreement, isPending: isUpdateUserApiPending } =
    useUpdateUserAgreement();

  const handleAgreed = async () => {
    if (!agreement) return;
    await updateUserAgreement({ id: agreement.id });
  };

  return (
    <ClientAgreementRenderer
      title={agreement?.title || ''}
      description={agreement?.description || ''}
      onAgree={handleAgreed}
      isAgreed={agreements?.includes(agreement?.id || '') || false}
      isLoading={isLoading || isUpdateUserApiPending}
    />
  );
};

export default ClientAgreementDetail;
