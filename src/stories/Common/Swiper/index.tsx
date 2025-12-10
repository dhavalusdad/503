import React, { useRef, useState } from 'react';

import { Keyboard, Pagination, Navigation, Autoplay, Grid } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper-bundle.css';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

import type SwiperType from 'swiper';

interface CustomSwiperProps {
  children: React.ReactNode[];
  slidesPerView?: number;
  spaceBetween?: number;
  slidesPerGroup?: number;

  // NOTE: separate props
  showNav?: boolean; // ← control custom prev/next buttons (was your `pagination` usage)
  showBullets?: boolean; // ← control pagination dots (Swipers pagination)

  keyboard?: boolean;
  autoplayDelay?: number;
  className?: string;
  title?: string;
  breakpoints?: { [key: number]: { slidesPerView: number; grid?: { rows: number } } };
  buttonPosition?: 'top' | 'right';
  grid?: { rows: number; fill?: 'row' | 'column' };
}

const SwiperComponent: React.FC<CustomSwiperProps> = ({
  children,
  slidesPerView = 1,
  spaceBetween = 10,
  slidesPerGroup = 1,

  // new semantics
  showNav = true, // default: don't show custom nav
  showBullets = false, // default: don't show bullets

  keyboard = true,
  autoplayDelay,
  className = '',
  buttonPosition = 'top',
  title,
  breakpoints,
  grid,
}) => {
  const swiperRef = useRef<SwiperType>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const isButtonHide = children?.length < slidesPerView;

  return (
    <>
      {/* Title */}
      {title && (
        <h5 className='text-base top-12 font-bold leading-22px text-blackdark ml-25'>{title}</h5>
      )}

      {/* Custom Navigation Buttons (controlled by showNav) */}
      {buttonPosition === 'top' && showNav && !isButtonHide && (
        <div className='flex justify-end items-center gap-2.5 mb-2 swiper-btn'>
          <Button
            onClick={() => swiperRef.current?.slidePrev()}
            variant='none'
            isDisabled={isBeginning}
            icon={<Icon name='chevronLeft' className='custom-prev' />}
            className='border border-solid bg-white border-surface p-0 w-10 h-10 rounded-lg text-primarygray'
          />
          <Button
            onClick={() => swiperRef.current?.slideNext()}
            variant='none'
            isDisabled={isEnd}
            icon={<Icon name='chevronRight' className='custom-next' />}
            className='border border-solid bg-white border-surface p-0 w-10 h-10 rounded-lg text-primarygray'
          />
        </div>
      )}

      {/* Swiper */}
      <Swiper
        key={children?.length}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        slidesPerGroup={slidesPerGroup}
        keyboard={keyboard ? { enabled: true } : false}
        // IMPORTANT: pass pagination to Swiper based ONLY on showBullets
        pagination={showBullets ? { clickable: true } : false}
        breakpoints={breakpoints}
        grid={grid}
        autoplay={
          autoplayDelay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
              }
            : undefined
        }
        speed={500}
        modules={[Keyboard, Pagination, Navigation, Grid, ...(autoplayDelay ? [Autoplay] : [])]}
        onSwiper={s => {
          swiperRef.current = s;
          setIsBeginning(s.isBeginning);
          setIsEnd(s.isEnd);
        }}
        onSlideChange={s => {
          setIsBeginning(s.isBeginning);
          setIsEnd(s.isEnd);
        }}
        className={`mySwiper ${className}`}
      >
        {children?.map((child, index) => (
          <SwiperSlide key={index} className='!flex justify-center'>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default SwiperComponent;
