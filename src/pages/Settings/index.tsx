import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import AdminSettings from '@/pages/Admin/Settings';
import ClientSettings from '@/pages/Preferences/GeneralSetting';
import TherapistSettings from '@/pages/Therapist/Settings';
import { currentUser } from '@/redux/ducks/user';

const Settings = () => {
  const user = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;

  // Render the appropriate dashboard based on user role
  switch (userRole) {
    case UserRole.THERAPIST:
      return <TherapistSettings />;
    case UserRole.ADMIN:
    case UserRole.BACKOFFICE:
      return <AdminSettings />;
    case UserRole.CLIENT:
      return <ClientSettings />;
    default:
      return <ClientSettings />;
  }
};

export default Settings;
