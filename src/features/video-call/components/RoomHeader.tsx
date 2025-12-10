import { useState, useEffect } from 'react';

import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import type { AppointmentDetailsResponse } from '@/api/types/calendar.dto';
import { UserRole } from '@/api/types/user.dto';
import { Timer } from '@/features/video-call/components/Timer';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';

interface RoomHeaderProps {
  appointmentDetails: AppointmentDetailsResponse;
  roomName: string;
  participantCount: number;
  onToggleParticipants: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
}

export function RoomHeader({ appointmentDetails }: RoomHeaderProps) {
  const { role, timezone } = useSelector(currentUser);
  const [startTime, setStartTime] = useState<moment.Moment | null>(null);
  const [endTime, setEndTime] = useState<moment.Moment | null>(null);
  const [showWarningAt, setShowWarningAt] = useState<number | null>(null);
  const [timer, setTimer] = useState<{ minutes: string; second: string }>({
    minutes: '00',
    second: '00',
  });

  // Parse start/end time from appointment
  useEffect(() => {
    const startTime = appointmentDetails?.actual_start_time || moment.tz(new Date(), timezone);
    const parsedStartTime = moment.tz(startTime, timezone);
    const parsedEndTime = moment.tz(startTime, timezone).add(60, 'minutes');

    setStartTime(parsedStartTime);
    setEndTime(parsedEndTime);

    const diffInMin = parsedEndTime.diff(parsedStartTime, 'minutes');
    const currentTime = moment.tz(new Date(), timezone);

    const offsetFromStart = currentTime.diff(parsedStartTime, 'minutes');
    const offsetFromEnd = currentTime.diff(parsedEndTime, 'minutes');

    if (offsetFromStart < 0) {
      // Meeting hasn’t started yet
      setShowWarningAt(diffInMin - 10);
    } else {
      // Meeting already started
      if (offsetFromEnd > 0) {
        // Meeting already ended
        setShowWarningAt(null);
      } else {
        // Still running
        setShowWarningAt(diffInMin - 10);
      }
    }
  }, [appointmentDetails?.actual_start_time]);

  useEffect(() => {
    if (!startTime) return;

    const joinTime = moment.tz(timezone);

    const interval = setInterval(() => {
      const now = moment.tz(timezone);
      let elapsedSeconds = 0;
      if (joinTime.isBefore(startTime)) {
        elapsedSeconds = now.diff(joinTime, 'seconds');
      } else {
        elapsedSeconds = now.diff(startTime, 'seconds');
      }

      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;

      const mm = String(Math.max(0, minutes)).padStart(2, '0');
      const ss = String(Math.max(0, seconds)).padStart(2, '0');

      setTimer({ minutes: mm, second: ss });
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone, startTime]);

  return (
    <header className='p-4 relative'>
      <div className='flex items-center gap-4 justify-between'>
        <h1 className='text-lg sm:text-xl font-semibold text-white truncate'>
          {role !== UserRole.THERAPIST
            ? `Session With ${appointmentDetails?.therapist?.user.first_name} ${appointmentDetails?.therapist?.user.last_name}`
            : `Session With ${appointmentDetails?.client?.user.first_name} ${appointmentDetails?.client?.user.last_name}`}
        </h1>
        {role === UserRole.THERAPIST &&
          startTime &&
          showWarningAt !== null &&
          Number(timer.minutes) >= showWarningAt &&
          Number(timer.minutes) <= showWarningAt + 10 &&
          endTime &&
          endTime.diff(moment.tz(timezone), 'minutes') > 0 && (
            <div className='flex items-center gap-2 w-[calc(100%-20px)] sm:w-auto absolute left-2/4 -translate-x-2/4 xl:translate-0 xl:left-auto xl:relative z-10 bg-amber-900 border border-amber-500/40 rounded-lg px-3 py-1.5'>
              <Icon name='alertTriangle' className='icon-wrapper w-6 h-6 text-amber-300' />
              <p className='text-amber-100 text-xs sm:text-sm font-medium sm:whitespace-nowrap flex-1'>
                This meeting will end in{' '}
                {endTime ? endTime.diff(moment.tz(timezone), 'minutes') : 0} minutes because this
                meeting has limit of 60 minutes.
              </p>
              <div
                className='flex bg-white rounded-full p-1 cursor-pointer'
                onClick={() => setShowWarningAt(null)}
              >
                <Icon name='close' className='icon-wrapper w-4 h-4 text-amber-700' />
              </div>
            </div>
          )}
        {startTime && <Timer time={`${timer.minutes}:${timer.second}`} />}
      </div>
    </header>
  );
}
