import { yupResolver } from '@hookform/resolvers/yup/src/yup.js';
import { useGoogleLogin } from '@react-oauth/google';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGoogleAuthLogin, useLogin } from '@/api/auth';
import { UserRole } from '@/api/types/user.dto';
import { tokenStorage } from '@/api/utils/tokenStorage';
import { ROUTES } from '@/constants/routePath';
import type { LoginCredentials, SignInFormData, SignInProps } from '@/features/login/types';
import { signInSchema } from '@/features/login/validationSchema';
import { useSocketEmit } from '@/hooks/socket';
import { setUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';
import PasswordField from '@/stories/Common/PasswordField';

const Signin: React.FC<SignInProps> = () => {
  const dispatch = useDispatch();
  const emit = useSocketEmit();
  const navigate = useNavigate();
  const { mutateAsync: loginMutation, isPending: isLoading } = useLogin();
  const { mutateAsync: googleAuthLogin } = useGoogleAuthLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = getValues('rememberMe');

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginMutation(credentials);
    const { data } = response;

    const { email_verified, token, refreshToken } = data;

    if (email_verified) {
      const tokens = { accessToken: token };
      tokenStorage.setTokens(tokens);
      tokenStorage.setRefreshToken(refreshToken || '');
      emit('socket:connect_user', token);
      dispatch(setUser({ ...data, accessToken: token }));
      navigate(ROUTES.CLIENT_DASHBOARD.path);
    } else {
      navigate(ROUTES.VERIFICATION.path, {
        state: { email: credentials.email, token },
      });
    }
  };

  const handleFormSubmit: SubmitHandler<SignInFormData> = async data => {
    await login({
      email: data.email?.toLocaleLowerCase(),
      password: data.password,
      role: UserRole.CLIENT,
      is_remember_me: rememberMe,
    });
  };

  const handleForgotPassword = (): void => {
    navigate(ROUTES.FORGOT.path);
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async tokenResponse => {
      try {
        const { success, data } = await googleAuthLogin({
          idToken: tokenResponse.code,
          role: UserRole.CLIENT,
          is_remember_me: rememberMe,
        });

        if (success && data && data?.token) {
          tokenStorage.setTokens({ accessToken: data?.token });
          tokenStorage.setRefreshToken(data?.refreshToken || '');
          emit('socket:connect_user', data.token);
          dispatch(setUser({ ...data, accessToken: data?.token }));
          navigate(ROUTES.CLIENT_DASHBOARD.path);
        }
      } catch (error) {
        console.error(error);
      }
    },
    onError: error => {
      console.error('Google Login Failed:', error);
    },
  });

  const handleSignUpClick = (): void => {
    navigate(ROUTES.REGISTER.path);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleSignUpClick();
    }
  };

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setValue('rememberMe', checked, { shouldValidate: true });
  };

  return (
    <>
      <form
        className='flex flex-col gap-30px items-center xl:items-start w-full'
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <Icon name='logo-secondary' />

        <div className='flex flex-col gap-2.5 w-full items-center xl:items-start'>
          <h4 className='text-2xl font-bold text-blackdark'>Sign In to your Account</h4>
          <p className='text-base font-normal text-primarygray'>
            Welcome Back! Please Enter Your Detail
          </p>
        </div>

        <div className='flex flex-col gap-4 w-full'>
          <InputField
            name='email'
            register={register}
            type='email'
            label='Email'
            placeholder='Email'
            icon='email'
            iconFirst
            inputClass='!border-primarylight'
            error={errors.email?.message}
          />

          <PasswordField
            name='password'
            register={register}
            label='Password'
            placeholder='Password'
            icon='lock'
            iconFirst
            error={errors.password?.message}
          />

          <div className='flex items-center justify-between'>
            <CheckboxField
              name='rememberMe'
              id='remember'
              onChange={handleRememberMeChange}
              isDefaultChecked={rememberMe}
              label='Remember Me'
              labelClass='whitespace-nowrap'
            />
            <Button
              type='button'
              variant='none'
              title='Forgot Password?'
              className='font-bold text-primary !p-0'
              onClick={handleForgotPassword}
            />
          </div>
        </div>

        <div className='flex flex-col gap-4 w-full'>
          <Button
            type='submit'
            variant='filled'
            isLoading={isLoading}
            title={isLoading ? 'Signing In...' : 'Sign In'}
            className='w-full rounded-10px !font-bold !leading-5'
            isDisabled={isLoading}
            onClick={handleSubmit(handleFormSubmit)}
          />

          <div className='relative'>
            <div className='h-1px bg-primarylight w-full my-2.5' />
            <div className='absolute left-2/4 -translate-x-2/4 bg-white rounded-full px-3.5 -top-0.5'>
              <span className='text-xl leading-4'>or</span>
            </div>
          </div>

          <Button
            variant='outline'
            title='Sign in with Google'
            className='w-full rounded-10px !font-semibold !border-primarylight'
            onClick={() => handleGoogleLogin()}
            icon={<Icon name='google' />}
            isIconFirst
          />
        </div>
      </form>

      <p className='text-center mt-6 text-blackdark text-sm font-normal'>
        Don't have an Account?
        <span
          className='font-bold cursor-pointer ml-1 hover:underline'
          onClick={handleSignUpClick}
          onKeyDown={handleKeyDown}
          role='button'
          tabIndex={0}
        >
          Sign Up
        </span>
      </p>
    </>
  );
};

export default Signin;
