import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useForgotPassword } from '@/api/auth';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import type { ForgotPasswordCredentials } from '@/features/login/types';
import { emailValidationSchema } from '@/features/login/validationSchema';
import { getLoginPagePath } from '@/helper';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';

interface ForgotPasswordFormData {
  email: string;
  role?: UserRole;
}

const ForgotPassword = ({ role = UserRole.CLIENT }: { role?: UserRole }) => {
  // ** Hooks **
  const navigate = useNavigate();

  // ** States **
  const [mailSent, setMailSent] = useState(false);

  // ** Services **
  const { mutateAsync: forgotPasswordMutation, isPending: isLoading } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(emailValidationSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const handleBackToLogin = (): void => {
    const loginPagePath = getLoginPagePath(role);
    navigate(loginPagePath);
  };

  const isProcessing = isLoading || isSubmitting;

  const sendForgotPasswordOtp = async (credentials: ForgotPasswordCredentials): Promise<void> => {
    const response = await forgotPasswordMutation(credentials);
    const { error } = response;

    if (!error) {
      setMailSent(true);
    }
  };

  const handleForgotPassword: SubmitHandler<ForgotPasswordFormData> = async data => {
    await sendForgotPasswordOtp({ email: data.email?.toLocaleLowerCase(), role });
  };

  return (
    <>
      {mailSent ? (
        <div
          className={clsx(
            'flex flex-col gap-5',
            role == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
          )}
        >
          <h4
            className={clsx(
              'text-xl sm:text-28px font-bold text-blackdark leading-7',
              role == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
            )}
          >
            Password Change Request Sent!
          </h4>
          <p
            className={clsx(
              'text-base sm:text-lg text-blackdark',
              role == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
            )}
          >
            Please check your email. Click the link in the email to reset your password.
          </p>
          <Button
            variant='filled'
            type='button'
            onClick={() =>
              navigate(
                role == UserRole.ADMIN
                  ? ROUTES.ADMIN_LOGIN.path
                  : role == UserRole.THERAPIST
                    ? ROUTES.THERAPIST_LOGIN.path
                    : ROUTES.LOGIN.path
              )
            }
            title='Go to login page'
            parentClassName='w-full'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        </div>
      ) : (
        <>
          <div
            className={clsx(
              'flex flex-col gap-30px',
              role == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
            )}
          >
            <Icon name='logo-secondary' />

            <div
              className={clsx(
                'flex flex-col gap-2.5',
                role == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
              )}
            >
              <h4 className='text-2xl font-bold text-blackdark'>Forgot Password</h4>
              <p
                className={clsx(
                  'text-base font-normal text-primarygray',
                  role == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
                )}
              >
                Enter your registered email. We'll send a One-Time Passcode (OTP) to verify.
              </p>
            </div>

            <form
              className='flex flex-col gap-4 w-full'
              onSubmit={handleSubmit(handleForgotPassword)}
            >
              <InputField
                name='email'
                register={register}
                type='email'
                label='Email'
                icon='email'
                iconFirst
                placeholder='Email'
                error={errors.email?.message}
                autoComplete='email'
                inputClass='!border-primarylight'
              />

              <Button
                type='submit'
                variant='filled'
                title={isProcessing ? 'Sending...' : 'Send Reset Link'}
                className='w-full rounded-10px !font-bold !leading-5'
                isDisabled={isProcessing}
                isLoading={isProcessing}
                onClick={handleSubmit(handleForgotPassword)}
              />
            </form>
          </div>

          <p className='text-center mt-6 text-blackdark text-sm font-normal'>
            Back to{' '}
            <span
              className='font-bold cursor-pointer hover:underline'
              onClick={handleBackToLogin}
              role='button'
              tabIndex={0}
            >
              Log In
            </span>
          </p>
        </>
      )}
    </>
  );
};

export default ForgotPassword;
