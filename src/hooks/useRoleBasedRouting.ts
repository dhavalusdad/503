import { useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { getNormalizedParam } from '@/api/utils';
import { getDefaultRouteByRole } from '@/config/defaultRoutes';
import { ROUTES, type RouteObjectValueType } from '@/constants/routePath';
import { currentUser } from '@/redux/ducks/user';

export const useRoleBasedRouting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(currentUser);

  const userRole = user.role || UserRole.CLIENT;
  const isAuthenticated = !!user.accessToken && !!user.id;
  const currentPath = location.pathname;

  // Redirect to role-appropriate default route if user is on a generic route
  useEffect(() => {
    if (isAuthenticated) {
      const defaultRoute = getDefaultRouteByRole(userRole);

      // If user is on root path or login path, redirect to their default route
      if (currentPath === '/' || currentPath === ROUTES.LOGIN.path) {
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, currentPath, navigate, user]);

  const staticRoutes = {
    [UserRole.CLIENT]: [
      ROUTES.CLIENT_DASHBOARD,
      ROUTES.APPOINTMENT,
      ROUTES.TRANSACTION,
      ROUTES.CHAT,
      ROUTES.CLIENT_PROFILE,
      ROUTES.BOOK_APPOINTMENT,
      ROUTES.BOOK_SLOT,
      ROUTES.BOOK_APPOINTMENTS_DETAILS,
      ROUTES.GENERAL_SETTING,
      ROUTES.PAYMENT_METHOD,
      ROUTES.INSURANCE,
      ROUTES.MY_AGREEMENTS,
      ROUTES.SESSION_DOCUMENTS,
      ROUTES.SUBMIT_FORM_RESPONSE,
      ROUTES.VIEW_FORM_RESPONSE,
    ],
    [UserRole.THERAPIST]: [
      ROUTES.THERAPIST_DASHBOARD,
      ROUTES.APPOINTMENT,
      ROUTES.MY_CLIENT,
      ROUTES.CALENDAR,
      ROUTES.CHAT,
      ROUTES.SETTINGS,
      ROUTES.THERAPIST_PROFILE,
      ROUTES.INTAKE_FORM,
    ],
    [UserRole.ADMIN]: [
      ROUTES.ADMIN_DASHBOARD,
      ROUTES.APPOINTMENT,
      ROUTES.TRANSACTION,
      ROUTES.CLIENT_MANAGEMENT,
      ROUTES.THERAPIST_MANAGEMENT,
      ROUTES.ADMIN_PROFILE,
      ROUTES.ADMIN_SETTINGS,
      // ROUTES.ADD_THERAPIST,
      ROUTES.STAFF_MANAGEMENT,
      ROUTES.ADD_STAFF_MEMBER,
      ROUTES.EDIT_STAFF_MEMBER,
      ROUTES.ROLE_PERMISSION,
      ROUTES.AREA_OF_FOCUS,
      ROUTES.REMINDER_WIDGETS,
      ROUTES.ADMIN_BACKOFFICE_QUEUE,
      ROUTES.TAG,
      ROUTES.AGREEMENT,
      ROUTES.ADD_CLIENT,
      ROUTES.ASSESSMENT_FORM,
      ROUTES.SESSION_TAG,
      ROUTES.CLINIC_ADDRESSES,
      // ROUTES.AMD_LOGS,
      // ROUTES.AMD_LOGS_DETAILS,
      ROUTES.AMD_APPOINTMENTS_TYPES,
      ROUTES.ADMIN_BOOK_APPOINTMENT,
      ROUTES.ADMIN_BOOK_APPOINTMENT_DETAIL,
      ROUTES.THIRD_PARTY_API_LOGS,
      ROUTES.NOT_AUTHORIZED,
    ],
    [UserRole.BACKOFFICE]: [
      ROUTES.ADMIN_DASHBOARD,
      ROUTES.APPOINTMENT,
      ROUTES.ADMIN_BOOK_APPOINTMENT,
      ROUTES.CLIENT_MANAGEMENT,
      ROUTES.ADD_CLIENT,
      ROUTES.THERAPIST_MANAGEMENT,
      ROUTES.ASSESSMENT_FORM,
      ROUTES.AGREEMENT,
      ROUTES.ADMIN_BOOK_APPOINTMENT_DETAIL,
      ROUTES.AREA_OF_FOCUS,
      ROUTES.REMINDER_WIDGETS,
      ROUTES.TAG,
      ROUTES.SESSION_TAG,
      ROUTES.CLINIC_ADDRESSES,
      ROUTES.ADMIN_BACKOFFICE_QUEUE,
      ROUTES.STAFF_PROFILE,
      ROUTES.ADMIN_SETTINGS,
      ROUTES.TRANSACTION,
      ROUTES.THIRD_PARTY_API_LOGS,
      ROUTES.AMD_APPOINTMENTS_TYPES,
    ],
  };

  const dynamicRoutes = {
    [UserRole.ADMIN]: [
      ROUTES.VIEW_THERAPIST_DETAILS,
      ROUTES.EDIT_THERAPIST,
      ROUTES.APPOINTMENT_VIEW,
      ROUTES.THERAPIST_APPOINTMENT_LIST,
      ROUTES.CLIENT_MANAGEMENT_DETAILS,
      ROUTES.EDIT_CLIENT,
      // ROUTES.AMD_LOGS_DETAILS,
      ROUTES.VIEW_FORM_RESPONSE_ADMIN,
      ROUTES.THIRD_PARTY_API_LOGS_DETAILS,
      ROUTES.ADD_CREDENTIALING_ITEM,
      ROUTES.EDIT_CREDENTIALING_ITEM,
      ROUTES.TRANSACTION_DETAILS,
      ROUTES.QUEUE_DETAILS_VIEW,
      ROUTES.EDIT_ASSESSMENT_FORM,
      ROUTES.STAFF_MANAGEMENT_DETAILS,
    ],
    [UserRole.THERAPIST]: [
      ROUTES.MY_CLIENT_DETAIL,
      ROUTES.APPOINTMENT_VIEW,
      ROUTES.CHAT_VIEW,
      ROUTES.VIEW_FORM_RESPONSE_THERAPIST,
      ROUTES.WELLNESS_DETAIL,
      ROUTES.AMD_SAFETY_PLAN,
      // Add therapist dynamic routes here
    ],
    [UserRole.CLIENT]: [
      // Add client dynamic routes here
      ROUTES.APPOINTMENT_VIEW,
      ROUTES.CHAT_VIEW,
      ROUTES.MY_AGREEMENTS_DETAIL,
      ROUTES.EDIT_FORM_RESPONSE,
      ROUTES.VIEW_FORM_RESPONSE,
      ROUTES.REQUEST_SLOT,
    ],
    [UserRole.BACKOFFICE]: [
      ROUTES.APPOINTMENT_VIEW,
      ROUTES.CLIENT_MANAGEMENT_DETAILS,
      ROUTES.EDIT_CLIENT,
      ROUTES.EDIT_THERAPIST,
      ROUTES.VIEW_THERAPIST_DETAILS,
      ROUTES.EDIT_ASSESSMENT_FORM,
      ROUTES.QUEUE_DETAILS_VIEW,
      ROUTES.TRANSACTION_DETAILS,
      ROUTES.THIRD_PARTY_API_LOGS_DETAILS,
      ROUTES.THERAPIST_APPOINTMENT_LIST,
      ROUTES.VIEW_FORM_RESPONSE_ADMIN,
      ROUTES.ADD_CREDENTIALING_ITEM,
      ROUTES.EDIT_CREDENTIALING_ITEM,
    ],
  };

  const isAccessible = (route: RouteObjectValueType): boolean => {
    // List of the user permissions
    const safePermissions = Array.isArray(user?.permissions) ? user?.permissions : [];

    // Permissions need to access the particular route (Defined in routes itself)
    const requiredPermission = route.permissions?.list;

    // If no permissions required then return isAccessible as true
    if (!requiredPermission) {
      return true;
    }

    // Else check if user has the permissions required to access that path
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.every(p => safePermissions.includes(p));
    }

    return safePermissions.includes(requiredPermission);
  };

  // Check if current route is accessible for user's role.
  const isRouteAccessible = (path: string, checkForNotFound: boolean = false): boolean => {
    // CHeck if it is static route
    const isStaticRoute =
      Object.entries(staticRoutes).find(([, routes]) =>
        routes.some(route => route.path === path)
      ) || null;

    if (isStaticRoute) {
      // Check if the current role has access to that route
      const isRouteAccessibleToRole = staticRoutes[userRole as keyof typeof staticRoutes].find(
        r => r.path === path
      );

      // If accessible,
      if (isRouteAccessibleToRole) {
        // If checking for not found, then return false
        if (checkForNotFound) {
          return false;
        }
        // If checking for route access..
        // Check for staff permissions
        if (userRole === UserRole.BACKOFFICE) {
          return isAccessible(isRouteAccessibleToRole);
        }
        // Else return true
        return true;
      } else {
        // If Route is not accessible to role
        // If checking for not found, return true
        if (checkForNotFound) {
          return true;
        }
        // Else checking for route access then return false
        return false;
      }
    } else {
      // Check for dynamic routes
      // Get dynamic routes of the current role
      const allowedDynamicRoutes = dynamicRoutes[userRole as keyof typeof dynamicRoutes] || [];

      // If we are checking for not found route
      if (checkForNotFound) {
        // Check if the role has access to the current path
        // If not , return not found as true else false
        if (!allowedDynamicRoutes.find(a => getNormalizedParam(a.path) === path)) {
          return true;
        }
        return false;
      }

      // Now match the current and the dynamic path
      return allowedDynamicRoutes.some(allowedPath => {
        const allowedSegments = allowedPath.path.split('/').filter(Boolean);
        const currentSegments = path.split('/').filter(Boolean);
        if (allowedSegments.length !== currentSegments.length) return false;

        // If the route matched
        if (allowedSegments.every((seg, i) => seg.startsWith(':') || seg === currentSegments[i])) {
          // Check for the permissions for the staff role
          if (userRole === UserRole.BACKOFFICE) {
            return isAccessible(allowedPath);
          }
          // Else return route accessible as true
          return true;
        }
        // If route is not accessible, return false
        return false;
      });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (userRole !== UserRole.BACKOFFICE) return true;
    const userPermissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
    return userPermissions?.includes(permission);
  };

  return {
    userRole,
    isAuthenticated,
    isRouteAccessible,
    getDefaultRoute: () => getDefaultRouteByRole(userRole),
    hasPermission,
  };
};
