import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useInfiniteNotes } from '@/api/note';
import defaultUserPng from '@/assets/images/default-user.webp';
import type { Note } from '@/features/therapist/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const IncompleteNotes = () => {
  const user = useSelector(currentUser);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading, isFetching } =
    useInfiniteNotes({
      note_type: '',
      limit: 10,
      sortColumn: 'created_at',
      sortOrder: 'desc',
      search: '',
      isDraft: true,
      userId: user.id,
    });

  const notes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items || []);
  }, [data?.pages]);

  const navigate = useNavigate();

  const loaderRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loaderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [handleObserver]);

  const handleNoteClick = useCallback(
    (note: Note) => {
      navigate(`/appointment/${note.appointment.id}?note=${note.id}`);
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className='flex flex-col gap-5 '>
        <div className='bg-white rounded-2xl p-5 shadow-therapistdashbaordcard  w-full'>
          <p className='text-base font-bold text-[18px] text-blackdark mb-[16px]'>
            Incomplete Memo
          </p>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            <span className='ml-2'>Loading memo...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 '>
      <div className='bg-white rounded-2xl p-5 shadow-therapistdashbaordcard  w-full'>
        <p className='text-base font-bold text-[18px] text-blackdark mb-[16px]'>Incomplete Memo</p>
        <div className='h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          {notes.length === 0 ? (
            <div className='text-center py-8 text-base font-bold text-blackdark'>
              No incomplete memo found
            </div>
          ) : (
            <>
              {notes?.map((note: Note) => (
                <div
                  className='flex items-start gap-3 border-b border-gray-200 py-3 last:border-b-0'
                  key={note.id}
                >
                  {/* Avatar */}
                  <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                    <Image
                      imgPath={
                        note?.client?.user?.profile_image
                          ? `${SERVER_URL}${note?.client?.user?.profile_image}`
                          : defaultUserPng
                      }
                      firstName={note?.client?.user?.first_name}
                      lastName={note?.client?.user?.last_name}
                      alt='User Avatar'
                      imageClassName='rounded-full object-cover object-center w-full h-full'
                      className='w-full h-full bg-surface'
                      initialClassName='!text-base'
                    />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <h3 className='text-base font-bold text-[16px] text-blackdark mb-1'>
                      {note?.client?.user?.first_name} {note?.client?.user?.last_name}
                    </h3>

                    <p className='text-base font-normal text-[14px] text-blackdark mb-1'>
                      {note?.title}
                    </p>
                  </div>

                  {/* Edit Icon */}
                  <div
                    className='flex-shrink-0 cursor-pointer hover:bg-gray-50 p-1 rounded'
                    onClick={() => handleNoteClick(note)}
                  >
                    <Icon name='edit' className='w-4 h-4 text-black-400' />
                  </div>
                </div>
              ))}

              {/* Infinite scroll loader */}
              <div ref={loaderRef} className={isFetchingNextPage ? 'py-4' : ''}>
                {isFetchingNextPage && (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
                    <span className='ml-2 text-sm text-gray-600'>Loading more memo...</span>
                  </div>
                )}
              </div>

              {/* Optional: Manual load more button as fallback */}
              {hasNextPage && !isFetchingNextPage && (
                <div className='text-center pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    title='Load more'
                    onClick={() => fetchNextPage()}
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                    isDisabled={isFetching}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncompleteNotes;
