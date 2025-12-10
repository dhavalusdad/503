import * as Sentry from '@sentry/react';
import {
  type DefaultError,
  type QueryFunction,
  type QueryFunctionContext,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult as UseQueryResultRQ,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult as UseInfiniteQueryResultRQ,
  useMutation as useMutationRQ,
  useQuery as useQueryRQ,
  useInfiniteQuery as useInfiniteQueryRQ,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
interface CustomBackendError {
  success: false;
  message: string;
}

import { showToast as showToastHelper } from '@/helper';

export type UseQueryResult<TData = unknown, TError = AxiosError | DefaultError> = UseQueryResultRQ<
  TData,
  TError
>;

export type UseQueryRestParamsType = {
  showToast?: boolean;
};

export type CustomUseQueryOptions<
  TQueryFnData = unknown,
  TError = AxiosError,
  TData = TQueryFnData,
  TQueryKeyType extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKeyType> & {
  queryFn?: QueryFunction<TQueryFnData, TQueryKeyType>;
  cacheTime?: number;
  staleTime?: number;
  showToast?: boolean;
};

export type CustomUseMutationOptions<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  showToast?: boolean;
};

export const useMutation = <
  TData = unknown,
  TError = AxiosError | DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: CustomUseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  const { mutationFn, showToast = true, onError: userOnError } = options;
  return useMutationRQ({
    ...options,
    ...(mutationFn && {
      mutationFn: async (variables: TVariables): Promise<TData> => {
        try {
          const res = await mutationFn(variables);
          if (showToast) {
            showToastHelper(res.message, 'SUCCESS');
          }
          return res;
        } catch (error) {
          const axiosError = error as AxiosError;
          const responseData = axiosError.response?.data as CustomBackendError;
          const message = responseData?.message || 'Something went wrong';
          const status = axiosError.response?.status;

          const isCustomError =
            typeof responseData === 'object' &&
            responseData?.success === false &&
            typeof responseData?.message === 'string';

          showToastHelper(message, 'ERROR');

          // ✅ Log only non-custom
          if (!isCustomError && axiosError instanceof AxiosError) {
            Sentry.captureException(axiosError, {
              tags: {
                error_type: 'react_query_mutation',
                http_status: status,
                http_method: axiosError.config?.method?.toUpperCase(),
              },
              contexts: {
                mutation: {
                  url: axiosError.config?.url,
                  method: axiosError.config?.method,
                },
                response: {
                  status,
                  data: responseData,
                },
              },
              level: 'error',
            });
          }

          throw error;
        }
      },
    }),
    onError: (error, variables, context) => {
      // Call user's onError if provided
      if (userOnError) {
        userOnError(error, variables, context);
      }
      // Don't re-throw here - let React Query handle it
    },
  } as UseMutationOptions<TData, TError, TVariables, TContext>);
};

export const useQuery = <
  TQueryFnData = unknown,
  TError = AxiosError | DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: CustomUseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> => {
  const { queryFn, showToast = false, ...rest } = options;
  return useQueryRQ({
    ...rest,
    ...(queryFn &&
      typeof queryFn == 'function' && {
        queryFn: async (context: QueryFunctionContext<TQueryKey>) => {
          try {
            const res = await queryFn(context);
            if (showToast) {
              showToastHelper(res?.message, 'SUCCESS');
            }
            return res?.data;
          } catch (error) {
            const axiosError = error as AxiosError;
            const responseData = axiosError.response?.data as CustomBackendError;
            const message = responseData?.message || 'Something went wrong';
            const status = axiosError.response?.status;

            const isCustomError =
              typeof responseData === 'object' &&
              responseData?.success === false &&
              typeof responseData?.message === 'string';

            showToastHelper(message, 'ERROR');

            // ✅ Log only non-custom
            if (!isCustomError && axiosError instanceof AxiosError) {
              Sentry.captureException(axiosError, {
                tags: {
                  error_type: 'react_query_query',
                  http_status: status,
                  http_method: axiosError.config?.method?.toUpperCase(),
                },
                contexts: {
                  query: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                  },
                  response: {
                    status,
                    data: responseData,
                  },
                },
                level: 'error',
              });
            }

            throw error;
          }
        },
      }),
  });
};

export type UseInfiniteQueryResult<
  TData = unknown,
  TError = AxiosError | DefaultError,
> = UseInfiniteQueryResultRQ<TData, TError>;

export type CustomUseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = AxiosError,
  TData = TQueryFnData,
  TQueryKeyType extends QueryKey = QueryKey,
> = UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKeyType> & {
  queryFn?: QueryFunction<TQueryFnData, TQueryKeyType>;
  showToast?: boolean;
};

export const useInfiniteQuery = <
  TQueryFnData = unknown,
  TError = AxiosError | DefaultError,
  TData = TQueryFnData,
  TQueryKeyType extends QueryKey = QueryKey,
>(
  options: CustomUseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKeyType>
): UseInfiniteQueryResult<TData, TError> => {
  const { queryFn, showToast = false, ...rest } = options;

  return useInfiniteQueryRQ({
    ...rest,
    ...(queryFn &&
      typeof queryFn == 'function' && {
        queryFn: async (context: QueryFunctionContext<TQueryKeyType>) => {
          try {
            const res = await queryFn(context);
            if (showToast) {
              showToastHelper(res?.message, 'SUCCESS');
            }
            return res;
          } catch (error) {
            const axiosError = error as AxiosError;
            const responseData = axiosError.response?.data as CustomBackendError;
            const message = responseData?.message || 'Something went wrong';
            const status = axiosError.response?.status;

            const isCustomError =
              typeof responseData === 'object' &&
              responseData?.success === false &&
              typeof responseData?.message === 'string';

            showToastHelper(message, 'ERROR');

            // ✅ Log only non-custom
            if (!isCustomError && axiosError instanceof AxiosError) {
              Sentry.captureException(axiosError, {
                tags: {
                  error_type: 'react_query_infinite_query',
                  http_status: status,
                  http_method: axiosError.config?.method?.toUpperCase(),
                },
                contexts: {
                  query: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                  },
                  response: {
                    status,
                    data: responseData,
                  },
                },
                level: 'error',
              });
            }

            throw error;
          }
        },
      }),
  });
};
