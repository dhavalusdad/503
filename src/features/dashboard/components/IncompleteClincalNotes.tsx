import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetInfiniteUnsignedForms } from '@/api/ amdForm';
import { ROUTES } from '@/constants/routePath';
import { AmdFormDocNames } from '@/enums';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

interface UnsignedFormNote {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  client?: {
    user?: {
      first_name?: string;
      last_name?: string;
      profile_image?: string;
    };
  };
}

export enum FormStatusAMD {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SIGNED = 'signed',
  SUBMITTED = 'submitted',
}
const SERVER_URL = import.meta.env.VITE_BASE_URL;

const IncompleteClinicalNotes: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(currentUser);

  const {
    data: unsignedForms,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteUnsignedForms({
    therapistId: user?.therapist_id || '',
    status: [FormStatusAMD.PENDING, FormStatusAMD.SUBMITTED],
  });

  const notes = useMemo(() => {
    if (!unsignedForms?.pages) return [];
    return unsignedForms.pages.flatMap(page => page.items || []);
  }, [unsignedForms]);

  const loaderRef = useRef<HTMLDivElement>(null);
  const handleEditNote = data => {
    if (data?.form?.name === AmdFormDocNames.SAFETY_PLAN) {
      navigate(ROUTES.AMD_SAFETY_PLAN.navigatePath(data.id));
      return;
    }

    const appointmentId = data?.appointment_id;
    const amd_appointment_id = data?.appointment?.amd_appointment_id;
    const amd_patient_id = data?.client?.amd_patient_id;
    const patient_id = data?.client?.id;
    const therapist_id = data?.therapist?.id;
    const ehr_note_id = data?.ehr_note_id;
    const assign_id = data?.id;

    const formName = (data.form.name as string) || '';
    if (!appointmentId || !formName) return;

    const search = new URLSearchParams({
      appointmentId,
      formName,
      therapist_id,
      patient_id,
      amd_patient_id,
      amd_appointment_id,
      ehr_note_id,
      assign_id,
    } as unknown as Record<string, string>).toString();

    navigate(
      `${ROUTES.INTAKE_FORM.navigatePath(data.client?.id || '')}?${search
        .split('&')
        .filter(d => !d.includes('=null'))
        .join('&')}`
    );
  };

  const getAvatarSrc = (note: UnsignedFormNote) => {
    return note.client?.user?.profile_image ? SERVER_URL + note.client?.user?.profile_image : '';
  };
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

  const getDisplayName = (note: UnsignedFormNote) => {
    if (note.name) return note.name;

    const firstName = note.client?.user?.first_name || '';
    const lastName = note.client?.user?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Client';
  };

  if (notes?.length === 0) {
    return (
      <div className='relative bg-white p-5 overflow-hidden shadow-progresstracker rounded-2xl'>
        <h2 className='text-xl font-bold text-blackdark mb-6'>Incomplete Clinical Notes</h2>
        <div className='text-center py-8'>
          <Icon name='note' className='icon-wrapper w-12 h-12 text-primarygray mx-auto mb-3' />
          <p className='text-primarygray text-lg'>No incomplete clinical Notes</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='relative bg-white p-5 overflow-hidden shadow-progresstracker rounded-2xl'>
        <h2 className='text-lg font-bold mb-5 text-blackdark'>Incomplete Clinical Notes</h2>

        <div className='flex flex-col gap-3.5 max-h-[40vh] overflow-auto'>
          {notes?.map((note: UnsignedFormNote, index: number) => (
            <div
              key={note.id}
              ref={index == notes?.length - 1 ? loaderRef : null}
              className='flex items-start justify-between pr-2 pb-3.5 border-b border-solid border-surface mb-3.5 last:mb-0 last:pb-0 last:border-b-0'
            >
              <div className='flex items-start gap-2.5'>
                {/* Avatar */}
                <Image
                  imgPath={getAvatarSrc(note)}
                  alt={getDisplayName(note)}
                  className='w-10 h-10 sm:w-12 sm:h-12 rounded-full'
                  imageClassName='w-full  h-full rounded-full object-cover object-center'
                  initialClassName='!text-lg'
                  firstName={note.client?.user?.first_name}
                  lastName={note.client?.user?.last_name}
                />
                {/* Content */}
                <div className='flex flex-col gap-1.5'>
                  <h3 className='font-bold text-blackdark text-base truncate'>
                    {getDisplayName(note)}
                  </h3>
                  <p className='text-sm text-primarygray line-clamp-2 font-normal'>
                    {note?.form?.name}
                  </p>
                  <p className='text-sm text-primarygray line-clamp-2 font-normal'>
                    {moment
                      .tz(note?.appointment?.slot?.start_time, user.timezone)
                      .format('hh:mm A')}{' '}
                    -{moment.tz(note?.appointment?.slot?.end_time, user.timezone).format('hh:mm A')}{' '}
                    ,{' '}
                    {moment
                      .tz(note?.appointment?.slot?.start_time, user.timezone)
                      .format('D MMMM yyyy')}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                variant='none'
                onClick={() => handleEditNote(note)}
                className='!p-0'
                title=''
                icon={<Icon name='edit' className='icon-wrapper w-5 h-5' />}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default IncompleteClinicalNotes;
