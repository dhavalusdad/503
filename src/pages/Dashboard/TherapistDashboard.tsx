import IncompleteClinicalNotes from '@/features/dashboard/components/IncompleteClincalNotes';
import PendingAssessmentForm from '@/features/dashboard/components/PendingAssessmentForm';
import AppointmentsCards from '@/features/therapist/components/dashboard/AppointmentsCards';
import { SessionProgressPieChart } from '@/features/therapist/components/dashboard/SessionProgressPieChart';
import SessionProgressTracker from '@/features/therapist/components/dashboard/SessionProgressTracker';

const TherapistDashboard = () => {
  return (
    <div className='flex flex-col gap-5'>
      <AppointmentsCards />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-3 xl:gap-5'>
        <SessionProgressTracker />
        <SessionProgressPieChart />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-3 xl:gap-5'>
        <IncompleteClinicalNotes />
        <PendingAssessmentForm />
      </div>
    </div>
  );
};

export default TherapistDashboard;
