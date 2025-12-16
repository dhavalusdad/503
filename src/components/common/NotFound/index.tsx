import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ROUTE_BASE_PATH, ROUTES } from '@/constants/routePath';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

const generateStars = (count = 80) => {
  return Array.from({ length: count }).map((_, i) => {
    const top = Math.random() * 100;
    const delay = Math.random() * 10;
    const size = Math.random() * 2 + 1;

    return (
      <div
        key={i}
        className='star absolute bg-white rounded-full opacity-70 animate-starfloat'
        style={{
          top: `${top}vh`,
          left: `${Math.random() * 100 + 50}vw`, // start outside screen
          width: size,
          height: size,
          animationDelay: `-${delay}s`,
        }}
      ></div>
    );
  });
};

const NotFound = () => {
  const navigate = useNavigate();
  const user = useSelector(currentUser);
  const isAuthenticated = !!user.id;

  return (
    <div className='flex flex-col items-center h-screen justify-center text-center bg-primary overflow-hidden w-full relative'>
      {/* ⭐ Stars Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none z-0'>
        {generateStars(250)}
      </div>
      <div className='relative z-10 px-5'>
        <h1 className='text-9xl sm:text-140px text-white tracking-wider whitespace-nowrap font-bold drop-shadow-content'>
          4
          <span className='inline-block text-white animate-notfound'>
            <Icon name='notfound' className='icon-wrapper w-28 h-28 sm:w-36 sm:h-36' />
          </span>
          4
        </h1>
        <div className='flex flex-col items-center gap-3 sm:gap-5 relative mt-3 sm:mt-5'>
          <div className='flex flex-col gap-5'>
            <div className='w-full bg-white h-px'></div>
            <h2 className='text-white text-3xl sm:text-4xl font-bold'>404 page not found</h2>
          </div>
          <p className='text-white text-base sm:text-xl'>
            Sorry, the page you're looking doesn't exist.
          </p>
          <Button
            variant='outline'
            title={isAuthenticated ? 'Go To Dashboard' : 'Go To Home Page'}
            className='w-full uppercase rounded-10px !font-bold min-h-50px !text-primary'
            parentClassName='w-full mt-5'
            onClick={() => {
              if (isAuthenticated) {
                navigate(ROUTE_BASE_PATH.DASHBOARD);
              } else {
                navigate(ROUTES.DEFAULT.path);
              }
            }}
          />
        </div>
      </div>
      <div className='absolute w-24 sm:w-32 bottom-0 animate-astronaut'>
        <Image
          imgPath={
            'https://images.vexels.com/media/users/3/152639/isolated/preview/506b575739e90613428cdb399175e2c8-space-astronaut-cartoon-by-vexels.png'
          }
        />
      </div>
    </div>
  );
};

export default NotFound;
