import React, { useState, useCallback, useEffect, useMemo, type JSX } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  type GroupBase,
  type InputActionMeta,
  type PropsValue,
  type FormatOptionLabelMeta,
} from 'react-select';

import type { IconNameType } from '@/stories/Common/Icon';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import { Select, type SelectProps } from '@/stories/Common/Select/index';

import type { Control, FieldValues } from 'react-hook-form';

export interface CustomAsyncSelectProps<
  TFieldValues extends FieldValues,
  Option extends { value: string | number; label?: React.ReactNode; isDisabled?: boolean },
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> extends Omit<
    SelectProps<TFieldValues, Option, IsMulti, Group>,
    'options' | 'loadingMessage' | 'noOptionsMessage' | 'value'
  > {
  loadOptions: (
    page?: number,
    searchTerm?: string
  ) => Promise<{ data: Option[]; hasMore: boolean }>;
  defaultOptions?: Option[];
  cacheOptions?: boolean;
  resetCacheOnHasMoreFalse?: boolean;
  loadingMessage?: string;
  noOptionsMessage?: string;
  loadingMoreMessage?: string;
  onHasMoreChange?: (hasMore: boolean) => void;
  pageSize?: number;
  queryKey: string | readonly string[];
  AddOption?: Option;
  searchDebounceMs?: number;
  AddOptionAction?: () => void;
  maxSelectedToShow?: number;
  leftIcon?: IconNameType;
  control?: Control<TFieldValues>;
  value?: PropsValue<Option> | string;
  refetchOnChangeValue?: unknown;
  leftIconClassname?: string;
}

