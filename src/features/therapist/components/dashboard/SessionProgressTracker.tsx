import React from 'react';

import Tippy from '@tippyjs/react';
import _ from 'lodash';
import { useSelector } from 'react-redux';

import { useGetSessionProgressData } from '@/api/therapist';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';

type ClientProgressProps = {
  name: string;
  completed_sessions: number;
};

const DEFAULT_SESSION_THRESHOLD = 15;

const SESSION_TOOLTIP = {
  LESS: 'Client continues to meet/does not meet medical necessity criteria. Check in with your client regarding progress and ongoing treatment needs.',
  MEDIUM:
    'Please ensure that medical necessity is clearly documented if a client exceeds 15 sessions.',
  MORE: 'Please ensure that medical necessity is clearly documented if a client exceeds 15 sessions.',
};

const BAR_COLORS = {
  RED: 'bg-red',
  YELLOW: 'bg-yellow',
  GREEN: 'bg-Green',
};

const TOOLTIP_CLASS = {
  RED: `bg-redextralight text-red border border-red md:w-434px md:max-w-434px w-280px max-w-280px`,
  YELLOW: `bg-yellowextralight text-yellow border border-yellow md:w-434px md:max-w-434px w-280px max-w-280px`,
  GREEN: `bg-white text-blackdark border border-transparent md:w-464px md:max-w-464px w-300px max-w-300px`,
};

const ProgressBar: React.FC<ClientProgressProps> = ({ name, completed_sessions: current }) => {
  let percentage = 0;
  let data = {
    tooltip_text: SESSION_TOOLTIP.MORE,
    bar_color: BAR_COLORS.RED,
    percentage: 0,
    tooltip_class: TOOLTIP_CLASS.RED,
    theme: 'red',
  };

  if (current <= 15) {
    // Green range
    percentage = Math.min((current / 15) * 100, 100);
    data = {
      tooltip_text: SESSION_TOOLTIP.LESS,
      bar_color: BAR_COLORS.GREEN,
      percentage,
      tooltip_class: TOOLTIP_CLASS.GREEN,
      theme: '',
    };
  } else if (current > 15 && current <= 25) {
    // Yellow range
    percentage = Math.min(((current - 15) / 10) * 100, 100);
    data = {
      tooltip_text: SESSION_TOOLTIP.MEDIUM,
      bar_color: BAR_COLORS.YELLOW,
      percentage,
      tooltip_class: TOOLTIP_CLASS.YELLOW,
      theme: 'yellow',
    };
  } else if (current > 25 && current <= 50) {
    // Red range
    percentage = Math.min(((current - 25) / 25) * 100, 100);
    data = {
      tooltip_text: SESSION_TOOLTIP.MORE,
      bar_color: BAR_COLORS.RED,
      percentage,
      tooltip_class: TOOLTIP_CLASS.RED,
      theme: 'red',
    };
  }

  return (
    <>
      <div className='p-4 bg-surfacelight rounded-lg mb-2.5 last:mb-0 w-full border border-surface'>
        <p className='font-semibold text-base text-blackdark mb-2'>{name}</p>
        <p className='text-sm font-semibold text-primarygray mb-4'>
          Session {current} of {DEFAULT_SESSION_THRESHOLD}
        </p>
        <Tippy
          placement='top'
          arrow={true}
          content={
            <div
              className={`flex gap-3 px-3 py-2.5 rounded-lg z-50 break-words shadow-progresstooltip text-xs font-medium ${data.tooltip_class}`}
            >
              <div className='tippy-content flex items-start gap-2 '>
                <Icon name='infoOutline' className='icon-wrapper w-5 h-5' />
                {data.tooltip_text}
              </div>
            </div>
          }
          theme={data.theme}
        >
          <div className='w-full bg-gray-200 rounded-full h-1.5'>
            <div
              className={`${data.bar_color} h-1.5 rounded-full`}
              style={{ width: `${data.percentage}%` }}
            />
          </div>
        </Tippy>
      </div>
    </>
  );
};

const SessionProgressTracker = () => {
  const { timezone } = useSelector(currentUser);
  const { data: clients, isFetching } = useGetSessionProgressData({
    limit: 10,
    page: 1,
    timezone,
  });

  return (
    <div className='relative bg-white p-5 overflow-hidden shadow-progresstracker rounded-2xl min-h-[420px]'>
      <h2 className='text-lg font-bold mb-5 text-blackdark'>Session Progress Tracker</h2>
      {isFetching ? (
        <div className='flex absolute top-0 left-0 w-full justify-center items-center h-full'>
          <span
            className={`inline-block border-2 border-lime-200 border-b-lime-500 rounded-full animate-spin h-7 w-7`}
          />
        </div>
      ) : (
        <>
          {_.isArray(clients) && clients?.length ? (
            <div className='max-h-400px overflow-y-auto min-h-[300px]'>
              <div className='pr-2'>
                {(clients || []).slice(0, 1).map(c => (
                  <ProgressBar
                    {...c}
                    key={c.id}
                    name={c.name}
                    current={c.completed_sessions}
                    status={c.status}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-[calc(100%-50px)]'>
              <p className='text-lg font-normal text-blackdark text-center'>
                You currently have no appointments <br /> scheduled to display here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SessionProgressTracker;
