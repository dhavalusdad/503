import { useNavigate, useParams } from 'react-router-dom';

import { useGetUserFormResponse, useUpdateFormResponse } from '@/api/assessment-forms';
import { ROUTES } from '@/constants/routePath';
import FormPreview from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import type { DynamicFormResponse } from '@/features/admin/components/DynamicFormBuilder/types';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const EditFormResponse = () => {
  const navigate = useNavigate();
  const { editId = '' } = useParams();

  const { data: formResponse, isLoading, isFetching } = useGetUserFormResponse(editId);
  const { mutateAsync: updateResponse } = useUpdateFormResponse();

  const handleFormSubmit = (args: DynamicFormResponse) => {
    updateResponse({ ...args, id: editId });
    navigate(ROUTES.SESSION_DOCUMENTS.path);
  };

  const handleCancel = () => {
    navigate(ROUTES.SESSION_DOCUMENTS.path);
  };

  if (isLoading || isFetching) {
    return <SectionLoader />;
  }

  return (
    <FormPreview
      formData={formResponse.response_obj}
      formDataLoading={isLoading}
      handleOnSubmit={handleFormSubmit}
      handleOnCancel={handleCancel}
    />
  );
};

export default EditFormResponse;
