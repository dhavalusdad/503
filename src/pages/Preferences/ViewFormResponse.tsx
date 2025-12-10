import { useParams } from 'react-router-dom';

import { useGetUserFormResponse } from '@/api/assessment-forms';
import DataNotFound from '@/components/common/DataNotFound';
import FormPreview from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const ViewFormResponse = () => {
  const { editId = '' } = useParams();
  const { data: formResponse, isLoading } = useGetUserFormResponse(editId);

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!formResponse) {
    return <DataNotFound />;
  }

  return <FormPreview formData={formResponse.response_obj} readOnly={true} />;
};

export default ViewFormResponse;
