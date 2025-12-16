import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as yup from 'yup';

import { useGetAppointmentDetails, useUpdateAppointmentAdmin } from '@/api/appointment';
import { useGetAvailabilitySlots } from '@/api/availability';
import { getFieldOptionsAsync } from '@/api/field-option';
import { APPOINTMENT_STATUS_OPTIONS, AppointmentStatusLabels } from '@/constants/CommonConstant';
import { AppointmentStatus, FieldOptionType } from '@/enums';
import type { AppointmentDataType } from '@/features/admin/components/appointmentList/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';

interface AppointmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: AppointmentDataType;
}

interface FormData {
  date: string;
  time: string;
  slotId: string;
  clientName: string;
  therapistName: string;
  therapyType: { value: string; label: string };
  status: { value: string; label: string };
}

// Yup validation schema
const validationSchema = yup.object().shape({
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  slotId: yup.string().required('Slot ID is required'),
  clientName: yup.string().required('Client name is required'),
  therapistName: yup.string().required('Therapist name is required'),
  therapyType: yup
    .object()
    .shape({
      value: yup.string().required('Therapy type is required'),
      label: yup.string().required('Therapy type label is required'),
    })
    .required('Therapy type is required'),
  status: yup
    .object()
    .shape({
      value: yup.string().required('Status is required'),
      label: yup.string().required('Status label is required'),
    })
    .required('Status is required'),
});

