import type { User } from '@/api/types/user.dto';

export const jwtUtils = {
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  getTokenExpiry: (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  },

  getUserFromToken: (token: string): Partial<User> | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const { userId, email, name, role } = payload;
      return {
        id: userId,
        email: email,
        name,
        role,
        tenant_id: payload.tenant_id,
      };
    } catch {
      return null;
    }
  },
};
