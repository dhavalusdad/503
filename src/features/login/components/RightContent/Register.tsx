import { yupResolver } from '@hookform/resolvers/yup/src/yup.js';
import { useGoogleLogin } from '@react-oauth/google';
import clsx from 'clsx';
import moment from 'moment';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useGoogleAuthRegister, useRegister } from '@/api/auth';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import type { RegistrationFormInterface } from '@/features/login/types';
import { registrationSchema } from '@/features/login/validationSchema';
import type { RegisterCredentials } from '@/features/therapist/types';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';
import PasswordChecker from '@/stories/Common/PasswordChecker';
import PasswordField from '@/stories/Common/PasswordField';

const Register = () => {
  const navigate = useNavigate();
  const { mutateAsync: registerMutation, isPending: isLoading } = useRegister({ showToast: false });
  const { mutateAsync: googleAuthRegister } = useGoogleAuthRegister();
  const {
    register: formRegister,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<RegistrationFormInterface>({
    mode: 'onSubmit',
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dob: undefined,
      createPassword: '',
      confirmPassword: '',
      remember: false,
    },
  });

  const createPassword = getValues('createPassword');

  const registerUser = async (credentials: RegisterCredentials): Promise<void> => {
    const response = await registerMutation(credentials);
    const { data } = response;
    navigate(ROUTES.VERIFICATION.path, {
      state: {
        email: credentials.email?.toLocaleLowerCase(),
        token: data.token,
        key: 'REGISTER',
      },
    });
  };

  const handleFormSubmit: SubmitHandler<RegistrationFormInterface> = async data => {
    await registerUser({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email?.toLocaleLowerCase(),
      password: data.createPassword,
      dob: data.dob,
      role: UserRole.CLIENT,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const handleGoogleRegister = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async tokenResponse => {
      try {
        const { success, data } = await googleAuthRegister({
          idToken: tokenResponse.code,
          role: UserRole.CLIENT,
        });
        if (success && data) {
          showToast('User registered successfully!');
          navigate(ROUTES.LOGIN.path);
        }
      } catch (error) {
        console.error(error);
      }
    },
    onError: error => {
      console.error('Google Register Failed:', error);
    },
  });
  const handleForgotPassword = (): void => {
    navigate(ROUTES.FORGOT.path);
  };

  const handleSignInClick = (): void => {
    navigate(ROUTES.LOGIN.path);
  };

  return (
    <>
      <form
        className='flex flex-col gap-30px items-center xl:items-start'
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <Icon name='logo-secondary' />

        <div className='flex flex-col gap-2.5'>
          <h4 className='text-2xl font-bold text-blackdark'>Get Started Now</h4>
          <p className='text-base font-normal text-primarygray'>Let's create your account</p>
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <div className='flex items-start gap-4'>
            <InputField
              name='firstName'
              register={formRegister}
              type='text'
              label='First Name'
              icon='user'
              iconFirst
              inputClass='!border-primarylight'
              placeholder='First Name'
              parentClassName='w-2/4'
              error={errors.firstName?.message}
            />
            <InputField
              name='lastName'
              register={formRegister}
              type='text'
              label='Last Name'
              icon='user'
              iconFirst
              inputClass='!border-primarylight'
              placeholder='Last Name'
              parentClassName='w-2/4'
              error={errors.lastName?.message}
            />
          </div>

          <InputField
            name='email'
            register={formRegister}
            type='email'
            label='Email'
            icon='mail'
            iconFirst
            inputClass='!border-primarylight'
            placeholder='Enter your email'
            error={errors.email?.message}
          />
          <CustomDatePicker
            label='Date of Birth'
            labelClass='!text-sm'
            placeholderText='Select Date Of Birth'
            parentClassName='add-patient-datepicker '
            className='!border-primarylight  placeholder:!text-[14px]'
            error={errors.dob?.message}
            selected={
              getValues('dob') && moment(getValues('dob')).isValid()
                ? moment(getValues('dob')).toDate()
                : ''
            }
            onChange={date =>
              setValue('dob', date ? moment(date).format('YYYY-MM-DD') : '', {
                shouldValidate: true,
              })
            }
            maxDate={new Date()}
          />

          <PasswordField
            name='createPassword'
            register={formRegister}
            label='Create Password'
            placeholder='Create Password'
            icon='lock'
            iconFirst
            error={isSubmitted && createPassword.length < 1 ? 'Password is required' : ''}
          />

          <PasswordField
            name='confirmPassword'
            register={formRegister}
            label='Confirm Password'
            placeholder='Confirm Password'
            icon='lock'
            iconFirst
            error={errors.confirmPassword?.message}
          />

          <div className='flex items-center justify-end'>
            {/* <CheckboxField
              name='remember'
              onChange={remember => setValue('remember', !remember)}
              isDefaultChecked={remember}
              id='remember'
              label='Remember Me'
              labelClass='whitespace-nowrap'
            /> */}
            <Button
              type='button'
              variant='none'
              title='Forgot Password?'
              className='font-bold text-primary !p-0'
              onClick={handleForgotPassword}
            />
          </div>
          {createPassword.length > 0 && (
            <div className={clsx('transition-all ease-in-out duration-100 overflow-hidden')}>
              <PasswordChecker password={createPassword} />
            </div>
          )}
        </div>

        <div className='flex flex-col gap-4 w-full'>
          <Button
            type='submit'
            variant='filled'
            title={isLoading ? 'Signing Up...' : 'Sign Up'}
            isLoading={isLoading}
            isDisabled={isLoading}
            className='w-full rounded-10px !font-bold !leading-5'
          />

          <div className='relative'>
            <div className='h-1px bg-primarylight w-full my-2.5' />
            <div className='absolute left-2/4 -translate-x-2/4 bg-white rounded-full px-3.5 -top-0.5'>
              <span className='text-xl leading-4'>or</span>
            </div>
          </div>

          <Button
            variant='outline'
            type='button'
            title='Sign up with Google'
            className='w-full rounded-10px !font-semibold !border-primarylight'
            onClick={() => handleGoogleRegister()}
            icon={<Icon name='google' />}
            isIconFirst
          />
        </div>
      </form>

      <p className='text-center mt-6 text-blackdark text-sm font-normal'>
        Already have an Account?{' '}
        <span
          className='font-bold cursor-pointer hover:underline'
          onClick={handleSignInClick}
          role='button'
          tabIndex={0}
        >
          Sign In
        </span>
      </p>
    </>
  );
};

export default Register;
