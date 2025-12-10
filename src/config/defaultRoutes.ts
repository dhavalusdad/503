import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';

export const getDefaultRouteByRole = (userRole: string): string => {
  switch (userRole) {
    case UserRole.CLIENT:
      return ROUTES.CLIENT_DASHBOARD.path;
    case UserRole.THERAPIST:
      return ROUTES.THERAPIST_DASHBOARD.path;
    case UserRole.ADMIN:
    case UserRole.BACKOFFICE:
      return ROUTES.ADMIN_DASHBOARD.path;
    default:
      return ROUTES.CLIENT_DASHBOARD.path;
  }
};
