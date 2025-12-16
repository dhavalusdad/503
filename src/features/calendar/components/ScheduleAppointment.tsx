import { useState, useCallback, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import { useCreateBookingAppointment } from '@/api/appointment';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { MODAL_TITLES } from '@/constants/CommonConstant';
import { SessionType } from '@/enums';
import AddPatientForm from '@/features/calendar/components/scheduleAppointmentComponents/AddPatientForm';
import AppointmentDetails from '@/features/calendar/components/scheduleAppointmentComponents/AppointmentDetails';
import PatientSelection from '@/features/calendar/components/scheduleAppointmentComponents/PatientSelection';
import type {
  BookingAppointmentState,
  CreateBookingAppointmentRequest,
  ScheduleAppointmentProps,
} from '@/features/calendar/types';
import { showToast } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Drawer from '@/stories/Common/Drawer';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

const ScheduleAppointment = ({
  setScheduleAppointment,
  scheduleAppointment,
  timeZone,
}: ScheduleAppointmentProps) => {
  const queryClient = useQueryClient();
  const user = useSelector(currentUser);
  const SESSION_TYPE = 'Virtual';

  const [step, setStepValue] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  // Add state to track validation trigger
  const [shouldShowValidationErrors, setShouldShowValidationErrors] = useState<boolean>(false);

  const { mutateAsync: createAppointment, isPending: isBookingAppointment } =
    useCreateBookingAppointment();

  const [bookingAppointment, setBookingAppointment] = useState<BookingAppointmentState>({
    selectedDate: (() => {
      // Get tomorrow in user's timezone
      const tomorrow = moment.tz(timeZone).add(1, 'day').startOf('day').toDate();
      return tomorrow;
    })(),
    selectedTime: {},
    areaOfFocus: [],
    selectRecurringAppointment: '',
    selectedPatient: '',
    numberOfRecurringSession: 8,
    therapyType: null,
    sessionType: { label: 'Virtual', value: 'Virtual' }, // Will be updated when therapist details load
    appointmentType: [],
    dependents_ids: [],
    clinicAddress: null,
  });

  const handleBookAppointment = async () => {
    if (!isBookingValid) {
      // Trigger validation errors
      setShouldShowValidationErrors(true);
      return;
    }

    if (!bookingAppointment.selectedTime.value?.id) {
      showToast('Please Select Time Slot', 'ERROR');
      return;
    }

    const data: CreateBookingAppointmentRequest = {
      therapist_id: user?.therapist_id || '',
      therapy_type_id: bookingAppointment.therapyType?.value,
      session_type: bookingAppointment.sessionType.value || SESSION_TYPE,
      area_of_focus_ids: bookingAppointment.areaOfFocus.map(a => a.value),
      slot_id: bookingAppointment.selectedTime.value?.id,
      ...(bookingAppointment.selectRecurringAppointment
        ? { recurring_appointment_type: bookingAppointment.selectRecurringAppointment || '' }
        : {}),
      number_of_appointments: bookingAppointment.selectRecurringAppointment
        ? bookingAppointment.numberOfRecurringSession
        : 1,
      patient_id: bookingAppointment.selectedPatient,
      appointment_type_ids: bookingAppointment.appointmentType.map(v => v.value),
      dependents_ids: bookingAppointment.dependents_ids.map(a => a.value),
      timezone: timeZone,
      ...(bookingAppointment.sessionType.value === SessionType.CLINIC
        ? { clinic_address_id: bookingAppointment.clinicAddress?.value }
        : {}),
    };

    try {
      await createAppointment(data);
      queryClient.invalidateQueries({
        queryKey: calendarQueryKeys.availabilitySlots({
          startDate: moment.tz(bookingAppointment.selectedDate, timeZone).format('YYYY-MM-DD'),
        }),
      });

      handleCloseModal();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setBookingAppointment(prev => ({ ...prev, selectedPatient: patientId }));
  };

  const handleAddNewPatient = () => {
    setStepValue(1);
  };

  const handlePatientCreated = (patientId: string) => {
    setBookingAppointment(prev => ({ ...prev, selectedPatient: patientId }));
    setStepValue(2);
  };

  const handleBookingAppointmentChange = (updates: Partial<BookingAppointmentState>) => {
    setBookingAppointment(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user makes changes
    if (shouldShowValidationErrors) {
      setShouldShowValidationErrors(false);
    }
  };

  const handleCancel = () => {
    setStepValue(0);
    setShouldShowValidationErrors(false); // Reset validation state
  };

  // Memoized handlers for modal
  const handleCloseModal = useCallback(() => {
    setScheduleAppointment(false);
    setStepValue(0);
    setShouldShowValidationErrors(false); // Reset validation state
    setBookingAppointment({
      selectedDate: moment.tz(timeZone).add(1, 'day').startOf('day').toDate(), // Reset to tomorrow
      selectedTime: {},
      areaOfFocus: [],
      selectRecurringAppointment: '',
      selectedPatient: '',
      numberOfRecurringSession: 1,
      therapyType: { label: '', value: '' },
      sessionType: { label: '', value: '' },
      appointmentType: [],
      dependents_ids: [],
      clinicAddress: { label: '', value: '' },
    });
  }, []);

  const isBookingValid = useMemo(() => {
    const hasPatient = Boolean(bookingAppointment.selectedPatient);
    const hasAreaOfFocus = bookingAppointment.areaOfFocus.length > 0;

    const hasTherapyType = Boolean(bookingAppointment.therapyType?.value);
    const hasSessionType = Boolean(bookingAppointment.sessionType.value);
    const hasAppointmentType = bookingAppointment.appointmentType.length > 0;
    return hasPatient && hasAreaOfFocus && hasTherapyType && hasSessionType && hasAppointmentType;
  }, [bookingAppointment]);

  // Memoized modal title
  const modalTitle = useMemo(() => {
    return MODAL_TITLES[step as keyof typeof MODAL_TITLES] || MODAL_TITLES.default;
  }, [step]);

  const renderUI = () => {
    switch (step) {
      case 0:
        return (
          <PatientSelection
            patientId={bookingAppointment.selectedPatient}
            onPatientSelect={handlePatientSelect}
            onAddNewPatient={handleAddNewPatient}
          />
        );

      case 1:
        return <AddPatientForm timezone={timeZone} onPatientCreated={handlePatientCreated} />;

      case 2:
        return (
          <AppointmentDetails
            timezone={timeZone}
            bookingAppointment={bookingAppointment}
            onBookingAppointmentChange={handleBookingAppointmentChange}
            shouldShowValidationErrors={shouldShowValidationErrors}
          />
        );
    }
  };

  return (
    <>
      <Drawer
        width='w-471px'
        title={modalTitle}
        isOpen={scheduleAppointment}
        onClose={handleCloseModal}
        id='schedule-appointment'
        footer={
          step === 0 ? (
            <Button
              variant='filled'
              title='Next'
              isDisabled={!bookingAppointment?.selectedPatient}
              onClick={() => setStepValue(2)}
              parentClassName='w-full'
              className='w-full rounded-10px'
            />
          ) : (
            <div className='flex items-center justify-between gap-5 w-full'>
              <Button
                variant='outline'
                title='Back'
                onClick={handleCancel}
                parentClassName='w-2/4'
                className='w-full rounded-lg'
              />
              <Button
                variant='filled'
                title={isBookingAppointment ? 'Booking...' : 'Book Appointment'}
                isDisabled={step === 1}
                isLoading={isBookingAppointment}
                onClick={handleBookAppointment}
                parentClassName='w-2/4'
                className='w-full rounded-lg'
              />
            </div>
          )
        }
      >
        {renderUI()}
      </Drawer>
      {/* updated modal */}
      <Modal
        // header={
        //   <div className={`flex items-center  justify-between p-4 `}>
        //     <div className='w-full flex justify-center items-center'>
        //       <Icon name='double-leaf' className='relative top-[40px] left-[20px]'></Icon>
        //     </div>

        //     <Button
        //       variant='none'
        //       onClick={() => setShowSuccessModal(false)}
        //       icon={<Icon name='close' className='text-gray-500  ' />}
        //       className='p-2 hover:bg-gray-100 rounded-full transition-colors duration-200'
        //     />
        //   </div>
        // }
        closeButton={true}
        parentTitleClassName='justify-end !p-5'
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        contentClassName='!pt-30px'
      >
        <div className='flex flex-col items-center gap-5'>
          <Icon name='double-leaf' className='relative'></Icon>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-5'>
              Your Appointment Is Confirmed.
            </h1>
            <p className='text-gray-600 text-lg leading-relaxed'>
              Your session has been booked successfully.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ScheduleAppointment;
