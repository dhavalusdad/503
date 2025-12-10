import { yupResolver } from '@hookform/resolvers/yup';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useTherapistRegister, useValidateToken } from '@/api/auth';
import { ROUTES } from '@/constants/routePath';
import type { TherapistRegistrationFormInterface } from '@/features/login';
import type { TherapistRegisterCredentials } from '@/features/therapist/types';
import { registrationSchema } from '@/features/therapist/validationSchema';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import PasswordChecker from '@/stories/Common/PasswordChecker';
import PasswordField from '@/stories/Common/PasswordField';

const TherapistRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get('token');

  const { mutateAsync: registerMutation, isPending: isRegisterLoading } = useTherapistRegister();
  const { data: tokenValidationData, isFetching: isTokenValidating } = useValidateToken({
    token: tokenFromUrl,
    type: 'therapist_register',
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

  const registerUser = async (credentials: TherapistRegisterCredentials): Promise<void> => {
    const response = await registerMutation(credentials);
    const { data } = response;

    if (data) {
      navigate(ROUTES.THERAPIST_LOGIN.path);
    }
  };

  const handleFormSubmit: SubmitHandler<TherapistRegistrationFormInterface> = async data => {
    const credentials: TherapistRegisterCredentials = {
      token: tokenFromUrl,
      new_password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    return await registerUser(credentials);
  };

  const isFormValid = () => {
    const { password, confirmPassword, acceptTerms } = watch();
    return password && confirmPassword && acceptTerms;
  };

  return (
    <>
      {isTokenValidating ? (
        <Spinner />
      ) : tokenValidationData ? (
        <>
          {!tokenValidationData.isValid ? (
            <>
              <div className='flex flex-col items-center xl:items-start gap-10'>
                <h4 className='text-xl sm:text-28px font-bold text-blackdark text-center xl:text-left'>
                  This link has already been used. Please log in with your account credentials.
                </h4>
                <Button
                  variant='filled'
                  type='button'
                  onClick={() => navigate(ROUTES.THERAPIST_LOGIN.path)}
                  title='Go to login page'
                  parentClassName='w-full'
                  className='w-full rounded-10px !font-bold !leading-5'
                />
              </div>
            </>
          ) : (
            <form
              className='flex flex-col gap-25px w-full items-center xl:items-start'
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <Icon name='logo-secondary' />
              <div className='flex flex-col gap-2.5 items-center xl:items-start'>
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
                  isLoading={isRegisterLoading}
                  isDisabled={!isFormValid()}
                  title={'Register'}
                  className='w-full rounded-10px !font-bold !leading-5'
                />
              </div>
            </form>
          )}
        </>
      ) : (
        <div className='flex flex-col items-center xl:items-start gap-10'>
          <h4 className='text-xl sm:text-28px font-bold text-blackdark'>
            Oops! Something Went Wrong!
          </h4>
          <Button
            variant='filled'
            type='button'
            onClick={() => navigate(ROUTES.THERAPIST_LOGIN.path)}
            title='Go to login page'
            parentClassName='w-full'
            className='w-full rounded-10px !font-bold !leading-5'
          />
        </div>
      )}
    </>
  );
};

export default TherapistRegister;
