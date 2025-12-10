import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { formsQueryKey } from '@/api/common/assessment-form.queryKey';
import { ROUTES } from '@/constants/routePath';
import { FormStatusType } from '@/enums';
import { useGetInfiniteUserAssessment } from '@/features/video-call/hooks/useGetInfiniteUserAssessment';
import { redirectTo } from '@/helper/redirect';
import Icon from '@/stories/Common/Icon';

export const PendingTask = ({
  appointmentId,
  handleData = undefined,
  userId,
  tenant_id,
}: {
  appointmentId: string;
  handleData?: (data: number) => void;
  userId?: string;
  tenant_id: string;
}) => {
  const queryClient = useQueryClient();

  const { loaderRef, data, total, isLoading, dataUpdatedAt } = useGetInfiniteUserAssessment({
    page: 1,
    limit: 5,
    filters: {
      status: [{ value: FormStatusType.PENDING, label: FormStatusType.PENDING }],
    },
    appointment_id: appointmentId,
    user_id: userId,
    tenant_id,
  });

  const handelOpenForm = (d: { id: string; token?: string }) => {
    const url = `${ROUTES.PUBLIC_FORM.navigatePath(d.id)}?token=${d?.token}&appointment_id=${appointmentId}`;
    redirectTo(url, { isNewTab: true });
  };

  useEffect(() => {
    if (!isLoading) {
      handleData?.(total);
    }
  }, [dataUpdatedAt, total, isLoading]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({
          queryKey: formsQueryKey.getList(appointmentId),
        });
        if (total > 0) handleData?.(total);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className='flex flex-col gap-5'>
      {/* Intake Form Card */}
      {Array.isArray(data) &&
        data.map((d: { id: string; token?: string; form_title?: string }, i) => (
          <>
            <div
              ref={data.length - 1 == i ? loaderRef : null}
              onClick={() => handelOpenForm(d)}
              className='w-full bg-Gray rounded-2xl p-2.5 sm:p-5 border border-solid border-surface cursor-pointer'
            >
              <div className='flex items-center gap-2.5 sm:gap-4 w-full justify-between'>
                <div className='flex items-start gap-3 sm:flex-1'>
                  <Icon
                    name='file'
                    className='text-primary mt-1 icon-wrapper w-5 h-5 sm:w-7 sm:h-7'
                  />
                  <div className='flex flex-col gap-1.5 flex-1 sm:flex-auto'>
                    <h3 className='text-sm sm:text-base font-semibold text-blackdark leading-5'>
                      {d.form_title}
                    </h3>
                    <p className='text-13px sm:text-sm text-primarygray leading-5 font-normal'>
                      This is the Pre-Session Assessment Form
                    </p>
                  </div>
                </div>
                <Icon name='calendarRightArrow' />
              </div>
            </div>
          </>
        ))}

      {isLoading && (
        <div className='mt-6 flex justify-center items-center py-8 gap-3'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <span className='text-primarygray'>Fetching Forms...</span>
        </div>
      )}
      {/* Insurance Card */}
      {/* <div className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-3">
          <Icon name='file' />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-1">Insurance Card</h3>
                <p className="text-gray-600 text-sm">
                  Upload you Insurance Card
                </p>
              </div>
            </div>
            <Icon name="calendarRightArrow" className="w-6 h-6 flex-shrink-0" />
          </div>
        </div> */}
    </div>
  );
};
