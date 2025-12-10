import { useEffect } from 'react';

import {
  useGetAmdForm,
  useGetFormValue,
  useCreateAmdIntakeForm,
  useUpdateAmdIntakeFormResponse,
} from '@/api/ amdForm';
import type { AppointmentDetailsResponse } from '@/api/types/calendar.dto';
import { useJsonToHtmlForm } from '@/features/IntakeForm/hooks/useJsonToHtmlForm';
import type { FormStructure } from '@/features/IntakeForm/types';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import Modal from '@/stories/Common/Modal';

export const IntakeFormModal = ({
  isOpen,
  onClose,
  appointment,
  intakeFormName,
}: {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentDetailsResponse;
  intakeFormName: string;
}) => {
  const { data: formValueFromApi, isPending: isFormValueLoading } = useGetFormValue(
    appointment?.amd_appointment_id || ''
  );

  const {
    data: formDataFromApi,
    isPending: isFormDataLoading,
    error: formDataError,
  } = useGetAmdForm({ formName: intakeFormName });
  const {
    formData: formStructureData,
    generateFormSections,
    resetForm,
    // validateForm,
  } = useJsonToHtmlForm(
    formDataFromApi?.data?.form_json as FormStructure,
    formValueFromApi?.data?.note?.at(-1)?.pages[0]?.fields
  );
  const updateAmdForm = useUpdateAmdIntakeFormResponse();
  const createAmdForm = useCreateAmdIntakeForm({ close: onClose });

  const flatFormStructureData = (
    Array.isArray(formStructureData.sections) ? formStructureData.sections : []
  )
    .flatMap(section => section.fields ?? [])
    .flatMap(field => (field.section_id ? (field.fields ?? []) : [field]));

  const onSubmit = () => {
    // if (validateForm())  {
    const data = {
      form_name: formDataFromApi?.data?.form_json.form_name || '',
      amd_appointment_id: appointment?.amd_appointment_id || '',
      amd_patient_id: appointment?.amd_patient_id || '',
      amd_therapist_id: appointment?.amd_therapist_id || '',
      response_json: flatFormStructureData,
    };
    if (formValueFromApi?.data?.note?.at(-1)?.id) {
      updateAmdForm.mutate(
        {
          ...data,
          note_id: formValueFromApi?.data?.note?.at(-1)?.id || '',
        },
        formValueFromApi?.data?.note?.at(-1)?.id || ''
      );
    } else {
      createAmdForm.mutate(data);
    }
    // }
  };

  useEffect(() => {
    if (formDataError) {
      showToast('Failed to load form', 'ERROR');
      onClose();
    }
  }, [formDataError]);

  useEffect(() => {
    return () => resetForm();
  }, []);

  return (
    <Modal
      title={formStructureData.form_title}
      titleClassName='text-2xl !font-bold !text-gray-900 form-header'
      subTitle={formStructureData.form_description}
      isOpen={isOpen}
      size='3xl'
      onClose={() => {
        resetForm();
        onClose();
      }}
      footer={
        <div className='flex justify-end gap-3'>
          <Button
            onClick={() => {
              resetForm();
              onClose();
            }}
            variant='outline'
            className='w-full rounded-10px'
            title='Cancel'
          />
          <Button
            onClick={onSubmit}
            variant='filled'
            className='w-full rounded-10px'
            title={formValueFromApi?.data?.note?.at(-1)?.id ? 'Update' : 'Submit'}
            isLoading={updateAmdForm.isPending || createAmdForm.isPending}
          />
        </div>
      }
    >
      {isFormValueLoading || isFormDataLoading ? (
        <div className='flex justify-center items-center h-full'>
          <SectionLoader />
        </div>
      ) : (
        <div className={`intake-form-container `}>
          <div className=' space-y-6'>{generateFormSections()}</div>
        </div>
      )}
    </Modal>
  );
};
