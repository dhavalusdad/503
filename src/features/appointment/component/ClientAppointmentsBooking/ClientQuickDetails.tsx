import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { getAmdAppointmentsTypesAsync } from '@/api/advancedMd';
import { useCreateClientFromDashboard } from '@/api/clientManagement';
import { therapistQueryKey } from '@/api/common/therapist.queryKey';
import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import { SessionType, TherapyType } from '@/enums';
import { clientQuickDetailsSchema } from '@/features/appointment/component/ClientAppointmentsBooking/validationSchema';
import type { FilterState } from '@/features/appointment/types';
import type { SelectOption } from '@/features/calendar/types';
import type { DependentFormValues } from '@/features/client/types';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import { CustomAsyncSelect } from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';
import { getTherapistClinicAsync } from '@/therapist-clinic';

import type {
  AppointmentBookedResponse,
  AppointmentDateTimeProps,
  ClientQuickDetailsProps,
} from './types';
import type { MultiValue } from 'react-select';

interface ClientDetailsProps {
  onContinue: (mode: string) => void;
  onBack?: () => void;
  dependentData: DependentFormValues[];
  appointmentDetails?: AppointmentDateTimeProps;
  selectedTherapist?: TherapistBasicDetails;
  filter: FilterState;
  setDependentData: (DependentFormValues: DependentFormValues[]) => void;
  onAppointmentBooked?: (data: AppointmentBookedResponse) => void;
  savedValues: ClientQuickDetailsProps;
  setSavedValues: (data: ClientQuickDetailsProps) => void;
}

