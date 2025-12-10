import { useCallback, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useResendOtp, useVerifyForgotPasswordOtp, useVerifyOtp } from '@/api/auth';
import { tokenStorage } from '@/api/utils/tokenStorage';
import { ROUTES } from '@/constants/routePath';
import { OtpType } from '@/enums';
import type { LocationState } from '@/features/login/types';
import { useSocketEmit } from '@/hooks/socket';
import { setUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Otp from '@/stories/Common/Otp';

const OTP_LENGTH = 6;
const RESEND_COOL_DOWN = 60;

const Verification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emit = useSocketEmit();

  const { state } = useLocation() as { state: LocationState };

  const { mutateAsync: resendOtpMutation, isPending: isResendOtpLoading } = useResendOtp();
  const { mutateAsync: verifyOtpMutation, isPending: isVerifyOtpLoading } = useVerifyOtp();
  const { mutateAsync: verifyForgotPasswordOtpMutation, isPending: isVerifyForgotPasswordLoading } =
    useVerifyForgotPasswordOtp();

  const [otpValue, setOtpValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  const canResend = timeLeft <= 0;
  const isLoading = isVerifyOtpLoading || isVerifyForgotPasswordLoading;
  const isForgotPassword = state?.key === 'FORGOT_PASSWORD';

  const maskedEmail = () => {
    if (!state?.email) return '';
    return state.email.replace(
      /(.)(.*)(.@)/,
      (_, first: string, middle: string, at: string) => first + '*'.repeat(middle.length) + at
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = async (): Promise<void> => {
    if (!state?.token || !otpValue) return;

    const response = await verifyOtpMutation({
      otp: otpValue,
      token: state.token,
    });

    const { data } = response;

    if (data && data?.token) {
      const { token: accessToken, refreshToken, user } = data;

      tokenStorage.setTokens({ accessToken, refreshToken });
      dispatch(
        setUser({
          ...user,
          accessToken,
          refreshToken,
        })
      );

      emit('socket:connect_user', accessToken);
      navigate(ROUTES.CLIENT_DASHBOARD.path);
    } else {
      navigate(ROUTES.LOGIN.path);
    }
  };

  const handleVerifyForgotPasswordOtp = async (): Promise<void> => {
    if (!state?.token || !otpValue) return;

    const response = await verifyForgotPasswordOtpMutation({
      token: state.token,
      otp: otpValue,
    });

    const { data } = response;

    navigate(ROUTES.RESET_PASSWORD.path, { state: data });
  };

  const handleVerifyCode = () => {
    if (otpValue.length !== OTP_LENGTH) return;

    if (isForgotPassword) {
      handleVerifyForgotPasswordOtp();
    } else {
      handleVerifyOtp();
    }
  };

  const handleResendOtp = useCallback(async (): Promise<void> => {
    if (!canResend || isResendOtpLoading || !state?.token) return;

    const response = await resendOtpMutation({
      token: state.token,
      otp_type: isForgotPassword ? OtpType.FORGOT_PASSWORD : OtpType.EMAIL_VERIFY,
    });

    if (response.success) {
      setTimeLeft(RESEND_COOL_DOWN);
      setOtpValue('');
    }
  }, [canResend, isResendOtpLoading, state?.token, resendOtpMutation]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!state?.token || !state?.email) {
    navigate(ROUTES.LOGIN.path);
    return null;
  }

  useEffect(() => {
    const handleEnterPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (otpValue.length === OTP_LENGTH && !isLoading) {
          handleVerifyCode();
        }
      }
    };
    window.addEventListener('keydown', handleEnterPress);
    return () => {
      window.removeEventListener('keydown', handleEnterPress);
    };
  }, [otpValue, isLoading]);

  return (
    <>
      <div className='flex flex-col gap-30px items-center xl:items-start'>
        <Icon name='logo-secondary' />

        <div className='flex flex-col gap-2.5 items-center xl:items-start'>
          <h4 className='text-2xl font-bold text-blackdark'>Two-step Authentication</h4>
          <p className='text-sm sm:text-base font-normal text-primarygray text-center xl:text-left'>
            Please enter the OTP to verify your account. A code has been sent to{' '}
            <span className='font-medium'>{maskedEmail()}</span>
          </p>
        </div>

        <Otp length={OTP_LENGTH} isValid={true} setValue={setOtpValue} value={otpValue} />

        <div className='flex flex-col gap-4 w-full'>
          <Button
            variant='filled'
            title='Verify Code'
            isLoading={isLoading}
            isDisabled={isLoading || otpValue.length !== OTP_LENGTH}
            className='w-full rounded-10px !font-bold !leading-5'
            onClick={handleVerifyCode}
          />
        </div>
      </div>

      <p className='text-center mt-6 text-blackdark text-sm font-normal'>
        Didn't receive the code?{' '}
        {canResend ? (
          <Button
            variant='none'
            onClick={handleResendOtp}
            isDisabled={isResendOtpLoading}
            isLoading={isResendOtpLoading}
            parentClassName='w-auto inline-block'
            className='!font-bold cursor-pointer text-primary !px-1 !text-sm'
            title={isResendOtpLoading ? 'Sending...' : 'Resend Code'}
          />
        ) : (
          <span className='font-semibold text-gray-500'>Resend in {formatTime(timeLeft)}</span>
        )}
      </p>
    </>
  );
};

export default Verification;
