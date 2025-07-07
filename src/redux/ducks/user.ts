
import { storageHelper } from '@/helper';
import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

export type UserState = {
  id: string;
  email: string;
  name: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  first_name?: string;
  last_name?: string;
  dob?: string;
  phone?: string;
  gender?: string;
  tokenInfo?: {
    [key: string]: number | string | (string | number)[];
  };
};


const initialState: UserState = {
  id: '',
  email: '',
  name: '',
  accessToken: null,
  refreshToken: null,
  tokenInfo: undefined,
};

const user = createSlice({
  name: 'user', // unique name to slice
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    clearUser: (
      state,
      action: PayloadAction<{
        isRedirect: boolean;
        isForceClear: boolean;
      }>
    ) => {
      if (action.payload.isForceClear) {
        storageHelper().removeItem('token');
        storageHelper().removeItem('accessToken');
      }
      if (action.payload.isRedirect) {
        return state;
      }
      return {
        ...initialState,
        accessToken: null,
        refreshToken: null,
        tokenInfo: undefined
      };
    }
  }
});

export const currentUser = (state: { user: UserState }) => state.user; 

export const { setUser, clearUser } = user.actions;
export default user.reducer;
