import type { UserRole } from '@/api/types/user.dto';

// Define the form data type
export interface SignInFormData {
  email: string;
  password: string;
  role?: string;
  rememberMe?: boolean;
}

// Define component props type (if needed for future extensions)
export interface SignInProps {
  onSubmit?: (data: SignInFormData) => void;
  isLoading?: boolean;
}

export interface LocationState {
  key: string;
  token: string;
  email: string;
}
export interface LocationState {
  key: string;
  token: string;
  email: string;
}
export interface User {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
  // Add other user properties as needed
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
  type?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  [key: string]: string | object;
}

export interface registerResponse {
  data: object;
  message: string;
  [key: string]: string | object;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TherapistRegistrationFormInterface {
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegistrationFormInterface {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  createPassword: string;
  confirmPassword: string;
  remember?: boolean;
}

export interface ResetPasswordFormInterface {
  newPassword: string;
  confirmPassword: string;
}

export interface ErrorResponse {
  message: string;
  success: boolean;
}

export interface ForgotPasswordCredentials {
  email: string;
  role: string;
}

export interface ResetPasswordCredentials {
  token: string;
  newPassword: string;
  role: string;
  confirmPassword?: string; // if needed
}
export interface SetPasswordCredentials {
  token: string | null;
  newPassword: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
  };
}

export interface VerifyForgotPasswordOtpResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export interface OTPRequest {
  otp: string;
  token: string;
}

export interface OTPRequest {
  otp: string;
  token: string;
}
export interface OTPResponse {
  success: boolean;
  data?: {
    message: string;
    token: string;
    [key: string]: string;
  };
}
