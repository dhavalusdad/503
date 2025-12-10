import React, { type PropsWithChildren, Suspense } from 'react';

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { getDefaultRouteByRole } from '@/config/defaultRoutes';
import { useAuthState } from '@/hooks/useAuthState';
import { currentUser } from '@/redux/ducks/user';
import SectionLoader from '@/stories/Common/Loader/Spinner';

export const UnAuthenticateRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthState();
  const { role } = useSelector(currentUser);

  if (isAuthenticated) {
    const defaultRoute = getDefaultRouteByRole(role || UserRole.CLIENT);

    return <Navigate to={defaultRoute} replace />;
  }

  return <Suspense fallback={<SectionLoader />}>{children}</Suspense>;
};

export default UnAuthenticateRoute;
