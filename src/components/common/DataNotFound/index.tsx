import clsx from 'clsx';

import Icon from '@/stories/Common/Icon';

export interface DataNotFoundProps {
  parentClassName?: string;
}

const DataNotFound: React.FC<DataNotFoundProps> = ({ parentClassName }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-5 py-10', parentClassName)}>
      <Icon name='noResultFound' className='icon-wrapper w-14 h-14' />
      <div className='flex flex-col gap-2.5 items-center'>
        <h6 className='text-xl text-primarygray font-bold'>No Data Found</h6>
        <p className='text-base text-primarygray leading-5 font-normal'>
          We couldn’t retrieve any data at the moment
        </p>
      </div>
    </div>
  );
};

export default DataNotFound;
