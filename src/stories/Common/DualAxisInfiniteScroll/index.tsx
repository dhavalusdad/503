import React, { useEffect, useRef, useCallback } from 'react';

import clsx from 'clsx';
import { debounce } from 'lodash';

export interface DualAxisInfiniteScrollProps {
  hasMoreBottom?: boolean;
  hasMoreTop?: boolean;
  triggerOnHasMoreTop?: () => void;
  triggerOnHasMoreBottom?: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  containerElement?: React.ElementType;
  loading?: boolean;
  scrollToMessageId?: string;
}

export const DualAxisInfiniteScroll = ({
  hasMoreBottom,
  hasMoreTop,
  triggerOnHasMoreTop,
  triggerOnHasMoreBottom,
  children,
  containerClassName,
  containerRef,
  containerElement: Container = 'div',
  loading = false,
  scrollToMessageId,
}: DualAxisInfiniteScrollProps) => {
  const rootMargin = '100px';

  // Sentinel refs for intersection observers
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Internal container ref if none provided
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const activeContainerRef = containerRef || internalContainerRef;

  const fetchMoreTop = useCallback(
    debounce(() => {
      if (!hasMoreTop || loading) return;
      triggerOnHasMoreTop?.();
    }, 300),
    [hasMoreTop, triggerOnHasMoreTop, loading]
  );

  const fetchMoreBottom = useCallback(
    debounce(() => {
      if (!hasMoreBottom || loading) return;
      triggerOnHasMoreBottom?.();
    }, 300),
    [hasMoreBottom, triggerOnHasMoreBottom, loading]
  );

  useEffect(() => {
    if (!scrollToMessageId) return;
    const container = activeContainerRef.current;
    const element = document.getElementById(`message-${scrollToMessageId}`);
    if (element && container) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToMessageId]);

  useEffect(() => {
    const container = activeContainerRef.current;
    const topSentinel = topSentinelRef.current;
    const bottomSentinel = bottomSentinelRef.current;
    if (!container || !topSentinel || !bottomSentinel) return;

    const observerOptions = { root: container, rootMargin };

    const topObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreTop && !loading) fetchMoreTop();
    }, observerOptions);

    const bottomObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreBottom && !loading) fetchMoreBottom();
    }, observerOptions);

    topObserver.observe(topSentinel);
    bottomObserver.observe(bottomSentinel);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
      fetchMoreTop.cancel();
      fetchMoreBottom.cancel();
    };
  }, [hasMoreTop, hasMoreBottom, loading, fetchMoreTop, fetchMoreBottom]);

  return (
    <Container ref={activeContainerRef} className={clsx('', containerClassName)}>
      <div ref={bottomSentinelRef} style={{ height: '1px' }} aria-hidden='true' />
      {children}
      <div ref={topSentinelRef} style={{ height: '1px' }} aria-hidden='true' />
    </Container>
  );
};

export default DualAxisInfiniteScroll;
