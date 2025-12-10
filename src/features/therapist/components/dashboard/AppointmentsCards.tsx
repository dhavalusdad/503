import { useEffect, useRef, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useInfiniteTherapistAppointmentQuery } from '@/api/appointment';
import ProfileImage from '@/assets/images/Rectangle1.webp';
import { ROUTES } from '@/constants/routePath';
import { SessionType } from '@/enums';
import CancelTherapistAppointmentModal from '@/features/calendar/components/CancelTherapistAppointmentModal';
import { RescheduleAppointmentModal } from '@/features/calendar/components/RescheduleAppointmentModal';
import { showToast } from '@/helper';
import { redirectTo } from '@/helper/redirect';
import { usePopupClose } from '@/hooks/usePopupClose';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Select, { type SelectOption } from '@/stories/Common/Select';
import Spinner from '@/stories/Common/Spinner';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

import SwiperComponentTherapistCards from './SwiperCardsTherapistAppointment';

import type { InfiniteTherapistAppointmentResponse, TherapistAppointment } from '../../types';
import type { SingleValue, MultiValue } from 'react-select';

const AppointmentsCards = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<SelectOption>({
    value: 'today',
    label: 'Today',
  });

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [cancelAppointmentModalOpen, setCancelAppointmentModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const { timezone } = useSelector(currentUser);

  const {
    data: appData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteTherapistAppointmentQuery({
    timezone: timezone,
    filter: selectedFilter.value,
  });

  const appointments = ((appData as InfiniteTherapistAppointmentResponse)?.pages ?? []).flatMap(
    page => page.data ?? []
  );

  const filterOptions: SelectOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'upcoming', label: 'Upcoming' },
  ];

  const formatTime = (dateString: string) => {
    return moment(dateString)
      .tz(timezone || 'UTC')
      .format('h:mm A');
  };
  const moreActionRef = useRef<HTMLDivElement>(null);

  const { isOpen: isVisible, setIsOpen: setIsVisible } = usePopupClose({
    popupRef: moreActionRef as React.RefObject<HTMLElement>,
  });

  const handleDropdownToggle = (appointmentId: string) => {
    if (openDropdownId === appointmentId) {
      setOpenDropdownId(null);
      setIsVisible(false);
    } else {
      setOpenDropdownId(appointmentId);
      setIsVisible(true);
    }
  };

  const getStatusButton = (status: string, appointmentId: string, startTime: string) => {
    const startTimeMoment = moment(startTime).tz(timezone || 'UTC');
    const now = moment().tz(timezone || 'UTC');

    switch (status) {
      case 'Scheduled':
        return (
          <div className='flex items-center gap-1 relative'>
            <div className='flex items-center gap-2 rounded-full bg-yellow border-yellow py-1 px-3 text-white'>
              <Icon name='dot' className='icon-wrapper w-2 h-2' />
              <span className='text-xs 2xl:text-sm'>Upcoming</span>
            </div>
            <div className='cursor-pointer' onClick={() => handleDropdownToggle(appointmentId)}>
              <Icon name='threedots' className='rotate-90' />
            </div>
            {isVisible && openDropdownId === appointmentId && (
              <div
                ref={moreActionRef}
                className='absolute right-0 top-full mt-1 flex flex-col items-center gap-3.5 min-w-40 bg-white rounded-10px py-2 px-3 border border-solid border-surface shadow-dropdown z-50'
              >
                {/* view details */}
                <Button
                  variant='none'
                  title='View Details'
                  icon={<Icon name='eye' color='' className='rounded-full' />}
                  isIconFirst
                  parentClassName='w-full flex justify-start items-center'
                  className='w-full !p-0 justify-start'
                  onClick={() => navigate(`/appointment/${appointmentId}`)}
                />
                {/* reschedule */}
                <Button
                  variant='none'
                  title='Reschedule'
                  icon={<Icon name='reschedule' color='' className='rounded-full' />}
                  isIconFirst
                  parentClassName='w-full flex justify-start items-center'
                  className='w-full !p-0 justify-start'
                  onClick={() => {
                    if (now.isAfter(startTimeMoment)) {
                      showToast('Cannot reschedule past appointments');
                      return;
                    }
                    setIsRescheduleModalOpen(true);
                    setSelectedAppointmentId(appointmentId);
                    setIsVisible(false);
                  }}
                  isDisabled={now.isAfter(startTimeMoment)}
                />

                <Button
                  variant='none'
                  title='Cancel'
                  icon={<Icon name='close' color='red' className='rounded-full text-white' />}
                  isIconFirst
                  parentClassName='w-full flex justify-start items-center'
                  className='w-full !p-0 justify-start'
                  onClick={() => {
                    setSelectedAppointmentId(appointmentId);
                    setCancelAppointmentModalOpen(true);
                    setIsVisible(false);
                  }}
                  isDisabled={now.isAfter(startTimeMoment)}
                />
              </div>
            )}
          </div>
        );
      case 'Cancelled':
        return (
          <div className='flex items-center gap-2 rounded-full bg-red border-red py-1 px-3 text-white'>
            <Icon name='dot' className='icon-wrapper w-2 h-2' />
            <span className='text-xs 2xl:text-sm'>Cancelled</span>
          </div>
        );
      default:
        return (
          <div className='relative'>
            <Icon name='threedots' />
          </div>
        );
    }
  };

  const getActionButton = (
    status: string,
    startTime: string,
    endTime: string,
    id: string,
    video_room_name: string
  ) => {
    const StartSessionButton = () => {
      const [now, setNow] = useState(moment().tz(timezone || 'UTC'));

      useEffect(() => {
        const interval = setInterval(() => {
          setNow(moment().tz(timezone || 'UTC'));
        }, 1000);

        return () => clearInterval(interval);
      }, [timezone]);

      const startTimeMoment = moment(startTime).tz(timezone || 'UTC');
      const minutesDiff = startTimeMoment.diff(now, 'minutes');
      const endDiff = moment(endTime)
        .tz(timezone || 'UTC')
        .diff(now, 'minutes');
      const buttonDisabled = minutesDiff > 15 || endDiff < -30;

      if (status === 'Cancelled') {
        return (
          <Button
            variant='filled'
            title='View Details'
            parentClassName='w-full'
            className='w-full rounded-lg !font-bold !text-sm'
            onClick={() => navigate(`/appointment/${id}`)}
          />
        );
      }

      return (
        <>
          <Tooltip
            disable={!buttonDisabled}
            placement='top'
            label='Available 15 minutes before session'
            className='text-white text-sm px-3 py-1 rounded-lg shadow-lg bg-blackdark'
          >
            <div>
              <Button
                variant='filled'
                title='Start Session'
                parentClassName='w-full'
                isDisabled={buttonDisabled}
                className='w-full rounded-lg !font-bold !text-sm'
                onClick={() => {
                  const url = ROUTES.JOIN_APPOINTMENT.navigatePath(video_room_name);
                  redirectTo(url, { isNewTab: false });
                }}
              />
            </div>
          </Tooltip>
        </>
      );
    };
    return <StartSessionButton />;
  };

  const getFilter = () => {
    return (
      <div className='flex justify-between'>
        <div className='flex items-center gap-0'>
          <p className='text-lg font-normal text-primarygray'>Showing:</p>
          <Select
            options={filterOptions}
            value={selectedFilter}
            onChange={handleFilterChange}
            isSearchable={false}
            className='text-sm'
            placeholder=''
            portalRootId={true}
            StylesConfig={{
              control: () => ({
                width: '100%',
                border: 'none',
                outline: 'none !important',
                minHeight: '26px',
              }),
              menu: () => ({ minWidth: '140px' }),
              dropdownIndicator: () => ({
                backgroundColor: '#E8ECF3',
                width: '24px',
                height: '24px',
                borderRadius: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
          />
        </div>
      </div>
    );
  };

  const handleFilterChange = (newValue: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (newValue && !Array.isArray(newValue)) {
      setSelectedFilter(newValue as SelectOption);
    }
  };

  if (isFetching && appointments.length === 0) {
    return (
      <div className='bg-white rounded-2xl p-5 shadow-therapistdashbaordcard w-full !min-h-[20rem] flex justify-center items-center'>
        <Spinner size='w-8 h-8' color='text-lime-500' className='mx-auto my-4' />
      </div>
    );
  }

  if (!isFetching && appointments.length === 0) {
    return (
      <div className='flex flex-col gap-5'>
        <div className='bg-white rounded-2xl p-5 shadow-therapistdashbaordcard'>
          {getFilter()}
          <div className='mt-5'>
            <p className='text-center text-gray-500'>No appointments for today</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-white rounded-2xl p-5 shadow-therapistdashbaordcard w-full  !min-h-[20rem]'>
        {getFilter()}
        <div className='mt-5 overflow-auto scrollbar-hide '>
          <SwiperComponentTherapistCards
            slidesPerView={1}
            spaceBetween={10}
            slidesPerGroup={1}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            breakpoints={{
              768: {
                slidesPerView: 1,
              },
              1024: {
                slidesPerView: 2,
              },
              1600: {
                slidesPerView: 2.7,
              },
              1700: {
                slidesPerView: 3,
              },
            }}
          >
            {appointments.map((appointment: TherapistAppointment) => (
              <div
                key={appointment.id}
                className='bg-white border border-solid border-surface rounded-2xl p-3.5 w-full'
              >
                <div className='flex sm:flex-row flex-col items-start gap-3 justify-between'>
                  <div className='flex items-start gap-2.5'>
                    <Image
                      imgPath={ProfileImage}
                      className='w-12 min-w-12 h-12 rounded-full'
                      imageClassName='w-full h-full object-cover object-center rounded-full'
                    />
                    <div className='flex flex-col gap-1.5'>
                      <h6 className='text-base font-bold text-blackdark leading-22px'>
                        {appointment.client.user.first_name} {appointment.client.user.last_name}
                      </h6>
                      <div className='flex flex-col gap-1'>
                        <div className='flex flex-wrap items-start gap-1'>
                          <p className='text-sm font-bold text-blackdark leading-18px'>
                            Treatment:{' '}
                          </p>
                          <span className='text-sm font-medium text-blackdark leading-18px'>
                            {appointment.appointment_area_of_focus[0]?.area_of_focus?.name || 'N/A'}
                          </span>
                        </div>

                        <div className='flex items-center gap-1.5 '>
                          <Icon name='calendar' className='text-primarygra' />
                          <span className='text-13px xl:text-sm font-medium text-primarygray whitespace-nowrap '>
                            {moment(appointment.slot.start_time)
                              .tz(timezone || 'UTC')
                              .format('MMM DD, YYYY')}
                          </span>
                          <div className='bg-primarylight w-1px h-18px mx-1 xl:mx-2'></div>
                          <div className='flex items-center gap-1.5'>
                            <Icon name='todotimer' className='text-primarygray' />
                            <span className='text-13px xl:text-sm font-medium text-primarygray whitespace-nowrap'>
                              {formatTime(appointment.slot.start_time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {getStatusButton(appointment.status, appointment.id, appointment.slot.start_time)}
                </div>
                <div className='flex flex-wrap items-center gap-1.5 my-3'>
                  <div className='flex flex-wrap gap-1'>
                    <div className='flex items-center gap-1.5 overflow-hidden'>
                      <p className='text-sm font-bold text-blackdark whitespace-nowrap'>
                        Therapy Type:{' '}
                      </p>
                      <span className='text-sm font-semibold text-blackdark truncate'>
                        {appointment.therapy_type.name}
                      </span>
                    </div>
                    <div className='bg-primarylight w-1px h-18px mx-2'></div>
                    <div className='flex items-center gap-1.5 overflow-hidden'>
                      <p className='text-sm font-bold text-blackdark whitespace-nowrap'>
                        Session Type:{' '}
                      </p>
                      <span className='text-sm font-semibold text-blackdark truncate'>
                        {appointment.session_type === SessionType.VIRTUAL
                          ? SessionType.VIRTUAL
                          : SessionType.CLINIC}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-5 justify-between'>
                  <div className='relative bg-surface rounded-3px h-1.5 w-full'>
                    <div
                      style={{
                        width: `${parseInt(appointment.sessions_count) > 15 ? 100 : (parseInt(appointment.sessions_count) / 15) * 100}%`,
                      }}
                      className='absolute left-0 h-1.5 rounded-3px bg-primary'
                    ></div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='text-sm font-normal text-blackdark'>
                      {appointment.sessions_count}
                    </span>

                    <span className='text-sm font-normal text-blackdark'>/</span>
                    <span className='text-sm font-bold text-blackdark'>15</span>
                  </div>
                </div>
                {appointment.session_type === SessionType.CLINIC && (
                  <div className='flex items-start gap-1.5 mt-3.5'>
                    <Icon name='location' className='text-primary' />
                    <span className='text-sm font-medium text-blackdark leading-18px'>
                      {appointment?.clinic_address?.name} :{' '}
                      {[
                        appointment?.clinic_address?.address,
                        appointment?.clinic_address?.state?.name,
                        appointment?.clinic_address?.city?.name,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                <div className='flex sm:flex-nowrap flex-wrap items-center gap-3.5 mt-3.5 relative'>
                  {appointment.session_type === 'Virtual' && (
                    <div className='group sm:w-2/4'>
                      {getActionButton(
                        appointment.status,
                        appointment.slot.start_time,
                        appointment.slot.end_time,
                        appointment.id,
                        appointment.video_room_name
                      )}
                    </div>
                  )}

                  <Button
                    variant='none'
                    title='Add Memo'
                    icon={<Icon name='sessionducuments' />}
                    isIconFirst
                    parentClassName={`${appointment.session_type === 'Virtual' ? 'sm:w-2/4' : 'w-full'}`}
                    className='border-surface border rounded-lg py-3 px-5 w-full !font-bold !text-sm text-blackdark'
                    onClick={() =>
                      navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(appointment.id), {
                        state: { openNotes: true },
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </SwiperComponentTherapistCards>
        </div>
      </div>
      {cancelAppointmentModalOpen && (
        <CancelTherapistAppointmentModal
          isOpen={cancelAppointmentModalOpen}
          onClose={() => {
            setCancelAppointmentModalOpen(false);
          }}
          appointmentId={selectedAppointmentId}
          parentModule='therapist-dashboard'
        />
      )}
      {isRescheduleModalOpen && (
        <RescheduleAppointmentModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          appointmentId={selectedAppointmentId}
          parentModule='therapist-dashboard'
        />
      )}
    </>
  );
};

export default AppointmentsCards;
