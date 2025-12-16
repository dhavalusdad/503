import { useEffect, useRef, useState } from 'react';

import moment from 'moment';
import 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetClientAppointmentBookingList } from '@/api/client-appointment-booking';
import { useSendMailToDependent } from '@/api/dependents';
import defaultUserPng from '@/assets/images/default-user.webp';
import Slider12 from '@/assets/images/slider12.webp';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus, SessionType, TherapyType } from '@/enums';
import CancelClientAppointmentModal from '@/features/calendar/components/CancelClientAppointmentModal';
import RescheduleAppointmentModal from '@/features/calendar/components/RescheduleAppointmentModal';
import { CopyLink } from '@/features/dashboard/components/CopyLink';
import { showToast } from '@/helper';
import { redirectTo } from '@/helper/redirect';
import { usePopupClose } from '@/hooks/usePopupClose';
import { selectIsTourActive } from '@/redux/ducks/tour';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Modal from '@/stories/Common/Modal';
import Skeleton from '@/stories/Common/Skeleton';
import SwiperComponent from '@/stories/Common/Swiper';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

// import type { SingleValue, MultiValue } from 'react-select';

interface Appointment {
  id: string;
  appointment_date: string;
  profile_image: string;
  session_type: string;
  clinic_address: string;
  therapist_id: string;
  therapist_name: string;
  therapy_name: string;
  video_room_name: string;
  status: string;
  clinic_name?: string;
  clinic_city?: string;
  clinic_state?: string;
  chat_session_id: string;
  dependent_users: { id: string; full_name: string; email: string; video_link: string }[];
}

interface currentUserStateType {
  id?: string;
  therapy_name: string;
  full_name?: string;
  email?: string;
  video_link?: string;
  login_user_video_link: string;
}

const SERVER_URL = import.meta.env.VITE_BASE_URL;
const APP_URL = import.meta.env.VITE_APP_URL;

