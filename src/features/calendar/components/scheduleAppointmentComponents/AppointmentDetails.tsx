import React, { useMemo, useState, useRef, useEffect } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import { getAmdAppointmentsTypesAsync } from '@/api/advancedMd';
import {
  getDependentUserByClientId,
  useGetLatestClientTherapistAppointment,
} from '@/api/appointment';
import { useGetAvailabilitySlots } from '@/api/availability';
import { amdAppointmentsTypesQueryKey } from '@/api/common/amdAppointmentsTypesQueryKey';
import { useGetTherapistBasicDetails } from '@/api/therapist';
import type { AppointmentDetailsResponse } from '@/api/types/calendar.dto';
import { SessionType, TherapyType } from '@/enums';
import type {
  AppointmentDetailsProps,
  fieldOptionType,
  RecurringAppointmentOption,
  RecurringOption,
  SelectOption,
  SlotData,
  TimeSlotValue,
} from '@/features/calendar/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';

import type { MultiValue } from 'react-select';

const recurringAppointmentOptions: RecurringAppointmentOption[] = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
  { value: 'Choose No of Appointment', label: 'Choose No of Appointment' },
];

// const SERVER_URL = import.meta.env.VITE_BASE_URL;

export const mapTimeSlotToAvailableSlot = (
  slotData: SlotData[],
  timezone: string,
  hours: number
) => {
  return (
    slotData
      ?.filter(
        slot =>
          slot.status === 'Available' &&
          moment
            .tz(slot.start_time, timezone)
            .isAfter(
              moment
                .tz(moment.tz(timezone).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm', timezone)
                .add(hours, 'hours')
            )
      )
      ?.map(slot => ({
        time: moment.tz(slot.start_time, timezone).format('h:mm A'),
        value: { id: slot.id, status: slot.status } as TimeSlotValue,
      })) || []
  );
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  timezone,
  bookingAppointment,
  onBookingAppointmentChange,
  shouldShowValidationErrors,
}) => {
  const user = useSelector(currentUser);
  const [showRecurringAppointment, setShowRecurringAppointment] = useState(false);
  const [allAvailableDates, setAllAvailableDates] = useState<{ date: Date; className: string }[]>(
    []
  );

  // ✅ Refs for auto-scroll
  const areaOfFocusRef = useRef<HTMLDivElement | null>(null);
  const appointmentTypeRef = useRef<HTMLDivElement | null>(null);
  const therapyTypeRef = useRef<HTMLDivElement | null>(null);
  const sessionTypeRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto-scroll when validation triggers
  useEffect(() => {
    if (shouldShowValidationErrors) {
      const invalidFields: { ref: React.RefObject<HTMLDivElement | null>; isInvalid: boolean }[] = [
        { ref: areaOfFocusRef, isInvalid: bookingAppointment.areaOfFocus.length === 0 },
        { ref: appointmentTypeRef, isInvalid: bookingAppointment.appointmentType.length === 0 },
        { ref: therapyTypeRef, isInvalid: !bookingAppointment.therapyType.value },
        { ref: sessionTypeRef, isInvalid: !bookingAppointment.sessionType },
      ];

      const firstInvalid = invalidFields.find(field => field.isInvalid);
      if (firstInvalid?.ref?.current) {
        firstInvalid.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [shouldShowValidationErrors]);

  // Create memoized params to ensure React Query detects changes
  const { data: lastAppointment } =
    useGetLatestClientTherapistAppointment<AppointmentDetailsResponse>(
      bookingAppointment.selectedPatient
    );

  const { data: availabilityResponse, isLoading: isLoadingSlots } = useGetAvailabilitySlots({
    timeZone: timezone,
    startDate: moment(bookingAppointment.selectedDate).format('YYYY-MM-DD'),
    endDate: moment(bookingAppointment.selectedDate).format('YYYY-MM-DD'),
    therapist_id: user?.therapist_id,
  });
  const availabilityData = availabilityResponse?.data ?? [];

  useEffect(() => {
    if (!availabilityResponse) return;
    // Extract available dates (fall back to empty array)
    const dates = availabilityResponse.availableDates;

    // Filter + transform valid dates
    const transformed = dates
      .filter((date: Date | string) => moment(date).isValid())
      .map((date: Date | string) => ({
        date: moment.utc(date).tz(timezone).toDate(),
        className: 'available-slot',
      }));

    setAllAvailableDates(transformed);
  }, [availabilityResponse?.availableDates, timezone]);

  const { data: therapistDetails } = useGetTherapistBasicDetails({});

  const areaOfFocusOptions = useMemo(
    () =>
      therapistDetails?.area_of_focus
        ?.map((area: fieldOptionType) => ({
          value: area.id,
          label: area.name,
        }))
        .filter((option: { value: string; label: string }) => option.value && option.label) || [],
    [therapistDetails?.area_of_focus]
  );

  const sessionTypeOptions = useMemo(
    () =>
      therapistDetails?.session_types?.map((sessionType: string) => ({
        value: sessionType,
        label: sessionType,
      })) || [],
    [therapistDetails?.session_types]
  );

  const therapyTypeOptions = useMemo(
    () =>
      therapistDetails?.therapy_types?.map((therapyType: { id: string; name: string }) => ({
        value: therapyType.id,
        label: therapyType.name,
      })) || [],
    [therapistDetails?.therapy_types]
  );

  const availableSlots = useMemo(() => {
    const slots = Array.isArray(availabilityData) ? availabilityData : [];
    return mapTimeSlotToAvailableSlot(slots, timezone, 0);
  }, [availabilityData, bookingAppointment.selectedDate]);

  const handleClickUpArrow = (stepValue: number) => {
    if (
      +bookingAppointment.numberOfRecurringSession + stepValue > 8 ||
      +bookingAppointment.numberOfRecurringSession + stepValue < 1
    ) {
      return;
    }
    onBookingAppointmentChange({
      numberOfRecurringSession: (bookingAppointment.numberOfRecurringSession as number) + stepValue,
    });
  };

  const handleAppointmentTypeChange = (selectedOption: MultiValue<SelectOption>) => {
    const selectedValues = selectedOption || [];
    onBookingAppointmentChange({
      appointmentType: selectedValues,
    });
  };

  useEffect(() => {
    if (!lastAppointment) return;

    // Prefill Area of Focus
    if (lastAppointment.appointment_area_of_focus?.length) {
      const areaOfFocusValues = lastAppointment.appointment_area_of_focus.map(a => ({
        label: a.area_of_focus?.name,
        value: a.area_of_focus?.id,
      }));

      onBookingAppointmentChange({ areaOfFocus: areaOfFocusValues });
    }

    // Prefill Therapy Type
    if (lastAppointment.therapy_type) {
      onBookingAppointmentChange({
        therapyType: {
          label: lastAppointment.therapy_type.name,
          value: lastAppointment.therapy_type.id,
        },
      });
    }

    // Prefill Appointment Types (AMD)
    if (lastAppointment.amd_appointment_types?.length) {
      const prefillAppointmentTypes = lastAppointment.amd_appointment_types.map(data => ({
        value: data.amd_id,
        label: data.name,
      }));
      onBookingAppointmentChange({ appointmentType: prefillAppointmentTypes });
    }

    // Prefill Session Type
    if (lastAppointment.session_type) {
      onBookingAppointmentChange({
        sessionType: {
          label: lastAppointment.session_type,
          value: lastAppointment.session_type,
        },
      });
    }

    // Prefill Dependent users
    if (lastAppointment.dependent_users) {
      const prefillDependentUser = lastAppointment.dependent_users.map(data => ({
        value: data.id,
        label: data.full_name,
      }));
      onBookingAppointmentChange({
        dependents_ids: prefillDependentUser,
      });
    }

    // Prefill Clinic address
    if (lastAppointment.clinic_address) {
      onBookingAppointmentChange({
        clinicAddress: {
          label: lastAppointment.clinic_address.name,
          value: lastAppointment.clinic_address.id,
        },
      });
    }
  }, [lastAppointment]);

  return (
    <div className='flex flex-col gap-5 pb-0.5'>
      {lastAppointment && (
        <div className='w-full bg-[#FFC030] rounded-lg flex items-center justify-center py-2.5'>
          <p className='text-white font-semibold text-base text-center'>
            Note: Auto-filled from last session. Please verify details.
          </p>
        </div>
      )}

      <CustomDatePicker
        selected={bookingAppointment.selectedDate}
        onMonthChange={data => {
          const changeMonthDate = moment(data).toDate();
          onBookingAppointmentChange({ selectedDate: changeMonthDate });
        }}
        onChange={date => {
          const selectedDate = date as Date;
          // Convert to user's timezone date
          const tzDate = moment(selectedDate).startOf('day').toDate();
          onBookingAppointmentChange({
            selectedDate: tzDate,
            selectedTime: {}, // Reset selected time when date changes
          });
        }}
        minDate={moment.tz(timezone).startOf('day').toDate()} // Only allow dates from tomorrow onwards
        maxDate={moment.tz(timezone).add(12, 'months').toDate()}
        inline
        showIcon={false}
        showMonthDropdown={false}
        showYearDropdown={false}
        headerClassName='rounded-10px'
        parentClassName=''
        label='Select Date'
        labelClass=' text-base !font-semibold !leading-6'
        portalRootId={'schedule-appointment'}
        customDateClasses={allAvailableDates}
      />

      <div className='flex flex-wrap gap-3 rounded-2xl bg-surfacelight w-full'>
        <div className='p-4 sm:p-5 w-full'>
          {isLoadingSlots ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
              <p className='text-blackdark'>Loading available times...</p>
            </div>
          ) : availableSlots?.length > 0 ? (
            <>
              <h2 className='text-base sm:text-lg font-semibold text-blackdark mb-3'>
                Available Times on{' '}
                {moment(bookingAppointment.selectedDate).format('ddd D MMMM, YYYY')}
              </h2>

              <div className='flex flex-wrap gap-3'>
                {availableSlots.map(timeSlot => (
                  <Button
                    isDisabled={timeSlot?.value?.status == 'Booked'}
                    key={timeSlot.value.id}
                    onClick={() =>
                      onBookingAppointmentChange({
                        selectedTime: timeSlot,
                      })
                    }
                    variant={
                      bookingAppointment?.selectedTime?.value?.id === timeSlot?.value?.id
                        ? 'filled'
                        : 'outline'
                    }
                    title={timeSlot.time}
                    className=' rounded-10px'
                  />
                ))}
              </div>
            </>
          ) : (
            <div className='text-center flex justify-center flex-col items-center'>
              <h2 className='text-lg font-semibold text-blackdark mb-2'>No Available Times</h2>
              <p className='text-primarygray text-base font-normal'>
                on {moment(bookingAppointment.selectedDate).format('ddd D MMMM, YYYY')}
              </p>
              <p className='text-sm font-normal text-primarygray mt-2'>
                Please select a different date
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-5'>
        <div ref={areaOfFocusRef}>
          <Select
            label='Area of Focus'
            isClearable
            labelClassName='!text-base !leading-5'
            options={areaOfFocusOptions}
            isMulti
            onChange={value => onBookingAppointmentChange({ areaOfFocus: value })}
            value={bookingAppointment.areaOfFocus}
            error={
              shouldShowValidationErrors && bookingAppointment.areaOfFocus.length === 0
                ? 'Please select at least one area of focus'
                : ''
            }
            isRequired={true}
            StylesConfig={{
              control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
              singleValue: () => ({ fontSize: '16px' }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
            portalRootId='schedule-appointment'
          />
        </div>

        <div ref={appointmentTypeRef}>
          <CustomAsyncSelect
            key={`appointment-type`}
            label='Appointment Type'
            isClearable={true}
            labelClassName='!text-base !leading-5'
            loadOptions={(page, searchTerm) => getAmdAppointmentsTypesAsync(page, searchTerm)}
            queryKey={amdAppointmentsTypesQueryKey.getAmdAppointmentsTypes({})}
            pageSize={10}
            onChange={value => handleAppointmentTypeChange(value as MultiValue<SelectOption>)}
            StylesConfig={{
              control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
              singleValue: () => ({ fontSize: '16px' }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
            isMulti
            error={
              shouldShowValidationErrors && bookingAppointment.appointmentType.length === 0
                ? 'Please select at least one appointment type'
                : ''
            }
            portalRootId='schedule-appointment'
            value={bookingAppointment.appointmentType}
          />
        </div>

        <div ref={therapyTypeRef}>
          <Select
            label='Therapy Type'
            isClearable
            labelClassName='!text-base !leading-5'
            options={therapyTypeOptions}
            value={
              bookingAppointment.therapyType?.value
                ? {
                    value: bookingAppointment.therapyType?.value,
                    label: bookingAppointment.therapyType?.label,
                  }
                : null
            }
            isRequired={true}
            error={
              shouldShowValidationErrors && !bookingAppointment.therapyType.value
                ? 'Please select therapy type'
                : ''
            }
            onChange={value => {
              const selectedValue = value as SelectOption | null;
              onBookingAppointmentChange({
                therapyType: {
                  label: selectedValue?.label || '',
                  value: selectedValue?.value || '',
                },
              });
            }}
            portalRootId='schedule-appointment'
            StylesConfig={{
              control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
              singleValue: () => ({ fontSize: '16px' }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
          />
        </div>

        <div ref={sessionTypeRef}>
          <Select
            label='Session Type'
            isClearable
            isRequired={true}
            labelClassName='!text-base !leading-5'
            options={sessionTypeOptions}
            value={
              bookingAppointment.sessionType?.value
                ? {
                    value: bookingAppointment.sessionType?.value,
                    label: bookingAppointment.sessionType?.label,
                  }
                : null
            }
            error={
              shouldShowValidationErrors && !bookingAppointment.sessionType
                ? 'Please select session type'
                : ''
            }
            onChange={value => {
              const selectedValue = value as SelectOption | null;
              onBookingAppointmentChange({
                sessionType: {
                  label: selectedValue?.label || '',
                  value: selectedValue?.value || '',
                },
              });
            }}
            portalRootId='schedule-appointment'
            StylesConfig={{
              control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
              singleValue: () => ({ fontSize: '16px' }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
          />
        </div>
      </div>

      {bookingAppointment?.sessionType?.value === SessionType.CLINIC && (
        <Select
          label='Select Clinic Address'
          isClearable={true}
          placeholder={'Select clinic address'}
          labelClassName='!text-base !leading-5'
          options={therapistDetails?.clinic_address}
          value={bookingAppointment.clinicAddress}
          onChange={value => {
            const selectedValue = value as SelectOption | null;
            onBookingAppointmentChange({
              clinicAddress: {
                label: selectedValue?.label || '',
                value: selectedValue?.value || '',
              },
            });
          }}
          StylesConfig={{
            control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
            singleValue: () => ({ fontSize: '16px' }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />
      )}

      {(bookingAppointment.therapyType?.label == TherapyType.FAMILY ||
        bookingAppointment.therapyType?.label == TherapyType.COUPLE ||
        bookingAppointment.therapyType?.label == TherapyType.MINOR) && (
        <CustomAsyncSelect
          key={`${bookingAppointment.therapyType?.value}`}
          label='Select Dependent'
          isClearable={true}
          value={bookingAppointment.dependents_ids}
          placeholder={'Select dependent'}
          labelClassName='!text-base !leading-5'
          loadOptions={(page, searchTerm) =>
            getDependentUserByClientId(
              page,
              searchTerm,
              bookingAppointment.selectedPatient,
              bookingAppointment.therapyType.label
            )
          }
          queryKey={bookingAppointment.therapyType.label}
          pageSize={10}
          onChange={value => onBookingAppointmentChange({ dependents_ids: value })}
          StylesConfig={{
            control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
            singleValue: () => ({ fontSize: '16px' }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
          isMulti
          portalRootId='schedule-appointment'
          // formatOptionLabel={(data: OptionType) => (
          //   <div className='flex items-center gap-2.5 p-[0.5]'>
          //     {console.log(data)}
          //       <Image
          //         imgPath={data.image ? SERVER_URL + data.image : ''}
          //         firstName={data?.first_name}
          //         lastName={data?.last_name}
          //         alt='User Avatar'
          //         className='w-5 h-5 rounded-full bg-Gray border border-solid border-white'
          //         imageClassName='w-full h-full object-cover object-center rounded-full'
          //         initialClassName='!text-base'
          //       />

          //     <p className={`text-base truncate font-semibold`}>{data.label}</p>
          //   </div>
          // )}
        />
      )}
      <div className='flex flex-col gap-5'>
        <Select
          label='Set Recurring Appointment'
          isClearable
          labelClassName='!text-base !leading-5'
          options={recurringAppointmentOptions}
          onChange={value => {
            const selectedValue = value as RecurringOption | null;
            if (selectedValue?.value == 'Choose No of Appointment') {
              setShowRecurringAppointment(true);
              return;
            }
            onBookingAppointmentChange({
              selectRecurringAppointment: selectedValue?.value || '',
              numberOfRecurringSession: 8,
            });
            setShowRecurringAppointment(false);
          }}
          placeholder='Select recurring type'
          isSearchable
          error=''
          portalRootId='schedule-appointment'
          StylesConfig={{
            control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
            singleValue: () => ({ fontSize: '16px' }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />
        {showRecurringAppointment && (
          <div className='w-full'>
            <div className='inline-flex items-center bg-Gray p-3 rounded-10px gap-2'>
              <span className='text-blackdark text-sm whitespace-nowrap'>Repeat every</span>
              <div className='flex items-center gap-2'>
                <div
                  id='numberOfRecurringSession'
                  className='w-10 alway-show h-10 flex
                   justify-center items-center rounded-10px text-base leading-5 bg-surface'
                >
                  {' '}
                  {bookingAppointment.numberOfRecurringSession}{' '}
                </div>

                <div className='relative flex flex-col gap-1.5'>
                  <Icon
                    name='dropdownArrow'
                    onClick={() => handleClickUpArrow(1)}
                    color='gray'
                    className='downarrow flex justify-center items-center rotate-180 pointer-events-auto  cursor-pointer '
                  />
                  <Icon
                    name='dropdownArrow'
                    onClick={() => handleClickUpArrow(-1)}
                    color='gray'
                    className='uparrow flex justify-center items-center pointer-events-auto  cursor-pointer '
                  />
                </div>
              </div>
              <Select
                className='w-full'
                parentClassName='w-auto'
                options={[
                  { value: 'Weekly', label: 'Weekly' },
                  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
                ]}
                onChange={value => {
                  const selectedValue = value as RecurringOption | null;
                  onBookingAppointmentChange({
                    selectRecurringAppointment: selectedValue?.value || '',
                  });
                }}
                portalRootId='schedule-appointment'
                StylesConfig={{
                  control: () => ({
                    minHeight: '50px',
                    padding: '4px 6px',
                    fontSize: '16px',
                  }),
                  singleValue: () => ({ fontSize: '16px' }),
                  option: () => ({
                    fontSize: '16px',
                  }),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetails;
