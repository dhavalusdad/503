import { useMemo } from 'react';

import { PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import AdminDashboardDataCountCards from '@/pages/Admin/Dashboard/AdminDashboardDataCountCards';
import AdminDashboardUpcomingSessions from '@/pages/Admin/Dashboard/AdminDashboardUpcomingSessions';
import PatientFormCompletionRate from '@/pages/Admin/Dashboard/PatientFormCompletionRate';
import TherapistStatus from '@/pages/Admin/Dashboard/TherapistStatus';
import './style/style.css';

const Dashboard = () => {
  const { hasPermission } = useRoleBasedRouting();

  const allPermissions = useMemo(() => {
    return [
      hasPermission(PermissionType.APPOINTMENT_VIEW),
      hasPermission(PermissionType.PATIENT_VIEW),
      hasPermission(PermissionType.THERAPIST_VIEW),
      hasPermission(PermissionType.ASSESSMENT_FORM_VIEW),
    ];
  }, [hasPermission]);

  const [
    hasAppointmentPermission,
    hasClientPermission,
    hasTherapistPermission,
    hasAssessmentFormPermission,
  ] = allPermissions;

  if (!allPermissions.filter(Boolean).length) {
    return (
      <div className='flex items-center justify-center h-full text-4xl overflow-hidden'>
        Hello 👋
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      {(hasAppointmentPermission || hasClientPermission || hasTherapistPermission) && (
        <AdminDashboardDataCountCards />
      )}
      <div className='flex xl:flex-row flex-col gap-5 '>
        {hasAppointmentPermission && (
          <div className='xl:w-1/2 w-full'>
            <AdminDashboardUpcomingSessions />
          </div>
        )}

        <div className='flex flex-col gap-5 xl:w-1/2 w-full'>
          {hasAssessmentFormPermission && <PatientFormCompletionRate />}

          {hasTherapistPermission && <TherapistStatus />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
