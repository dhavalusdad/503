import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import AdminBookAppointment from '@/pages/Admin/Appointment/BookAppointment';
import AdminAppointment from '@/pages/Admin/AppointmentList/index';
import ClientAppointment from '@/pages/Appointment/ClientAppointment';
import TherapistAppointment from '@/pages/Appointment/TherapistAppointment';
import { currentUser } from '@/redux/ducks/user';

import ClientBookAppointment from './BookAppointment';

export const Appointment = () => {
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

export const BookAppointment = () => {
  const user = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;

  switch (userRole) {
    case UserRole.ADMIN:
    case UserRole.BACKOFFICE:
      return <AdminBookAppointment />;
    case UserRole.CLIENT:
      return <ClientBookAppointment />;
    default:
      return <></>;
  }
};
