import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { useGetUserPermission } from '@/api/permissions';
import { getUserDetails } from '@/api/user';
import { tokenStorage } from '@/api/utils/tokenStorage';
import { dispatchSetUser } from '@/redux/dispatch/user.dispatch';
import { currentUser } from '@/redux/ducks/user';

import type { User } from '@sentry/react';

const useApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(currentUser);
  const storedAccessToken = tokenStorage.getAccessToken();

  const accessToken = user.accessToken || storedAccessToken;

  const { data, dataUpdatedAt, isSuccess, isError } = getUserDetails({
    isEnabled: !!accessToken,
  });

  useGetUserPermission({
    isEnabled: !!accessToken,
  });

  const userDetails = {
    ...data,
    role: Array.isArray((data as Partial<User>)?.roles)
      ? ((data as Partial<User>).roles.find((d: string) => d === user.role) ??
        (data as Partial<User>).roles[0])
      : user.role,
  };

  useEffect(() => {
    if (isSuccess) {
      dispatchSetUser(userDetails);
      setIsLoading(false);
    } else if (isError) {
      setIsLoading(false);
    } else if (!accessToken) {
      setIsLoading(false);
    }
  }, [dataUpdatedAt, isSuccess, isError, user.id, accessToken]);

  return { isLoading };
};

export default useApp;
