import React, { useRef, useState, useEffect, useCallback } from 'react';

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
  pagination?: boolean;
  keyboard?: boolean;
  autoplayDelay?: number;
  className?: string;
  title?: string;
  breakpoints?: { [key: number]: { slidesPerView: number; grid?: { rows: number } } };
  buttonPosition?: 'top' | 'right';
  grid?: { rows: number; fill?: 'row' | 'column' };
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

const SwiperComponentTherapistCards: React.FC<CustomSwiperProps> = ({
  children,
  slidesPerView = 1,
  spaceBetween = 10,
  slidesPerGroup = 1,
  pagination = false,
  keyboard = true,
  autoplayDelay,
  className = '',
  buttonPosition = 'top',
  title,
  breakpoints,
  grid,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!swiperRef.current) return;

    const swiper = swiperRef.current;

    const checkAndFetch = () => {
      if (!hasNextPage || !fetchNextPage || isFetchingNextPage || isFetchingRef.current) {
        return;
      }
      const totalSlides = swiper.slides.length;
      const visibleSlides = slidesPerView || 1;
      const lastVisibleIndex = swiper.realIndex + visibleSlides;
      const slidesRemaining = totalSlides - lastVisibleIndex;

      if (slidesRemaining <= 5) {
        isFetchingRef.current = true;
        fetchNextPage();
      }
    };

    checkAndFetch();

    const handler = () => {
      checkAndFetch();
    };

    swiper.on('slideChange', handler);

    return () => {
      swiper.off('slideChange', handler);
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, slidesPerView, children.length]);

  useEffect(() => {
    if (!isFetchingNextPage) {
      isFetchingRef.current = false;
    }
  }, [isFetchingNextPage]);

  const handleNextClick = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const isButtonHide = children.length <= (slidesPerView || 1);

  return (
    <>
      {/* Title */}
      {title && <h5 className='text-base font-bold leading-22px text-blackdark mb-4'>{title}</h5>}

      {/* Navigation Buttons */}
      {buttonPosition === 'top' && !isButtonHide && (
        <div className='flex justify-end items-center gap-2.5 mb-4'>
          <Button
            onClick={() => swiperRef.current?.slidePrev()}
            variant='none'
            isDisabled={isBeginning}
            icon={<Icon name='chevronLeft' className='custom-prev' />}
            className='border border-solid bg-white border-surface p-0 w-10 h-10 rounded-lg text-primarygray'
          />
          <Button
            onClick={handleNextClick}
            variant='none'
            isDisabled={isEnd && !hasNextPage}
            icon={<Icon name='chevronRight' className='custom-next' />}
            className='border border-solid bg-white border-surface p-0 w-10 h-10 rounded-lg text-primarygray'
          />
        </div>
      )}

      {/* Swiper */}
      <Swiper
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        slidesPerGroup={slidesPerGroup}
        keyboard={keyboard ? { enabled: true } : false}
        pagination={pagination ? { clickable: true } : false}
        breakpoints={breakpoints}
        grid={grid}
        autoplay={autoplayDelay ? { delay: autoplayDelay, disableOnInteraction: false } : undefined}
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

        {isFetchingNextPage && hasNextPage && (
          <SwiperSlide>
            <div className='bg-white border border-solid border-surface rounded-2xl p-3.5 w-full h-full flex items-center justify-center opacity-80'>
              <div className='text-center'>
                <div className='w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4' />
                <p className='text-sm font-medium text-primarygray'>Loading more appointments...</p>
              </div>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </>
  );
};

export default SwiperComponentTherapistCards;
