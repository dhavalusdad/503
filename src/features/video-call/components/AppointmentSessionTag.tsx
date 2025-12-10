import { useMemo, useEffect, useRef } from 'react';

import { useForm } from 'react-hook-form';

import { useAssignAndRemoveSessionTagOptions, useInfiniteSessionTagQuery } from '@/api/video-call';
import { TagType } from '@/enums';
import CheckboxField from '@/stories/Common/CheckBox';

export interface InfiniteSessionTagPageResponse {
  data: { id: string; name: string; select?: boolean; canDelete?: boolean }[];
  total: number;
  hasMore: boolean;
}

export interface InfiniteWidgetQueryResponse {
  pages: InfiniteSessionTagPageResponse[];
  pageParams: number[];
}

interface FormData {
  sessionTagIds: string[];
}

const AppointmentSessionTag = ({ appointment_id }: { appointment_id: string }) => {
  const {
    data: sessionTagData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSessionTagQuery({
    type: TagType.SESSION_TAG,
    appointment_id,
  });
  // const x = useQueryClient();
  // console.log('11221', x.getQueriesData({ queryKey: ['getSessionTagWithSelectList'] }));
  // const { removeQuery } = useRemoveQueries();

  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { mutate: createAndRemoveSessionTag } = useAssignAndRemoveSessionTagOptions();

  const { register, setValue, watch } = useForm<FormData>({
    defaultValues: {
      sessionTagIds: [],
    },
    mode: 'onChange',
  });

  // useEffect(()=>{
  //   console.log("remove query");
  //     return ()=>{
  //       removeQuery(tagQueryKey.getSessionTagWithSelectList())
  //     }
  // },[])

  const sessionTagIds = watch('sessionTagIds');
  const WidgetList = useMemo(() => {
    const sessionTags =
      (sessionTagData as InfiniteWidgetQueryResponse)?.pages?.flatMap(page => page.data || []) ||
      [];

    const selectedIds = sessionTags
      .filter(session_tag => session_tag.select)
      .map(session_tag => session_tag.id);
    setValue('sessionTagIds', selectedIds);
    return sessionTags;
  }, [sessionTagData, setValue]);

  useEffect(() => {
    const loaderEl = loaderRef.current;
    const scrollEl = scrollContainerRef.current;

    if (!loaderEl || !scrollEl || !hasNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollEl,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(loaderEl);

    return () => {
      if (loaderEl) observer.unobserve(loaderEl);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, sessionTagData]);

  const handleCheckboxChange = async (
    session_tag_id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const payload = {
      appointment_id: appointment_id,
      session_tag_id,
      isDeleted: !event.target.checked,
    };
    // console.log(session_tag_id, 'seee id');
    //     x.setQueriesData({queryKey:['getSessionTagWithSelectList']}, (response)=>{
    //       console.log(response,"res");
    //       const updated = {
    //         ...response,
    //         pages:response.pages.map(page => ({
    //       ...page,
    //       data: page.data.map(item =>
    //         item.id === session_tag_id ? { ...item, select: !event.target.checked } : item
    //       ),
    //     })),
    //       }

    // console.log(updated,"uppppppppppp");
    //       return updated
    //     })
    // console.log('Payload sent to mutation:', payload);
    await createAndRemoveSessionTag({
      data: payload,
    });
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        className='max-h-80 overflow-y-auto mt-2.5 bg-white scroll-disable'
      >
        <div className='flex flex-col gap-3'>
          {WidgetList.map(widget => (
            <div
              key={widget.id}
              className='p-4 border border-solid border-surface rounded-md bg-surface/50'
            >
              <CheckboxField
                id=''
                label={widget.name}
                name='sessionTagIds'
                value={widget.id}
                register={register}
                isChecked={sessionTagIds.includes(widget.id)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCheckboxChange(widget.id, e)
                }
                labelClass='whitespace-nowrap'
              />
            </div>
          ))}
        </div>
        {(hasNextPage || isFetchingNextPage) && (
          <div ref={loaderRef} className='flex justify-center items-center py-4 min-h-50px'>
            {isFetchingNextPage ? (
              <div className='flex items-center gap-2'>
                <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary'></div>
                <span className='text-sm text-primarygray font-normal leading-5'>
                  Loading more sessionTags...
                </span>
              </div>
            ) : (
              <span className='text-sm text-primarygray font-normal leading-5'>
                Scroll to load more...
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentSessionTag;
