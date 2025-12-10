import { useLocation } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';

export const useRoleFromUrl = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0].toLowerCase();
    if (['admin', 'therapist', 'client'].includes(firstSegment)) {
      // return firstSegment as UserRole;
      if (firstSegment === 'admin') {
        return UserRole.ADMIN;
      } else if (firstSegment === 'therapist') {
        return UserRole.THERAPIST;
      } else if (firstSegment === 'client') {
        return UserRole.CLIENT;
      }
    }
  }
  return UserRole.CLIENT;
};