export const DashboardCard = () => {
  const navigate = useNavigate();
  const { timezone } = useSelector(currentUser);
  const moreActionRef = useRef<HTMLDivElement>(null);
  const { isOpen: isVisible, setIsOpen: setIsVisible } = usePopupClose({
    popupRef: moreActionRef as React.RefObject<HTMLElement>,
  });
  const [dependentId, setDependentId] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [cancelAppointmentModalOpen, setCancelAppointmentModalOpen] = useState(false);
  const [isSendMailModalOpen, setIsSendMailModalOpen] = useState(false);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [currentUserDependents, setCurrentUserDependents] = useState<currentUserStateType[]>([]);
  const { mutate: sendMail, isPending } = useSendMailToDependent(() => setDependentId(''));
  const { data: appointmentData } = useGetClientAppointmentBookingList({
    page: 1,
    limit: 10,
    is_upcoming: true,
    timezone,
    columns: JSON.stringify([
      'id',
      'therapist_name',
      'therapy_name',
      'date',
      'therapist_id',
      'profile_image',
      'video_room_name',
      'status',
      'session_type',
      'clinic_address',
      'chat_session_id',
      'dependent_users',
    ]),
  });

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [now, setNow] = useState(moment().tz(timezone || 'UTC'));

  const isTourActive = useSelector(selectIsTourActive);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().tz(timezone || 'UTC'));
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  const handleDropdownToggle = (appointmentId: string) => {
    if (isVisible) {
      setIsVisible(false);
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(appointmentId);
      setIsVisible(true);
    }
  };

  const AppointmentCardSkeleton = ({ elementId }: { elementId?: string }) => {
    return (
      <div className='bg-white border border-surface rounded-2xl p-4 w-full' id={elementId}>
        {/* Header */}
        <div className='flex items-center justify-between pb-4 border-b border-surface'>
          <div className='flex items-center gap-3'>
            {/* Avatar */}
            <Image
              imgPath={defaultUserPng}
              imageClassName='rounded-full object-cover object-center w-full h-full'
              className='w-12 h-12 rounded-full'
              initialClassName='!text-base'
            />

            <div className='w-44'>
              <Skeleton
                count={2}
                className='h-3.5 w-full rounded last:w-4/5'
                parentClassName='flex flex-col gap-2 w-full'
              />
            </div>
          </div>

          {/* 3-dots icon circle */}
          <Button
            variant='none'
            parentClassName='bg-surface rounded-full'
            icon={<Icon name='eye' />}
          />
        </div>

        {/* Middle detail line */}
        <div className='py-4 border-b border-surface'>
          <Skeleton count={1} className='h-4 w-56 rounded' />
        </div>

        {/* Buttons Section */}
        <div className='flex items-center gap-3 py-4'>
          {/* Join Session (filled) */}
          <Button
            variant='filled'
            title='Join Session'
            className='rounded-lg w-full min-h-50px'
            parentClassName='w-3/5'
          />

          {/* Cancel button (outline red) */}
          <Button
            variant='outline'
            title='Cancel'
            isIconFirst
            className='rounded-lg w-full min-h-50px !border-red !text-red hover:!bg-red-50'
            parentClassName='w-2/5'
            icon={<Icon name='close' />}
          />
        </div>

        {/* Reschedule full-width button */}
        <Button
          variant='outline'
          title='Reschedule'
          isIconFirst
          className='rounded-lg w-full min-h-50px !border-surface !text-blackdark'
          parentClassName='w-full'
          icon={<Icon name='reschedule' />}
        />
      </div>
    );
  };

  const scheduledAppointments =
    appointmentData?.data?.filter(
      (appointment: Appointment) => appointment.status === AppointmentStatus.SCHEDULED
    ) ?? [];

  const showSkeletons = !scheduledAppointments.length && isTourActive;

  // handle empty / loading case
  if (!appointmentData?.data?.length && !showSkeletons) {
    return (
      <div className='bg-white rounded-2xl p-5'>
        <p className='text-center text-gray-500'>No upcoming appointments</p>
      </div>
    );
  }

  const getAppointmentRescheduleOrCancelled = (appointment: Appointment) => {
    const profileImage = appointment?.profile_image
      ? `${SERVER_URL}${appointment?.profile_image}`
      : null;
    const therapyType = appointment.therapy_name;
    const appointmentStartTime = moment(appointment.appointment_date).tz(timezone || 'UTC');
    const startTime = appointmentStartTime.format('MMMM D, YYYY, h:mm A');

    const minutesUntilAppointment = appointmentStartTime.diff(now, 'minutes');
    const showStartSessionButton = minutesUntilAppointment <= 15 && minutesUntilAppointment >= -60;

    return (
      <div
        id='tour-appoimentment-card'
        key={appointment.id}
        className='bg-white border border-solid border-surface rounded-2xl p-3.5 w-full flex-shrink-0'
      >
        {/* Header */}
        <div className='flex items-center justify-between pb-3.5 border-b border-solid border-surface'>
          <div className='flex items-center gap-2.5'>
            <div className='w-10 h-10 rounded-full overflow-hidden'>
              <Image
                imgPath={profileImage ?? Slider12}
                alt={appointment.therapist_name}
                imageClassName='rounded-full object-cover object-center w-full h-full'
                className='w-full h-full bg-surface'
                initialClassName='!text-base'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <h5 className='text-base font-bold leading-22px text-blackdark'>
                {appointment.therapist_name}
              </h5>
              <p className='text-sm font-normal leading-18px text-primarygray'>{therapyType}</p>
            </div>
          </div>
          <div className='relative'>
            <div
              className='cursor-pointer px-2'
              onClick={() => handleDropdownToggle(appointment.id)}
            >
              <Icon name='threedots' className='rotate-90' />
            </div>
            {isVisible && openDropdownId === appointment.id && (
              <div
                ref={moreActionRef}
                className='absolute right-0 top-full mt-1 flex flex-col items-center gap-2 min-w-40 bg-white rounded-10px p-2 px-3 border border-solid border-surface shadow-dropdown z-50'
              >
                <Button
                  variant='none'
                  title='View Details'
                  icon={<Icon name='eye' color='' className='rounded-full' />}
                  isIconFirst
                  parentClassName='w-full flex justify-start items-center p-1'
                  className='w-full !p-0 justify-start items-center text-[13px]'
                  onClick={() => {
                    navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(appointment.id));
                    setOpenDropdownId(null);
                  }}
                />

                {/* reschedule */}

                <Button
                  variant='none'
                  title='Reschedule'
                  icon={<Icon name='reschedule' color='' className='rounded-full' />}
                  isIconFirst
                  parentClassName='w-full flex justify-start items-center p-1'
                  className='w-full !p-0 justify-start items-center text-[13px]'
                  onClick={() => {
                    if (now.isAfter(appointmentStartTime)) {
                      showToast('Cannot reschedule past appointments');
                      return;
                    }
                    setIsRescheduleModalOpen(true);
                    setSelectedAppointmentId(appointment.id);
                    setSelectedTherapistId(appointment.therapist_id);
                    setOpenDropdownId(null);
                  }}
                  isDisabled={now.isAfter(appointmentStartTime)}
                />

                <Button
                  variant='none'
                  title='Cancel'
                  icon={<Icon name='close' color='red' className='rounded-full text-white' />}
                  isIconFirst
                  parentClassName='w-full flex justify-start items-center p-1'
                  className='w-full !p-0 justify-start items-center text-red text-[13px]'
                  onClick={() => {
                    setSelectedAppointmentId(appointment.id);
                    setCancelAppointmentModalOpen(true);
                    setOpenDropdownId(null);
                  }}
                  isDisabled={now.isAfter(appointmentStartTime)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <ul className='mt-3.5 flex-col flex gap-2.5 pb-3.5 border-b border-solid border-surface'>
          <li className='flex items-start gap-1.5'>
            <Icon name='calendar' className='text-primary' />
            <span className='text-sm font-medium text-blackdark leading-18px'>{startTime}</span>
          </li>
          <li className='flex items-start gap-1.5'>
            <Icon name='location' className='text-primary' />
            <span className='text-sm font-medium text-blackdark leading-18px'>
              {appointment.session_type === SessionType.CLINIC
                ? `${appointment.clinic_name} : ${appointment?.clinic_address},  ${appointment.clinic_city}, ${appointment.clinic_state}`
                : 'Virtual session'}
            </span>
          </li>
        </ul>

        {/* Actions */}
        <Tooltip
          disable={showStartSessionButton}
          placement='top'
          label='Available 15 minutes before session'
          className=' text-white text-sm px-3 py-1 rounded-lg shadow-lg bg-gray-800'
        >
          <div className='flex items-center mt-3.5 gap-2.5'>
            <Button
              variant='filled'
              title={appointment.session_type === SessionType.CLINIC ? 'Chat Now' : 'Join Session'}
              parentClassName='w-full'
              isDisabled={
                appointment.session_type === SessionType.CLINIC ? false : !showStartSessionButton
              }
              className='w-full rounded-lg !font-bold min-h-50px'
              isIconFirst
              onClick={() => {
                if (appointment.session_type === SessionType.CLINIC) {
                  navigate(`/chat/${appointment.chat_session_id}`);
                } else {
                  const url = ROUTES.JOIN_APPOINTMENT.navigatePath(appointment.video_room_name);
                  redirectTo(url, { isNewTab: true });
                }
              }}
            />
            {appointment.session_type === SessionType.VIRTUAL && (
              <Button
                variant='filled'
                icon={<Icon name='mail' className='icon-wrapper w-5 h-5' />}
                parentClassName=''
                isDisabled={!showStartSessionButton}
                className='rounded-lg !font-bold'
                onClick={() => {
                  setSelectedAppointmentId(appointment.id);
                  const currentData = appointment.dependent_users.map(dep => ({
                    ...dep,
                    therapy_name: appointment.therapy_name,
                    login_user_video_link: appointment.video_room_name,
                  }));
                  if (currentData.length === 0) {
                    const data = [
                      {
                        therapy_name: appointment.therapy_name,
                        login_user_video_link: appointment.video_room_name,
                      },
                    ];
                    setCurrentUserDependents(data);
                  } else {
                    setCurrentUserDependents(currentData);
                  }
                  setIsSendMailModalOpen(true);
                }}
              />
            )}
          </div>
        </Tooltip>
      </div>
    );
  };

  return (
    <>
      <div className='bg-white border border-solid border-surface rounded-2xl w-full p-5'>
        <div>
          <SwiperComponent
            slidesPerView={1}
            spaceBetween={20}
            slidesPerGroup={1}
            breakpoints={{
              576: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 1.5,
              },
              1024: {
                slidesPerView: 2,
              },
              1280: {
                slidesPerView: 2.7,
              },
              1536: {
                slidesPerView: 3,
              },
              1650: {
                slidesPerView: 4,
              },
            }}
          >
            {!showSkeletons
              ? scheduledAppointments.map((appointment: Appointment) => (
                  <div className='w-full' key={appointment.id} id={appointment.id}>
                    {getAppointmentRescheduleOrCancelled(appointment)}
                  </div>
                ))
              : Array.from({ length: 4 }).map((_, index) => (
                  <AppointmentCardSkeleton
                    key={index}
                    elementId={index === 1 ? 'tour-appoimentment-card' : undefined}
                  />
                ))}
          </SwiperComponent>
        </div>
      </div>

      {isRescheduleModalOpen && (
        <RescheduleAppointmentModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          appointmentId={selectedAppointmentId}
          parentModule='client-dashboard'
          therapistId={selectedTherapistId}
        />
      )}
      {cancelAppointmentModalOpen && (
        <CancelClientAppointmentModal
          isOpen={cancelAppointmentModalOpen}
          onClose={() => setCancelAppointmentModalOpen(false)}
          appointmentId={selectedAppointmentId}
        />
      )}
      {isSendMailModalOpen && currentUserDependents && (
        <Modal
          isOpen={isSendMailModalOpen}
          onClose={() => setIsSendMailModalOpen(false)}
          title='Send Mail'
          size='xl'
          className='overflow-hidden'
          contentClassName='pt-30px'
        >
          {/* Recipients section */}
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-5 border border-solid border-surface bg-Gray rounded-10px p-5'>
              <div className='flex items-center justify-between bg-white rounded-10px p-5 border border-blackdark/15 gap-5'>
                <span className='whitespace-nowrap'>Video Link :</span>
                <CopyLink
                  value={`${APP_URL}/join-appointment/${currentUserDependents[0]?.login_user_video_link}`}
                />
              </div>
            </div>
            {currentUserDependents[0]?.therapy_name !== TherapyType.INDIVIDUAL && (
              <h3 className='text-lg font-bold text-blackdark'>
                {' '}
                Therapy Type : {currentUserDependents[0]?.therapy_name}
              </h3>
            )}
            {currentUserDependents[0].id ? (
              <>
                <div className='flex flex-col gap-5 border border-solid border-surface bg-Gray rounded-10px p-5'>
                  {Array.isArray(currentUserDependents) && currentUserDependents.length > 0 ? (
                    currentUserDependents.map(dep => (
                      <div
                        key={dep.id}
                        className='flex items-center justify-between bg-white rounded-10px p-5 border border-blackdark/15 gap-5'
                      >
                        <div className='flex flex-col gap-1.5'>
                          {/* Full Name */}
                          <p className='text-sm font-semibold text-blackdark'>
                            {dep.full_name || 'Unknown User'}
                          </p>
                          {/* Email */}
                          <p className='text-sm text-blackdark/80'>{dep.email}</p>
                        </div>
                        {/* Video Link */}
                        {dep.video_link && <CopyLink value={dep.video_link} />}
                        {/* Send Mail Button */}
                        <Button
                          title='Send Mail'
                          variant='filled'
                          isLoading={isPending && dependentId == (dep.id || '')}
                          className='w-full rounded-lg !font-semibold whitespace-nowrap'
                          onClick={() => {
                            sendMail({
                              data: {
                                appointment_id: selectedAppointmentId,
                                dependent_id: dep.id,
                                timezone: timezone,
                              },
                            });
                            setDependentId(dep.id || '');
                          }}
                        />
                      </div>
                    ))
                  ) : currentUserDependents[0]?.therapy_name !== TherapyType.INDIVIDUAL ? (
                    <div className='text-sm text-gray-500 text-center'>
                      No Dependent Details Found
                    </div>
                  ) : null}
                </div>
              </>
            ) : currentUserDependents[0]?.therapy_name !== TherapyType.INDIVIDUAL ? (
              <div className='text-sm text-gray-500 text-center'>No Dependent Details Found</div>
            ) : (
              ''
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
