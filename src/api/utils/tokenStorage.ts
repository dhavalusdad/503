import type { AuthTokens } from '@/api/types/auth.dto';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

type StorageType = 'localStorage' | 'sessionStorage';

export const tokenStorage = {
  getAccessToken: (storageType: StorageType = 'localStorage'): string | null => {
    const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
    return storage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (storageType: StorageType = 'localStorage'): string | null => {
    const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
    return storage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
  },

  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    sessionStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens: (): void => {
    sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  hasValidTokens: (storageType: StorageType = 'localStorage'): boolean => {
    const accessToken = tokenStorage.getAccessToken(storageType);
    return !!accessToken;
  },
};
