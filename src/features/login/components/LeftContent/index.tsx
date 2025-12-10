import Slider1 from '@/assets/images/slider1.webp';
import Slider10 from '@/assets/images/slider10.webp';
import Slider11 from '@/assets/images/slider11.webp';
import Slider12 from '@/assets/images/slider12.webp';
import Slider2 from '@/assets/images/slider2.webp';
import Slider3 from '@/assets/images/slider3.webp';
import Slider4 from '@/assets/images/slider4.webp';
import Slider5 from '@/assets/images/slider5.webp';
import Slider6 from '@/assets/images/slider6.webp';
import Slider7 from '@/assets/images/slider7.webp';
import Slider8 from '@/assets/images/slider8.webp';
import Slider9 from '@/assets/images/slider9.webp';
import Image from '@/stories/Common/Image';
import SwiperComponent from '@/stories/Common/Swiper';

export const LeftContent = () => {
  return (
    <SwiperComponent
      showNav={false}
      className='h-full'
      autoplayDelay={5000}
      slidesPerView={1}
      spaceBetween={0}
    >
      {[
        <Image
          imgPath={Slider1}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider2}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider3}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider4}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider5}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider6}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider7}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider8}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider9}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider10}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider11}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
        <Image
          imgPath={Slider12}
          imageClassName='object-cover w-full h-full'
          className='w-full h-full'
        />,
      ]}
    </SwiperComponent>
  );
};

export default LeftContent;
