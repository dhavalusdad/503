import type { User } from '@/features/login/types';
import { clearUser, setUser } from '@/redux/ducks/user';
import { store } from '@/redux/store';

export const dispatchSetUser = (user: Partial<User>) => {
  store.dispatch(setUser(user));
};

export const dispatchClearUser = (data?: { isRedirect?: boolean; isForceClear?: boolean }) => {
  store.dispatch(
    clearUser({
      isRedirect: data?.isRedirect || false,
      isForceClear: data?.isForceClear || import.meta.env.DEV,
    })
  );
};
