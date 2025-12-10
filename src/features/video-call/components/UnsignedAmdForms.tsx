import { useCallback, useEffect, useMemo, useRef } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetInfiniteUnsignedForms } from '@/api/ amdForm';
import { ROUTES } from '@/constants/routePath';
import { AmdFormDocNames } from '@/enums';
import { FormStatusAMD } from '@/features/dashboard/components/IncompleteClincalNotes';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

interface UnsignedAmdFormsProps {
  therapistId?: string;
  appointmentId?: string;
  roomId?: string;
}

const UnsignedAmdForms = ({ therapistId, appointmentId, roomId }: UnsignedAmdFormsProps) => {
  const navigate = useNavigate();
  const user = useSelector(currentUser);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const {
    data: unsignedForms,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetInfiniteUnsignedForms({
    therapistId: therapistId || '',
    appointmentId,
    status: [FormStatusAMD.PENDING, FormStatusAMD.SUBMITTED],
  });

  const notes = useMemo(() => {
    if (!unsignedForms?.pages) return [];
    return unsignedForms.pages.flatMap(page => page.items || []);
  }, [unsignedForms]);

  const handleEditNote = useCallback(
    data => {
      if (data?.form?.name === AmdFormDocNames.SAFETY_PLAN) {
        navigate(ROUTES.AMD_SAFETY_PLAN.navigatePath(data.id));
        return;
      }

      const appointmentIdFromForm = data?.appointment_id;
      const amd_appointment_id = data?.appointment?.amd_appointment_id;
      const amd_patient_id = data?.client?.amd_patient_id;
      const patient_id = data?.client?.id;
      const therapist_id = data?.therapist?.id;
      const ehr_note_id = data?.ehr_note_id;
      const assign_id = data?.id;
      const formName = (data.form.name as string) || '';
      const user_id = data?.client?.user.id;
      if (!appointmentIdFromForm || !formName) return;
      const search = new URLSearchParams({
        appointmentId: appointmentIdFromForm,
        formName,
        therapist_id,
        patient_id,
        amd_patient_id,
        amd_appointment_id,
        ehr_note_id,
        assign_id,
        user_id,
      } as unknown as Record<string, string>).toString();

      const url = `${ROUTES.PUBLIC_AMD_FORM.navigatePath(data.client?.id || '')}?${search
        .split('&')
        .filter(d => !d.includes('=null'))
        .join('&')}`;

      navigate(url, { state: { roomId } });
    },
    [navigate]
  );

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

    return () => observer.disconnect();
  }, [handleObserver]);

  const getDisplayName = useCallback(note => {
    if (note?.name) return note.name;
    const firstName = note?.client?.user?.first_name || '';
    const lastName = note?.client?.user?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Client';
  }, []);

  if (!therapistId || !appointmentId) {
    return (
      <div className='text-center py-8'>
        <p className='text-primarygray text-lg'>
          Unable to load AMD notes. Missing appointment or therapist info.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4' />
        <p className='text-primarygray text-lg'>Loading AMD notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className='text-center py-8'>
        <Icon name='note' className='icon-wrapper w-12 h-12 text-primarygray mx-auto mb-3' />
        <p className='text-primarygray text-lg'>No pending AMD notes for this appointment.</p>
        <p className='text-primarygray text-base'>
          You can always complete clinical notes later from the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 max-h-[45vh] overflow-auto pr-2'>
      {notes.map((note, index) => (
        <div
          key={note.id}
          ref={index === notes.length - 1 ? loaderRef : null}
          className='flex items-start justify-between p-4 border border-surface rounded-2xl bg-gray-50'
        >
          <div className='flex items-start gap-3 w-full'>
            <Image
              imgPath={
                note.client?.user?.profile_image
                  ? import.meta.env.VITE_BASE_URL + note.client.user.profile_image
                  : ''
              }
              alt={getDisplayName(note)}
              className='w-12 h-12 rounded-full'
              imageClassName='w-full h-full rounded-full object-cover object-center'
              initialClassName='!text-lg'
              firstName={note.client?.user?.first_name}
              lastName={note.client?.user?.last_name}
            />
            <div className='flex flex-col gap-1 flex-1'>
              <h3 className='font-bold text-blackdark text-base truncate'>{note?.form?.name}</h3>
              <p className='text-xs text-primarygray'>
                {moment.tz(note?.appointment?.slot?.start_time, user.timezone).format('hh:mm A')} -{' '}
                {moment.tz(note?.appointment?.slot?.end_time, user.timezone).format('hh:mm A')},{' '}
                {moment.tz(note?.appointment?.slot?.start_time, user.timezone).format('D MMM YYYY')}
              </p>
            </div>
          </div>
          <Button
            variant='none'
            onClick={() => handleEditNote(note)}
            className='ml-3 !p-0'
            title=''
            icon={<Icon name='edit' className='icon-wrapper w-5 h-5' />}
          />
        </div>
      ))}
    </div>
  );
};

export default UnsignedAmdForms;
