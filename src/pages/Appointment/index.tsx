import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import AdminAppointment from '@/pages/Admin/AppointmentList/index';
import ClientAppointment from '@/pages/Appointment/ClientAppointment';
import TherapistAppointment from '@/pages/Appointment/TherapistAppointment';
import { currentUser } from '@/redux/ducks/user';

const Appointment = () => {
  const user = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;

  switch (userRole) {
    case UserRole.THERAPIST:
      return <TherapistAppointment />;
    case UserRole.ADMIN:
    case UserRole.BACKOFFICE:
      return <AdminAppointment />;
    case UserRole.CLIENT:
      return <ClientAppointment />;
    default:
      return <ClientAppointment />;
  }
};

export default Appointment;
