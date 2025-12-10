import { useEffect, useMemo, useRef } from 'react';

import { useGetInfiniteUserAssessmentFormsAPI } from '@/api/assessment-forms';
import type { AssessmentFormParamsType } from '@/api/types/user.dto';

export const useGetInfiniteUserAssessment = (params: AssessmentFormParamsType) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage, dataUpdatedAt } =
    useGetInfiniteUserAssessmentFormsAPI(params);

  const items = useMemo(() => {
    const infinite = (data as unknown as { pages?: Array<{ data }> }) || {};
    return infinite.pages?.flatMap(p => p?.data.data ?? []) ?? [];
  }, [data]);

  const total = useMemo(() => {
    const infinite = (data as unknown as { pages?: Array<{ total?: number }> }) || {};
    return infinite.pages?.[0]?.data.total ?? items.length;
  }, [data, items.length]);

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data: items,
    total: total,
    isLoading: isPending,
    loaderRef,
    dataUpdatedAt,
  };
};
