import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '@/redux/store';

type StateType = {
  permissions: { id: string; name: string; label: string }[];
};
const initialState: StateType = {
  permissions: [],
};

const permissions = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (state, action) => {
      return { ...state, permissions: action.payload };
    },
  },
});

export const getPermissions = (state: RootState) => state.permissions.permissions;
export const { setPermissions } = permissions.actions;
export default permissions.reducer;
