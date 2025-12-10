import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  useGetAmdForm,
  useGetFormValue,
  useCreateAmdIntakeForm,
  useUpdateAmdIntakeFormResponse,
} from '@/api/ amdForm';
import { amdFormQueryKeys } from '@/api/common/amd.query';
import { useJsonToHtmlForm } from '@/features/IntakeForm/hooks/useJsonToHtmlForm';
import type { FormStructure } from '@/features/IntakeForm/types';
import { showToast } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const IntakeFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useSelector(currentUser);

  const searchParams = new URLSearchParams(location.search);
  const formName = searchParams.get('formName') || '';
  const amd_appointment_id = searchParams.get('amd_appointment_id') || '';
  const amd_patient_id = searchParams.get('amd_patient_id') || '';
  const patient_id = searchParams.get('patient_id') || '';
  const therapist_id = searchParams.get('therapist_id') || '';
  const ehr_note_id = searchParams.get('ehr_note_id') || '';
  const assign_id = searchParams.get('assign_id');

  const {
    data: formDataFromApi,
    isPending: isFormDataLoading,
    isError,
  } = useGetAmdForm({ formName });

  const templateId =
    (formDataFromApi?.data?.form_json as FormStructure)?.metadata?.template_id || '';

  const { data: formValueFromApi, isPending: loadingValue } = useGetFormValue({
    patientId: amd_patient_id,
    templateId,
    ehrNoteId: ehr_note_id,
    clientId: patient_id,
    therapist_id,
    user_id: id,
  });

  const {
    formData: formStructureData,
    generateFormSections,
    resetForm,
  } = useJsonToHtmlForm(
    (formDataFromApi?.data?.form_json as FormStructure) || ({} as FormStructure),
    formValueFromApi?.data?.note?.at(-1)?.pages[0]?.fields
  );

  const updateAmdForm = useUpdateAmdIntakeFormResponse();
  const createAmdForm = useCreateAmdIntakeForm({ close: () => navigate(-1) });

  const flatFormStructureData = (
    Array.isArray(formStructureData.sections) ? formStructureData.sections : []
  )
    .flatMap(section => section.fields ?? [])
    .flatMap(field => (field.section_id ? (field.fields ?? []) : [field]));

  const onSubmit = () => {
    const data = {
      form_name: formDataFromApi?.data?.form_json?.form_name || formName,
      amd_appointment_id: amd_appointment_id || '',
      patient_id: patient_id || '',
      therapist_id: therapist_id || '',
      response_json: flatFormStructureData,
    };
    if (ehr_note_id) {
      updateAmdForm.mutate(
        {
          ...data,
          note_id: ehr_note_id || '',
        },
        formValueFromApi?.data?.note?.at(-1)?.id || ''
      );
    } else {
      createAmdForm.mutate({ ...data, id: assign_id || '' });
    }
  };

  const handleCancel = () => {
    resetForm();
    if (formName) {
      queryClient.removeQueries({ queryKey: amdFormQueryKeys.form(formName) });
    }
    if (amd_appointment_id) {
      queryClient.removeQueries({ queryKey: amdFormQueryKeys.formValue(amd_appointment_id) });
    }
    navigate(-1);
  };

  useEffect(() => {
    if (!formName || !patient_id || !therapist_id) {
      showToast('Missing required parameters', 'ERROR');
      resetForm();
      navigate(-1);
    }
  }, [formName, amd_appointment_id, patient_id, therapist_id]);

  useEffect(() => {
    if (isError) {
      showToast('Failed to load form', 'ERROR');
      resetForm();
      navigate(-1);
    }
  }, [isError]);

  useEffect(() => {
    return () => {
      resetForm();
      if (formName) {
        queryClient.removeQueries({ queryKey: amdFormQueryKeys.form(formName) });
      }
      if (amd_appointment_id) {
        queryClient.removeQueries({ queryKey: amdFormQueryKeys.formValue(amd_appointment_id) });
      }
    };
  }, [formName, amd_appointment_id]);

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-2.5 mb-5'>
        <h2 className='text-2xl font-bold text-blackdark leading-6'>
          {formStructureData.form_title}
        </h2>
        {formStructureData.form_description && (
          <p className='text-blackdark text-base leading-22px'>
            {formStructureData.form_description}
          </p>
        )}
      </div>

      {!!(loadingValue && ehr_note_id) || isFormDataLoading ? (
        <div className='flex justify-center items-center h-full'>
          <SectionLoader />
        </div>
      ) : (
        <div className='flex flex-col gap-5 max-h-[calc(100dvh-310px)] overflow-y-auto pr-1'>
          {generateFormSections()}
        </div>
      )}

      <div className='flex items-center justify-end gap-5 mt-5'>
        <Button onClick={handleCancel} variant='outline' className='rounded-10px' title='Cancel' />
        <Button
          onClick={onSubmit}
          variant='filled'
          className='rounded-10px'
          title={ehr_note_id ? 'Update' : 'Submit'}
          isLoading={updateAmdForm.isPending || createAmdForm.isPending}
        />
      </div>
    </div>
  );
};

export default IntakeFormPage;
