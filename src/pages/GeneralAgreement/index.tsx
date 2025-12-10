import { useState } from 'react';

import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import { useGetAgreementByIdPublic } from '@/api/agreement';
import { useUpdateUserAgreementPublic } from '@/api/user';
import { ROUTES } from '@/constants/routePath';
import ClientAgreementRenderer from '@/features/client/components/ClientAgreement/ClientAgreementRenderer';
import Button from '@/stories/Common/Button';

const GeneralAgreement = () => {
  const { agreementId = '' } = useParams<{ agreementId: string }>();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: agreement, isLoading } = useGetAgreementByIdPublic(agreementId, tokenFromUrl);
  const { mutateAsync: updateUserAgreement, isPending: isUpdateUserApiPending } =
    useUpdateUserAgreementPublic({
      onSuccess: () => {
        setSuccessMessage('You have successfully signed this agreement.');
      },
    });

  const handleAgreed = async () => {
    if (!agreement) return;
    await updateUserAgreement({ id: agreement.id, token: tokenFromUrl });
  };

  if (agreement?.is_agreed) {
    return (
      <div className='flex flex-col items-center justify-center gap-6 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>
          You have already signed this agreement.
        </h4>
        <p className='text-gray-600'>
          Your agreement has been recorded. You can log in to your account to view or manage it.
        </p>
        <Button
          variant='filled'
          type='button'
          onClick={() => navigate(ROUTES.LOGIN.path)}
          title='Log in'
          parentClassName='w-full max-w-xs'
          className='w-full rounded-10px !font-bold !leading-5'
        />
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className='flex flex-col items-center justify-center gap-6 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>{successMessage}</h4>
        <p className='text-gray-600'>
          You can log in to your account to view or manage this agreement.
        </p>
        <Button
          variant='filled'
          type='button'
          onClick={() => navigate(ROUTES.LOGIN.path)}
          title='Log in'
          parentClassName='w-full max-w-xs'
          className='w-full rounded-10px !font-bold !leading-5'
        />
      </div>
    );
  }

  if (agreement?.isTokenInvalid) {
    return (
      <div className='flex flex-col items-center justify-center gap-10 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>
          This link has expired or is no longer valid.
        </h4>
        <p>Please log in with your account credentials to access your agreement.</p>
        <Button
          variant='filled'
          type='button'
          onClick={() => navigate(ROUTES.LOGIN.path)}
          title='Go to login page'
          parentClassName='w-full max-w-xs'
          className='w-full rounded-10px !font-bold !leading-5'
        />
      </div>
    );
  }

  return (
    <div className='flex justify-center py-10'>
      <div className='w-full max-w-4xl'>
        <ClientAgreementRenderer
          title={agreement?.title || ''}
          description={agreement?.description || ''}
          onAgree={handleAgreed}
          isAgreed={agreement?.is_agreed}
          isLoading={isLoading || isUpdateUserApiPending}
        />
      </div>
    </div>
  );
};

export default GeneralAgreement;