export const CustomAsyncSelect = React.forwardRef(
  <
    TFieldValues extends FieldValues,
    Option extends { value: string | number; label?: React.ReactNode; isDisabled?: boolean },
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
  >(
    {
      queryKey,
      loadOptions,
      AddOption,
      defaultOptions = [],
      cacheOptions = true,
      resetCacheOnHasMoreFalse = false,
      loadingMessage = 'Loading...',
      noOptionsMessage = 'No options available',
      loadingMoreMessage = 'Loading more...',
      onHasMoreChange,
      searchDebounceMs = 500,
      onFocus,
      onMenuScrollToBottom,
      onInputChange,
      AddOptionAction,
      leftIcon,
      refetchOnChangeValue,
      leftIconClassname,
      ...selectProps
    }: CustomAsyncSelectProps<TFieldValues, Option, IsMulti, Group>,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isActive, setIsActive] = useState(false);

    // 🔹 Debounce search term
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), searchDebounceMs);
      return () => clearTimeout(timer);
    }, [searchTerm, searchDebounceMs]);

    const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, refetch } =
      useInfiniteQuery({
        queryKey: Array.isArray(queryKey)
          ? [...queryKey, debouncedSearchTerm]
          : [queryKey, debouncedSearchTerm],
        queryFn: ({ pageParam = 1 }) => loadOptions(pageParam, debouncedSearchTerm),
        getNextPageParam: (lastPage, allPages) =>
          lastPage.hasMore ? allPages.length + 1 : undefined,
        initialPageParam: 1,
        enabled: isActive,
        staleTime: cacheOptions ? 5 * 60 * 1000 : 0,
        gcTime: cacheOptions ? 10 * 60 * 1000 : 0,
      });

    useEffect(() => {
      if (refetchOnChangeValue) {
        refetch();
      }
    }, [JSON.stringify(refetchOnChangeValue)]);

    // 🔹 Flatten pages → options
    const options = useMemo(() => {
      if (!data?.pages) return defaultOptions;
      return data.pages.flatMap(page => page.data);
    }, [data?.pages, defaultOptions]);

    // 🔹 Notify parent about hasMore change
    useEffect(() => {
      const lastPage = data?.pages?.[data.pages.length - 1];
      if (lastPage?.hasMore !== undefined) {
        onHasMoreChange?.(lastPage.hasMore);
      }
    }, [data?.pages, onHasMoreChange]);

    // 🔹 Reset cache if required
    useEffect(() => {
      if (resetCacheOnHasMoreFalse && !hasNextPage) {
        refetch();
      }
    }, [hasNextPage, resetCacheOnHasMoreFalse, refetch]);

    const loadMoreOptionsData = useCallback(async () => {
      if (!isFetchingNextPage && hasNextPage) {
        try {
          await fetchNextPage();
        } catch (error) {
          console.error('Error loading more options:', error);
        }
      }
    }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (!data?.pages || !cacheOptions) {
          refetch();
        }
        setIsActive(true);
        onFocus?.(event);
      },
      [data?.pages, cacheOptions, refetch, onFocus]
    );

    const handleMenuScrollToBottom = useCallback(
      (event: WheelEvent | TouchEvent) => {
        if (hasNextPage) loadMoreOptionsData();
        onMenuScrollToBottom?.(event as WheelEvent | TouchEvent);
      },
      [loadMoreOptionsData, onMenuScrollToBottom, hasNextPage]
    );

    const handleInputChange = useCallback(
      (newValue: string, actionMeta: InputActionMeta) => {
        if (newValue === '') {
          setSearchTerm('');
        } else if (actionMeta.action === 'input-change') setSearchTerm(newValue);
        onInputChange?.(newValue, actionMeta);
      },
      [onInputChange]
    );

    const optionsWithLoader = useMemo(() => {
      if (isFetchingNextPage && hasNextPage) {
        return [
          ...options,
          {
            value: '__loading__',
            label: (
              <span className='flex items-center justify-center p-2'>
                <SectionLoader className='relative h-4' size='h-4 w-4 !border-[2px]' />
                <span className='ml-2 text-sm text-gray-600'>{loadingMoreMessage}</span>
              </span>
            ),
            isDisabled: true,
          } as Option,
        ];
      }
      return options;
    }, [options, isFetchingNextPage, hasNextPage, loadingMoreMessage]);
    const { value: rawValue, ...restSelectProps } = selectProps as {
      value?: PropsValue<Option> | string;
    } & Omit<CustomAsyncSelectProps<TFieldValues, Option, IsMulti, Group>, 'value'>;
    return (
      <div ref={ref}>
        <Select
          {...restSelectProps}
          options={AddOption ? [AddOption, ...optionsWithLoader] : optionsWithLoader}
          isLoading={isLoading || isFetching}
          onFocus={handleFocus}
          onMenuScrollToBottom={handleMenuScrollToBottom}
          onInputChange={handleInputChange}
          leftIcon={leftIcon}
          leftIconClassname={leftIconClassname}
          loadingMessage={() => (
            <span className='flex items-center justify-center p-2'>
              <SectionLoader className='relative h-6' size='h-5 w-5 !border-[3px]' />
              <span className='ml-2 text-sm text-gray-600'>{loadingMessage}</span>
            </span>
          )}
          noOptionsMessage={() =>
            AddOption && selectProps?.formatOptionLabel ? (
              <div onClick={AddOptionAction} className='cursor-pointer'>
                {selectProps?.formatOptionLabel(AddOption, {
                  context: 'menu',
                } as FormatOptionLabelMeta<Option>)}
              </div>
            ) : (
              noOptionsMessage
            )
          }
          value={
            typeof rawValue === 'string' && rawValue.trim()
              ? (options.find(d => String(d.value) === rawValue) as PropsValue<Option>)
              : (rawValue as PropsValue<Option> | undefined)
          }
        />
      </div>
    );
  }
) as <
  TFieldValues extends FieldValues = FieldValues,
  Option extends { value: string | number; label?: React.ReactNode; isDisabled?: boolean } = {
    value: string | number;
    label?: React.ReactNode;
    isDisabled?: boolean;
  },
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: CustomAsyncSelectProps<TFieldValues, Option, IsMulti, Group> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => JSX.Element;

export default CustomAsyncSelect;
