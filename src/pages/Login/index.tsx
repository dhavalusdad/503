import { GoogleOAuthProvider } from '@react-oauth/google';

import { LeftContent, RightContent } from '@/features/login/components';

const Login = () => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className='h-screen flex xl:flex-row flex-col-reverse xl:gap-0 gap-6'>
        <div className='xl:w-2/4 hidden xl:block w-full'>
          <LeftContent />
        </div>
        <div className='xl:w-2/4 w-full bg-white flex items-center justify-center overflow-y-auto h-full py-7 xl:px-0 px-5'>
          <RightContent />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
