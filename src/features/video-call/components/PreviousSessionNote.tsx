import { useMemo } from 'react';

import DOMPurify from 'dompurify';

import { useGetLastNote } from '@/api/video-call';
import { formatStatusLabel } from '@/helper';

interface LastNotePropsType {
  client_id: string;
  therapist_id: string;
  appointment_id: string;
}

const PreviousSessionNote = ({ client_id, therapist_id, appointment_id }: LastNotePropsType) => {
  const { data, isLoading, isError, error } = useGetLastNote({
    client_id,
    therapist_id,
    appointment_id,
  });

  const sanitizedContent = useMemo(() => {
    if (!data?.content) return '';
    return DOMPurify.sanitize(data.content);
  }, [data?.content]);

  if (isLoading) {
    return (
      <div className='p-4'>
        <p className='text-sm text-primarygray font-normal leading-5'>
          Loading previous session memo...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-4 text-red-500'>
        <p>Error loading memo: {error instanceof Error ? error.message : 'An error occurred'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='p-4 text-center'>
        <p className='text-sm text-primarygray font-normal leading-5'>
          No previous session memo found.
        </p>
      </div>
    );
  }

  return (
    <div className='p-4 mt-2.5 bg-surface/50 rounded-10px flex flex-col gap-2.5'>
      <div className='flex items-center gap-1 flex-wrap'>
        <span className='text-base font-bold leading-5 text-blackdark'>Title : </span>
        <span className='text-sm font-normal leading-5 text-primarygray'>{data.title}</span>
      </div>
      <div className='flex items-center gap-1 flex-wrap'>
        <span className='text-base font-bold leading-5 text-blackdark'>Memo Type : </span>
        <span className='text-sm font-normal leading-5 text-primarygray'>
          {formatStatusLabel(data.note_type)}
        </span>
      </div>
      <div className='flex items-start gap-1 flex-wrap'>
        <span className='text-base font-bold leading-5 text-blackdark'>Content : </span>
        <div className='text-sm' dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>
    </div>
  );
};

export default PreviousSessionNote;
