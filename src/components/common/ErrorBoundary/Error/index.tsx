import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

interface ErrorProps {
  path?: string;
}

export const Error: React.FC<ErrorProps> = () => {
  const handleReload = () => {
    window.location.reload(); // Reload the page
  };
  return (
    <div className='absolute left-2/4 top-2/4 -translate-2/4'>
      <div className='flex flex-col items-center gap-5 max-w-md'>
        <Icon name='error' className='icon-wrapper w-20 h-20 text-primary' />
        <h3 className='text-2xl leading-6 sm:text-3xl font-bold sm:leading-8 text-primary capitalize'>
          Something went wrong
        </h3>
        <div className='flex flex-col gap-1'>
          <p className='text-base sm:text-lg font-normal leading-5 sm:leading-6 text-primary text-center'>
            Our team is looking into the issue.
          </p>
          <p className='text-base sm:text-lg font-normal leading-5 sm:leading-6 text-primary text-center'>
            Hit the 'Reload' button to check if issue is resolved.
          </p>
        </div>
        <Button
          variant='filled'
          title='Reload'
          onClick={handleReload}
          className='w-full rounded-10px min-h-50px !font-bold tracking-widest'
          parentClassName='w-full'
        />
      </div>
    </div>
  );
};

export default Error;
