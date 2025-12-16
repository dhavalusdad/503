import { useMemo, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getCarrierByStateAsync } from '@/api/carrier';
import { useGetCitiesByState } from '@/api/city';
import { cityQueryKey } from '@/api/common/city.queryKey';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { getFieldOptionsAsync } from '@/api/field-option';
import { useGetAllCredentialedStates } from '@/api/state';
import { selectStyles, SESSION_OPTIONS } from '@/constants/CommonConstant';
import { ROUTES } from '@/constants/routePath';
import { PaymentMethodEnum, PermissionType } from '@/enums';
import { useBookSlot } from '@/features/appointment/component/ClientAppointmentsBooking/hooks/useBookSlot';
import type { NavigationState } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import AdminPatientSelection from '@/features/calendar/components/scheduleAppointmentComponents/AdminPatientSelection';
import AdminTherapistSelection from '@/features/calendar/components/scheduleAppointmentComponents/AdminTherapistSelection';
import { isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Select, { CustomAsyncSelect, type SelectOption } from '@/stories/Common/Select';

const AdminBookAppointment = () => {
  const navigate = useNavigate();
  const { role } = useSelector(currentUser);
  const [patient, setPatient] = useState<NavigationState['patient']>({});
  const [therapistDetail, setTherapist] = useState<NavigationState['patient']>({});
  const [showBookingInterface, setShowBookingInterface] = useState(false);
  const [state, setState] = useState<SelectOption | null>(null);
  const [city, setCity] = useState<SelectOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<SelectOption | null>(null);
  const [carrier, setCarrier] = useState<SelectOption | null>(null);
  const [sessionType, setSessionType] = useState<SelectOption | null>(null);

  const { hasPermission } = useRoleBasedRouting();
  const {
    timezone,
    therapist,
    isSlotsLoading,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    dateWihTimeZone,
    availableTimesForSelectedDate,
  } = useBookSlot(therapistDetail.value);

  const { data: statesData, isLoading: statesLoading } = useGetAllCredentialedStates({
    isCredentialed: true,
  });

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesByState(
    String(state?.value) || '',
    {
      options: {
        enabled: !!state?.value,
        queryKey: cityQueryKey.getCitiesByStateKey(String(state?.value) || ''),
      },
      isCredentialed: true,
    }
  );

  const validAvailableDates = useMemo(() => {
    if (!timezone || !dateWihTimeZone?.length) return [];

    const tomorrowDate = moment.tz(timezone).add(1, 'day').format('YYYY-MM-DD');
    return dateWihTimeZone.filter((date: string) => date !== tomorrowDate);
  }, [dateWihTimeZone, timezone]);

  const monthChangeHandler = (date: Date) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
  };
  const handleShowBookingInterface = () => {
    if (patient?.value && therapistDetail) {
      setShowBookingInterface(true);
    }
  };

  const isInsurance = paymentMethod?.label === PaymentMethodEnum.Insurance;

  const isTherapistOrPatientDisabled = Boolean(
    !paymentMethod?.value ||
      (paymentMethod.value && isInsurance && !carrier?.value) ||
      !sessionType?.value
  );

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Book Appointment</h5>
        <div className='grid grid-cols-2 gap-5'>
          {/* <CustomAsyncSelect
            key={'state'}
            label='State'
            isClearable={true}
            value={state}
            labelClassName='!text-base'
            loadOptions={getCredentialStatesAsync}
            queryKey={STATE_KEYS_NAME.LIST}
            pageSize={5}
            onChange={selectedValue => {
              setTherapist({});
              setPatient({});
              setCarrier({ value: '', label: '' });
              setState(selectedValue as SelectOption);
            }}
            StylesConfig={selectStyles}
          /> */}

          <Select
            name='state'
            label='State'
            isClearable={true}
            labelClassName='!text-base'
            options={statesData?.length ? statesData : []}
            placeholder='Select State'
            onChange={value => {
              setTherapist({});
              setPatient({});
              setCarrier({ value: '', label: '' });
              setCity({ value: '', label: '' });
              setState(value as SelectOption); // handleSelectChange('carrier', { label: '', value: '' });
              // handleSelectChange('city', { label: '', value: '' });
              // handleSelectChange('state', value as SelectOption);
            }}
            isLoading={statesLoading}
            StylesConfig={selectStyles}
            isRequired={isInsurance}
          />

          <Select
            name='city'
            key={`landing-city-${state?.value}`}
            label='City'
            isClearable={true}
            labelClassName='!text-base'
            options={Array.isArray(citiesData) && citiesData?.length ? citiesData : []}
            placeholder='Select City'
            onChange={selected => {
              setCity(selected as unknown as SelectOption);
            }}
            isLoading={citiesLoading}
            StylesConfig={selectStyles}
          />

          <CustomAsyncSelect
            isRequired
            key={`payment`}
            value={paymentMethod}
            label='Payment Method'
            isClearable={true}
            labelClassName='!text-base'
            loadOptions={(page, searchTerm) =>
              getFieldOptionsAsync('PaymentMethod', page, searchTerm)
            }
            queryKey={fieldOptionsQueryKey.getFieldOptionsKey('PaymentMethod')}
            pageSize={10}
            onChange={selectedValue => {
              setCarrier({ value: '', label: '' });
              setPaymentMethod(selectedValue as SelectOption);
            }}
            StylesConfig={selectStyles}
          />

          {paymentMethod?.label == PaymentMethodEnum.Insurance && (
            <CustomAsyncSelect
              isRequired
              key={`insurance`}
              value={carrier?.value}
              refetchOnChangeValue={[state?.value]}
              label='Insurance'
              isClearable={true}
              labelClassName='!text-base'
              loadOptions={(page, searchTerm) =>
                getCarrierByStateAsync(page, searchTerm, state?.value as string)
              }
              queryKey={fieldOptionsQueryKey.getFieldOptionsKey('Carrier')}
              pageSize={10}
              onChange={selectedValue => {
                setTherapist({});
                setPatient({});
                setCarrier(selectedValue as SelectOption);
              }}
              StylesConfig={selectStyles}
            />
          )}

          <Select
            isRequired
            name='sessionType'
            label='Session Type'
            isClearable={true}
            labelClassName='!text-base'
            options={SESSION_OPTIONS}
            placeholder='Select Session Type'
            onChange={value => {
              setTherapist({});
              setPatient({});
              setSessionType(value as SelectOption);
            }}
            value={sessionType}
            StylesConfig={selectStyles}
          />

          {hasPermission(PermissionType.PATIENT_VIEW) && (
            <AdminPatientSelection
              isDisabled={isTherapistOrPatientDisabled}
              patient={patient}
              onPatientSelect={setPatient}
              carrier={carrier?.value as string}
              paymentMethod={paymentMethod?.value as string}
              isRequired={true}
            />
          )}

          {hasPermission(PermissionType.THERAPIST_VIEW) && (
            <AdminTherapistSelection
              therapist={therapistDetail}
              onTherapistSelect={setTherapist}
              isDisabled={isTherapistOrPatientDisabled}
              filters={{
                carrier: (carrier?.value as string) || '',
                ...(city?.value && { city: city.value }),
                ...(state?.value && { state: state.value }),
                ...(sessionType?.value && { session_type: sessionType.value }),
              }}
              isRequired={true}
              refetchOnChangeValue={[
                carrier?.value,
                city?.value,
                state?.value,
                sessionType?.value,
                paymentMethod?.value,
              ]}
            />
          )}
        </div>
        <div className='flex items-center gap-5 justify-end'>
          <Button
            title='Cancel'
            variant='outline'
            className='rounded-10px !leading-5 !px-6'
            onClick={() => {
              setPatient({});
              setTherapist({});
              setShowBookingInterface(false);
              navigate(ROUTES.APPOINTMENT.path);
            }}
          />
          <Button
            title='Continue'
            variant='filled'
            className='rounded-10px !leading-5 !px-6'
            isDisabled={
              !paymentMethod?.value ||
              !patient.value ||
              !therapistDetail.value ||
              !sessionType?.value ||
              (isInsurance && !carrier?.value)
            }
            onClick={handleShowBookingInterface}
          />
        </div>
        {showBookingInterface && patient?.value && therapistDetail?.value && (
          <div className='flex lg:flex-row flex-col items-start gap-5'>
            <div className='lg:w-2/4 w-full'>
              <CustomDatePicker
                selected={selectedDate as Date}
                onMonthChange={monthChangeHandler}
                onChange={handleDateChange}
                inline
                showIcon={false}
                showMonthDropdown={false}
                showYearDropdown={false}
                headerClassName='rounded-10px'
                legendIndicator
                parentClassName='bg-surfacelight p-5 rounded-2xl disabled-past-dates appointment-slot-datepicker'
                label='Select Slots'
                labelClass='mb-5 text-lg !font-bold !leading-6'
                customDateClasses={validAvailableDates.map(date => ({
                  date: new Date(date),
                  className: 'available-slot',
                }))}
                minDate={
                  timezone ? moment.tz(new Date(), timezone).endOf('day').toDate() : undefined
                }
                maxDate={moment.tz(timezone).add(12, 'months').toDate()}
              />
            </div>
            <div className='flex flex-wrap gap-3 rounded-2xl bg-surfacelight lg:w-2/4 w-full'>
              <div className='p-5 w-full'>
                {isSlotsLoading ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                    <p className='text-blackdark'>Loading available times...</p>
                  </div>
                ) : availableTimesForSelectedDate?.length > 0 ? (
                  <>
                    <h2 className='text-lg font-semibold text-blackdark mb-3'>
                      Available Times on {moment(selectedDate).format('ddd D MMMM, YYYY')}
                    </h2>

                    <div className='flex flex-wrap gap-3'>
                      {availableTimesForSelectedDate.map(timeSlot => (
                        <Button
                          isDisabled={timeSlot?.value?.status === 'Booked'}
                          key={timeSlot.value.id}
                          onClick={() => setSelectedTime(timeSlot)}
                          variant={
                            selectedTime?.value?.id === timeSlot?.value?.id ? 'filled' : 'outline'
                          }
                          title={timeSlot.time}
                          className=' rounded-10px'
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className='flex justify-center flex-col items-center'>
                    <h2 className='text-lg font-semibold text-blackdark mb-2'>
                      No Available Times
                    </h2>
                    <p className='text-primarygray text-base font-normal'>
                      on {moment(selectedDate).format('ddd D MMMM, YYYY')}
                    </p>
                    <p className='text-sm font-normal text-primarygray mt-2'>
                      Please select a different date
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Book Appointment button moved below all forms */}
        {showBookingInterface && patient?.value && therapistDetail?.value && (
          <div className='flex flex-wrap items-center justify-end gap-5 pt-5 border-t border-solid border-surface'>
            <Button
              variant='filled'
              title='Continue'
              className='rounded-10px !px-6 !font-bold'
              onClick={() => {
                navigate(
                  isAdminPanelRole(role)
                    ? ROUTES.ADMIN_BOOK_APPOINTMENT_DETAIL.path
                    : ROUTES.BOOK_APPOINTMENTS_DETAILS.path,
                  {
                    state: {
                      therapist,
                      therapistDetail: therapist?.id,
                      patientId: patient?.value,
                      patient: {
                        first_name: patient.first_name,
                        last_name: patient.last_name,
                      },
                      selectedDate,
                      selectedTime,
                      slotId: selectedTime?.value?.id,
                      timeSlot: selectedTime?.time,
                      appliedFilters: {
                        paymentMethod: paymentMethod,
                        carrier: carrier,
                        state: state,
                        sessionType: sessionType,
                      },
                    },
                  }
                );
              }}
              isDisabled={!selectedDate || !selectedTime}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookAppointment;
