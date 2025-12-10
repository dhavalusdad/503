import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import AppointmentListView from '@/features/admin/components/appointmentList/components/AppointmentView';
import AppointmentDetail from '@/features/appointment/component/TherapistAppointment/AppointmentDetail';
import { currentUser } from '@/redux/ducks/user';

const AppointmentView = () => {
  const user = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;

  switch (userRole) {
    case UserRole.THERAPIST:
      return <AppointmentDetail />;
    case UserRole.ADMIN:
      return <AppointmentListView />;
    default:
      return <AppointmentListView />;
  }
};

export default AppointmentView;
