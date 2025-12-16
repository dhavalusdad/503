import '../sentry.client.config';
import { withErrorBoundary } from '@sentry/react';
import { ToastContainer } from 'react-toastify';

import QueryProvider from '@/api/QueryProvider';
import useApp from '@/hooks/useApp';
import { Providers } from '@/redux/provider';
import Route from '@/routes';
import { SocketProvider } from '@/socket/socketContext';
import SectionLoader from '@/stories/Common/Loader/Spinner';

const PreRoute = () => {
  const { isLoading } = useApp();

  if (!isLoading) {
    return <Route />;
  }

  return <SectionLoader />;
};

const App = () => {
  return (
    <QueryProvider>
      <Providers>
        <SocketProvider>
          <ToastContainer
            position='top-right'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
            style={{ zIndex: 10000 }}
          />
          <PreRoute />
        </SocketProvider>
      </Providers>
    </QueryProvider>
  );
};

// Wrap with Sentry's Error Boundary
export default withErrorBoundary(App, {
  fallback: <p>Something went wrong.</p>,
});
