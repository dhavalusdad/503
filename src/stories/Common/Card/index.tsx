import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type { TherapistBasicDetails } from '@/api/types/therapist.dto';
import DummyUserImage from '@/assets/images/default-user.webp';
import { ROUTES } from '@/constants/routePath';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import type { CardProps } from '@/stories/Common/Card/types';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

type TimeSlotValue = { id?: string; status?: string };
type AvailableTimeSlot = { time?: string; value?: TimeSlotValue };

type ClinicInfo = {
  clinic_address_id: string;
  clinic_address: {
    id: string;
    name: string;
    address: string;
    state: {
      name: string;
      country: {
        name: string;
      };
    };
    city: {
      name: string;
    };
  };
};

const Card: React.FC<CardProps> = ({
  data: therapist,
  isDatepicker = false,
  onClick,
  index,
  onRequestSlot,
  className = '',
  fromDashboard = false,
  handleSlot,
  appliedFilters,
}) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showAddressTooltip, setShowAddressTooltip] = useState(false);
  const { timezone: loggedInUserTimezone, id: loggedInUserId } = useSelector(currentUser);
  const timezone = loggedInUserId ? loggedInUserTimezone : moment.tz.guess();
  const navigate = useNavigate();
  const selectedDate = useRef<Date | null>(null);
  const formatAvailableTimes = (): { times: AvailableTimeSlot[]; date: string } => {
    if (!therapist?.availability || therapist.availability.length === 0) {
      return { times: [], date: '' };
    }

    // Filter only available slots
    const availableSlots = therapist.availability.filter(slot => slot.status === 'Available');
    if (availableSlots.length === 0) return { times: [], date: '' };

    const now = moment.tz(timezone);

    const next24Hours = now.clone().add(24, 'hours');

    // ✅ Only take slots after 24 hours
    const futureSlots = availableSlots
      .filter(slot => {
        const slotDate = moment.tz(slot.start_time, timezone);
        return slotDate.isAfter(next24Hours);
      })
      .sort(
        (a, b) =>
          moment.tz(a.start_time, timezone).valueOf() - moment.tz(b.start_time, timezone).valueOf()
      );
    if (futureSlots.length > 0) {
      const nextDate = moment.tz(futureSlots[0].start_time, timezone);
      const nextDateSlots = futureSlots.filter(slot =>
        moment.tz(slot.start_time, timezone).isSame(nextDate, 'day')
      );

      const times = nextDateSlots.slice(0, 3).map(slot => ({
        time: moment.tz(slot.start_time, timezone).format('h:mm A'),
        value: {
          id: slot.id,
          status: slot.status,
        },
      }));

      selectedDate.current = moment.tz(futureSlots[0].start_time, timezone).startOf('day').toDate();

      return {
        times,
        date: moment.tz(futureSlots[0].start_time, timezone).format('MMM D, YYYY'),
      };
    }

    return { times: [], date: '' };
  };

  const getExpertiseAreas = (): string[] => {
    if (!therapist?.specialties?.length) {
      return therapist?.area_of_focus?.map(area => area?.name).filter(Boolean) ?? [];
    }

    return (
      therapist.specialties
        ?.map(specialty => {
          const specialtyWithNested = specialty as {
            area_of_focus?: { name?: string };
            name?: string;
          };
          return specialtyWithNested?.area_of_focus?.name ?? specialtyWithNested?.name ?? '';
        })
        .filter(name => Boolean(name)) ?? []
    );
  };

  const handleSlotSelect = (time?: AvailableTimeSlot, therapistData?: TherapistBasicDetails) => {
    const slotDate = selectedDate.current ?? new Date();
    const slotTime = time ?? '';

    if (fromDashboard && handleSlot) {
      handleSlot({
        selectedDate: slotDate,
        selectedTime: slotTime,
      });
    } else {
      navigate(ROUTES.BOOK_APPOINTMENTS_DETAILS.path, {
        state: {
          therapist: {
            ...therapistData,
            first_name: therapistData?.user?.first_name,
            last_name: therapistData?.user?.last_name,
          },
          therapistId: therapistData?.id,
          selectedDate: slotDate,
          selectedTime: slotTime,
          slotId: time?.value?.id,
          timeSlot: slotTime,
          appliedFilters,
        },
      });
    }
  };

  const { times: availableTimes, date: availableDate } = formatAvailableTimes();
  const expertiseAreas = getExpertiseAreas();
  const hasAvailability = availableTimes.length > 0;
  const profileImage = therapist?.user?.profile_image
    ? BASE_URL + therapist?.user?.profile_image
    : '';
  const clinicAddresses: ClinicInfo[] = (therapist?.clinics as ClinicInfo[]) || [];
  const primaryClinicAddress = clinicAddresses?.[0]?.clinic_address || null;

  // floating
  // NEW STATES FOR TOOLTIP
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('right');

  const cardRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Side Position Calculation
  const positionTooltip = () => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    if (spaceLeft > spaceRight) setTooltipPosition('left');
    else setTooltipPosition('right');
  };

  // DESKTOP HOVER EVENTS
  const handleMouseEnter = () => {
    if (window.innerWidth <= 1279) return; // ignore on mobile
    positionTooltip();
    setIsTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth <= 1279) return; // ignore on mobile
    setIsTooltipOpen(false);
  };

  // MOBILE CLICK TOGGLE
  const toggleTooltip = () => {
    if (window.innerWidth > 1279) return; // ignore on desktop
    positionTooltip();
    // setIsTooltipOpen(prev => !prev);
    setIsTooltipOpen(true);
  };

  useEffect(() => {
    if (!isTooltipOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (window.innerWidth > 1279) return; // desktop not needed

      if (
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsTooltipOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isTooltipOpen]);

  return (
    <div
      className={` border border-solid border-surface rounded-20px  ${className}`}
      id={therapist?.user?.id}
    >
      {/* Main Card Content */}
      <div className='relative h-full'>
        {/* Profile Image */}
        <div
          ref={cardRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleTooltip} // MOBILE
          className='w-full group relative  bg-Gray rounded-t-20px '
        >
          <Image
            imgPath={profileImage || DummyUserImage}
            alt={`${therapist?.user?.first_name} ${therapist?.user?.last_name}`}
            className={` overflow-hidden h-48 w-full rounded-t-20px`}
            imageClassName={clsx('h-full w-full object-contain')}
          />

          <div
            ref={tooltipRef}
            className={clsx(
              'bg-white rounded-20px p-5 w-332px absolute sm:top-0 top-full shadow-content z-10',
              tooltipPosition === 'right' ? 'left-full -ml-2' : 'right-full -mr-2',
              isTooltipOpen ? 'block' : 'hidden'
            )}
          >
            {/* Arrow indicator */}
            <div
              className={clsx(
                'absolute top-24 text-white',
                tooltipPosition === 'right' ? '-left-2 rotate-180' : '-right-2 rotate-0'
              )}
            >
              <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                <path d='M8 0l8 8-8 8V0z' />
              </svg>
            </div>

            <div className='relative'>
              {/* Header */}
              <div className='flex items-center gap-2.5'>
                <Image
                  imgPath={profileImage}
                  firstName={therapist?.user?.first_name}
                  lastName={therapist?.user?.last_name}
                  alt='User Avatar'
                  imageClassName='rounded-full object-cover object-center w-full h-full'
                  className='w-10 h-10 rounded-full bg-Gray overflow-hidden'
                  initialClassName='!text-base'
                />
                <div className='flex flex-col gap-2.5'>
                  <h4 className='text-base font-bold leading-4 text-blackdark'>
                    {therapist?.user?.first_name} {therapist?.user?.last_name}
                  </h4>
                  <p className='text-sm font-normal leading-3.5 text-primarygray'>Therapist</p>
                </div>
              </div>

              <div className='bg-surface my-3.5 w-full h-1px' />

              {/* Details */}
              <div className='flex flex-col gap-2.5'>
                <p className='text-sm font-normal leading-21px text-blackdark'>
                  <strong>Area of Expertise :</strong>{' '}
                  {expertiseAreas?.join(', ') || 'Not specified'}
                </p>
                <p className='text-sm font-normal leading-21px text-blackdark'>
                  <strong>Years of Experience :</strong>{' '}
                  {therapist?.years_experience && therapist.years_experience > 0
                    ? `${therapist.years_experience} years`
                    : 'Not specified'}
                </p>
                <p className='text-base font-normal text-blackdark'>
                  {therapist?.bio && therapist.bio.split(' ').length > 50 ? (
                    isBioExpanded ? (
                      <>
                        {therapist.bio}
                        <span
                          className='font-bold cursor-pointer'
                          onClick={() => {
                            setIsBioExpanded(!isBioExpanded);
                          }}
                        >
                          {' '}
                          See Less
                        </span>
                      </>
                    ) : (
                      <>
                        {`${therapist.bio.split(' ').slice(0, 50).join(' ')}...`}
                        <span
                          className='font-bold cursor-pointer'
                          onClick={() => {
                            setIsBioExpanded(!isBioExpanded);
                          }}
                        >
                          {' '}
                          See More
                        </span>
                      </>
                    )
                  ) : (
                    therapist?.bio
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className='p-5 flex flex-col justify-between h-[calc(100%-192px)]'>
          {/* Therapist Info */}
          <div className='relative'>
            <div className='flex flex-col gap-2.5'>
              <h4 className='text-lg font-bold text-blackdark leading-18px'>
                {therapist?.user?.first_name} {therapist?.user?.last_name}
              </h4>
              <p className='text-base font-normal leading-4 text-primarygray'>Therapist</p>
            </div>

            <div className='bg-surface my-3.5 w-full h-1px' />

            {/* Availability Section */}
            <div className='flex flex-col gap-2.5'>
              {hasAvailability && (
                <span className='text-base font-medium leading-4 text-blackdark'>
                  {hasAvailability ? `${availableDate} Available Times` : ''}
                </span>
              )}

              <div
                className={clsx('flex items-start gap-2.5', isDatepicker ? 'justify-between' : '')}
              >
                <div className='flex items-center gap-2.5 flex-wrap'>
                  {hasAvailability ? (
                    availableTimes?.map((time, idx) => (
                      <span
                        key={idx}
                        className={clsx(
                          'text-sm leading-4 font-normal text-blackdark rounded-md border border-solid border-primarygray px-3 py-2.5 cursor-pointer transition-colors duration-150',
                          'hover:bg-primary hover:text-white hover:border-primary'
                        )}
                        onClick={() => handleSlotSelect(time, therapist)}
                      >
                        {time.time}
                      </span>
                    ))
                  ) : (
                    <span className='text-base leading-4 font-normal text-blackdark '>
                      No Slot Available
                    </span>
                  )}
                </div>

                {availableTimes.length > 0 && isDatepicker && (
                  <Button
                    icon={<Icon name='calendar' className='icon-wrapper w-4 h-4' />}
                    variant={hasAvailability ? 'filled' : 'none'}
                    onClick={hasAvailability ? onClick : undefined}
                    className='text-sm font-normal text-blackdark rounded-md border border-solid border-primarygray !p-2.5 !leading-18px'
                  />
                )}
              </div>
            </div>
          </div>
          <div className='relative'>
            <div className='bg-surface my-3.5 w-full h-1px' />
            {/* Action Button */}
            {primaryClinicAddress && (
              <div className='mb-4'>
                <div className='flex flex-wrap items-center gap-2 text-sm text-blackdark'>
                  <span className='leading-5 truncate'>
                    {' '}
                    <span className='font-bold'>Address:</span>{' '}
                    {`${primaryClinicAddress.address + primaryClinicAddress?.city?.name}, ${
                      primaryClinicAddress?.state?.name
                    }, ${primaryClinicAddress?.state?.country?.name}`}
                  </span>
                </div>
                {clinicAddresses.length > 0 && (
                  <div
                    className='relative inline-flex items-center gap-1 mt-2 cursor-pointer text-primary text-sm font-medium'
                    onMouseEnter={() => setShowAddressTooltip(true)}
                    onMouseLeave={() => setShowAddressTooltip(false)}
                  >
                    {clinicAddresses.length - 1 === 0 ? (
                      <span> show address</span>
                    ) : (
                      <span>+{clinicAddresses.length - 1} more address</span>
                    )}
                    {showAddressTooltip && clinicAddresses.length > 0 && (
                      <div
                        className={clsx(
                          'absolute bg-white rounded-20px p-5 w-80 shadow-content border border-solid border-surface z-20',
                          index % 4 === 3 ? 'left-auto right-full -mr-2' : 'left-full -ml-2'
                        )}
                      >
                        {/* Arrow */}
                        <div
                          className={clsx(
                            'absolute top-1/4 text-white',
                            index % 4 === 3 ? '-right-2 rotate-0' : '-left-2 rotate-180'
                          )}
                        >
                          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                            <path d='M8 0l8 8-8 8V0z' />
                          </svg>
                        </div>

                        {/* Tooltip Content */}
                        <div className='flex flex-col'>
                          {clinicAddresses.map((clinic, index) => (
                            <div key={clinic.clinic_address_id || index}>
                              <p className='text-sm font-semibold text-blackdark'>
                                {' '}
                                <span className='font-bold'>{clinic.clinic_address?.name}: </span>
                                {clinic?.clinic_address?.address
                                  ? `${clinic.clinic_address.address}, ${
                                      clinic?.clinic_address.city?.name
                                    }, ${clinic.clinic_address.state?.name}, ${
                                      clinic.clinic_address.state?.country?.name
                                    }`
                                  : 'Address not available'}
                              </p>

                              {/* Divider except last item */}
                              {index !== clinicAddresses.length - 1 && (
                                <div className='border-b border-surface my-1'></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <Button
              variant={hasAvailability ? 'filled' : 'none'}
              title={hasAvailability ? 'Book Now' : `Request a Time slot`}
              onClick={hasAvailability ? onClick : onRequestSlot}
              className={`w-full rounded-lg text-lg font-bold leading-18px border border-solid border-black/20 bg-primary text-white`}
              // isDisabled={!hasAvailability}
            />
          </div>
        </div>
      </div>

      {/* Hover Card */}
    </div>
  );
};

export default Card;
