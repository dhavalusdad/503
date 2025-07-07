import { clearUser, setUser, type UserState } from "../ducks/user";
import { store } from "../store";

export const dispatchSetUser = (user: Partial<UserState>) => {
  store.dispatch(setUser(user));
};

export const dispatchClearUser = (data?: {
  isRedirect?: boolean;
  isForceClear?: boolean;
}) => {
  store.dispatch(
    clearUser({
      isRedirect: data?.isRedirect || false,
      isForceClear: data?.isForceClear || import.meta.env.DEV
    })
  );
};
