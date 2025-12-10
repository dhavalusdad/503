import { useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { getDefaultRouteByRole } from '@/config/defaultRoutes';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import { currentUser } from '@/redux/ducks/user';

export const useRoleBasedRouting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(currentUser);

  const userRole = user.role || UserRole.CLIENT;
  const isAuthenticated = !!user.accessToken && !!user.id;

  // Redirect to role-appropriate default route if user is on a generic route
  useEffect(() => {
    if (isAuthenticated) {
      const currentPath = location.pathname;
      const defaultRoute = getDefaultRouteByRole(userRole);

      // If user is on root path or login path, redirect to their default route
      if (currentPath === '/' || currentPath === ROUTES.LOGIN.path) {
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, location.pathname, navigate, user]);

  // Check if current route is accessible for user's role.
  const isRouteAccessible = (path: string): boolean => {
    const backofficeRoutePermissionsMap: Record<string, string | string[] | undefined> = {
      [ROUTES.TRANSACTION.path]: PermissionType.TRANSACTIONS_VIEW,
      [ROUTES.TRANSACTION_DETAILS.path]: PermissionType.TRANSACTIONS_VIEW,
      [ROUTES.THIRD_PARTY_API_LOGS.path]: PermissionType.THIRD_PARTY_LOGS_VIEW,
      [ROUTES.THIRD_PARTY_API_LOGS_DETAILS.path]: PermissionType.THIRD_PARTY_LOGS_VIEW,
      [ROUTES.AMD_APPOINTMENTS_TYPES.path]: PermissionType.APPOINTMENT_TYPES_VIEW,
      [ROUTES.APPOINTMENT.path]: PermissionType.APPOINTMENT_VIEW,
      [ROUTES.ADMIN_BOOK_APPOINTMENT.path]: PermissionType.APPOINTMENT_ADD,
      [ROUTES.APPOINTMENT_VIEW.path]: PermissionType.APPOINTMENT_VIEW,
      [ROUTES.CLIENT_MANAGEMENT.path]: PermissionType.PATIENT_VIEW,
      [ROUTES.ADD_CLIENT.path]: PermissionType.PATIENT_ADD,
      [ROUTES.CLIENT_MANAGEMENT_DETAILS.path]: PermissionType.PATIENT_VIEW,
      [ROUTES.EDIT_CLIENT.path]: PermissionType.PATIENT_EDIT,
      [ROUTES.THERAPIST_MANAGEMENT.path]: PermissionType.THERAPIST_VIEW,
      [ROUTES.EDIT_THERAPIST.path]: PermissionType.THERAPIST_EDIT,
      [ROUTES.VIEW_THERAPIST_DETAILS.path]: PermissionType.THERAPIST_VIEW,
      [ROUTES.ASSESSMENT_FORM.path]: PermissionType.ASSESSMENT_FORM_VIEW,
      // Allow view to edit page when user has either UPDATE or READ permission
      [ROUTES.EDIT_ASSESSMENT_FORM.path]: [
        PermissionType.ASSESSMENT_FORM_EDIT,
        PermissionType.ASSESSMENT_FORM_VIEW,
      ],
      [ROUTES.AGREEMENT.path]: PermissionType.AGREEMENTS_VIEW,
      [ROUTES.BOOK_APPOINTMENTS_DETAILS.path]: PermissionType.APPOINTMENT_ADD,
      [ROUTES.AREA_OF_FOCUS.path]: PermissionType.AREA_OF_FOCUS_VIEW,
      [ROUTES.REMINDER_WIDGETS.path]: PermissionType.WIDGETS_VIEW,
      [ROUTES.TAG.path]: PermissionType.ALERT_TAGS_VIEW,
      [ROUTES.SESSION_TAG.path]: PermissionType.SESSION_TAGS_VIEW,
      [ROUTES.CLINIC_ADDRESSES.path]: PermissionType.CLINIC_ADDRESSES_VIEW,
      [ROUTES.ADMIN_BACKOFFICE_QUEUE.path]: PermissionType.BACKOFFICE_QUEUE_VIEW,
      [ROUTES.QUEUE_DETAILS_VIEW.path]: PermissionType.BACKOFFICE_QUEUE_VIEW,
      [ROUTES.ADMIN_BOOK_APPOINTMENT_DETAIL.path]: PermissionType.APPOINTMENT_ADD,
    };

    const isRouteAccessible = (route: string): boolean => {
      const safePermissions = Array.isArray(user?.permissions) ? user?.permissions : [];

      const requiredPermission = backofficeRoutePermissionsMap[route];

      if (!requiredPermission) {
        return true;
      }

      if (Array.isArray(requiredPermission)) {
        return requiredPermission.some(p => safePermissions.includes(p));
      }

      return safePermissions.includes(requiredPermission);
    };

    const staticRoutes = {
      [UserRole.CLIENT]: [
        ROUTES.CLIENT_DASHBOARD.path,
        ROUTES.APPOINTMENT.path,
        ROUTES.CALENDAR.path,
        ROUTES.TRANSACTION.path,
        ROUTES.CHAT.path,
        ROUTES.CLIENT_PROFILE.path,
        ROUTES.BOOK_APPOINTMENT.path,
        ROUTES.BOOK_SLOT.path,
        ROUTES.BOOK_APPOINTMENTS_DETAILS.path,
        ROUTES.GENERAL_SETTING.path,
        ROUTES.PAYMENT_METHOD.path,
        ROUTES.INSURANCE.path,
        ROUTES.MY_AGREEMENTS.path,
        ROUTES.SESSION_DOCUMENTS.path,
        ROUTES.SUBMIT_FORM_RESPONSE.path,
        ROUTES.VIEW_FORM_RESPONSE.path,
        ROUTES.REQUEST_SLOT.path,
      ],
      [UserRole.THERAPIST]: [
        ROUTES.THERAPIST_DASHBOARD.path,
        ROUTES.APPOINTMENT.path,
        ROUTES.MY_CLIENT.path,
        ROUTES.WELLNESS_DETAIL.path,
        ROUTES.CALENDAR.path,
        ROUTES.CHAT.path,
        ROUTES.SETTINGS.path,
        ROUTES.THERAPIST_PROFILE.path,
        ROUTES.INTAKE_FORM.path,
        ROUTES.VIEW_FORM_RESPONSE_THERAPIST.path,
        ROUTES.THERAPIST_ADD_CREDENTIALING_ITEM.path,
        ROUTES.AMD_SAFETY_PLAN,
      ],
      [UserRole.ADMIN]: [
        ROUTES.ADMIN_DASHBOARD.path,
        ROUTES.APPOINTMENT.path,
        ROUTES.TRANSACTION.path,
        ROUTES.CLIENT_MANAGEMENT.path,
        ROUTES.CLIENT_MANAGEMENT_DETAILS.path,
        ROUTES.THERAPIST_MANAGEMENT.path,
        ROUTES.SETTINGS.path,
        ROUTES.MANAGEMENT.path,
        ROUTES.ADMIN_PROFILE.path,
        ROUTES.ADMIN_LOGIN.path,
        ROUTES.ADMIN_STAFF.path,
        ROUTES.ADMIN_SETTINGS.path,
        // ROUTES.ADD_THERAPIST.path,
        ROUTES.STAFF_MANAGEMENT.path,
        ROUTES.STAFF_MANAGEMENT_DETAILS.path,
        ROUTES.ADD_STAFF_MEMBER.path,
        ROUTES.EDIT_STAFF_MEMBER.path,
        ROUTES.ROLE_PERMISSION.path,
        ROUTES.ASSESSMENT_FORM_DETAILS.path,
        ROUTES.AREA_OF_FOCUS.path,
        ROUTES.REMINDER_WIDGETS.path,
        ROUTES.APPOINTMENT_VIEW.path,
        ROUTES.ADMIN_BACKOFFICE_QUEUE.path,
        ROUTES.TAG.path,
        ROUTES.QUEUE_DETAILS_VIEW.path,
        ROUTES.AGREEMENT.path,
        ROUTES.ADD_CLIENT.path,
        ROUTES.ASSESSMENT_FORM.path,
        ROUTES.ADD_ASSESSMENT_FORM.path,
        ROUTES.EDIT_ASSESSMENT_FORM.path,
        ROUTES.SESSION_TAG.path,
        ROUTES.CLINIC_ADDRESSES.path,
        // ROUTES.AMD_LOGS.path,
        // ROUTES.AMD_LOGS_DETAILS.path,
        ROUTES.AMD_APPOINTMENTS_TYPES.path,
        ROUTES.ADMIN_BOOK_APPOINTMENT.path,
        ROUTES.BOOK_APPOINTMENTS_DETAILS.path,
        ROUTES.ADMIN_BOOK_APPOINTMENT_DETAIL.path,
        ROUTES.VIEW_FORM_RESPONSE_ADMIN.path,
        ROUTES.THIRD_PARTY_API_LOGS.path,
        ROUTES.TRANSACTION_DETAILS.path,
      ],
      [UserRole.BACKOFFICE]: [
        ROUTES.ADMIN_DASHBOARD.path,
        ROUTES.APPOINTMENT.path,
        ROUTES.ADMIN_BOOK_APPOINTMENT.path,
        ROUTES.CLIENT_MANAGEMENT.path,
        ROUTES.ADD_CLIENT.path,
        ROUTES.THERAPIST_MANAGEMENT.path,
        ROUTES.ASSESSMENT_FORM.path,
        ROUTES.AGREEMENT.path,
        ROUTES.ADMIN_BOOK_APPOINTMENT_DETAIL.path,
        ROUTES.AREA_OF_FOCUS.path,
        ROUTES.REMINDER_WIDGETS.path,
        ROUTES.TAG.path,
        ROUTES.SESSION_TAG.path,
        ROUTES.CLINIC_ADDRESSES.path,
        ROUTES.ADMIN_BACKOFFICE_QUEUE.path,
        ROUTES.STAFF_PROFILE.path,
        ROUTES.SETTINGS.path,
        ROUTES.TRANSACTION.path,
        ROUTES.THIRD_PARTY_API_LOGS.path,
        ROUTES.AMD_APPOINTMENTS_TYPES.path,
      ],
    };

    const dynamicRoutes = {
      [UserRole.ADMIN]: [
        ROUTES.VIEW_THERAPIST_DETAILS.path,
        ROUTES.EDIT_THERAPIST.path,
        ROUTES.APPOINTMENT_VIEW.path,
        ROUTES.THERAPIST_APPOINTMENT_LIST.path,
        ROUTES.CLIENT_MANAGEMENT_DETAILS.path,
        ROUTES.EDIT_CLIENT.path,
        // ROUTES.AMD_LOGS_DETAILS.path,
        ROUTES.VIEW_FORM_RESPONSE_ADMIN.path,
        ROUTES.THIRD_PARTY_API_LOGS_DETAILS.path,
        ROUTES.CREDENTIALING.path,
        ROUTES.ADD_CREDENTIALING_ITEM.path,
        ROUTES.EDIT_CREDENTIALING_ITEM.path,
      ],
      [UserRole.THERAPIST]: [
        ROUTES.MY_CLIENT_DETAIL.path,
        ROUTES.APPOINTMENT_VIEW.path,
        ROUTES.CHAT_VIEW.path,
        ROUTES.VIEW_FORM_RESPONSE_THERAPIST.path,
        ROUTES.WELLNESS_DETAIL.path,
        ROUTES.CREDENTIALING.path,
        ROUTES.ADD_CREDENTIALING_ITEM.path,
        ROUTES.AMD_SAFETY_PLAN.path,
        // Add therapist dynamic routes here
      ],
      [UserRole.CLIENT]: [
        // Add client dynamic routes here
        ROUTES.APPOINTMENT_VIEW.path,
        ROUTES.CHAT_VIEW.path,
        ROUTES.MY_AGREEMENTS_DETAIL.path,
        ROUTES.EDIT_FORM_RESPONSE.path,
        ROUTES.VIEW_FORM_RESPONSE.path,
        ROUTES.REQUEST_SLOT.path,
      ],
      [UserRole.BACKOFFICE]: [
        ROUTES.APPOINTMENT_VIEW.path,
        ROUTES.CLIENT_MANAGEMENT_DETAILS.path,
        ROUTES.EDIT_CLIENT.path,
        ROUTES.EDIT_THERAPIST.path,
        ROUTES.VIEW_THERAPIST_DETAILS.path,
        ROUTES.EDIT_ASSESSMENT_FORM.path,
        ROUTES.QUEUE_DETAILS_VIEW.path,
        ROUTES.TRANSACTION_DETAILS.path,
        ROUTES.THIRD_PARTY_API_LOGS_DETAILS.path,
      ],
    };

    const allowedStaticRoutes = staticRoutes[userRole as keyof typeof staticRoutes] || [];

    const allowedDynamicRoutes = dynamicRoutes[userRole as keyof typeof dynamicRoutes] || [];

    if (allowedStaticRoutes.includes(path)) {
      if (userRole === UserRole.BACKOFFICE) {
        return isRouteAccessible(path);
      }
      return true;
    }
    return allowedDynamicRoutes.some(allowedPath => {
      const allowedSegments = allowedPath.split('/').filter(Boolean);
      const currentSegments = path.split('/').filter(Boolean);
      if (allowedSegments.length !== currentSegments.length) return false;

      if (allowedSegments.every((seg, i) => seg.startsWith(':') || seg === currentSegments[i])) {
        if (userRole === UserRole.BACKOFFICE) {
          return isRouteAccessible(allowedPath);
        }
        return true;
      }
      return false;
    });
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
    getDefaultRoute: () => getDefaultRouteByRole(userRole, user.permissions),
    hasPermission,
  };
};