const ClientQuickDetails = ({
  onContinue,
  dependentData,
  selectedTherapist,
  appointmentDetails,
  setDependentData,
  filter,
  onAppointmentBooked,
  savedValues,
  setSavedValues,
}: ClientDetailsProps) => {
  const { mutateAsync: createClient, isPending } = useCreateClientFromDashboard();
  const [isDependent, setIsDependent] = useState<boolean>(false);

  // Form setup with React Hook Form
  const methods = useForm<ClientQuickDetailsProps>({
    resolver: yupResolver(clientQuickDetailsSchema),
    context: { sessionType: filter?.sessionType },
    defaultValues: savedValues,
  });
  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    formState: { errors, isValid },
    watch,
  } = methods;

  useEffect(() => {
    const subscription = methods.watch(values => {
      setSavedValues(values as ClientQuickDetailsProps);
    });

    return () => subscription.unsubscribe();
  }, [methods.watch]);

  useEffect(() => {
    if (
      filter?.therapyType?.label == TherapyType.FAMILY ||
      filter?.therapyType?.label == TherapyType.MINOR ||
      filter?.therapyType?.label == TherapyType.COUPLE
    ) {
      setIsDependent(true);
    }
  }, []);

  // Handle actual appointment booking after confirmation
  const handleConfirmAppointment = async () => {
    try {
      const data = getValues();

      if (isDependent && dependentData.length == 0) {
        toast.error('Select at least one Dependent.');

        return;
      }
      const clientData = {
        first_name: data.first_name,
        last_name: data.last_name,
        dob: data.dob,
        email: data.email,
        phone: data.phone,
        ...(filter?.sessionType?.value === SessionType.CLINIC
          ? { clinic_address_id: data?.clinic?.id }
          : {}),
      };
      const areaOfFocus = selectedTherapist?.specialties?.map(d => d?.area_of_focus_id) || [];
      const appointmentData = {
        // selectedTherapist: selectedTherapist,
        appointmentDetails: {
          therapist_id: selectedTherapist?.id,
          session_type: filter?.sessionType?.value,
          area_of_focus_ids: filter?.areaOfFocus
            ?.filter(aof => areaOfFocus?.includes(aof.value))
            ?.map(d => d?.value),
          slot_id: appointmentDetails?.selectedTime?.value?.id,
          therapy_type_id: filter?.therapyType?.value,
          dependents_ids: [],
          appointment_type_ids: data?.appointment_type?.map(at => at.value),
          appointment_reason: data?.reason_for_visit,
        },
        dependentData: dependentData,
        clientData: clientData,
      };
      const response = await createClient(appointmentData);
      const result: AppointmentBookedResponse = response?.data;
      onAppointmentBooked?.(result);

      //   setShowConfirmModal(false);
      // setOpenSuccessAppointmentModal(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  const removeDependentByIndex = (id: string) => {
    setDependentData(dependentData.filter(dependent => dependent.id !== id));
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-2 gap-y-5 gap-25px'>
        <InputField
          type='text'
          isRequired={true}
          label='First Name'
          labelClass='!text-base !leading-5'
          inputClass='!text-base !leading-5'
          placeholder='First Name'
          name='first_name'
          register={register}
          error={errors.first_name?.message}
        />

        <InputField
          type='text'
          label='Last Name'
          isRequired={true}
          labelClass='!text-base !leading-5'
          inputClass='!text-base !leading-5'
          placeholder='Last Name'
          name='last_name'
          register={register}
          error={errors.last_name?.message}
        />
        {/* Date Picker - Disabled */}
        <CustomDatePicker
          label='Date of Birth'
          name='dob'
          labelClass='!text-base !leading-5'
          selected={
            getValues('dob') && moment(getValues('dob')).isValid()
              ? moment(getValues('dob')).toDate()
              : ''
          }
          onChange={date => {
            setValue('dob', moment(date), { shouldValidate: true, shouldDirty: true });
          }}
          error={errors.dob?.message}
          maxDate={new Date()}
          isRequired={true}
          parentClassName=''
          className='!py-3'
        />
        <InputField
          type='email'
          label='Email'
          isRequired={true}
          labelClass='!text-base !leading-5'
          inputClass='!text-base !leading-5'
          parentClassName=''
          placeholder='Email'
          name='email'
          register={register}
          error={errors.email?.message}
        />

        {filter?.sessionType?.value === SessionType.CLINIC && (
          <CustomAsyncSelect
            loadOptions={(page, search) => {
              return getTherapistClinicAsync(page, search, selectedTherapist?.id);
            }}
            queryKey={therapistQueryKey.getTherapistClinic(selectedTherapist?.id || '')}
            label='Select Clinic Address'
            isClearable={true}
            placeholder={'Select clinic address'}
            labelClassName='!text-base !leading-5'
            StylesConfig={{
              control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
              singleValue: () => ({ fontSize: '16px' }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
            onChange={(e: { value: string; label: string }) => {
              setValue(
                'clinic',
                { id: e?.value, name: e?.label },
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              );
            }}
            error={errors.clinic?.id?.message || errors.clinic?.name?.message}
          />
        )}

        <PhoneField
          label='Contact Number'
          labelClass='!text-base !leading-5'
          value={getValues('phone') || ''}
          name='phone'
          onChange={formattedValue => {
            setValue('phone', formattedValue.replaceAll(' ', ''), {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          isRequired={true}
          error={errors.phone?.message}
          placeholder='Contact number'
          inputClass={` !text-base !leading-5 !p-3.5 `}
          buttonClass=''
        />

        <CustomAsyncSelect
          key={`appointment-type`}
          label='Appointment Type'
          isClearable={true}
          labelClassName='!text-base'
          loadOptions={(page, searchTerm) => getAmdAppointmentsTypesAsync(page, searchTerm)}
          queryKey={'get-amd-appointments-types'}
          pageSize={10}
          value={getValues('appointment_type')}
          onChange={value => {
            const selectedValues = value as unknown as MultiValue<SelectOption>;
            setValue('appointment_type', selectedValues, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          StylesConfig={{
            control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
            singleValue: () => ({ fontSize: '16px' }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
          isMulti
          isRequired
          error={errors.appointment_type?.message}
        />

        <div className='col-span-2 w-full'>
          <TextArea
            label='Reason for Visit'
            labelClass='!text-base !leading-5'
            name='reason_for_visit'
            value={getValues('reason_for_visit')}
            onChange={e => {
              setValue('reason_for_visit', e?.target?.value || '', {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            error={errors.reason_for_visit?.message}
          />
        </div>
      </div>
      <div className='flex flex-col gap-5'>
        <CheckboxField
          id='acceptTerms'
          name='acceptTerms'
          isDefaultChecked={getValues('acceptTerms')}
          register={register}
          label={<p>By ticking this box I agree that I have read the privacy Policy.</p>}
          parentClassName=''
          labelClass='text-black'
          error={errors.acceptTerms?.message}
        />
        {isDependent && (
          <Button
            variant='outline'
            title='Add Dependent'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            parentClassName=''
            onClick={() => {
              onContinue('create');
            }}
          />
        )}

        {dependentData.length > 0 && (
          <div className='grid grid-cols-2 gap-x-25px gap-y-5'>
            {dependentData.map((member, index) => (
              <div
                key={index}
                className='flex items-center gap-2.5 justify-between px-4 py-2 bg-white shadow-calenderheader rounded-xl border border-solid border-surface'
              >
                <div
                  className='flex items-center gap-2.5 w-[calc(100%-50px)] cursor-pointer'
                  onClick={() => onContinue('edit')}
                >
                  <div className='w-10 h-10 rounded-full bg-surface flex items-center justify-center text-base font-bold text-Primary uppercase'>
                    {member?.first_name?.[0]}
                    {member?.last_name?.[0]}
                  </div>
                  <p className='text-base font-normal text-blackdark truncate w-[calc(100%-50px)]'>
                    {member.first_name} {member.last_name}
                  </p>
                </div>
                <div className='w-10 h-10 flex items-center justify-center bg-red/20 text-red rounded-full cursor-pointer'>
                  <Icon
                    name='delete'
                    // onClick={() => setSelectedIds(prev => [...prev, member.id])}
                    // onClick={() => attachMemberHandler(member.id)}
                    onClick={() => removeDependentByIndex(member.id)}
                    className='icon-wrapper w-5 h-5'
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visit Reason */}
        <div className=''>
          <Button
            type='button'
            onClick={handleSubmit(handleConfirmAppointment)}
            variant='filled'
            title={'Submit'}
            className='w-full rounded-10px px-6 !font-bold'
            isDisabled={!watch('acceptTerms') || !isValid || isPending}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientQuickDetails;
