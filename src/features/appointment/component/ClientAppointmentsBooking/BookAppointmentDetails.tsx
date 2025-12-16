import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { getAmdAppointmentsTypesAsync } from '@/api/advancedMd';
import {
  useCreateAdminAppointmentBooking,
  useCreateClientAppointmentBooking,
  useGetUserDependents,
} from '@/api/appointment';
import { useGetAvailabilitySlots } from '@/api/availability';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { getFieldOptionsAsyncByTherapistId } from '@/api/field-option';
import { useGetClientInsurances } from '@/api/insurance';
import { useGetCustomerPaymentProfile } from '@/api/payment';
import { useGetTherapistBasicDetailsInfo } from '@/api/therapist';
import type { AvailabilitySlot } from '@/api/types/calendar.dto';
import ClinicLogo from '@/assets/images/clinic_logo.webp';
import { RELATION_BY_THERAPY_TYPE, selectStyles } from '@/constants/CommonConstant';
import {
  FieldOptionType,
  PaymentMethodEnum,
  PermissionType,
  RelationEnum,
  TherapyType,
} from '@/enums';
import ConfirmAppointmentModal from '@/features/appointment/component/ClientAppointmentsBooking/ConfirmAppointmentModal';
import MemberCard from '@/features/appointment/component/ClientAppointmentsBooking/MemberCard';
import SuccessAppointmentModal from '@/features/appointment/component/ClientAppointmentsBooking/SuccessAppointmentModal';
import type {
  FormData,
  NavigationState,
  SpecialtiesDataType,
} from '@/features/appointment/component/ClientAppointmentsBooking/types';
import { validationSchemaClientBooking } from '@/features/appointment/component/ClientAppointmentsBooking/validationSchema';
import type { SelectOption } from '@/features/calendar/types';
import { AddClientDependentForm } from '@/features/client/components/ClientProfile/AddClientDependentForm';
import { AddPaymentMethodModal } from '@/features/payment/components/AddPaymentMethodModal';
import { isAdminPanelRole, showToast } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import AddInsuranceModal from '@/pages/Preferences/components/AddInsuranceModal';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import RadioField from '@/stories/Common/RadioBox';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';

import type { MultiValue } from 'react-select';

const BUTTON_TITLE_BY_RELATION = {
  [RelationEnum.FAMILY]: 'Member',
  [RelationEnum.COUPLE]: 'Couple',
  [RelationEnum.MINOR]: 'Minor',
};

const getCommonAreaOfFocus = (
  specialistList: SpecialtiesDataType[] = [],
  areaOfFocusList: SelectOption[] = []
) => {
  const ids = new Set(specialistList.map(item => item.area_of_focus_id));
  return areaOfFocusList.filter(item => ids.has(item.value));
};

const BookAppointmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, timezone, client_id } = useSelector(currentUser);
  const navigationState = location.state as NavigationState;

  const { hasPermission } = useRoleBasedRouting();
  const { data: therapistData } = useGetTherapistBasicDetailsInfo({
    therapist_id: navigationState?.therapistId || navigationState?.therapist?.id,
  });

  const getInternalTherapyType = (label: string): RelationEnum | undefined => {
    if (
      [TherapyType.FAMILY, TherapyType.COUPLE, TherapyType.MINOR].includes(label as TherapyType)
    ) {
      return RELATION_BY_THERAPY_TYPE[label];
    }
    return undefined;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedTherapyType, setSelectedTherapyType] = useState<RelationEnum | undefined>(
    getInternalTherapyType(navigationState?.appliedFilters?.therapyType?.label || '')
  );
  const [allAvailableDates, setAllAvailableDates] = useState<{ date: Date; className: string }[]>(
    []
  );

  // Form setup with React Hook Form
  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchemaClientBooking),
    shouldFocusError: true,
    defaultValues: {
      sessionType: navigationState?.appliedFilters?.sessionType,
      selectedDate: navigationState?.selectedDate || new Date(),
      selectedTime: navigationState?.slotId,
      therapyType: navigationState?.appliedFilters?.therapyType,
      areaOfFocus: getCommonAreaOfFocus(
        navigationState?.therapist.specialties,
        navigationState?.appliedFilters?.areaOfFocus
      ),
      visitReason: '',
      appointmentType: [],
      clinic: {},
    },
  });

  // Watch form values to keep them reactive
  const sessionType = watch('sessionType');
  const selectedDate = watch('selectedDate');
  const selectedTime = watch('selectedTime');
  const therapyTypeValue = watch('therapyType');
  const areaOfFocus = watch('areaOfFocus');
  const appointmentType = watch('appointmentType');
  const selectedClinicId = watch('clinic')?.id;

  const [therapyType, setTherapyType] = useState<string>('');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [openSuccessAppointmentModal, setOpenSuccessAppointmentModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showBookingConflict, setShowBookingConflict] = useState<boolean>(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState<boolean>(false);
  const [showAddInsuranceModal, setShowAddInsuranceModal] = useState<boolean>(false);

  // Booking appointment mutation
  const { mutateAsync: bookAppointment, isPending: isBookingAppointment } =
    useCreateClientAppointmentBooking();

  const { mutateAsync: bookAdminAppointment, isPending: isBookingAdminAppointment } =
    useCreateAdminAppointmentBooking();

  const { data: availabilityData, isLoading: isLoadingAvailability } = useGetAvailabilitySlots({
    therapist_id: navigationState?.therapistId,
    startDate: moment(getValues('selectedDate')).format('YYYY-MM-DD'),
    endDate: moment(getValues('selectedDate')).format('YYYY-MM-DD'),
    timeZone: timezone,
  });

  useEffect(() => {
    if (!availabilityData) return;
    // Extract available dates (fall back to empty array)
    const dates = availabilityData.availableDates;

    // Filter + transform valid dates
    const transformed = dates
      .filter((date: Date | string) => moment(date).isValid())
      .map((date: Date | string) => ({
        date: moment.utc(date).tz(timezone).toDate(),
        className: 'available-slot',
      }));

    setAllAvailableDates(transformed);
  }, [availabilityData?.availableDates, timezone]);

  const { data: customerPaymentProfiles } = useGetCustomerPaymentProfile({
    clientId: client_id || navigationState?.patientId,
  });

  const { data: clientInsurances } = useGetClientInsurances(
    client_id || navigationState?.patientId
  );

  const { data: userDependents } = useGetUserDependents(
    selectedTherapyType,
    client_id || navigationState?.patientId
  );

  const cardUsers = useMemo(
    () => userDependents?.filter(user => selectedIds.includes(user.user_id)) || [],
    [userDependents, selectedIds, selectedTherapyType]
  );

  const availableUsers = useMemo(() => {
    if (!selectedTherapyType || !userDependents) return [];
    return userDependents.filter(user => !selectedIds.includes(user.user_id));
  }, [userDependents, selectedIds, selectedTherapyType]);

  // Form submission - show confirmation modal first
  const onSubmit = async () => {
    if (selectedTherapyType) {
      if (!selectedIds.length) {
        showToast(`Select at least one ${selectedTherapyType} member`, 'ERROR');
        return;
      }
    }

    if ((customerPaymentProfiles?.paymentProfiles?.length || 0) < 1) {
      setShowAddPaymentModal(true);
      return;
    }

    if (
      navigationState?.appliedFilters?.paymentMethod?.label === PaymentMethodEnum.Insurance &&
      clientInsurances?.length === 0
    ) {
      setShowAddInsuranceModal(true);
      return;
    }

    setShowConfirmModal(true);
    setShowBookingConflict(false);
  };

  const handleConfirmAppointment = async () => {
    try {
      const data = getValues();

      const appointmentData = {
        therapist_id: navigationState?.therapistId || navigationState?.therapist?.id || '',
        session_type:
          typeof data.sessionType === 'object' && data.sessionType
            ? String(data.sessionType.value)
            : String(data.sessionType || ''),
        area_of_focus_ids: Array.isArray(data.areaOfFocus)
          ? data.areaOfFocus.map(item => (typeof item === 'object' && item ? item.value : item))
          : [],
        slot_id: data.selectedTime || navigationState?.slotId,
        therapy_type_id:
          typeof data.therapyType === 'object' && data.therapyType
            ? String(data.therapyType.value)
            : String(therapyType || data.therapyType || ''),
        appointment_reason: data.visitReason,
        dependents_ids: selectedIds,
        appointment_type_ids: data.appointmentType.map(v => v.value),
        client_id: navigationState?.patientId,
        clinic_address_id: data.clinic?.id,
        payment_method_id: navigationState?.appliedFilters?.paymentMethod?.value,
      };

      if (navigationState?.patientId) {
        const response = await bookAdminAppointment(appointmentData);
        if (response && response.status === 203) {
          // Show warning instead of proceeding
          setShowBookingConflict(true);
          return;
        }
      } else {
        const response = await bookAppointment(appointmentData);

        if (response && response.status === 203) {
          // Show warning instead of proceeding
          setShowBookingConflict(true);
          return;
        }
      }

      // Reset warning if booking is successful
      setShowBookingConflict(false);
      setShowConfirmModal(false);
      setOpenSuccessAppointmentModal(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  useEffect(() => {
    if (!navigationState?.therapistId && !navigationState?.slotId) {
      navigate(-1);
    }
  }, []);

  const attachMemberHandler = (memberId: string) => {
    setSelectedIds(prev => [...prev, memberId]);
  };

  const monthChangeHandler = (date?: string | Date) => {
    setValue('selectedDate', date as Date, { shouldValidate: true });
  };

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-5'>
        {/* Step 1: All fields except Insurance Provider */}
        <>
          <h4 className='text-lg font-bold leading-6 text-blackdark'>Book Appointment</h4>
          <div className='flex flex-col gap-5'>
            <div className='grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-y-5 gap-25px'>
              <InputField
                type='text'
                labelClass='!text-base'
                label='Therapist'
                placeholder='Therapist Name'
                inputClass='!leading-5 !text-base cursor-not-allowed pointer-events-none'
                value={`${navigationState?.therapist?.first_name} ${navigationState?.therapist?.last_name}`}
              />
              {navigationState?.appliedFilters?.state && (
                <InputField
                  type='text'
                  labelClass='!text-base'
                  label='State'
                  inputClass='!leading-5 !text-base cursor-not-allowed pointer-events-none'
                  value={navigationState?.appliedFilters?.state?.label}
                />
              )}
              <InputField
                type='text'
                labelClass='!text-base'
                label='Payment Method'
                inputClass='!leading-5 !text-base cursor-not-allowed pointer-events-none'
                value={navigationState?.appliedFilters?.paymentMethod?.label}
              />
              {navigationState?.appliedFilters?.paymentMethod?.label ===
                PaymentMethodEnum.Insurance && (
                <InputField
                  type='text'
                  labelClass='!text-base'
                  label='Carrier'
                  inputClass='!leading-5 !text-base cursor-not-allowed pointer-events-none'
                  value={navigationState?.appliedFilters?.carrier?.label}
                />
              )}
              {isAdminPanelRole(role) && (
                <InputField
                  type='text'
                  labelClass='!text-base'
                  label='Patient'
                  inputClass='!leading-5 !text-base cursor-not-allowed pointer-events-none'
                  value={`${navigationState?.patient?.first_name} ${navigationState?.patient?.last_name}`}
                />
              )}
              {/* Session Type */}
              {/* <Select
            label='Select Session Type'
            labelClassName='!text-base'
            isClearable={false}
            options={sessionOptions}
            value={sessionOptions.find(option => option.value === watch('sessionType')) || null}
            onChange={value => {
              const selectedValue = value as SelectOption;
              setValue('sessionType', selectedValue?.value || '');
            }}
            error={errors.sessionType?.message}
            StylesConfig={selectStyles}
          /> */}

              <CustomAsyncSelect
                queryKey={fieldOptionsQueryKey.getFieldOptionsKey('SessionType')}
                label='Session Type'
                isRequired={true}
                error={errors.sessionType?.message}
                labelClassName='!text-base'
                loadOptions={(page, searchTerm) =>
                  getFieldOptionsAsyncByTherapistId(
                    'SessionType',
                    page,
                    searchTerm,
                    navigationState?.therapist?.id
                  )
                }
                isClearable={false}
                value={sessionType || getValues('sessionType')}
                onChange={value => {
                  const selectedValue = value as SelectOption;
                  setValue('sessionType', selectedValue || null, { shouldValidate: true });
                  setValue('clinic', null);
                }}
                // placeholder='Search therapy types...'
                // isSearchable
                StylesConfig={selectStyles}
                cacheOptions={false}
              />

              {/* Date Picker - Disabled */}
              <CustomDatePicker
                selected={selectedDate || getValues('selectedDate')}
                onChange={value => {
                  const dateValue = value as Date;
                  setValue('selectedDate', dateValue, { shouldValidate: true });
                  setValue('selectedTime', '');
                }}
                onMonthChange={monthChangeHandler}
                isRequired={true}
                customDateClasses={allAvailableDates}
                label='Selected Date'
                labelClass='!text-base'
                className='!p-3'
                minDate={moment.tz(new Date(), timezone).endOf('day').toDate()}
              />

              {/* Time Input Field  */}
              <Select
                label='Select Time'
                labelClassName='!text-base'
                isRequired={true}
                value={availabilityData?.data
                  ?.filter(
                    (d: AvailabilitySlot) => d.id === (selectedTime || getValues('selectedTime'))
                  )
                  .map((d: AvailabilitySlot) => ({
                    label: moment.tz(d.start_time, timezone).format('h:mm A'),
                    value: d.id,
                  }))}
                options={
                  availabilityData?.data?.length
                    ? availabilityData?.data
                        ?.map((item: AvailabilitySlot) =>
                          item.status === 'Available'
                            ? {
                                label: moment.tz(item.start_time, timezone).format('h:mm A'),
                                value: item.id,
                              }
                            : null
                        )
                        .filter(Boolean)
                    : [
                        {
                          label: 'No slots available for this date.',
                          value: 'No slots available for this date.',
                        },
                      ]
                }
                isLoading={isLoadingAvailability}
                onChange={value =>
                  setValue('selectedTime', (value as SelectOption)?.value, {
                    shouldValidate: true,
                  })
                }
                error={errors.selectedTime?.message}
                StylesConfig={selectStyles}
              />

              {/* Therapy Type */}
              <CustomAsyncSelect
                queryKey={fieldOptionsQueryKey.getFieldOptionsKey('therapyType')}
                label='Therapy Type'
                isRequired={true}
                labelClassName='!text-base'
                loadOptions={(page, searchTerm) =>
                  getFieldOptionsAsyncByTherapistId(
                    FieldOptionType.THERAPY_TYPE,
                    page,
                    searchTerm,
                    navigationState?.therapist?.id
                  )
                }
                isClearable={false}
                value={therapyTypeValue || getValues('therapyType')}
                onChange={value => {
                  const selectedValue = value as SelectOption;
                  setValue('therapyType', selectedValue || null, { shouldValidate: true });
                  setTherapyType(selectedValue?.value || '');
                  const therapyName: string | undefined = getInternalTherapyType(
                    selectedValue.label
                  );
                  setSelectedIds([]);
                  setSelectedTherapyType(therapyName);
                }}
                placeholder='Search therapy types...'
                isSearchable
                error={errors.therapyType?.message}
                StylesConfig={selectStyles}
                cacheOptions={false}
              />

              {/* Area of Focus */}
              <CustomAsyncSelect
                queryKey={fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.AREA_OF_FOCUS)}
                label='Area of Focus'
                labelClassName='!text-base'
                isRequired={true}
                loadOptions={(page, searchTerm) =>
                  getFieldOptionsAsyncByTherapistId(
                    FieldOptionType.AREA_OF_FOCUS,
                    page,
                    searchTerm,
                    navigationState?.therapist?.id
                  )
                }
                isMulti
                value={(areaOfFocus || getValues('areaOfFocus')) as MultiValue<SelectOption>}
                onChange={value => {
                  const selectedValues = value as unknown as MultiValue<SelectOption>;
                  setValue('areaOfFocus', selectedValues || [], {
                    shouldValidate: true,
                  });
                }}
                placeholder='Search areas of focus...'
                isSearchable
                isClearable
                error={errors.areaOfFocus?.message}
                StylesConfig={selectStyles}
                cacheOptions={false}
              />

              <CustomAsyncSelect
                key={`appointment-type`}
                label='Appointment Type'
                isRequired={true}
                isClearable={true}
                labelClassName='!text-base'
                loadOptions={(page, searchTerm) => getAmdAppointmentsTypesAsync(page, searchTerm)}
                queryKey={'get-amd-appointments-types'}
                pageSize={10}
                value={appointmentType || getValues('appointmentType')}
                onChange={value => {
                  const selectedValues = value as unknown as MultiValue<SelectOption>;
                  setValue('appointmentType', selectedValues, {
                    shouldValidate: true,
                  });
                }}
                StylesConfig={selectStyles}
                isMulti
                error={errors.appointmentType?.message}
              />

              {/* Visit Reason */}
              <InputField
                type='text'
                label='Visit Reason'
                labelClass='!text-base'
                inputClass='!text-base !leading-5'
                parentClassName='xl:col-span-3 sm:col-span-2 col-span-1'
                placeholder='Reason...'
                name='visitReason'
                register={register}
                error={errors.visitReason?.message}
              />
            </div>

            {/* Clinic Detail - Conditional Display */}
            {(() => {
              const currentSessionType = sessionType || getValues('sessionType');
              const sessionTypeValue =
                typeof currentSessionType === 'object' && currentSessionType
                  ? currentSessionType.value
                  : currentSessionType;
              return sessionTypeValue === 'Clinic';
            })() && (
              <div className='bg-Gray p-5 rounded-2xl'>
                <h5 className='text-base font-bold leading-22px text-blackdark mb-5'>
                  Clinic Detail
                </h5>
                <div className='bg-white rounded-10px p-5'>
                  <div className='flex flex-col gap-5'>
                    {therapistData?.data &&
                      therapistData?.data?.clinic_address?.length > 0 &&
                      therapistData?.data?.clinic_address?.map(
                        (adress: { value: string; label?: string }) => {
                          return (
                            <div className='flex items-center gap-3'>
                              <RadioField
                                id={adress?.value}
                                name='clinic'
                                isChecked={selectedClinicId === adress.value}
                                label={
                                  <div className='flex items-center gap-3 cursor-pointer'>
                                    <Image
                                      imgPath={ClinicLogo}
                                      className='w-50px h-50px rounded-full p-2 bg-orangelight'
                                    />
                                    <p className='text-sm font-semibold leading-18px text-primarygray'>
                                      {adress?.label || ''}
                                    </p>
                                  </div>
                                }
                                onChange={() => {
                                  setValue(
                                    'clinic',
                                    { id: adress.value, name: adress?.label },
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    }
                                  );
                                }}
                              />
                            </div>
                          );
                        }
                      )}
                    {(errors.clinic?.id?.message || errors.clinic?.message) && (
                      <p className='text-red-600'>
                        {errors.clinic?.id?.message || errors.clinic?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {Object.values(RELATION_BY_THERAPY_TYPE).includes(selectedTherapyType) &&
              (hasPermission(PermissionType.PATIENT_EDIT) ||
                hasPermission(PermissionType.PATIENT_ADD)) && (
                <div className='bg-Gray p-5 rounded-2xl flex flex-col gap-5'>
                  {/* Family Therapy Section */}
                  <div className='flex flex-col gap-5'>
                    <div className='flex items-center justify-between gap-5'>
                      <h5 className='text-base font-bold leading-22px text-blackdark'>
                        {`${selectedTherapyType} Details`}
                      </h5>

                      <Button
                        variant='filled'
                        title={`Add ${BUTTON_TITLE_BY_RELATION[selectedTherapyType]}`}
                        onClick={() => {
                          setValue('therapyType', selectedTherapyType);
                          setIsOpen(true);
                        }}
                        className='rounded-lg'
                      />
                    </div>
                    {isOpen && (
                      <AddClientDependentForm
                        relationship={selectedTherapyType}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        mode={mode}
                        setMode={setMode}
                        patient_id={client_id || navigationState?.patientId}
                      />
                    )}
                  </div>

                  {selectedIds.length > 0 && cardUsers.length > 0 && (
                    <div className='flex flex-col gap-5'>
                      <div className='bg-blackdark/12 h-1px w-full'></div>
                      <div className='grid gap-5 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'>
                        {cardUsers.map((user, index) => (
                          <MemberCard
                            key={user.user_id}
                            member={{
                              ...user.user,
                              id: user.id,
                              user_id: user.user_id,
                              dob: user?.user?.dob,
                            }}
                            index={index}
                            onRemove={() =>
                              setSelectedIds(prev => prev.filter(id => id !== user.user_id))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {availableUsers.length > 0 && (
                    <>
                      <div className='bg-blackdark/12 h-1px w-full'></div>
                      <div className='grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
                        {availableUsers.map((member, index) => {
                          return (
                            <div
                              key={index}
                              className='flex items-center gap-2.5 justify-between px-4 py-2 bg-white shadow-calenderheader rounded-xl border border-solid border-surface w-full'
                            >
                              <div className='flex items-center gap-2.5 flex-1 overflow-hidden'>
                                <div className='w-10 h-10 rounded-full bg-surface flex items-center justify-center text-base font-bold text-Primary uppercase'>
                                  {member?.user.first_name?.[0]}
                                  {member?.user.last_name?.[0]}
                                </div>
                                <p className='text-base font-normal text-blackdark truncate flex-1'>
                                  {member.user.first_name} {member.user.last_name}
                                </p>
                              </div>
                              <div className='w-10 h-10 flex items-center justify-center bg-Gray text-primary rounded-full cursor-pointer'>
                                <Icon
                                  name='plus'
                                  // onClick={() => setSelectedIds(prev => [...prev, member.id])}
                                  onClick={() => attachMemberHandler(member.user_id)}
                                  className='icon-wrapper w-6 h-6'
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>
        </>

        {/* Footer Buttons */}
        <div className='flex items-center justify-end gap-5 pt-30px border-t border-solid border-surface'>
          <Button
            variant='outline'
            title='Cancel'
            className='rounded-10px !px-6 !font-bold'
            onClick={() => navigate(-1)}
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            variant='filled'
            title={
              isBookingAppointment || isBookingAdminAppointment ? 'Booking...' : 'Book Appointment'
            }
            className='rounded-10px !px-6 !font-bold'
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmAppointmentModal
        isOpen={showConfirmModal}
        patientName={`${navigationState?.patient?.first_name} ${navigationState?.patient?.last_name}`}
        onClose={() => {
          setShowConfirmModal(false);
          setShowBookingConflict(false);
        }}
        closeButton={true}
        appointmentData={{
          therapist: `${navigationState?.therapist?.first_name} ${navigationState?.therapist?.last_name}`,
          appointmentDate: moment(getValues('selectedDate')).format('DD MMMM YYYY'),
          appointmentTime: moment
            .tz(
              availabilityData?.data?.find(
                (d: AvailabilitySlot) => d.id === getValues('selectedTime')
              )?.start_time,
              timezone
            )
            .format('hh:mm A'),
          therapyType: selectedTherapyType || TherapyType.INDIVIDUAL,
          sessionType: (() => {
            const sessionTypeValue = getValues('sessionType');
            return typeof sessionTypeValue === 'object' && sessionTypeValue
              ? sessionTypeValue.label
              : sessionTypeValue || 'Video Session';
          })(),
          payment: navigationState?.appliedFilters?.paymentMethod?.label,
          clinicAddress: getValues('clinic')?.name,
        }}
        onConfirm={handleConfirmAppointment}
        showBookingConflict={showBookingConflict}
        isLoading={isBookingAppointment || isBookingAdminAppointment}
      />
      {openSuccessAppointmentModal && (
        <SuccessAppointmentModal
          isOpen={openSuccessAppointmentModal}
          onClose={() => {
            setOpenSuccessAppointmentModal(false);
            reset();
          }}
          closeButton={true}
          appointmentData={{
            therapist: `${navigationState?.therapist?.first_name} ${
              navigationState?.therapist?.last_name
            }`,
            appointmentDate: moment.tz(getValues('selectedDate'), timezone).format('DD MMMM YYYY'),
            appointmentTime: moment
              .tz(
                availabilityData?.data?.find(
                  (d: AvailabilitySlot) => d.id === getValues('selectedTime')
                )?.start_time,
                timezone
              )
              .format('hh:mm A'),
          }}
        />
      )}
      {showAddPaymentModal && (
        <AddPaymentMethodModal
          isOpen={showAddPaymentModal}
          onClose={() => setShowAddPaymentModal(false)}
          clientId={client_id || navigationState?.patientId}
          onSuccess={() => {
            setShowAddPaymentModal(false);
            if (
              navigationState?.appliedFilters?.paymentMethod?.label === PaymentMethodEnum.Insurance
            ) {
              setShowAddInsuranceModal(true);
            } else {
              setShowConfirmModal(true);
            }
          }}
        />
      )}
      {showAddInsuranceModal && (
        <AddInsuranceModal
          isOpen={showAddInsuranceModal}
          onClose={() => setShowAddInsuranceModal(false)}
          clientId={client_id || navigationState?.patientId}
          onSuccess={() => {
            setShowAddInsuranceModal(false);
            setShowConfirmModal(true);
          }}
        />
      )}
    </div>
  );
};

export default BookAppointmentDetails;
