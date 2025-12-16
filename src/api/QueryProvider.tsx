import type { PropsWithChildren } from 'react';

import { captureException } from '@sentry/react';
import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface QueryProviderProps extends PropsWithChildren {
  config?: QueryClientConfig;
  idbValidKey?: string;
  maxAge?: number;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: error => {
        // Global error handler for mutations
        if (error instanceof AxiosError) {
          captureException(error, {
            tags: {
              error_type: 'react_query_global_mutation',
              http_status: error.response?.status,
            },
            level: 'error',
          });
        }
      },
    },
  },
});

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;
