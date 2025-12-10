import { useGetUserFormResponse } from '@/api/assessment-forms';
import FormPreview from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import Modal from '@/stories/Common/Modal';

const PreviewAssessmentForm = ({
  isOpen,
  onClose,
  selectedAssessmentForm,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAssessmentForm: { id: string } | null;
}) => {
  const { data, isLoading } = useGetUserFormResponse(selectedAssessmentForm?.id || '');
  return (
    <>
      <Modal
        isOpen={isOpen}
        title='Pending Task'
        onClose={onClose}
        titleClassName='!font-bold font-Nunito text-2xl '
        contentClassName='!p-0 '
        size='lg'
      >
        <div className='pt-4'>
          {isLoading ? (
            <SectionLoader />
          ) : (
            <FormPreview formData={data?.response_obj} readOnly={true} />
          )}
          {/* <PendingTask appointmentId={appointmentId} handleData={handleData} /> */}
        </div>
      </Modal>
    </>
  );
};

export default PreviewAssessmentForm;
