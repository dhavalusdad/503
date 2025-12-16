import React, { useState } from 'react';

import clsx from 'clsx';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import type { UserAppointment } from '@/features/admin/components/appointmentList/types';
import { PatientDependentsOverview } from '@/features/video-call/components/PatientDependentsOverview';
import { PatientOverview } from '@/features/video-call/components/PatientOverview';
import { PersonalHubNotes } from '@/features/video-call/components/PersonalHubNotes';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Modal from '@/stories/Common/Modal';

type ToggleSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export const ClientDetails = ({
  clientId,
  onClose,
  dependents,
  tenantId,
}: {
  clientId: string;
  onClose: () => void;
  appointment_id: string;
  dependents: UserAppointment[];
  tenantId: string;
}) => {
  const [highCharts, setHighChartsValue] = useState<Highcharts.Options>();
  const [open, setOpen] = useState(false);
  const sections: ToggleSection[] = [
    {
      id: 'personalInfo',
      title: 'Patient Overview',
      content: (
        <PatientOverview
          setHighChartsValue={setHighChartsValue}
          highCharts={highCharts}
          setOpen={setOpen}
        />
      ),
    },
    dependents?.length > 0 && {
      id: 'dependents',
      title: 'Dependents',
      content: <PatientDependentsOverview dependentList={dependents} setOpen={setOpen} />,
    },

    {
      id: 'previousRecords',
      title: 'Personal Hub Notes',
      content:
        clientId && tenantId ? (
          <PersonalHubNotes clientId={clientId} tenant_id={tenantId} />
        ) : (
          <>No Data found</>
        ),
    },
  ].filter(Boolean);

  const [openSection, setOpenSection] = useState<string | null>(sections[0].id);

  const handleToggle = (id: string) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  return (
    <>
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
                    className='border border-solid border-Gray bg-Gray rounded-2xl overflow-hidden'
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
                          ? 'max-h-500px opacity-100 pb-2.5 overflow-y-auto scroll-disable'
                          : 'max-h-0 opacity-0'
                      )}
                    >
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        size='lg'
        closeButton={true}
        closeButtonClassName='ml-auto'
        contentClassName='!p-5'
        parentTitleClassName='!p-5 '
        children={<HighchartsReact highcharts={Highcharts} options={highCharts} />}
      />
    </>
  );
};
