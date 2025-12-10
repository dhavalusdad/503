import React, { useState } from 'react';

import clsx from 'clsx';

import AppointmentSessionTag from '@/features/video-call/components/AppointmentSessionTag';
import AppointmentWidget from '@/features/video-call/components/AppointmentWidget';
import { DuringSessionNote } from '@/features/video-call/components/DuringSessionNote';
import { DuringSessionNoteList } from '@/features/video-call/components/DuringSessionNoteList';
import PreviousSessionNote from '@/features/video-call/components/PreviousSessionNote';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

type ToggleSection = {
  id: string;
  title: string;
  renderContent: () => React.ReactNode;
};
type MemoPadPropsType = {
  onClose: () => void;
  client_id: string;
  therapist_id: string;
  appointment_id: string;
};

export const MemoPad = ({ client_id, therapist_id, onClose, appointment_id }: MemoPadPropsType) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  const sections: ToggleSection[] = [
    {
      id: 'appointmentWidget',
      title: 'Reminder Widgets',
      renderContent: () => <AppointmentWidget appointment_id={appointment_id} />,
    },
    {
      id: 'appointmentSessionTag',
      title: 'Tags',
      renderContent: () => <AppointmentSessionTag appointment_id={appointment_id} />,
    },
    {
      id: 'note',
      title: 'Live Session Memo',
      renderContent: () => (
        <DuringSessionNote
          appointment_id={appointment_id}
          client_id={client_id}
          therapist_id={therapist_id}
        />
      ),
    },
    {
      id: 'currentNotes',
      title: 'Memo',
      renderContent: () => <DuringSessionNoteList appointment_id={appointment_id} />,
    },
    {
      id: 'previousNote',
      title: 'Previous Session Memo',
      renderContent: () => (
        <PreviousSessionNote
          client_id={client_id}
          therapist_id={therapist_id}
          appointment_id={appointment_id}
        />
      ),
    },
  ];

  return (
    <div className='w-[calc(100%-32px)] sm:w-387px rounded-20px z-50 h-full absolute right-4 xl:right-auto xl:relative'>
      <div className='flex flex-col bg-white rounded-20px h-full'>
        <div className='flex items-center justify-between p-5 bg-surface rounded-t-20px'>
          <Button
            variant='none'
            onClick={onClose}
            className='text-blackdark !p-0'
            parentClassName='h-6 ml-auto'
            icon={<Icon name='x' className='icon-wrapper w-6 h-6' />}
          />
        </div>
        <div className='p-5 relative flex-1 overflow-hidden'>
          <div className='h-full overflow-y-auto scroll-disable'>
            <div className='flex flex-col gap-3'>
              {sections.map(section => (
                <div
                  key={section.id}
                  className='border border-Gray bg-Gray rounded-2xl overflow-hidden'
                >
                  <div
                    onClick={() => handleToggle(section.id)}
                    className='w-full p-3.5 flex justify-between items-center cursor-pointer'
                  >
                    <h6 className='font-bold text-base text-blackdark leading-22px'>
                      {section.title}
                    </h6>
                    <Icon name={openSection === section.id ? 'arrowTop' : 'arrowBottom'} />
                  </div>
                  <div
                    className={clsx(
                      'px-2.5 bg-white transition-all duration-300 ease-in-out overflow-hidden',
                      openSection === section.id
                        ? 'max-h-400px opacity-100 pb-2.5 overflow-y-auto scroll-disable'
                        : 'max-h-0 opacity-0'
                    )}
                  >
                    {/* Render content only when open */}
                    {openSection === section.id && section.renderContent()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
