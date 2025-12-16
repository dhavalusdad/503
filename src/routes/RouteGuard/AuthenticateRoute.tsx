import React, { type PropsWithChildren, Suspense } from 'react';

import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { getNormalizedPath } from '@/api/utils';
import { ROUTES } from '@/constants/routePath';
import { isAdminPanelRole } from '@/helper';
import { useAuthState } from '@/hooks/useAuthState';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const AuthenticateRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthState();
  const location = useLocation();
  const { isRouteAccessible, getDefaultRoute } = useRoleBasedRouting();
  const { role } = useSelector(currentUser);
  if (!isAuthenticated) {
    if (role === UserRole.CLIENT) {
      return <Navigate to={ROUTES.LOGIN.path} replace />;
    } else if (role === UserRole.THERAPIST) {
      return <Navigate to={ROUTES.THERAPIST_LOGIN.path} replace />;
    } else if (isAdminPanelRole(role)) {
      return <Navigate to={ROUTES.ADMIN_LOGIN.path} replace />;
    }
    return <Navigate to={ROUTES.LOGIN.path} replace />;
  }

  const normalizedPath = getNormalizedPath(location.pathname);
  const isNotFound = isRouteAccessible(normalizedPath, true);
  // Check if current route is accessible for user's role
  if (isNotFound) {
    return <Navigate to={ROUTES.NOT_FOUND.path} />;
  }
  if (!isRouteAccessible(normalizedPath)) {
    if (role === UserRole.BACKOFFICE) {
      return <Navigate to={ROUTES.NOT_AUTHORIZED.path} replace />;
    } else {
      // Redirect to user's default route if they don't have access to current route
      return <Navigate to={getDefaultRoute()} replace />;
    }
  }

  return <Suspense fallback={<SectionLoader />}>{children}</Suspense>;
};

export default AuthenticateRoute;
