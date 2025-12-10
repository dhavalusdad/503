import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useLogin, useSetPassword, useValidateToken } from '@/api/auth';
import { TokenValidationType, UserRole } from '@/api/types/user.dto';
import { tokenStorage } from '@/api/utils/tokenStorage';
import { ROUTES } from '@/constants/routePath';
import { LoginRequestEnum } from '@/enums';
import type {
  LoginCredentials,
  ResetPasswordCredentials,
  TherapistRegistrationFormInterface,
} from '@/features/login';
import { registrationSchema } from '@/features/therapist/validationSchema';
import { getDashboardPath } from '@/helper';
import { useSocketEmit } from '@/hooks/socket';
import { setUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import PasswordChecker from '@/stories/Common/PasswordChecker';
import PasswordField from '@/stories/Common/PasswordField';

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const emit = useSocketEmit();

  const tokenFromUrl = searchParams.get('token');

  const { mutateAsync: setPasswordMutation, isPending: isLoading } = useSetPassword();
  const { mutateAsync: loginMutation } = useLogin();

  const currentRole = location.pathname.includes('admin')
    ? UserRole.ADMIN
    : location.pathname.includes('therapist')
      ? UserRole.THERAPIST
      : location.pathname.includes(ROUTES.SET_STAFF_PASSWORD.path)
        ? UserRole.BACKOFFICE
        : location.pathname.includes(ROUTES.SET_PASSWORD.path)
          ? UserRole.CLIENT
          : null;
  const validationtokentype = location.pathname.includes(ROUTES.SET_STAFF_PASSWORD.path)
    ? TokenValidationType.BO
    : location.pathname.includes(ROUTES.SET_PASSWORD.path)
      ? TokenValidationType.CT
      : '';
  const { data: tokenValidationData, isFetching: isTokenValidating } = useValidateToken({
    token: tokenFromUrl,
    type: validationtokentype,
  });

  const {
    register,
    watch,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<TherapistRegistrationFormInterface>({
    mode: 'onSubmit',
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password') || '';

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginMutation(credentials);
    const { data } = response;

    const { token, email_verified } = data;

    if (email_verified && token) {
      const tokens = { accessToken: token };
      tokenStorage.setTokens(tokens);
      emit('socket:connect_user', token);
      dispatch(setUser({ ...data, accessToken: token }));
      const dashboardPath = getDashboardPath(currentRole as UserRole);

      navigate(dashboardPath);
    } else if (!email_verified && token) {
      navigate(ROUTES.VERIFICATION.path, {
        state: {
          email: credentials.email,
          token: token,
          key: 'REGISTER',
        },
      });
    }
  };

  const handleNavigationToPasswordChangedPage = async (email: string, source: string) => {
    await login({
      email: email?.toLocaleLowerCase(),
      password: getValues('password'),
      role: currentRole,
      ...(source === 'email' ? { type: LoginRequestEnum.INVITE } : {}),
    });
  };

  const setPassword = async (credentials: ResetPasswordCredentials): Promise<void> => {
    const response = await setPasswordMutation(credentials);
    handleNavigationToPasswordChangedPage(response.data.email, response.data.source);
  };

  const handleFormSubmit: SubmitHandler<TherapistRegistrationFormInterface> = async data => {
    const credentials: ResetPasswordCredentials = {
      token: tokenFromUrl || '',
      newPassword: data.password,
      role: currentRole || '',
    };

    return await setPassword(credentials);
  };

  const isFormValid = () => {
    const { password, confirmPassword, acceptTerms } = watch();
    return password && confirmPassword && acceptTerms;
  };

  const userLoginRouteBasedOnRole = {
    [UserRole.ADMIN]: ROUTES.ADMIN_LOGIN.path,
    [UserRole.THERAPIST]: ROUTES.THERAPIST_LOGIN.path,
    [UserRole.CLIENT]: ROUTES.LOGIN.path,
    [UserRole.BACKOFFICE]: ROUTES.ADMIN_LOGIN.path,
  }[currentRole || UserRole.CLIENT];

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
                  'flex flex-col gap-10',
                  currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
                )}
              >
                <h4
                  className={clsx(
                    'text-xl sm:text-28px font-bold text-blackdark',
                    currentRole == UserRole.ADMIN ? 'text-center' : 'text-center xl:text-left'
                  )}
                >
                  This link has already been used. Please log in with your account credentials.
                </h4>
                <Button
                  variant='filled'
                  type='button'
                  onClick={() => navigate(userLoginRouteBasedOnRole)}
                  title='Go to login page'
                  parentClassName='w-full'
                  className='w-full rounded-10px !font-bold !leading-5'
                />
              </div>
            </>
          ) : (
            <form
              className={clsx(
                'flex flex-col gap-25px w-full',
                currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
              )}
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <Icon name='logo-secondary' />
              <div
                className={clsx(
                  'flex flex-col gap-2.5',
                  currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
                )}
              >
                <h4 className='text-2xl font-bold text-blackdark'>Set Password</h4>
                <p className='text-base font-normal text-primarygray'>
                  Enter and confirm your password below.
                </p>
              </div>
              <div className='flex flex-col gap-5 w-full'>
                <PasswordField
                  name='password'
                  register={register}
                  label='Create Password'
                  placeholder='Create Password'
                  icon='lock'
                  iconFirst
                  error={password?.length < 1 && isSubmitted ? 'password is required' : ''}
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
                <div className='flex items-center justify-between'>
                  <CheckboxField
                    id='acceptTerms'
                    name='acceptTerms'
                    isDefaultChecked={getValues('acceptTerms')}
                    register={register}
                    label={
                      <p>
                        Accept our{' '}
                        <span className='font-bold text-primary underline'>Privacy Policy</span> and{' '}
                        <span className='font-bold text-primary underline'>Terms & Conditions</span>
                      </p>
                    }
                    labelClass='whitespace-nowrap text-black !text-xs sm:text-sm'
                    error={errors.acceptTerms?.message}
                  />
                </div>
                {password.length > 0 && (
                  <div className={'transition-all ease-in-out duration-100 overflow-hidden'}>
                    <PasswordChecker password={password} />
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-4 w-full'>
                <Button
                  variant='filled'
                  type='submit'
                  onClick={handleSubmit(handleFormSubmit)}
                  isLoading={isLoading}
                  isDisabled={!isFormValid()}
                  title={'Submit'}
                  className='w-full rounded-10px !font-bold !leading-5'
                />
              </div>
            </form>
          )}
        </>
      ) : (
        <div
          className={clsx(
            'flex flex-col gap-10',
            currentRole == UserRole.ADMIN ? 'items-center' : 'items-center xl:items-start'
          )}
        >
          <h4 className='text-xl sm:text-28px font-bold text-blackdark text-center'>
            Oops! Something Went Wrong!
          </h4>
          <Button
            variant='filled'
            type='button'
            onClick={() => navigate(userLoginRouteBasedOnRole)}
            title='Go to login page'
            parentClassName='w-full'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        </div>
      )}
    </>
  );
};

export default SetPassword;
