import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useResetPassword, useValidateToken } from '@/api/auth';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import type { ResetPasswordCredentials, ResetPasswordFormInterface } from '@/features/login/types';
import { validationSchema } from '@/features/login/validationSchema';
import { getForgotPasswordPagePath, getLoginPagePath, getPasswordChangedPagePath } from '@/helper';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import PasswordChecker from '@/stories/Common/PasswordChecker';
import PasswordField from '@/stories/Common/PasswordField';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { mutateAsync: resetPasswordMutation, isPending: isLoading } = useResetPassword();

  const tokenFromUrl = searchParams.get('token');
  const currentRole = location.pathname.includes('admin')
    ? UserRole.ADMIN
    : location.pathname.includes('therapist')
      ? UserRole.THERAPIST
      : location.pathname.includes(ROUTES.RESET_PASSWORD.path)
        ? UserRole.CLIENT
        : null;

  const { data: tokenValidationData, isFetching: isTokenValidating } = useValidateToken({
    token: tokenFromUrl,
    type: 'reset_password',
  });

  const {
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
    watch,
  } = useForm<ResetPasswordFormInterface>({
    mode: 'onSubmit',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const hasPassword = newPassword.length > 0;

  const handleNavigationToPasswordChangedPage = () => {
    const pwdChangedPath = getPasswordChangedPagePath(currentRole);
    navigate(pwdChangedPath);
  };

  const resetPassword = async (credentials: ResetPasswordCredentials): Promise<void> => {
    await resetPasswordMutation(credentials);
    handleNavigationToPasswordChangedPage();
  };

  const onSubmit: SubmitHandler<ResetPasswordFormInterface> = async data => {
    await resetPassword({
      newPassword: data.newPassword,
      token: tokenFromUrl as string,
    });
  };

  const getNewPasswordError = (): string => {
    if (newPassword.length < 1 && isSubmitted) {
      return 'New password is required';
    }
    return '';
  };

  // TODO - Handle for staff member
  const handleNavigation = () => {
    const forgotPwdPath = getForgotPasswordPagePath(currentRole);
    navigate(forgotPwdPath);
  };

  const handleNavigationToLoginPage = () => {
    const loginPath = getLoginPagePath(currentRole);
    navigate(loginPath);
  };

  return (
    <>
      {isTokenValidating ? (
        <Spinner />
      ) : tokenValidationData ? (
        <>
          {!tokenValidationData.isValid ? (
            <>
              <div
                className={clsx(
                  'flex flex-col gap-10 w-full ',
                  currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
                )}
              >
                <h4
                  className={clsx(
                    'text-xl sm:text-28px font-bold text-blackdark',
                    currentRole == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
                  )}
                >
                  This reset link is invalid or has expired. Please request a new one.
                </h4>
                <Button
                  variant='filled'
                  type='button'
                  onClick={handleNavigation}
                  title='Request a new link'
                  parentClassName='w-full'
                  className='w-full rounded-10px !font-bold !leading-5'
                />
              </div>
            </>
          ) : (
            <form
              className={clsx(
                'flex flex-col gap-30px ',
                currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
              )}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Icon name='logo-secondary' />

              <div
                className={clsx(
                  'flex flex-col gap-2.5 ',
                  currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
                )}
              >
                <h4 className='text-2xl font-bold text-blackdark'>Set New Password</h4>
                <p
                  className={clsx(
                    'text-base font-normal text-primarygray',
                    currentRole == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
                  )}
                >
                  Enter and confirm your new password below.
                </p>
              </div>

              <div className='flex flex-col gap-4 w-full'>
                <PasswordField
                  name='newPassword'
                  register={register}
                  label='New Password'
                  placeholder='New Password'
                  icon='lock'
                  iconFirst
                  error={getNewPasswordError()}
                />

                <PasswordField
                  name='confirmPassword'
                  register={register}
                  label='Confirm Password'
                  placeholder='Confirm Password'
                  icon='lock'
                  iconFirst
                  error={errors.confirmPassword?.message}
                />
                {hasPassword && (
                  <div className={'transition-all ease-in-out duration-100 overflow-hidden'}>
                    <PasswordChecker password={newPassword} />
                  </div>
                )}

                <Button
                  type='submit'
                  variant='filled'
                  title='Reset Password'
                  className='w-full rounded-10px !font-bold !leading-5'
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onClick={handleSubmit(onSubmit)}
                />
              </div>
            </form>
          )}
        </>
      ) : (
        <div
          className={clsx(
            'flex flex-col gap-10 w-full',
            currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
          )}
        >
          <h4
            className={clsx(
              'text-xl sm:text-28px font-bold text-blackdark',
              currentRole == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
            )}
          >
            Oops! Something Went Wrong!
          </h4>
          <Button
            variant='filled'
            type='button'
            onClick={handleNavigationToLoginPage}
            title='Go to login page'
            parentClassName='w-full'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        </div>
      )}
    </>
  );
};

export default ResetPassword;
