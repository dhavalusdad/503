
import React from 'react';
import type { RouteObject } from 'react-router-dom';

const Root  = React.lazy(() => import('@/pages/Root')); 
const Dashboard  = React.lazy(() => import('@/pages/Dashboard')); 

export type RoutesType = {
  [key in
    | 'DEFAULT'
    | 'DASHBOARD'
    | 'NOT_FOUND']: {
    path: string;
    headerName?: string;
    routeType: 'public' | 'un-authenticate' | 'authenticate';
    isHeaderVisible?: boolean;
    isFooterVisible?: boolean;
    element: RouteObject['element'];
    errorElement?: RouteObject['errorElement'];
  };
} 
// & {
//   [key in
//     | 'USER_MANAGEMENT_EDIT_DOCTOR'
//   ]: {
//     navigatePath: (id: number | string) => string;
//   };
// };

export const ROUTES: RoutesType = {
  DEFAULT: {
    path: '/',
    routeType: 'public',
    element: <Root /> 
  },
  DASHBOARD: {
    path: '/dashboard',
    routeType: 'public',
    headerName: 'Dashboard',
    element: <Dashboard />
  },
  NOT_FOUND: {
    path: '*',
    routeType: 'public',
    element: <>NOT FOUND</>
  }
};
