import { useState } from 'react';

import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import { useBookSlot } from '@/features/appointment/component/ClientAppointmentsBooking/hooks/useBookSlot';
import { type BookSlotProps } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import { formatExperience } from '@/helper';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Spinner from '@/stories/Common/Loader/Spinner';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const BookSlot = ({ therapist_id = '', onContinue, onBack }: BookSlotProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state || {};

  const {
    timezone,
    // Therapist data
    therapist,
    isTherapistLoading,

    isSlotsLoading,

    // UI state
    selectedDate,
    selectedTime,

    // Actions
    setSelectedDate,
    setSelectedTime,

    dateWihTimeZone,

    // Computed values
    availableTimesForSelectedDate,
    // therapistLanguages,
  } = useBookSlot(therapist_id);

  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const fromDashboard = therapist_id !== '' ? true : false;

  const therapistFullName = therapist ? `${therapist.first_name} ${therapist.last_name}` : '';

  const therapistExperience = therapist ? formatExperience(therapist.experiences) : '';

  const therapistSpecializations =
    therapist?.area_of_focus?.map((focus: { name: string }) => focus.name) || [];

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      navigate(ROUTES.BOOK_APPOINTMENTS_DETAILS.path, {
        state: {
          therapist,
          therapistId: therapist?.id,
          selectedDate,
          selectedTime,
          slotId: selectedTime?.value?.id,
          timeSlot: selectedTime?.time,
          ...navigationState,
        },
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
  const profileImage = therapist?.profile_image ? SERVER_URL + therapist?.profile_image : '';
  if (isTherapistLoading) {
    return <Spinner />;
  }

  const handleSlotData = () => {
    onContinue({
      selectedDate: selectedDate,
      selectedTime: selectedTime,
    });
  };

  const monthChangeHandler = (date: Date) => {
    setSelectedDate(date);
  };
  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-5'>
        {!fromDashboard && (
          <>
            <h4 className='text-lg font-bold leading-6 text-blackdark'>Select Slot</h4>
            <div className='bg-surfacelight rounded-2xl p-5 flex flex-col gap-5'>
              <div className='flex items-center gap-5'>
                <Image
                  imgPath={profileImage}
                  className='w-90px h-90px rounded-full'
                  firstName={therapist?.first_name}
                  lastName={therapist?.last_name}
                  imageClassName='w-full h-full object-cover object-center rounded-full'
                />

                <div className='flex flex-col gap-1.5'>
                  <h4 className='text-lg font-bold leading-6 text-blackdark'>
                    {therapistFullName}
                  </h4>
                  <div className='flex items-center gap-2.5'>
                    <p className='text-sm font-normal leading-18px text-primarygray'>
                      {therapistSpecializations.join(', ') || 'Mental Health Therapist'}
                    </p>
                    <span className='bg-primarylight w-1px h-3.5 '></span>
                    <p className='text-sm font-normal leading-18px text-primarygray'>
                      {therapistExperience}
                    </p>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Icon name='location' className='text-primary' />
                    <span className='text-sm font-normal text-primarygray leading-18px'>
                      {therapist?.clinic_address?.[0]?.address || 'USA'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='relative'>
                <p className='text-base font-normal text-blackdark'>
                  {therapist?.bio && therapist.bio.split(' ').length > 100 ? (
                    isBioExpanded ? (
                      <>
                        {therapist.bio}
                        <span
                          className='font-bold cursor-pointer'
                          onClick={() => {
                            setIsBioExpanded(!isBioExpanded);
                          }}
                        >
                          {' '}
                          See Less
                        </span>
                      </>
                    ) : (
                      <>
                        {`${therapist.bio.split(' ').slice(0, 100).join(' ')}...`}
                        <span
                          className='font-bold cursor-pointer'
                          onClick={() => {
                            setIsBioExpanded(!isBioExpanded);
                          }}
                        >
                          {' '}
                          See More
                        </span>
                      </>
                    )
                  ) : (
                    therapist?.bio
                  )}
                </p>
              </div>
            </div>
          </>
        )}
        <div className='flex lg:flex-row flex-col items-start gap-5'>
          <div className='lg:w-2/4 w-full'>
            <CustomDatePicker
              selected={selectedDate as Date}
              onMonthChange={monthChangeHandler}
              onChange={date => {
                const selectedDate = date as Date;
                setSelectedDate(selectedDate);
              }}
              inline
              showIcon={false}
              showMonthDropdown={false}
              showYearDropdown={false}
              headerClassName='rounded-10px'
              legendIndicator
              parentClassName='bg-surfacelight p-5 rounded-2xl disabled-past-dates appointment-slot-datepicker'
              label='Select Date'
              labelClass='mb-5 text-lg !font-bold !leading-6'
              customDateClasses={dateWihTimeZone.map(date => ({
                date: new Date(date),
                className: 'available-slot',
              }))}
              minDate={moment.tz(new Date(), timezone).endOf('day').toDate()} // Only allow dates from tomorrow onwards
              maxDate={moment.tz(timezone).add(12, 'months').toDate()}
            />
          </div>
          <div className='flex flex-wrap gap-3 rounded-2xl  bg-surfacelight lg:w-2/4 w-full'>
            <div className='p-5 w-full'>
              {isSlotsLoading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                  <p className='text-gray-600'>Loading available times...</p>
                </div>
              ) : availableTimesForSelectedDate?.length > 0 ? (
                <>
                  <h2 className='text-base sm:text-lg font-semibold text-blackdark mb-3'>
                    Available Times on {moment(selectedDate).format('ddd D MMMM, YYYY')}
                  </h2>

                  <div className='flex flex-wrap gap-3'>
                    {availableTimesForSelectedDate.map(timeSlot => (
                      <Button
                        isDisabled={timeSlot?.value?.status == 'Booked'}
                        key={timeSlot.value.id}
                        onClick={() => setSelectedTime(timeSlot)}
                        variant={
                          selectedTime?.value?.id === timeSlot?.value?.id ? 'filled' : 'outline'
                        }
                        title={timeSlot.time}
                        className='!px-5 !py-2.5 text-nowrap  rounded-10px !leading-5'
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className='text-center flex justify-center flex-col items-center py-8'>
                  <h2 className='text-lg font-semibold text-blackdark mb-2'>No Available Times</h2>
                  <p className='text-blackdark text-base'>
                    on {moment(selectedDate).format('ddd D MMMM, YYYY')}
                  </p>
                  <p className='text-base text-blackdark mt-2'>Please select a different date</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {fromDashboard ? (
          <div className='flex flex-wrap items-center justify-end gap-5 pt-5 border-t border-solid border-surface'>
            <Button
              variant='outline'
              title='Cancel'
              className='rounded-10px !font-bold'
              onClick={onBack}
            />
            <Button
              variant='filled'
              title='Book Appointment'
              className='rounded-10px !font-bold'
              onClick={handleSlotData}
              isDisabled={!selectedDate || !selectedTime}
            />
          </div>
        ) : (
          <div className='flex flex-wrap items-center justify-end gap-5 pt-30px border-t border-solid border-surface'>
            <Button
              variant='outline'
              title='Back'
              className='rounded-10px !px-6 !font-bold'
              onClick={handleBack}
            />
            <Button
              variant='filled'
              title='Continue'
              className='rounded-10px !px-6 !font-bold'
              onClick={handleContinue}
              isDisabled={!selectedDate || !selectedTime}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSlot;
