import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import AdminDashboard from '@/pages/Admin/Dashboard';
import ClientDashboard from '@/pages/Dashboard/ClientDashboard';
import TherapistDashboard from '@/pages/Dashboard/TherapistDashboard';
import { currentUser } from '@/redux/ducks/user';

const Dashboard = () => {
  const user = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;
  // Render the appropriate dashboard based on user role
  switch (userRole) {
    case UserRole.THERAPIST:
      return <TherapistDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.BACKOFFICE:
      return <AdminDashboard />;
    case UserRole.CLIENT:
      return <ClientDashboard />;
    default:
      return <ClientDashboard />;
  }
};

export default Dashboard;
