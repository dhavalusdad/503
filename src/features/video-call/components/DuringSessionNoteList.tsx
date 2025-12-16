import { useMemo, useEffect, useRef } from 'react';

import { useInfiniteNotesByAppointment } from '@/api/note';
import { NoteType } from '@/enums';

export interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  is_draft: boolean;
  appointment: {
    id: string;
    slot_id: string;
    slot: {
      start_time: string;
      end_time: string;
    };
  };
}

interface InfiniteNotePageResponse {
  items: Note[];
  total: number;
  nextPage: number | undefined;
}

interface InfiniteNoteQueryResponse {
  pages: InfiniteNotePageResponse[];
  pageParams: number[];
}

interface DuringSessionNoteListProps {
  appointment_id: string;
  tenant_id: string;
}

export const DuringSessionNoteList = ({
  appointment_id,
  tenant_id,
}: DuringSessionNoteListProps) => {
  const {
    data: noteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotesByAppointment({
    appointment_id,
    tenant_id,
    note_type: NoteType.DuringAppointment,
  });

  const notes = useMemo(() => {
    return (
      (noteData as InfiniteNoteQueryResponse | undefined)?.pages?.flatMap(
        page => page.items || []
      ) || []
    );
  }, [noteData]);

  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={scrollContainerRef}
      className='max-h-80 overflow-y-auto mt-2.5 bg-white scroll-disable flex flex-col gap-5'
    >
      {notes.length === 0 && !isFetchingNextPage && (
        <div className='py-5 text-center'>
          <span className='text-sm text-primarygray text-center leading-5 font-normal'>
            No Memo available.
          </span>
        </div>
      )}
      {notes?.map((note: Note) => (
        <div
          key={note.id}
          className='flex flex-col gap-3 p-2.5 border border-solid border-surface rounded-md bg-surface/50'
        >
          <h3 className='text-base font-bold text-blackdark leading-5 break-all'>{note.title}</h3>
          <p
            className='text-sm text-primarygray leading-5 font-normal break-all whitespace-pre-wrap'
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      ))}
      {(hasNextPage || isFetchingNextPage) && (
        <div ref={loaderRef} className='flex justify-center items-center py-4 min-h-50px'>
          {isFetchingNextPage ? (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary'></div>
              <span className='text-sm text-primarygray font-normal leading-5'>
                Loading more Memo...
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

export default DuringSessionNoteList;