const AppointmentEditModal = ({
  isOpen,
  onClose,
  selectedAppointment,
}: AppointmentEditModalProps) => {
  const user = useSelector(currentUser);
  const {
    mutateAsync: updateAppointment,
    isPending,
    isError: isUpdateError,
  } = useUpdateAppointmentAdmin();
  const {
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      date: moment(selectedAppointment.slot.start_time).format('YYYY-MM-DD'),
      time: '',
      slotId: '',
      clientName: '',
      therapistName: '',
      therapyType: { value: '', label: '' },
      status: { value: '', label: '' },
    },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  //state
  const [allAvailableDates, setAllAvailableDates] = useState<{ date: Date; className: string }[]>(
    []
  );

  const {
    data: appointmentDetails,
    dataUpdatedAt,
    isPending: getAppointmentDetailsPending,
  } = useGetAppointmentDetails(selectedAppointment.id);

  const { data: availabilitySlots } = useGetAvailabilitySlots({
    therapist_id: selectedAppointment.therapist.id,
    startDate: getValues('date') ? moment(getValues('date')).format('YYYY-MM-DD') : '',
    endDate: getValues('date') ? moment(getValues('date')).format('YYYY-MM-DD') : '',
    timeZone: user?.timezone || 'UTC',
    session_type: 'Virtual',
  });

  const availableTimeSlots = availabilitySlots?.data || [];

  const availableTimeOptions = availableTimeSlots
    .filter((slot: { id: string; start_time: string; status: string }) => {
      const currentDate = getValues('date');
      if (!currentDate) return false;
      const slotDate = moment(slot.start_time).format('YYYY-MM-DD');
      const selectedDate = moment(currentDate).format('YYYY-MM-DD');
      return slotDate === selectedDate && slot.status === 'Available';
    })
    .map((slot: { id: string; start_time: string; status: string }) => ({
      value: slot.start_time,
      label: moment.tz(slot.start_time, user?.timezone || 'UTC').format('h:mm A'),
      slotId: slot.id, // Include the slot ID
    }))
    .sort(
      (a: { value: string }, b: { value: string }) =>
        moment(a.value).valueOf() - moment(b.value).valueOf()
    );

  // Add current appointment slot if it exists and matches the selected date
  const currentSlotOption =
    appointmentDetails?.slot && getValues('date')
      ? {
          value: appointmentDetails.slot.start_time,
          label: moment
            .tz(appointmentDetails.slot.start_time, user?.timezone || 'UTC')
            .format('h:mm A'),
          slotId: appointmentDetails.slot.id,
        }
      : null;

  // Combine available slots with current slot (if it exists and matches date)
  const allTimeOptions =
    currentSlotOption &&
    moment(currentSlotOption.value).format('YYYY-MM-DD') ===
      moment(getValues('date')).format('YYYY-MM-DD')
      ? [currentSlotOption, ...availableTimeOptions]
      : availableTimeOptions;

  useEffect(() => {
    if (appointmentDetails) {
      const appointment = appointmentDetails;
      const mappedStatus = APPOINTMENT_STATUS_OPTIONS.find(opt => opt.value === appointment.status);

      setValue(
        'clientName',
        `${appointment.client.user.first_name} ${appointment.client.user.last_name}`,
        { shouldValidate: true }
      );
      setValue(
        'therapistName',
        `${appointment.therapist.user.first_name} ${appointment.therapist.user.last_name}`,
        { shouldValidate: true }
      );
      setValue('status', mappedStatus, { shouldValidate: true });
      setValue(
        'therapyType',
        { value: appointment.therapy_type.id, label: appointment.therapy_type.name },
        { shouldValidate: true }
      );
      setValue('time', appointment.slot?.start_time || '', { shouldValidate: true });
      setValue('slotId', appointment.slot?.id || '', { shouldValidate: true });
    }
  }, [dataUpdatedAt, setValue]);

  const statusOptions = [
    { value: AppointmentStatus.SCHEDULED, label: AppointmentStatusLabels.Scheduled },
    { value: AppointmentStatus.IN_PROGRESS, label: AppointmentStatusLabels.InProgress },
    { value: AppointmentStatus.COMPLETED, label: AppointmentStatusLabels.Completed },
    { value: AppointmentStatus.CANCELLED, label: AppointmentStatusLabels.Cancelled },
  ];

  const handleDateChange = (date: Date | string) => {
    const dateString = typeof date === 'string' ? date : date.toISOString();
    setValue('date', dateString, { shouldValidate: true });
    // Clear time and slotId when date changes
    setValue('time', '', { shouldValidate: true });
    setValue('slotId', '', { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    await updateAppointment({
      data: {
        status:
          data.status.value === AppointmentStatusLabels.Scheduled
            ? AppointmentStatus.SCHEDULED
            : data.status.value,
        therapy_type_id: data.therapyType.value,
        slot_id: data.slotId,
      },
      id: selectedAppointment.id,
    });
    if (!isUpdateError) {
      onClose();
    }
  };

  useEffect(() => {
    if (!availabilitySlots) return;
    // Extract available dates (fall back to empty array)
    const dates = availabilitySlots.availableDates;

    // Filter + transform valid dates
    const transformed = dates
      .filter((date: Date | string) => moment(date).isValid())
      .map((date: Date | string) => ({
        date: moment.utc(date).tz(user?.timezone).toDate(),
        className: 'available-slot',
      }));

    setAllAvailableDates(transformed);
  }, [availabilitySlots?.availableDates, user?.timezone]);

  return (
    // updated modal
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id='appointment-edit-modal'
      title='Edit Appointment'
      size='sm'
      closeButton={false}
      isLoading={getAppointmentDetailsPending}
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            type='button'
            variant='outline'
            title='Cancel'
            onClick={onClose}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            variant='filled'
            title='Save Changes'
            onClick={handleSubmit(onSubmit)}
            className='rounded-10px !leading-5 !px-6'
            isLoading={isPending}
          />
        </div>
      }
    >
      <div className='grid grid-cols-2 gap-5'>
        <InputField
          type='text'
          label='Client Name'
          labelClass='!text-base'
          value={getValues('clientName')}
          placeholder='Enter client name'
          isDisabled={true}
          error={errors.clientName?.message}
        />
        <CustomDatePicker
          label='Date'
          onMonthChange={date => {
            const startOfMonth = moment(date).startOf('month').format('YYYY-MM-DD');

            // Set new date
            setValue('date', startOfMonth, { shouldValidate: true });

            // Clear dependent fields
            setValue('time', '', { shouldValidate: true });
            setValue('slotId', '', { shouldValidate: true });
          }}
          selected={getValues('date') || new Date()}
          onChange={handleDateChange}
          placeholderText='Select date'
          className='w-full !py-3'
          customDateClasses={allAvailableDates}
          minDate={moment.tz(user?.timezone).startOf('day').toDate()}
          maxDate={moment.tz(user?.timezone).add(12, 'months').toDate()}
        />
        <Select
          label='Status'
          value={getValues('status')}
          portalRootId='appointment-edit-modal'
          onChange={option => {
            if (option && typeof option === 'object' && 'value' in option) {
              // const newStatus = option.value as string;
              setValue('status', option, { shouldValidate: true });
            }
          }}
          options={statusOptions}
          placeholder='Select status'
          className='w-full'
          error={errors.status?.message}
          labelClassName='!text-base'
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: '16px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />
        <InputField
          type='text'
          label='Therapist Name'
          labelClass='!text-base'
          value={getValues('therapistName')}
          placeholder='Enter therapist name'
          isDisabled={true}
        />
        <Select
          label='Time'
          portalRootId='appointment-edit-modal'
          value={
            getValues('time')
              ? {
                  value: getValues('time'),
                  label: moment.tz(getValues('time'), user?.timezone || 'UTC').format('h:mm A'),
                }
              : null
          }
          onChange={option => {
            if (option && typeof option === 'object' && 'value' in option) {
              setValue('time', option.value as string, { shouldValidate: true });
              // Also capture the slot ID
              if ('slotId' in option) {
                setValue('slotId', option.slotId as string, { shouldValidate: true });
              }
            }
          }}
          options={allTimeOptions}
          placeholder='Select time'
          className='w-full'
          isDisabled={!getValues('date') || allTimeOptions.length === 0}
          error={
            getValues('date') && allTimeOptions.length === 0
              ? 'No time slots available'
              : errors.time?.message
          }
          labelClassName='!text-base'
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: '16px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />
        <CustomAsyncSelect
          label='Therapy Type'
          labelClassName='!text-base'
          portalRootId='appointment-edit-modal'
          loadOptions={(page, searchTerm) =>
            getFieldOptionsAsync(FieldOptionType.THERAPY_TYPE, page, searchTerm)
          }
          queryKey={['therapy-types']}
          pageSize={10}
          value={getValues('therapyType')}
          onChange={value => {
            if (value && typeof value === 'object' && 'value' in value && 'label' in value) {
              setValue(
                'therapyType',
                { value: value.value as string, label: value.label as string },
                { shouldValidate: true }
              );
            } else {
              setValue('therapyType', { value: '', label: '' }, { shouldValidate: true });
            }
          }}
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: '16px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
          error={errors.therapyType?.message}
          isDisabled={true}
        />
      </div>
    </Modal>
  );
};

export default AppointmentEditModal;
