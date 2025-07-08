
import { type PropsWithChildren, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routePath';
import { currentUser } from '@/redux/ducks/user';
import SectionLoader from '@/stories/Common/Loader/Spinner';

export const UnAuthenticateRoute: React.FC<PropsWithChildren> = ({
  children
}) => {
  const { accessToken } = useSelector(currentUser);

  if (!accessToken) {
    return <Suspense fallback={<SectionLoader/>}>{children}</Suspense>;
  }

  return <Navigate to={ROUTES.DASHBOARD.path} />;
};

export default UnAuthenticateRoute;
