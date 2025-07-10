// components/SwiperComponent.tsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

import { Pagination, Navigation, Autoplay } from "swiper/modules";

interface SwiperComponentProps {
  children: React.ReactNode[];
  slidesPerView?: number;
  spaceBetween?: number;
  navigation?: boolean;
  pagination?: boolean;
  autoplayDelay?: number;
}

const SwiperComponent: React.FC<SwiperComponentProps> = ({
  children,
  slidesPerView = 1,
  spaceBetween = 10,
  navigation = false,
  pagination = true,
  autoplayDelay,
}) => {
  return (
    <Swiper
      className="h-full"
      modules={[Pagination, Navigation, ...(autoplayDelay ? [Autoplay] : [])]}
      slidesPerView={slidesPerView}
      spaceBetween={spaceBetween}
      navigation={navigation}
      pagination={pagination ? { clickable: true } : false}
      autoplay={
        autoplayDelay
          ? {
              delay: autoplayDelay,
              disableOnInteraction: false,
            }
          : undefined
      }
    >
      {children.map((child, index) => (
        <SwiperSlide key={index}>{child}</SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SwiperComponent;
