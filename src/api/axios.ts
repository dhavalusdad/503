import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

import { PERMISSION_QUERY_KEYS_NAME } from '@/api/common/permissions.queryKey';
import { queryClient } from '@/api/QueryProvider';
import { UserRole } from '@/api/types/user.dto';
import { jwtUtils } from '@/api/utils/jwtUtlis';
import { tokenStorage } from '@/api/utils/tokenStorage';
import { PERMISSION_ERROR } from '@/constants/CommonConstant';
import { ROUTES } from '@/constants/routePath';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (reason?: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleRedirection = (role: string) => {
  const loginRole = role;
  let route = ROUTES.LOGIN.path;
  switch (loginRole) {
    case UserRole.THERAPIST:
      route = ROUTES.THERAPIST_LOGIN.path;
      break;
    case UserRole.CLIENT:
      route = ROUTES.LOGIN.path;
      break;
    case UserRole.ADMIN:
      route = ROUTES.ADMIN_LOGIN.path;
      break;

    default:
      route = ROUTES.LOGIN.path;
      break;
  }
  window.location.href = route;
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  request => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      request.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return request;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 403 - Forbidden (permission errors)
    if (error.response?.status === 403) {
      if (error.response.data?.message === PERMISSION_ERROR) {
        queryClient.invalidateQueries({
          queryKey: [PERMISSION_QUERY_KEYS_NAME.GET_USER_PERMISSION],
        });
      }
      window.location.href = ROUTES.NOT_AUTHORIZED.path;
      return Promise.reject(error);
    }

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Check if we already tried to refresh this request
      if (originalRequest._retry) {
        const accessToken = tokenStorage.getAccessToken();
        tokenStorage.clearTokens();
        const roleFromToken = accessToken ? jwtUtils.getUserFromToken(accessToken)?.role : null;
        handleRedirection(roleFromToken as string);
        return Promise.reject(error);
      }

      const refreshToken = tokenStorage.getRefreshToken();

      // No refresh token available, redirect immediately
      if (!refreshToken) {
        const accessToken = tokenStorage.getAccessToken();
        tokenStorage.clearTokens();
        const roleFromToken = accessToken ? jwtUtils.getUserFromToken(accessToken)?.role : null;
        handleRedirection(roleFromToken as string);
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Mark this request as retried BEFORE starting refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint using base axios (not intercepted instance)
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {
            refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Store new tokens - pass as object!
        tokenStorage.setTokens({ accessToken });
        tokenStorage.setRefreshToken(newRefreshToken);

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens and redirect to login
        const accessToken = tokenStorage.getAccessToken();
        tokenStorage.clearTokens();

        const roleFromToken = accessToken ? jwtUtils.getUserFromToken(accessToken)?.role : null;
        handleRedirection(roleFromToken as string);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export methods that use the configured instance
export const axiosGet = async (url: string, config?: AxiosRequestConfig) => {
  return axiosInstance.get(url, config);
};

export const axiosPost = async (
  url: string,
  { data, ...config }: { data?: object } & AxiosRequestConfig = {}
) => {
  return axiosInstance.post(url, data, config);
};

export const axiosPatch = async (
  url: string,
  { data, ...config }: { data?: object } & AxiosRequestConfig = {}
) => {
  return axiosInstance.patch(url, data, config);
};

export const axiosPut = async (
  url: string,
  { data, ...config }: { data?: object } & AxiosRequestConfig = {}
) => {
  return axiosInstance.put(url, data, config);
};

export const axiosDelete = async (url: string, config?: AxiosRequestConfig) => {
  return axiosInstance.delete(url, config);
};

// Export the configured instance for direct use if needed
export default axiosInstance;
