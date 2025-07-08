
import { Suspense } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject
} from 'react-router-dom';
import AuthenticateRoute from '@/routes/RouteGuard/AuthenticateRoute';
import UnAuthenticateRoute from '@/routes/RouteGuard/UnAuthenticateRoute';
import { ROUTES } from '@/constants/routePath';
import ErrorBoundary, { ErrorElement } from '@/components/common/ErrorBoundary';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import AppLayout from '@/components/layout';

const applySuspense = (routes: RouteObject[]): RouteObject[] => {
  return routes.map((route) => ({
    ...route,
    element: <Suspense fallback={<SectionLoader/>}>{route.element}</Suspense>
  }));
};

export const RoutesArray: RouteObject[] = applySuspense([
  ...Object.keys(ROUTES).map((key) => {
    const route = ROUTES[key as keyof typeof ROUTES];

    const routeObj: RouteObject = {
      path: route.path,
      element: route.element,
      errorElement: route.errorElement || <ErrorElement />
    };

    if (route.routeType === 'authenticate') {
      routeObj['element'] = (
        <AuthenticateRoute
>          <AppLayout>
            {ROUTES.DASHBOARD.path !== route.path ? (
              <ErrorBoundary path={ROUTES.DASHBOARD.path}>
                {route.element}
              </ErrorBoundary>
            ) : (
              route.element
            )}
          </AppLayout>
        </AuthenticateRoute>
      );
    } else if (route.routeType === 'un-authenticate') {
      routeObj['element'] = (
        <UnAuthenticateRoute>{route.element}</UnAuthenticateRoute>
      );
    }

    return routeObj;
  })
]);

const AllRoute = createBrowserRouter(RoutesArray);

const Route = () => <RouterProvider router={AllRoute} />;

export default Route;
