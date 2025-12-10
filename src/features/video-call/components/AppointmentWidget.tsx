import { useMemo, useEffect, useRef } from 'react';

import { useForm } from 'react-hook-form';

import { useInfiniteWidgetsQuery } from '@/api/video-call';
import { FieldOptionType } from '@/enums';

export interface InfiniteWidgetPageResponse {
  data: { id: string; name: string; select?: boolean; canDelete?: boolean }[];
  total: number;
  hasMore: boolean;
}

export interface InfiniteWidgetQueryResponse {
  pages: InfiniteWidgetPageResponse[];
  pageParams: number[];
}

interface FormData {
  widgetIds: string[];
}

const AppointmentWidget = ({ appointment_id }: { appointment_id: string }) => {
  const {
    data: widgetData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteWidgetsQuery({
    type: FieldOptionType.WIDGET_TYPE,
    appointment_id,
  });

  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { setValue } = useForm<FormData>({
    defaultValues: {
      widgetIds: [],
    },
    mode: 'onChange',
  });

  const WidgetList = useMemo(() => {
    const widgets =
      (widgetData as InfiniteWidgetQueryResponse)?.pages?.flatMap(page => page.data || []) || [];

    const selectedIds = widgets.filter(widget => widget.select).map(widget => widget.id);
    setValue('widgetIds', selectedIds);
    return widgets;
  }, [widgetData, setValue]);

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: scrollContainerRef.current, rootMargin: '0px', threshold: 1.0 }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={scrollContainerRef}
      className='max-h-80 overflow-y-auto mt-2.5 bg-white scroll-disable'
    >
      <div className='flex flex-col gap-3'>
        {WidgetList.length > 0
          ? WidgetList.map(widget => (
              <div
                key={widget.id}
                className='p-4 border border-solid border-surface rounded-md bg-surface/50'
              >
                <span className='text-sm text-blackdark font-normal leading-5'>{widget.name}</span>
              </div>
            ))
          : 'NO available data'}
      </div>
      {(hasNextPage || isFetchingNextPage) && (
        <div ref={loaderRef} className='flex justify-center items-center py-4 min-h-50px'>
          {isFetchingNextPage ? (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary'></div>
              <span className='text-sm text-primarygray font-normal leading-5'>
                Loading more widgets...
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
  );
};

export default AppointmentWidget;
