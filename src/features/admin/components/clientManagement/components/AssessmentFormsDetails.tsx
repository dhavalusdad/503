import Icon from '@/stories/Common/Icon';

const AssessmentFormsDetails = () => {
  return (
    <div className='bg-white border border-solid border-surface rounded-20px p-5 h-full'>
      <div className='flex items-center justify-center h-full'>
        <div className='flex flex-col gap-5 items-center'>
          <Icon name='assessmentformdata' className='text-primarygray' />
          <p className='text-xl font-normal leading-7 text-primarygray text-center'>
            The Form will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentFormsDetails;
