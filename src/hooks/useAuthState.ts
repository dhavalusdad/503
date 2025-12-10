import { useSelector } from 'react-redux';

import { tokenStorage } from '@/api/utils/tokenStorage';
import { currentUser } from '@/redux/ducks/user';

export const useAuthState = () => {
  const user = useSelector(currentUser);

  const isAuthenticated = !!user.id && !!user.accessToken;

  const hasStoredToken = !!tokenStorage.getAccessToken();

  const isUserAuthenticated = isAuthenticated || hasStoredToken;

  return {
    isAuthenticated: isUserAuthenticated,
    hasStoredToken,
  };
};
