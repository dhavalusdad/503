import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetUserAssessmentForms } from '@/api/assessment-forms';
import { useGetCustomerPaymentProfile } from '@/api/payment';
import { useCreateWellness, usePatientWellness } from '@/api/wellness';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus, FormStatusType } from '@/enums';
import { BreathingExercise } from '@/features/dashboard/components/BreathingExercise';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import GratitudeSpark from '@/features/dashboard/components/GratitudeSpark';
import TherapyMilestone from '@/features/dashboard/components/TherapyMilestone';
import TodoList from '@/features/dashboard/components/TodoList';
import WellnessHub from '@/features/dashboard/components/WellnessHub';
import { clearAppointmentFilters } from '@/redux/ducks/appointment-filters';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

const ClientDashboard = () => {
  const { mutateAsync: createWellness } = useCreateWellness();
  const { data: wellnessData } = usePatientWellness();
  const { client_id, id: user_id, tenant_id } = useSelector(currentUser);
  const { data: paymentProfileData } = useGetCustomerPaymentProfile({ clientId: client_id });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const statusFilter = {
    label: FormStatusType.PENDING,
    value: FormStatusType.PENDING,
  };
  const { data } = useGetUserAssessmentForms({
    tenant_id: tenant_id || '',
    filters: {
      status: [statusFilter],
      excludeAppointmentStatuses: [
        AppointmentStatus.CANCELLED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.NO_SHOW,
      ],
    },
    user_id,
    page: 1,
    limit: 100,
  });

  const [wellnessToday, setWellnessToday] = useState('');
  const [wellnessGratitude, setWellnessGratitude] = useState<string[]>([]);

  const pendingForms = data?.data || [];

  const handleSubmit = () => {
    const payload = {
      daily_mood: wellnessToday || '',
      daily_gratitude: wellnessGratitude || [],
    };
    createWellness(payload);
  };

  // Show error state
  // if (error) {
  //   return (
  //     <div className='flex items-center justify-center min-h-screen'>
  //       <div className='text-center'>
  //         <h2 className='text-xl font-semibold text-gray-900 mb-2'>Error loading dashboard</h2>
  //         <p className='text-gray-600'>Please try again later.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Normal dashboard content after agreements signed
  return (
    <div className='relative flex flex-col gap-5'>
      <div className='flex items-center gap-3 xl:gap-5 flex-wrap'>
        <h5 className='text-lg font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Upcoming Appointments
        </h5>
        {paymentProfileData?.paymentProfiles &&
          paymentProfileData?.paymentProfiles?.length === 0 && (
            <div className='order-3 lg:order-none border border-solid border-yellow rounded-10px bg-yellowlight flex flex-wrap justify-end items-center gap-2.5 p-2.5'>
              <div className='flex items-center gap-2.5'>
                <Icon name='warning' className='text-yellow' />
                <span className='text-base font-normal text-blackdark'>
                  Complete your pending profile.
                </span>
              </div>
              <div
                className='bg-blackdark rounded-md text-white text-sm font-normal py-1 px-2 cursor-pointer'
                onClick={() => navigate(ROUTES.PAYMENT_METHOD.path)}
              >
                <span>
                  <b>Add payment method</b>
                </span>
              </div>
            </div>
          )}
        <Button
          variant='filled'
          title='Book an Appointment'
          icon={<Icon name='plus' />}
          isIconFirst
          parentClassName='order-2 lg:order-none'
          className='rounded-lg'
          onClick={() => {
            dispatch(clearAppointmentFilters());
            navigate(ROUTES.BOOK_APPOINTMENT.path);
          }}
        />
      </div>

      <DashboardCard />
      <div className='bg-white border border-solid border-surface rounded-20px p-5'>
        <TodoList data={pendingForms} />
      </div>
      <div className='bg-white border border-solid border-surface rounded-20px p-5'>
        <div className='flex items-center gap-2.5 mb-5'>
          <Icon name='heart' className='text-blue' />
          <h5 className='text-lg font-bold text-blackdark leading-6'>My Mental Wellness Hub</h5>
        </div>
        <WellnessHub
          handleLabelChange={label => setWellnessToday(label)}
          handleGratitudeChange={gratitude => setWellnessGratitude(gratitude)}
          initialData={wellnessData}
        />
        <div className='p-5 bg-orangelight mt-5 rounded-10px'>
          <div className='flex items-center gap-2.5 mb-5'>
            <Icon name='archeryboard' className='text-blue' />
            <h5 className='text-lg font-bold text-blackdark leading-6'>Therapy Goals</h5>
          </div>
          <div className='grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5'>
            <TherapyMilestone />
            <BreathingExercise iterations={4} duration={60} />
            <GratitudeSpark />
          </div>
        </div>
        <div className='mt-5 text-end'>
          <Button
            variant='filled'
            onClick={handleSubmit}
            title={
              wellnessData?.daily_mood && wellnessData?.daily_gratitude?.length
                ? 'Submited'
                : 'Submit Check-In'
            }
            className='rounded-10px !font-bold'
            isDisabled={wellnessData?.daily_mood && wellnessData?.daily_gratitude?.length}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
