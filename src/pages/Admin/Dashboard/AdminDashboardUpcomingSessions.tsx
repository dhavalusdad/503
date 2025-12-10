import React, { useMemo, useState, useEffect } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { useGetPaginatedUpcomingSessions } from '@/api/admin-dashboard';
import type { SessionType } from '@/enums';
import { getMonthDaysTz } from '@/pages/Admin/Dashboard/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import DualAxisInfiniteScroll from '@/stories/Common/DualAxisInfiniteScroll';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Skeleton from '@/stories/Common/Skeleton';

type SessionDataType = {
  id: string;
  session_type: SessionType;
  start_time: string;
  therapist: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
  therapy_type: string;
};

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const renderComponent = (session: SessionDataType, timezone: string) => {
  const { id, therapist, session_type, therapy_type, start_time } = session;
  const { profile_image, first_name, last_name } = therapist;
  return (
    <div
      key={id}
      className='border border-solid border-surface rounded-2xl p-4 bg-surfacelight flex flex-col gap-3'
    >
      <div className='flex gap-2.5 items-center'>
        <div className='w-13 h-13 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center'>
          <Image
            imgPath={profile_image ? `${SERVER_URL}${profile_image}` : ''}
            imageClassName='rounded-full object-cover object-center w-full h-full'
            className='w-full h-full bg-surface'
            initialClassName='!text-base'
            firstName={first_name}
            lastName={last_name}
          />
        </div>
        <div className='flex flex-col gap-2.5'>
          <h6 className='text-base font-bold text-blackdark leading-5'>
            {`${first_name} ${last_name}`}
          </h6>
          <p className='text-sm text-blackdark font-bold leading-4'>
            Therapy Type: <span className='text-blackdark font-medium'>{therapy_type}</span>
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2.5'>
        <p className='text-sm text-blackdark font-bold leading-4'>
          Session Type: <span className='text-blackdark font-medium'>{session_type}</span>
        </p>
        <div className='flex items-center gap-2'>
          <Icon name='calendar' className='text-primary' />
          <p className='text-sm text-blackdark font-medium'>
            {moment.tz(start_time, timezone).format('MMMM D, YYYY, h:mm A')}
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardUpcomingSessions: React.FC = () => {
  const { timezone } = useSelector(currentUser);
  const userTimezone = timezone || 'UTC';

  const now = moment.tz(userTimezone);
  const [selectedMonth, setSelectedMonth] = useState(now.month());
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedDate, setSelectedDate] = useState<Date>(now.startOf('day').toDate());

  // ** Services **
  const {
    data: sessionData,
    hasNextPage,
    fetchNextPage,
    isPending,
    isLoading,
  } = useGetPaginatedUpcomingSessions({
    limit: 10,
    selectedDate,
    timezone: userTimezone,
  });

  const days = useMemo(
    () => getMonthDaysTz(selectedYear, selectedMonth, userTimezone),
    [selectedMonth, selectedYear, userTimezone]
  );

  const weeks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [days]);

  const initialWeekIndex = useMemo(() => {
    return weeks.findIndex(week =>
      week.some(day => moment(day.date).isSame(moment.tz(userTimezone), 'day'))
    );
  }, [weeks, userTimezone]);

  const [currentWeekIndex, setCurrentWeekIndex] = useState(
    initialWeekIndex !== -1 ? initialWeekIndex : 0
  );

  useEffect(() => {
    const newInitialWeekIndex = weeks.findIndex(week =>
      week.some(day => moment(day.date).isSame(moment(selectedDate).tz(userTimezone), 'day'))
    );
    setCurrentWeekIndex(newInitialWeekIndex !== -1 ? newInitialWeekIndex : 0);
  }, [selectedMonth, selectedYear, weeks, selectedDate, userTimezone]);

  const currentWeek = weeks[currentWeekIndex];

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const currentMoment = moment.tz(
      { year: selectedYear, month: selectedMonth, day: 1 },
      userTimezone
    );
    const newMoment =
      direction === 'next' ? currentMoment.add(1, 'month') : currentMoment.subtract(1, 'month');

    const newMonth = newMoment.month();
    const newYear = newMoment.year();

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setCurrentWeekIndex(0);

    const selectedDayOfWeek = moment(selectedDate).day();

    const updatedDays = getMonthDaysTz(newYear, newMonth, userTimezone);
    const firstMatchingDay = updatedDays.find(
      day => day.inCurrentMonth && moment(day.date).day() === selectedDayOfWeek
    );

    if (firstMatchingDay) {
      setSelectedDate(moment.tz(firstMatchingDay.date, userTimezone).startOf('day').toDate());
    } else {
      setSelectedDate(
        moment.tz({ year: newYear, month: newMonth, day: 1 }, userTimezone).startOf('day').toDate()
      );
    }
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeekIndex = direction === 'next' ? currentWeekIndex + 1 : currentWeekIndex - 1;

    if (newWeekIndex < 0) {
      handleMonthChange('prev');
      return;
    } else if (newWeekIndex >= weeks.length) {
      handleMonthChange('next');
      return;
    }

    setCurrentWeekIndex(newWeekIndex);

    const selectedDayOfWeek = moment(selectedDate).day();

    const newWeek = weeks[newWeekIndex];
    const matchingDay = newWeek.find(
      day => day.inCurrentMonth && moment(day.date).day() === selectedDayOfWeek
    );

    if (matchingDay) {
      setSelectedDate(moment.tz(matchingDay.date, userTimezone).startOf('day').toDate());
    } else {
      const firstValidDay = newWeek.find(day => day.inCurrentMonth);
      if (firstValidDay) {
        setSelectedDate(moment.tz(firstValidDay.date, userTimezone).startOf('day').toDate());
      }
    }
  };

  const canGoPrevWeek = () => {
    if (currentWeekIndex === 0 && !canGoPrevMonth()) {
      return false;
    }

    const today = moment.tz(userTimezone).startOf('day');
    const hasToday = currentWeek?.some(({ date }) =>
      moment.tz(date, userTimezone).startOf('day').isSame(today)
    );

    return !hasToday;
  };

  const handleDateSelect = (date: Date, inCurrentMonth: boolean) => {
    if (!inCurrentMonth) return;
    const isPast = moment
      .tz(date, userTimezone)
      .startOf('day')
      .isBefore(moment.tz(userTimezone).startOf('day'));
    if (isPast) return;
    setSelectedDate(moment.tz(date, userTimezone).startOf('day').toDate());
  };

  const upcomingSessionData = useMemo(() => {
    if (!sessionData?.pages) return [];
    return sessionData.pages.flatMap(page => page.items || []);
  }, [sessionData?.pages]);

  const canGoPrevMonth = () => {
    const currentMoment = moment.tz(userTimezone).startOf('month');
    const selectedMoment = moment.tz(
      { year: selectedYear, month: selectedMonth, day: 1 },
      userTimezone
    );
    return selectedMoment.isAfter(currentMoment);
  };

  return (
    <div className='bg-white p-5 rounded-20px shadow-cardshadow h-full'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-bold leading-6 text-blackdark'>Upcoming Sessions</h2>
        {/* Month navigation */}
        <div className='flex items-center gap-3'>
          <Button
            variant='none'
            onClick={() => handleMonthChange('prev')}
            isDisabled={!canGoPrevMonth()}
            className='!p-0'
            icon={
              <Icon
                name='previousArrow'
                className={clsx(
                  'icon-wrapper w-5 h-5',
                  !canGoPrevMonth() ? 'text-primarygray' : 'text-blackdark'
                )}
              />
            }
            isIconFirst
          />
          <span className='text-base font-semibold text-blackdark min-w-[140px] text-center'>
            {moment
              .tz({ year: selectedYear, month: selectedMonth, day: 1 }, userTimezone)
              .format('MMMM YYYY')}
          </span>
          <Button
            variant='none'
            onClick={() => handleMonthChange('next')}
            className='!p-0'
            icon={<Icon name='nextArrow' className='icon-wrapper w-5 h-5 text-blackdark' />}
          />
        </div>
      </div>

      {/* Week navigation */}
      <div className='flex justify-between items-center bg-Gray p-18px rounded-2xl'>
        <Button
          variant='none'
          onClick={() => handleWeekChange('prev')}
          isDisabled={!canGoPrevWeek()}
          className='!p-0'
          icon={
            <Icon
              name='previousArrow'
              className={clsx(
                'icon-wrapper w-5 h-5',
                !canGoPrevWeek() ? 'text-primarygray' : 'text-blackdark'
              )}
            />
          }
          isIconFirst
        />
        <div className='flex items-center gap-2.5'>
          {currentWeek.map(({ date, inCurrentMonth }) => {
            const formatted = date.getDate().toString().padStart(2, '0');
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const dayMoment = moment.tz(date, userTimezone).startOf('day');
            const today = moment.tz(userTimezone).startOf('day');

            const isSelected = dayMoment.isSame(
              moment.tz(selectedDate, userTimezone).startOf('day'),
              'day'
            );
            const isToday = dayMoment.isSame(today, 'day');
            const isPast = dayMoment.isBefore(today);
            const isDisabled = isPast || !inCurrentMonth;

            return (
              <span
                key={date.toISOString()}
                onClick={() => !isDisabled && handleDateSelect(date, inCurrentMonth)}
                className={clsx(
                  'flex-col w-16 h-16 rounded-lg !p-0 group font-normal inline-flex items-center sm:text-base text-sm justify-center gap-2 sm:py-3.5 py-2.5 sm:px-3.5 px-2 leading-none cursor-pointer',
                  isDisabled ? '!cursor-not-allowed opacity-60' : 'hover:bg-gray-200',

                  isSelected && 'bg-greendarklight text-blackdark',

                  isToday && 'bg-primary text-white border border-primary',

                  !isSelected && !isToday && 'text-blackdark'
                )}
              >
                <span className='text-lg font-bold leading-18px'>{formatted}</span>
                <span className='text-sm font-normal leading-14px'>{dayName}</span>
              </span>
            );
          })}
        </div>

        <Button
          variant='none'
          onClick={() => handleWeekChange('next')}
          className='!p-0'
          icon={<Icon name='nextArrow' className='icon-wrapper w-5 h-5 text-blackdark' />}
        />
      </div>
      {/* Sessions list */}
      <div className={clsx('')}>
        {isPending || isLoading ? (
          <Skeleton count={3} className='h-24 bg-gray-300' parentClassName='flex gap-5 mt-5' />
        ) : upcomingSessionData.length ? (
          <DualAxisInfiniteScroll
            containerElement={'div'}
            hasMoreTop={hasNextPage}
            triggerOnHasMoreTop={fetchNextPage}
            containerClassName='flex flex-col gap-3.5 mt-3.5 max-h-[688px] overflow-y-auto scroll-disable'
          >
            {upcomingSessionData.map((session: SessionDataType) =>
              renderComponent(session, timezone)
            )}
            {hasNextPage && (
              <div className='flex justify-center items-center w-full py-4'>
                <span
                  className={`relative border-[5px] border-lime-500 border-b-lime-300 rounded-full block animate-spin h-5 w-5`}
                />
              </div>
            )}
          </DualAxisInfiniteScroll>
        ) : (
          <p className='text-lg text-primarygray text-center py-4'>
            No sessions scheduled for this date.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardUpcomingSessions;
