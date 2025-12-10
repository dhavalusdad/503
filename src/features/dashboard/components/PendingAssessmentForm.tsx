import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetInfinitePendingClientsAssessmentForms } from '@/api/assessment-forms';
import { ROUTES } from '@/constants/routePath';
import { FormStatusType } from '@/enums';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

import type { UnsignedFormNote } from '../types';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const PendingAssessmentForm: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(currentUser) as {
    id?: string;
    timezone?: string;
  };

  const {
    data: unsignedForms,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfinitePendingClientsAssessmentForms({
    therapistId: user?.id || '',
    status: [FormStatusType.PENDING],
  });

  const notes = useMemo<UnsignedFormNote[]>(() => {
    if (!unsignedForms?.pages) return [];
    return unsignedForms.pages.flatMap(page => page.items || []);
  }, [unsignedForms]);

  const loaderRef = useRef<HTMLDivElement>(null);

  const handelViewClientDetail = useCallback(
    (data: UnsignedFormNote) => {
      if (data.assignedUser?.client_id) {
        navigate(ROUTES.MY_CLIENT_DETAIL.navigatePath(data.assignedUser?.client_id));
      }
    },
    [navigate]
  );

  const getAvatarSrc = useCallback((note: UnsignedFormNote): string => {
    return note.assignedUser?.profile_image ? SERVER_URL + note.assignedUser.profile_image : '';
  }, []);

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

  const getDisplayName = useCallback((note: UnsignedFormNote): string => {
    if (note.name) return note.name;
    const firstName = note?.assignedUser?.first_name || '';
    const lastName = note?.assignedUser?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Client';
  }, []);

  if (notes?.length === 0) {
    return (
      <div className='relative bg-white p-5 overflow-hidden shadow-progresstracker rounded-2xl'>
        <h2 className='text-xl font-bold text-blackdark mb-6'>Patient Pending forms</h2>
        <div className='text-center py-8'>
          <Icon name='note' className='icon-wrapper w-12 h-12 text-primarygray mx-auto mb-3' />
          <p className='text-primarygray text-lg'>No Patient Pending forms</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='relative bg-white p-5 overflow-hidden shadow-progresstracker rounded-2xl'>
        <h2 className='text-lg font-bold mb-5 text-blackdark'>Patient Pending forms</h2>

        <div className='flex flex-col gap-3.5 max-h-[40vh] overflow-auto'>
          {notes?.map((note: UnsignedFormNote, index: number) => (
            <div
              key={note.id + index}
              ref={index === notes.length - 1 ? loaderRef : null}
              className='flex items-start justify-between pr-2 pb-3.5 border-b border-solid border-surface mb-3.5 last:mb-0 last:pb-0 last:border-b-0'
            >
              <div className='flex items-start gap-2.5'>
                <Image
                  imgPath={getAvatarSrc(note)}
                  alt={getDisplayName(note)}
                  className='w-10 h-10 sm:w-12 sm:h-12 rounded-full'
                  imageClassName='w-full h-full rounded-full object-cover object-center'
                  initialClassName='!text-lg'
                  firstName={note.assignedUser?.first_name}
                  lastName={note.assignedUser?.last_name}
                />
                <div className='flex flex-col gap-1.5'>
                  <h3 className='font-bold text-blackdark text-base truncate'>
                    {getDisplayName(note)}
                  </h3>
                  <p className='text-sm text-primarygray line-clamp-2 font-normal'>
                    {note?.form_title}
                  </p>
                  {note?.appointment?.slot && (
                    <p className='text-sm text-primarygray line-clamp-2 font-normal'>
                      {moment
                        .tz(note?.appointment?.slot?.start_time, user?.timezone as string)
                        .format('hh:mm A')}{' '}
                      -
                      {moment
                        .tz(note?.appointment?.slot?.end_time, user?.timezone as string)
                        .format('hh:mm A')}{' '}
                      ,{' '}
                      {moment
                        .tz(note?.appointment?.slot?.start_time, user?.timezone as string)
                        .format('D MMMM yyyy')}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant='none'
                onClick={() => handelViewClientDetail(note)}
                className='!p-0'
                title=''
                icon={<Icon name='eye' className='icon-wrapper w-5 h-5' />}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PendingAssessmentForm;
