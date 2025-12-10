import { type AxiosError, isAxiosError } from 'axios';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import type { ErrorResponse } from '@/features/login';

export const jsonStringify = <T>(value: T, defaultValue: ''): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return defaultValue;
  }
};

export * from './dateUtils';

export const jsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
};

export const storageHelper = (type: 'local' | 'session' = 'local') => {
  const storage = type === 'session' ? sessionStorage : localStorage;
  // Store data
  return {
    setItem: <T>(key: string, data: T, storageType = 'local'): void => {
      try {
        const jsonData = jsonStringify(data, '');
        if (storageType === 'local') storage.setItem(key, jsonData);
      } catch {
        // Handle storage errors silently or log them
      }
    },

    // Retrieve data with optional default value
    getItem: <T>(key: string, defaultValue: T) => {
      const storedData = storage.getItem(key);
      if (!storedData) {
        return defaultValue; // Return the default value if no data is found
      }
      return jsonParse(storedData?.toString(), defaultValue);
    },

    // Remove data
    removeItem: (key: string): void => {
      try {
        storage.removeItem(key);
      } catch {
        // Handle errors silently
      }
    },
  };
};

// generateYears function moved to CommonConstant.ts to avoid circular dependency

export const showToast = (
  value: AxiosError<ErrorResponse> | string,
  KEY: 'ERROR' | 'SUCCESS' = 'SUCCESS'
) => {
  if (KEY == 'ERROR' && (isAxiosError<ErrorResponse>(value) || typeof value === 'string')) {
    const message = (isAxiosError<ErrorResponse>(value) ? value?.response?.data?.message : value)
      ?.replaceAll('"', '')
      ?.replaceAll('_', ' ');
    if (message) {
      toast.error(message as string);
      return null;
    }
  } else {
    toast.success(value as string);
  }
};

export const formatTitleCase = (input: string): string => {
  return _.startCase(_.toLower(input));
};

export const navigateTo = (path: string) => {
  const navigate = useNavigate();
  navigate(path);
};

export const getDashboardPath = (role: UserRole) => {
  switch (role) {
    case UserRole.CLIENT:
      return ROUTES.CLIENT_DASHBOARD.path;
    case UserRole.THERAPIST:
      return ROUTES.THERAPIST_DASHBOARD.path;
    case UserRole.ADMIN:
    case UserRole.BACKOFFICE:
      return ROUTES.ADMIN_DASHBOARD.path;
    default:
      return ROUTES.CLIENT_DASHBOARD.path;
  }
};

export const getProfilePath = (role: UserRole) => {
  switch (role) {
    case UserRole.CLIENT:
      return ROUTES.CLIENT_PROFILE.path;
    case UserRole.THERAPIST:
      return ROUTES.THERAPIST_PROFILE.path;
    case UserRole.BACKOFFICE:
      return ROUTES.STAFF_PROFILE.path;
    case UserRole.ADMIN:
      return ROUTES.ADMIN_PROFILE.path;
    default:
      return ROUTES.CLIENT_PROFILE.path;
  }
};

export const getSettingsPath = (role: UserRole) => {
  switch (role) {
    case UserRole.CLIENT:
      return ROUTES.GENERAL_SETTING.path;
    case UserRole.THERAPIST:
      return ROUTES.SETTINGS.path;
    case UserRole.BACKOFFICE:
      return ROUTES.SETTINGS.path;
    case UserRole.ADMIN:
      return ROUTES.SETTINGS.path;
    default:
      return ROUTES.GENERAL_SETTING.path;
  }
};

export const getForgotPasswordPagePath = (role: UserRole | null) => {
  switch (role) {
    case UserRole.THERAPIST:
      return ROUTES.THERAPIST_FORGOT.path;
    case UserRole.ADMIN:
      return ROUTES.ADMIN_FORGOT.path;
    case UserRole.CLIENT:
    default:
      return ROUTES.FORGOT.path;
  }
};

export const getPasswordChangedPagePath = (role: UserRole | null) => {
  switch (role) {
    case UserRole.THERAPIST:
      return ROUTES.THERAPIST_PASSWORD_CHANGED.path;
    case UserRole.ADMIN:
      return ROUTES.ADMIN_PASSWORD_CHANGED.path;
    case UserRole.CLIENT:
    default:
      return ROUTES.PASSWORD_CHANGED.path;
  }
};

export const getLoginPagePath = (role: UserRole | null) => {
  switch (role) {
    case UserRole.THERAPIST:
      return ROUTES.THERAPIST_LOGIN.path;
    case UserRole.ADMIN:
      return ROUTES.ADMIN_LOGIN.path;
    case UserRole.CLIENT:
    default:
      return ROUTES.LOGIN.path;
  }
};

export const removeHtmlTag = (value: string) => {
  if (!value) return '';
  const textWithoutTags = value?.replace(/<[^>]+>/g, '');
  return textWithoutTags.trim();
};

export const extractNumber = (value: string): number | null => {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
};

export const formatLabel = (value: string): string => {
  if (!value) return '';

  return value
    .split('_')

    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatStatusLabel = (text: string): string => {
  if (!text) return '';

  // Insert space before each capital letter (except the first one)
  const withSpaces = text.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Capitalize the first letter of each word
  return withSpaces.replace(/\b\w/g, char => char.toUpperCase());
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1000) return `${bytes} B`;
  const kb = bytes / 1000;
  if (kb < 1000) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1000;
  return `${mb.toFixed(1)} MB`;
};

export const normalizeText = (text: string): string => {
  if (!text) return '';

  // Convert to lowercase → then startCase → remove extra spaces
  return _.startCase(_.toLower(text.trim()));
};

export const isAdminPanelRole = (role: UserRole) => {
  return [UserRole.ADMIN, UserRole.BACKOFFICE].includes(role);
};
