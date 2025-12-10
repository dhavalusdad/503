import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import type { PendingFormListProps } from '@/features/dashboard/types';
import Icon from '@/stories/Common/Icon';
import SwiperComponent from '@/stories/Common/Swiper';

export const TodoList = ({ data }: { data: PendingFormListProps[] }) => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex flex-wrap items-center gap-2.5'>
          <Icon name='todotimer' className='text-yellow' />
          <h5 className='text-lg font-bold text-blackdark leading-6'>To Do List</h5>
        </div>
        <div className='flex items-center gap-5'>
          <div
            className={clsx(
              'bg-primary rounded-full flex items-center justify-center min-w-6 min-h-6 text-white text-xs font-bold',
              data.length > 99 ? 'py-1 px-1.5' : ''
            )}
          >
            <span>{data.length > 99 ? '99+' : data.length > 0 && data.length} </span>
          </div>
          <p className='text-base font-normal text-blackdark leading-22px'>
            Complete your pending to do list.
          </p>
        </div>
      </div>
      {/* when data not found */}
      {data.length == 0 && (
        <div className='flex flex-col gap-2.5 items-center'>
          <Icon name='todolist' className='text-primarygray' />
          <span className='text-base font-normal text-primarygray leading-22px'>
            You don't have any to do task.
          </span>
        </div>
      )}

      {/* Todo List */}
      {data.length > 0 && (
        <div className=' bg-white border border-solid border-surface rounded-2xl w-full p-5'>
          <SwiperComponent
            slidesPerView={1}
            slidesPerGroup={1}
            spaceBetween={20}
            className='w-full'
            breakpoints={{
              576: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1280: {
                slidesPerView: 3,
              },
            }}
          >
            {data.map((todo, index) => (
              <div
                key={index}
                className='bg-yellow/10 border border-solid border-yellow rounded-10px p-3.5 w-full flex flex-col justify-between cursor-pointer'
                onClick={() => navigate(ROUTES.SUBMIT_FORM_RESPONSE.navigatePath(todo.id))}
              >
                <div className='flex gap-2.5 w-full items-center'>
                  <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-blackdark/12 flex-shrink-0'>
                    <Icon name='note' className='text-blackdark' />
                  </div>
                  <h6 className='text-sm lg:text-base font-bold leading-22px text-blackdark break-words truncate'>
                    Complete {todo.form_title}
                  </h6>
                </div>
              </div>
            ))}
          </SwiperComponent>
        </div>
      )}
    </div>
  );
};

export default TodoList;
