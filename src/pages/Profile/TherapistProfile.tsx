// import { ProfileForm } from '@/features/profile/components/ProfileAddEditForm';
import { useParams } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ProfileForm } from '@/features/profile/components/ProfileAddEditForm';

import Profile from '.';

const TherapistProfile = () => {
  const params = useParams();
  const { therapist_id } = params;

  return <>{therapist_id ? <Profile userRole={UserRole.THERAPIST} /> : <ProfileForm />}</>;
};

export default TherapistProfile;
