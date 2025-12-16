import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import Button from '@/stories/Common/Button';

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-red-500 mb-4'>403</h1>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Access Denied</h2>
        <p className='text-gray-600 mb-8 max-w-md'>
          You don't have permission to access this page. Please contact your administrator if you
          believe this is an error.
        </p>
        <div className='flex gap-4 justify-center'>
          {/* <Button
            variant='outline'
            title='Go Back'
            onClick={() => navigate(-1)}
            className='px-6 py-2'
          /> */}
          <Button
            variant='filled'
            title='Go to Dashboard'
            onClick={() => navigate(ROUTES.ADMIN_DASHBOARD.path)}
            className='px-6 py-2'
          />
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
