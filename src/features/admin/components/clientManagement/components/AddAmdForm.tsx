import { useState, type Dispatch, type SetStateAction } from 'react';

import { useSelector } from 'react-redux';

import { useAssignAmdForm, useGetAllAmdForms } from '@/api/ amdForm';
import { getClientAppointmentsAsync } from '@/api/appointment';
import { selectStyles } from '@/constants/CommonConstant';
import { AmdFormDocNames } from '@/enums';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Modal from '@/stories/Common/Modal';
import Select, { CustomAsyncSelect, type SelectOption } from '@/stories/Common/Select';

type AddAmdFormsModalProps = {
  clientId: string;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  isModalOpen: boolean;
  appointment_id?: string;
};

const AddAmdFormsModal = ({
  clientId,
  isModalOpen,
  appointment_id: appointmentId,
  setIsModalOpen,
}: AddAmdFormsModalProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<SelectOption | null>(null);
  const [selectedForm, setSelectedForm] = useState<SelectOption | null>(null);
  const assignAmdForm = useAssignAmdForm({ close: () => setIsModalOpen(false) });

  const { data: formsResponse } = useGetAllAmdForms();
  const { timezone: userTimezone } = useSelector(currentUser);

  const handleSubmit = () => {
    const appointment_id =
      appointmentId ||
      (AmdFormDocNames.SAFETY_PLAN !== selectedForm?.label
        ? (selectedAppointment?.value as string)
        : null);
    const form_id = (selectedForm?.value as string) || '';
    const patient_id = clientId;

    assignAmdForm.mutate({
      form_id,
      patient_id,
      ...(appointment_id && { appointment_id }),
    });
    setSelectedAppointment(null);
    setSelectedForm(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedForm(null);
  };

  const formOptions = Array.isArray(formsResponse?.data)
    ? formsResponse?.data.map(form => ({
        value: form.id,
        label: form.name,
      }))
    : [];

  return (
    <Modal
      title='Add AMD Note'
      isOpen={isModalOpen}
      onClose={handleCancel}
      size='xs'
      contentClassName='pt-30px '
      closeButton={false}
      id='add-amd-note-modal'
      footerClassName='flex justify-end gap-5'
      footer={
        <>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='!px-6 rounded-lg'
            title='Cancel'
          />
          <Button
            variant='filled'
            onClick={handleSubmit}
            isDisabled={
              !selectedForm ||
              (AmdFormDocNames.SAFETY_PLAN !== selectedForm?.label
                ? !appointmentId
                  ? !selectedAppointment
                  : !appointmentId
                : false)
            }
            className='!px-6 rounded-lg'
            title='Assign'
          />
        </>
      }
    >
      <div className='flex flex-col gap-5 '>
        <Select
          label='AMD Note'
          placeholder='Select Note'
          options={formOptions}
          value={selectedForm}
          onChange={option => setSelectedForm(option as SelectOption)}
          isRequired
          isClearable
          isSearchable
          portalRootId='add-amd-note-modal'
          StylesConfig={selectStyles}
          labelClassName='!text-base'
        />
        {!appointmentId && AmdFormDocNames.SAFETY_PLAN !== selectedForm?.label && (
          <CustomAsyncSelect
            label='Client Appointment'
            placeholder='Select Appointment'
            queryKey={['therapist-appointments-list']}
            loadOptions={(page, searchTerm) =>
              getClientAppointmentsAsync(page, searchTerm, clientId, userTimezone)
            }
            value={selectedAppointment}
            onChange={option => setSelectedAppointment(option as SelectOption)}
            isClearable={true}
            autoFocus
            isSearchable={true}
            cacheOptions={false}
            loadingMessage='Loading appointments...'
            noOptionsMessage='No appointments found'
            loadingMoreMessage='Loading more appointments...'
            searchDebounceMs={300}
            portalRootId='add-amd-note-modal'
            StylesConfig={selectStyles}
            labelClassName='!text-base'
          />
        )}
      </div>
    </Modal>
  );
};

export default AddAmdFormsModal;
