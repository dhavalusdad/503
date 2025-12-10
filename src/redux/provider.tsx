import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persister, store } from '@/redux/store';
import SectionLoader from '@/stories/Common/Loader/Spinner.tsx';

export function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <PersistGate loading={<SectionLoader />} persistor={persister}>
        {children}
      </PersistGate>
    </Provider>
  );
}
