import { useLocation } from 'react-router-dom';

import TherapistSlider1 from '@/assets/images/TherapistSlider1.webp';
import TherapistSlider2 from '@/assets/images/TherapistSlider2.webp';
import TherapistSlider3 from '@/assets/images/TherapistSlider3.webp';
import TherapistSlider4 from '@/assets/images/TherapistSlider4.webp';
import TherapistSlider5 from '@/assets/images/TherapistSlider5.webp';
import TherapistSlider6 from '@/assets/images/TherapistSlider6.webp';
import TherapistSlider7 from '@/assets/images/TherapistSlider7.webp';
import TherapistSlider8 from '@/assets/images/TherapistSlider8.webp';
import { ROUTES } from '@/constants/routePath';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import SwiperComponent from '@/stories/Common/Swiper';

export const LeftContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === ROUTES.THERAPIST_LOGIN.path;
  // const isRegister = location.pathname === ROUTES.THERAPIST_REGISTER.path;
  const isForgot = location.pathname === ROUTES.THERAPIST_FORGOT.path;
  const isResetPassword = location.pathname === ROUTES.THERAPIST_RESET_PASSWORD.path;
  // const isVerification = location.pathname === ROUTES.THERAPIST_VERIFICATION.path;
  const isPasswordChanged = location.pathname === ROUTES.THERAPIST_PASSWORD_CHANGED.path;
  return (
    <div className='bg-bluelight h-full relative py-12 2xl:py-16 xl:px-20 2xl:px-104px px-14'>
      <div className='absolute xl:-top-10 xl:-left-10 2xl:-top-5 2xl:-left-5 top-0 left-0'>
        <Icon name='linear' className='text-blackdark' />
      </div>
      <div className='relative inline-block xl:mb-14 2xl:mb-20'>
        <div className='absolute -left-7 -top-4'>
          <Icon name='loadinglogin' />
        </div>
        {isLogin && (
          <>
            <h2 className='text-32px font-bold text-blackdark'>Care you trust in.</h2>
            <h2 className='text-32px font-bold text-blackdark relative'>
              <span className='z-10 relative'>Made simple with Cyti</span>
              <span className='absolute -right-5 top-3.5'>
                <Icon name='bghighlight' />
              </span>
            </h2>
          </>
        )}
        {isForgot && (
          <h2 className='text-32px font-bold text-blackdark relative'>
            <span className='z-10 relative'>
              Care You Trust In. Where Your <br /> Purpose Meets Our Platform.
            </span>
            <span className='absolute right-0 -bottom-1'>
              <Icon name='bghighlight' className='icon-wrapper w-200px' />
            </span>
          </h2>
        )}
        {(isResetPassword || isPasswordChanged) && (
          <h2 className='text-32px font-bold text-blackdark relative'>
            <span className='z-10 relative'>
              Protect Yourself & Your Family <br /> Easy Online Appointments
            </span>
            <span className='absolute right-5 -bottom-1.5'>
              <Icon name='bghighlight' className='icon-wrapper w-52' />
            </span>
          </h2>
        )}
      </div>
      <div className='relative'>
        <div className='absolute md:-right-12 -right-9 -top-8 flex'>
          <div className='relative z-10 -top-5 left-4'>
            <Icon name='loginstar' className='text-primary icon-wrapper w-7 h-7' />
          </div>
          <div className='relative z-10'>
            <Icon name='loginstar' className='text-primary' />
          </div>
        </div>
        <div className='absolute md:-left-14 -left-10 z-10 md:top-1/5 top-1/12'>
          <div className='bg-white border border-solid border-surface shadow-surfaceshadow p-2.5 flex items-center gap-2 rounded-10px'>
            <Icon name='statistics' />
            <h5 className='text-lg font-bold text-black'>98% Client Satisfaction</h5>
          </div>
        </div>
        <div className='rounded-2xl overflow-hidden xl:h-[calc(100dvh-250px)] 2xl:h-[calc(100dvh-336px)]'>
          <SwiperComponent
            autoplayDelay={5000}
            showNav={false}
            slidesPerView={1}
            spaceBetween={0}
            className='h-full'
          >
            {[
              <Image
                imgPath={TherapistSlider1}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider2}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider3}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider4}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider5}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider6}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider7}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
              <Image
                imgPath={TherapistSlider8}
                className='w-full h-full rounded-2xl'
                imageClassName='h-full w-full object-cover rounded-2xl'
              />,
            ]}
          </SwiperComponent>
        </div>
        <div className='absolute md:-right-16 -right-10 z-10 bottom-1/5'>
          <div className='bg-white border border-solid border-surface shadow-surfaceshadow p-2.5 flex items-center gap-2 rounded-10px'>
            <Icon name='statistics' />
            <h5 className='text-lg font-bold text-black'>98% Client Satisfaction</h5>
          </div>
        </div>
        <div className='absolute -right-10 -bottom-11'>
          <Icon name='loadingloginbigger' />
        </div>
      </div>
    </div>
  );
};

export default LeftContent;
