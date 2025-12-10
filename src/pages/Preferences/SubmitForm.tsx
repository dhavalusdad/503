import { useNavigate, useParams } from 'react-router-dom';

import { useCreateFormResponse, useGetAssessmentFormDetails } from '@/api/assessment-forms';
import DataNotFound from '@/components/common/DataNotFound';
import { ROUTES } from '@/constants/routePath';
import FormPreview from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import type { DynamicFormResponse } from '@/features/admin/components/DynamicFormBuilder/types';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const submitForm = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();

  const { data: formResponse, isLoading } = useGetAssessmentFormDetails(id);
  const { mutateAsync: submitResponse } = useCreateFormResponse();

  const handleFormSubmit = (args: DynamicFormResponse) => {
    submitResponse({ id: id, ...args });
    navigate(ROUTES.SESSION_DOCUMENTS.path);
  };

  const handleCancel = () => {
    navigate(ROUTES.SESSION_DOCUMENTS.path);
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!formResponse) {
    return <DataNotFound />;
  }

  return (
    <FormPreview
      formData={formResponse}
      formDataLoading={isLoading}
      handleOnSubmit={handleFormSubmit}
      handleOnCancel={handleCancel}
    />
  );
};

export default submitForm;
