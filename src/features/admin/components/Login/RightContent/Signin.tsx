import { yupResolver } from '@hookform/resolvers/yup';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useLogin } from '@/api/auth';
import { UserRole } from '@/api/types/user.dto';
import { tokenStorage } from '@/api/utils/tokenStorage';
import { ROUTES } from '@/constants/routePath';
import type { SignInFormData } from '@/features/login';
import type { LoginCredentials } from '@/features/login/types';
import { signInSchema } from '@/features/login/validationSchema';
import { useSocketEmit } from '@/hooks/socket';
import { setUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';
import PasswordField from '@/stories/Common/PasswordField';

const SignIn = () => {
  const navigate = useNavigate();
  const emit = useSocketEmit();
  const dispatch = useDispatch();
  const { mutateAsync: loginMutation, isPending: isLoading } = useLogin();

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginMutation(credentials);
    const { success, data } = response;

    if (success && data) {
      const { email_verified, token, refreshToken = '' } = data;

      if (email_verified) {
        const tokens = { accessToken: token, refreshToken };
        tokenStorage.setTokens(tokens);
        tokenStorage.setRefreshToken(refreshToken);
        emit('socket:connect_user', token);
        dispatch(
          setUser({
            ...data,
            accessToken: token,
            refreshToken,
            role: response.data.role,
            permissions: response.data.permissions,
          })
        );
        navigate(ROUTES.ADMIN_DASHBOARD.path);
      } else {
        navigate(ROUTES.VERIFICATION.path, {
          state: { email: credentials.email, token },
        });
      }
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleSignIn: SubmitHandler<SignInFormData> = async data => {
    await login({
      email: data.email,
      password: data.password,
      role: UserRole.ADMIN,
      is_remember_me: data?.rememberMe,
    });
  };

  const handleForgotPassword = (): void => {
    navigate(ROUTES?.ADMIN_FORGOT?.path);
  };

  const rememberMe = getValues('rememberMe');

  return (
    <form className='flex flex-col gap-30px' onSubmit={handleSubmit(handleSignIn)}>
      <div className='flex flex-col gap-30px items-center'>
        <Icon name='logo-secondary' />
        <div className='flex flex-col gap-2.5 items-center'>
          <h4 className='text-2xl font-bold text-blackdark'>Sign In to your Account</h4>
          <p className='text-base font-normal text-primarygray text-center'>
            Welcome Back! Please Enter Your Detail
          </p>
        </div>
      </div>
      <div className='flex flex-col gap-4'>
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
          autoComplete='email'
        />

        <PasswordField
          name='password'
          register={register}
          label='Password'
          placeholder='Password'
          icon='lock'
          iconFirst
          error={errors.password?.message}
          autoComplete='current-password'
        />

        <div className='flex items-center justify-between'>
          <CheckboxField
            name='rememberMe'
            id='remember'
            isChecked={rememberMe}
            label='Remember Me'
            labelClass='whitespace-nowrap'
            onChange={e => {
              setValue('rememberMe', e.target.checked, {
                shouldValidate: true,
              });
            }}
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
      <div className='flex flex-col gap-4'>
        <Button
          type='submit'
          variant='filled'
          isLoading={isLoading}
          title={isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
          className='w-full rounded-10px !font-bold !leading-5'
          isDisabled={isLoading || isSubmitting}
          onClick={handleSubmit(handleSignIn)}
        />
      </div>
    </form>
  );
};

export default SignIn;
