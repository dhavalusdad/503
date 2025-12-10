import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useCreateDemoRequest, useCreateSlotRequest } from '@/api/requestSlot';
import { useGetTherapistBasicDetailsInfo } from '@/api/therapist';
import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import { GENDER_OPTION } from '@/constants/CommonConstant';
import SuccessSlotRequestModal from '@/features/appointment/component/ClientAppointmentsBooking/SuccessSlotRequest';
import type { RequestSlotProps } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import { requestSlotSchema } from '@/features/appointment/component/ClientAppointmentsBooking/validationSchema';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';

interface ClientDetailsProps {
  selectedTherapist?: TherapistBasicDetails;
  onClose?: () => void;
  fromDashboard?: boolean;
  onSubmit?: (data: RequestSlotProps) => void;
}

const RequestSlot = ({
  selectedTherapist,
  onClose,
  fromDashboard = false,
  onSubmit,
}: ClientDetailsProps) => {
  const { mutateAsync: createDemoRequest, isPending: isDemoRequestPending } =
    useCreateDemoRequest();
  const { mutateAsync: createSlotRequest, isPending: isRequestingSlotPending } =
    useCreateSlotRequest();

  const intialValues: RequestSlotProps = {
    dob: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: null,
  };
  // Form setup with React Hook Form
  const methods = useForm<RequestSlotProps>({
    resolver: yupResolver(requestSlotSchema),
    defaultValues: intialValues,
  });
  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    // watch,
    reset,
    formState: { errors },
  } = methods;

  const navigate = useNavigate();
  const { id } = useParams();

  const [openSuccessAppointmentModal, setOpenSuccessAppointmentModal] = useState(false);

  let therapistData;
  if (!fromDashboard) {
    const { data } = useGetTherapistBasicDetailsInfo({
      therapist_id: id,
    });
    therapistData = data;
  }

  const userInfo = useSelector(currentUser);

  useEffect(() => {
    if (!fromDashboard) {
      reset({
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        email: userInfo.email,
      });
    }
  }, []);

  const handleConfirmAppointment = async (data: RequestSlotProps) => {
    try {
      const request = {
        ...data,
        therapist_id: fromDashboard ? selectedTherapist?.id : id,
      };

      if (!fromDashboard) {
        await createSlotRequest(request);
      } else {
        await createDemoRequest(request);
      }

      if (fromDashboard) {
        onSubmit(data);
      }
      setOpenSuccessAppointmentModal(true);
      //   const result: AppointmentBookedResponse = response.data;
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-25px'>
        <InputField
          type='text'
          inputClass='!text-base !leading-5'
          placeholder='First Name'
          name='first_name'
          register={register}
          error={errors.first_name?.message}
          readOnly={!fromDashboard}
        />
        <InputField
          type='text'
          inputClass='!text-base !leading-5'
          placeholder='Last Name'
          name='last_name'
          register={register}
          error={errors.last_name?.message}
          readOnly={!fromDashboard}
        />
        {/* Date Picker - Disabled */}
        <CustomDatePicker
          selected={
            getValues('dob') && moment(getValues('dob')).isValid()
              ? moment(getValues('dob')).toDate()
              : ''
          }
          onChange={date => {
            setValue('dob', moment(date), { shouldValidate: true });
          }}
          placeholderText='Select Date of birth'
          name='dob'
          error={errors.dob?.message}
          maxDate={new Date()}
          isRequired={true}
          className='!p-3'
        />
        <Select
          options={GENDER_OPTION}
          isRequired
          placeholder='Select Gender'
          error={errors?.gender?.message}
          name='gender'
          onChange={value => {
            if (value && 'value' in value) {
              setValue('gender', value.value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }}
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: '16px',
              lineHeight: '20px',
            }),
            placeholder: () => ({
              fontSize: '16px',
              lineHeight: '20px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
            menu: () => ({
              zIndex: '60',
            }),
          }}
        />
        <InputField
          type='email'
          inputClass='!text-base !leading-5'
          placeholder='Email'
          name='email'
          register={register}
          readOnly={!fromDashboard}
          error={errors.email?.message}
        />
        {/* Time Input Field  */}
        <PhoneField
          value={getValues('phone') || ''}
          name='phone'
          inputClass={` !text-base !leading-5`}
          country='us'
          onChange={formattedValue => {
            setValue('phone', formattedValue, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          enableSearch={true}
          error={errors.phone && errors.phone.message}
          isReadOnly={false}
          isModal={false}
          placeholder='Phone no.'
        />
        {/* Visit Reason */}
      </div>
      <h3 className='text-lg leading-6 font-bold text-blackdark'>Insurance Details (optional)</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-25px'>
        <InputField
          type='text'
          inputClass='!text-base !leading-5'
          placeholder='Insurance Provider'
          name='insurance_provider'
          register={register}
          error={errors.insurance_provider?.message}
        />
        <InputField
          type='text'
          inputClass='!text-base !leading-5'
          placeholder='Insurance ID'
          name='insurance_id'
          register={register}
          error={errors.insurance_id?.message}
        />
      </div>
      <h3 className='text-lg leading-6 font-bold text-blackdark'>Preferred Time (optional)</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-25px'>
        <CustomDatePicker
          selected={
            getValues('preferred_time') && moment(getValues('preferred_time')).isValid()
              ? moment(getValues('preferred_time')).toDate()
              : ''
          }
          onChange={date => {
            setValue('preferred_time', moment(date).utc().toDate(), { shouldValidate: true });
          }}
          placeholderText='Select Preferred Time'
          name='preferred_time'
          error={errors.preferred_time?.message}
          minDate={new Date()}
          isRequired={true}
          className='!p-3'
          dateFormat='MMMM d, yyyy h:mm aa'
          showTimeSelect={true}
          timeIntervals={30} // interval minutes - default 30
          timeCaption='Time' // Custom time section caption
        />
      </div>
      {fromDashboard ? (
        <div className='flex items-center gap-5 justify-end pt-5 border-t border-solid border-surface'>
          <Button
            onClick={onClose}
            variant='outline'
            title={'Cancel'}
            className='rounded-10px !px-6 !font-bold'
          />
          <Button
            onClick={handleSubmit(handleConfirmAppointment)}
            variant='filled'
            title={'Submit'}
            className='rounded-10px !px-6 !font-bold'
            isLoading={isDemoRequestPending}
          />
        </div>
      ) : (
        <div className='flex items-center justify-end gap-5 pt-5 border-t border-solid border-surface'>
          <Button
            variant='outline'
            title='Cancel'
            className='rounded-10px !px-6 !font-bold'
            onClick={() => navigate(-1)}
          />
          <Button
            onClick={handleSubmit(handleConfirmAppointment)}
            variant='filled'
            title={'Submit'}
            className='rounded-10px !px-6 !font-bold'
            isLoading={isRequestingSlotPending}
          />
        </div>
      )}
      {openSuccessAppointmentModal && (
        <SuccessSlotRequestModal
          isOpen={openSuccessAppointmentModal}
          onClose={() => setOpenSuccessAppointmentModal(false)}
          closeButton={true}
          selectedTherapist={therapistData?.data}
          preferredTime={getValues('preferred_time')}
        />
      )}
    </div>
  );
};

export default RequestSlot;
