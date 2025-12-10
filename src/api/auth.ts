import { type UseMutationOptions } from '@tanstack/react-query';

import { axiosGet, axiosPost } from '@/api/axios';
import { jwtUtils } from '@/api/utils/jwtUtlis';
import { tokenStorage } from '@/api/utils/tokenStorage';
import type { LoginCredentials } from '@/features/login';
import type { RegisterCredentials } from '@/features/therapist/types';

import { authQueryKey } from './common/auth.queryKey';
import {
  type ApiResponse,
  type AuthTokens,
  type LoginResponse,
  type MessageResponse,
  type OTPResponse,
  type RegisterResponse,
  type User,
} from './types';

import { type UseQueryRestParamsType, useMutation, useQuery } from '.';

import type { AxiosError } from 'axios';

const BASE_PATH = '/auth';

// For current user
export const useGetUser = () => {
  return useQuery({
    queryKey: authQueryKey.userProfile(),
    queryFn: async (): Promise<User> => {
      const response = await axiosGet(`${BASE_PATH}/me`);
      // Backend returns { success: true, data: User }
      return response.data.data;
    },
    enabled:
      !!tokenStorage.getAccessToken() && !jwtUtils.isTokenExpired(tokenStorage.getAccessToken()!),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error: AxiosError) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// For login auth operations
export const useLogin = (
  options?: UseMutationOptions<LoginResponse, AxiosError, LoginCredentials>
) => {
  return useMutation({
    mutationKey: authQueryKey.login(),
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await axiosPost(`${BASE_PATH}/login`, { data: credentials });

      return response.data;
    },
    showToast: false,
    ...options,
  });
};

export const useGoogleAuthLogin = () => {
  return useMutation({
    mutationKey: authQueryKey.googleLogin(),
    mutationFn: async (data: {
      idToken: string | undefined;
      role: string;
      is_remember_me?: boolean;
    }) => {
      const response = await axiosPost(`${BASE_PATH}/google`, { data });

      return response.data;
    },
  });
};

// For register auth operations
export const useRegister = (data: {
  options?: UseMutationOptions<RegisterResponse, AxiosError, RegisterCredentials>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options, extraParams } = data;
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
      const response = await axiosPost(`${BASE_PATH}/register`, { data: credentials });

      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useTherapistRegister = (
  options?: UseMutationOptions<RegisterResponse, AxiosError, RegisterCredentials>
) => {
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
      const response = await axiosPost(`${BASE_PATH}/therapist-register`, { data: credentials });
      return response.data;
    },
    ...options,
  });
};

// For logout operations
export const useLogout = (options?: UseMutationOptions<MessageResponse, AxiosError, void>) => {
  return useMutation({
    mutationKey: authQueryKey.login(),
    mutationFn: async (): Promise<MessageResponse> => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        const response = await axiosPost(`${BASE_PATH}/logout`, { data: { refreshToken } });
        return response.data;
      }
      return { success: true };
    },
    ...options,
  });
};

export const useVerifyOtp = (
  options?: UseMutationOptions<OTPResponse, AxiosError, { otp: string; token: string }>
) => {
  return useMutation({
    mutationFn: async (data: { otp: string; token: string }): Promise<OTPResponse> => {
      const response = await axiosPost(`${BASE_PATH}/verify-login-otp`, { data });
      return response.data;
    },
    ...options,
  });
};

export const useVerifyForgotPasswordOtp = (
  options?: UseMutationOptions<OTPResponse, AxiosError, { otp: string; token: string }>
) => {
  return useMutation({
    mutationFn: async (data: { otp: string; token: string }): Promise<OTPResponse> => {
      const response = await axiosPost(`${BASE_PATH}/verify-otp`, { data });
      return response.data;
    },
    ...options,
  });
};

export const useResendOtp = (
  options?: UseMutationOptions<OTPResponse, AxiosError, { token: string }>
) => {
  return useMutation({
    mutationFn: async (data: { token: string }): Promise<OTPResponse> => {
      const response = await axiosPost(`${BASE_PATH}/resend-otp`, { data });
      return response.data;
    },
    ...options,
  });
};

// Forgot Password
export const useForgotPassword = (
  options?: UseMutationOptions<MessageResponse, AxiosError, { email: string }>
) => {
  return useMutation({
    mutationFn: async (data: { email: string; role: string }): Promise<MessageResponse> => {
      const response = await axiosPost(`${BASE_PATH}/forgot-password`, {
        data: { email: data.email, role: data.role },
      });
      return response.data;
    },
    ...options,
  });
};

// Reset Password
export const useResetPassword = (
  options?: UseMutationOptions<MessageResponse, AxiosError, { token: string; newPassword: string }>
) => {
  return useMutation({
    mutationFn: async ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }): Promise<MessageResponse> => {
      const response = await axiosPost(`${BASE_PATH}/reset-password`, {
        data: { token, new_password: newPassword },
      });
      return response.data;
    },

    ...options,
  });
};

// Set Password
export const useSetPassword = (
  options?: UseMutationOptions<MessageResponse, AxiosError, { token: string; newPassword: string }>
) => {
  return useMutation({
    mutationFn: async ({
      token,
      newPassword,
      role,
    }: {
      token: string;
      newPassword: string;
      role: string;
    }): Promise<MessageResponse> => {
      const response = await axiosPost(`${BASE_PATH}/set-password`, {
        data: { token, new_password: newPassword, role },
      });
      return response.data;
    },

    ...options,
  });
};

// Refresh Token (additional hook you might need)
export const useRefreshToken = (
  options?: UseMutationOptions<ApiResponse<AuthTokens>, AxiosError, string>
) => {
  return useMutation({
    mutationFn: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
      const response = await axiosPost(`${BASE_PATH}/refresh`, {
        data: { refreshToken },
      });
      return response.data;
    },
    ...options,
  });
};

export const useValidateToken = (params: { token: string | null; type: string }) => {
  const { token } = params;

  return useQuery({
    queryKey: ['token'],
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/validate-token`, {
        params,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!token,
  });
};

export const useGoogleAuthRegister = () => {
  return useMutation({
    mutationKey: authQueryKey.googleRegister(),
    mutationFn: async (data: { idToken: string | undefined; role: string }) => {
      const response = await axiosPost(`${BASE_PATH}/google`, { data });
      return response.data;
    },
  });
};
