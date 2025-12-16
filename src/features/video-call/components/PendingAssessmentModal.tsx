import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

import { formsQueryKey } from '@/api/common/assessment-form.queryKey';
import PreviewAssessmentForm from '@/features/video-call/components/PreviewAssessmentForm';
import { useGetInfiniteUserAssessment } from '@/features/video-call/hooks/useGetInfiniteUserAssessment';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

const PendingAssessmentModal = ({
  isOpen,
  onClose,
  userId,
  appointmentId,
  tenant_id,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  appointmentId: string;
  tenant_id: string;
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading, loaderRef } = useGetInfiniteUserAssessment({
    page: 1,
    limit: 10,
    user_id: userId,
    include_dependent: true,
    filters: {},
    appointment_id: appointmentId,
    tenant_id,
  });

  const [isPreviewAssessmentFormOpen, setIsPreviewAssessmentFormOpen] = useState(false);

  const [selectedAssessmentForm, setSelectedAssessmentForm] = useState<{ id: string } | null>(null);
  // Status Tag Component
  const StatusTag = ({ submittedAt }: { submittedAt: string | null }) => {
    const isSubmitted = submittedAt !== null;
    const tagText = isSubmitted ? 'Submitted' : 'Pending';
    const tagClass = clsx(
      'px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-13px leading-18px font-semibold transition-all duration-200',
      isSubmitted
        ? 'bg-green-100 text-green-600 border border-green-300'
        : 'bg-yellow-100 text-yellow-600 border border-yellow-300'
    );

    return <span className={tagClass}>{tagText}</span>;
  };

  const handelRefreshData = () => {
    queryClient.invalidateQueries({
      queryKey: formsQueryKey.getList(),
    });
  };

  return (
    <>
      {/* updated modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title='Pending Assessment Forms'
        isLoading={isLoading}
        contentClassName='!p-5'
        parentTitleClassName='!p-5'
        titleClassName='truncate'
        size='lg'
        footerClassName='!p-5 !pt-0 flex justify-end gap-5'
        footer={
          <Button
            type='button'
            variant='outline'
            title='Refresh List'
            isIconFirst
            onClick={handelRefreshData}
            className=' rounded-10px !leading-5'
          />
        }
      >
        {Array.isArray(data) && data.length ? (
          <div className='flex flex-col gap-5'>
            {data.map(
              (
                d: {
                  form_title: string;
                  submitted_at: string | null;
                  id: string;
                  form: { form_category: string };
                },
                i
              ) => (
                <div
                  ref={data.length - 1 == i ? loaderRef : null}
                  key={d.id}
                  className='w-full bg-Gray rounded-2xl p-2.5 sm:p-5 border border-solid border-surface'
                  onClick={() => {
                    if (d.submitted_at) {
                      setIsPreviewAssessmentFormOpen(true);
                      setSelectedAssessmentForm(d);
                    }
                  }}
                >
                  <div className='flex items-start flex-wrap gap-2.5 sm:gap-4 w-full justify-between'>
                    <div className='flex items-start sm:flex-1 gap-3'>
                      <Icon
                        name='file'
                        className='text-primary mt-1 icon-wrapper w-5 h-5 sm:w-7 sm:h-7'
                      />
                      <div className='flex flex-col gap-1.5 flex-1 sm:flex-auto'>
                        <h3 className='text-sm sm:text-base font-semibold text-blackdark leading-5'>
                          {d.form_title}{' '}
                          {d.form.form_category && (
                            <span className='inline-block bg-primary/20 text-primary text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full'>
                              {d.form.form_category}
                            </span>
                          )}
                        </h3>

                        <p className='text-13px sm:text-sm text-primarygray leading-5 font-normal'>
                          {/* This is the Pre-Session Assessment Form */}
                          {[d?.assignedUser.first_name, d?.assignedUser?.last_name].join(' ')}
                        </p>
                      </div>
                    </div>
                    <StatusTag submittedAt={d.submitted_at} />
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <>
            <div className='text-center text-primarygray text-xl font-semibold py-10'>
              <p>No assessment forms available.</p>
            </div>
          </>
        )}
      </Modal>
      {isPreviewAssessmentFormOpen && (
        <PreviewAssessmentForm
          isOpen={isPreviewAssessmentFormOpen}
          onClose={() => {
            setIsPreviewAssessmentFormOpen(false);
            setSelectedAssessmentForm(null);
            // onClose();
          }}
          selectedAssessmentForm={selectedAssessmentForm}
        />
      )}
    </>
  );
};

export default PendingAssessmentModal;
