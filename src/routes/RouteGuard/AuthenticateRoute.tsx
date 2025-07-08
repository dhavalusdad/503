
// import { useSelector } from 'react-redux';
import { Suspense, type PropsWithChildren } from 'react';
// import { Navigate } from 'react-router-dom';
// import { ROUTES } from '@/constants/routePath';
// import { currentUser } from '@/redux/ducks/user';
import SectionLoader from '@/stories/Common/Loader/Spinner';


const AuthenticateRoute : React.FC<PropsWithChildren> = ({ children }) => {
  // const { accessToken } = useSelector(currentUser);

  // if (!accessToken) {
  //   return <Navigate to={ROUTES.DEFAULT.path} />;
  // }
  
  return <Suspense fallback={<SectionLoader/>}>{children}</Suspense>;
};

export default AuthenticateRoute;
