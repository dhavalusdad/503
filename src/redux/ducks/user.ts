import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { User } from '@/api/types/user.dto';
import { storageHelper } from '@/helper';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const initialState: User = {
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  name: '',
  role: '',
  profile_image: '',
  created_at: '',
  updated_at: '',
  last_login: '',
  tenant_id: '',
  accessToken: '',
  timezone: 'UTC',
  agreements: [],
  permissions: [],
};

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<User> | null>) => {
      if (action.payload?.profile_image) {
        if (!action.payload.profile_image.includes(SERVER_URL)) {
          action.payload.profile_image = `${SERVER_URL}${action.payload.profile_image}`;
        }
      }
      const rawPermissions = action.payload?.permissions?.[0]?.permissions;

      let flattenedPermissions = state.permissions;

      if (Array.isArray(rawPermissions) && rawPermissions.length > 0) {
        flattenedPermissions = rawPermissions.map(p => p.name);
      }

      const finalState = {
        ...state,
        ...action.payload,
        permissions: flattenedPermissions,
      };

      return { ...finalState, timezone: finalState.timezone || 'UTC' };
    },
    clearUser: (state, action: PayloadAction<{ isRedirect: boolean; isForceClear: boolean }>) => {
      if (action.payload.isForceClear) {
        storageHelper().removeItem('token');
        storageHelper().removeItem('accessToken');
      }

      if (action.payload.isRedirect) {
        return state;
      }

      return initialState;
    },
  },
});

export const currentUser = (state: { user: User }) => state.user;
export const { setUser, clearUser } = user.actions;
export default user.reducer;
