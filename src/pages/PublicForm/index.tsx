import { useState } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useGetAssignedForm, useSubmitAssignedForm } from '@/api/assessment-forms';
import { ROUTES } from '@/constants/routePath';
import FormPreview from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import type { DynamicFormResponse } from '@/features/admin/components/DynamicFormBuilder/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const PublicForm = () => {
  const navigate = useNavigate();
  const { formAssignId = '' } = useParams<{ formAssignId: string }>();
  const [searchParams] = useSearchParams();
  const user = useSelector(currentUser);
  const tokenFromUrl = searchParams.get('token');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: formResponse, isLoading } = useGetAssignedForm({
    formAssignedId: formAssignId,
    token: tokenFromUrl,
  });
  const isDependent = Boolean(+(searchParams.get('is_dependent') || 0));

  const { mutateAsync: submitResponse } = useSubmitAssignedForm({
    token: tokenFromUrl,
    onSuccess: () => {
      // Show a success message like Google Forms after submission
      setSuccessMessage('Your response has been recorded successfully.');
    },
  });

  const handleFormSubmit = (args: DynamicFormResponse) => {
    submitResponse({ ...args, id: formAssignId });
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  if (formResponse?.isTokenInvalid) {
    return (
      <div className='flex flex-col items-center justify-center gap-10 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>
          This link has expired or is no longer valid.
        </h4>
        {!isDependent && <p>Please log in with your account credentials to access your forms.</p>}
        {!isDependent && (
          <Button
            variant='filled'
            type='button'
            onClick={() => navigate(ROUTES.LOGIN.path)}
            title='Go to login page'
            parentClassName='w-full max-w-xs'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        )}
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className='flex flex-col items-center justify-center gap-10 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>{successMessage}</h4>
        <p className='text-gray-600'>
          You’ve successfully submitted the form.{' '}
          {user?.id || !isDependent
            ? ''
            : `You can log in to your account to view more
          details.`}
        </p>
        {!isDependent && (
          <Button
            variant='filled'
            type='button'
            onClick={() => navigate(user?.id ? ROUTES.CLIENT_DASHBOARD.path : ROUTES.LOGIN.path)}
            title={user?.id ? 'Return to Dashboard' : 'Log in'}
            parentClassName='w-full max-w-xs'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        )}
      </div>
    );
  }

  if (formResponse?.isSubmitted) {
    return (
      <div className='flex flex-col items-center justify-center gap-10 h-screen px-4 text-center'>
        <h4 className='text-28px font-bold text-blackdark'>You’ve already submitted this form.</h4>
        <p className='text-gray-600'>
          Your response has been recorded.
          {user?.id || !isDependent
            ? 'You can access your dashboard to review or manage your submissions.'
            : `You can log in to your account to view or manage your
          submissions.`}
        </p>
        {!isDependent && (
          <Button
            variant='filled'
            type='button'
            onClick={() => navigate(user?.id ? ROUTES.CLIENT_DASHBOARD.path : ROUTES.LOGIN.path)}
            title={user?.id ? 'Go to Dashboard' : 'Log in'}
            parentClassName='w-full max-w-xs'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        )}
      </div>
    );
  }

  return (
    <div className='w-full px-5 lg:px-0 lg:max-w-4xl py-5 mx-auto'>
      <FormPreview
        formData={formResponse}
        formDataLoading={isLoading}
        handleOnSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PublicForm;
