import LoginImage1 from '@/assets/images/login_image1.webp';
import LoginImage2 from '@/assets/images/login_image2.webp';
import LoginImage3 from '@/assets/images/login_image3.webp';
import LoginImage4 from '@/assets/images/login_image4.webp';
import LoginImage5 from '@/assets/images/login_image5.webp';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

export const LeftContent = () => {
  return (
    <div className='h-full bg-greendarklight p-10 relative'>
      <div className='lg:absolute lg:left-2/4 lg:top-2/4 lg:-translate-2/4'>
        <div className='relative mx-auto md:w-478px md:h-478px w-[300px] h-[300px] rounded-full border border-primary/20 flex items-center justify-center'>
          <div className='absolute md:-top-1 left-24 -top-7'>
            <Image imgPath={LoginImage1} />
          </div>
          <div className='absolute md:right-8 md:top-9 right-2 top-2'>
            <Image imgPath={LoginImage2} />
          </div>
          <div className='relative md:w-336px md:h-336px w-[200px] h-[200px] rounded-full border border-primary/20 flex items-center justify-center'>
            <div className='absolute md:-bottom-3 md:right-[75px] -bottom-5 right-10'>
              <Image imgPath={LoginImage5} />
            </div>
            <div className='absolute md:bottom-16 md:-left-3.5 bottom-16 -left-6'>
              <Image imgPath={LoginImage4} />
            </div>
            <div className='relative md:w-196px md:h-196px w-[100px] h-[100px] rounded-full border border-primary/20 flex items-center justify-center'>
              <div className='absolute md:top-0 md:right-0 -top-8 -right-2'>
                <Image imgPath={LoginImage3} />
              </div>
              <Icon name='smallLogo' />
            </div>
          </div>
        </div>
      </div>
      <div className='flex items-end justify-center h-full mt-8 lg:mt-0'>
        <div className='flex flex-col gap-2.5'>
          <h4 className='text-xl font-bold leading-7 text-blackdark'>
            Lorem ipsum dolor sit amet Habitasse malesuada purus massa
          </h4>
          <p className='text-base leading-6 font-normal text-blackdark'>
            Lorem ipsum dolor sit amet consectetur. Habitasse malesuada purus massa leo dignissim
            diam at. Risus pellentesque lectus dictum facilisi ullamcorper cursus lorem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeftContent;
