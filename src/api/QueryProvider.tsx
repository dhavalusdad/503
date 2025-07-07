import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

interface QueryProviderProps extends PropsWithChildren {
  config?: QueryClientConfig;
  idbValidKey?: string;
  maxAge?: number;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  config = {
    defaultOptions: {
      queries: {
        retry: 1,
        gcTime: 1000 * 60 * 60 * 24, 
        refetchOnWindowFocus: false
      }
    }
  }
}) => {
  const client = new QueryClient(config);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
