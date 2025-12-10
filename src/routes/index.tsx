import { Suspense } from 'react';

import { type RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';

import ErrorBoundary, { ErrorElement } from '@/components/common/ErrorBoundary';
import AppLayout from '@/components/layout';
import { ROUTES } from '@/constants/routePath';
import AuthenticateRoute from '@/routes/RouteGuard/AuthenticateRoute';
import UnAuthenticateRoute from '@/routes/RouteGuard/UnAuthenticateRoute';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const applySuspense = (routes: RouteObject[]): RouteObject[] => {
  return routes.map(route => ({
    ...route,
    element: <Suspense fallback={<SectionLoader />}>{route.element}</Suspense>,
  }));
};
const RoutesArray: RouteObject[] = applySuspense([
  ...Object.keys(ROUTES).map(key => {
    const route = ROUTES[key as keyof typeof ROUTES];

    const routeObj: RouteObject = {
      path: route.path,
      element: route.element,
      errorElement: route.errorElement || <ErrorElement />,
    };

    if (route.routeType === 'authenticate') {
      routeObj['element'] = (
        <AuthenticateRoute>
          <AppLayout>
            <ErrorBoundary path={route.path}>{route.element}</ErrorBoundary>
          </AppLayout>
        </AuthenticateRoute>
      );
    } else if (route.routeType === 'un-authenticate') {
      routeObj['element'] = <UnAuthenticateRoute>{route.element}</UnAuthenticateRoute>;
    }

    return routeObj;
  }),
]);

const AllRoute = createBrowserRouter(RoutesArray);

const Route = () => <RouterProvider router={AllRoute} />;

export default Route;
