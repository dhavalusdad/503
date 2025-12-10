import type { User } from '@/api/types/user.dto.ts';

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: 'client' | 'therapist' | 'admin';
}

export interface OTPRequest {
  otp: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
  role: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    permissions?: [
      {
        id: string;
        name: string;
      },
    ];
    token: string;
    refreshToken?: string;
    email_verified: boolean;
    user: User;
  };
  role?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface OTPResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  data: {
    email: string;
    email_verified: boolean;
    source: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: AuthTokens;
}
