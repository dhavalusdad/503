import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
// import ClientTransaction from '@/pages/Admin/Transactions';
import AdminTransaction from '@/pages/Admin/Transactions';
import { currentUser } from '@/redux/ducks/user';

const Transaction = () => {
  const user = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;

  // Render the appropriate dashboard based on user role
  switch (userRole) {
    case UserRole.BACKOFFICE:
    case UserRole.ADMIN:
      return <AdminTransaction />;
    case UserRole.CLIENT:
      return <AdminTransaction />;
    default:
      return <></>;
  }
};

export default Transaction;
