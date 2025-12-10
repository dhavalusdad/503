import { useEffect, useRef } from 'react';

import type { TherapistSearchResultsProps } from '@/features/appointment/types';
import Card from '@/stories/Common/Card';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';

const TherapistSearchResults = ({
  therapistList,
  isLoading,
  searchTerm,
  onSearchTermChange,
  totalCount,
  onTherapistClick,
  fetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
  activeSearch,
  onRequestSlot,
  appliedFilters,
}: TherapistSearchResultsProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Search Header */}
      {activeSearch && (
        <div className='flex items-center flex-wrap mt-30px'>
          <h4 className='text-lg leading-6 font-bold text-blackdark'>
            {totalCount > 0 ? `Search Results (${totalCount} found)` : 'Search Results'}
          </h4>
          <InputField
            type='text'
            placeholder='Search therapists by name...'
            icon='search'
            iconFirst
            iconClassName='text-primarygray'
            inputClass={'!text-base '}
            value={searchTerm}
            onChange={onSearchTermChange}
            parentClassName='w-full md:w-76 lg:w-360px ml-auto'
          />
        </div>
      )}

      {/* UI States */}
      {!activeSearch ? (
        // Initial state
        <div className='mt-6 flex flex-col gap-3 items-center justify-center py-12 text-center bg-Gray rounded-20px border border-solid border-surface'>
          <Icon name='search' className='text-blackdark icon-wrapper w-8 h-8' />
          <h3 className='text-lg leading-22px font-bold text-blackdark'>
            Find Your Perfect Therapist
          </h3>
          <p className='text-blackdark/70 text-base  leading-6'>
            Use the filters above to search for therapists based <br /> on your preferences. Select
            at least one filter to start your search.
          </p>
        </div>
      ) : isLoading ? (
        // Loading state
        <div className='mt-6 flex justify-center items-center py-8 gap-3'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <span className='text-gray-500'>Searching for therapists...</span>
        </div>
      ) : therapistList && therapistList.length > 0 ? (
        // Results grid
        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5'>
          {therapistList.map((therapist, index) => (
            <Card
              key={therapist.id}
              index={index}
              data={therapist}
              appliedFilters={appliedFilters}
              onClick={() => onTherapistClick(therapist)}
              onRequestSlot={() => onRequestSlot(therapist)}
            />
          ))}
          {/* Infinite Scroll Loader */}
          {(hasNextPage || isFetchingNextPage) && (
            <div ref={loaderRef} className='col-span-full flex justify-center items-center py-4'>
              {isFetchingNextPage && (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                  <span className='text-gray-500'>Loading more therapists...</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // No results
        <div className='text-center py-8'>
          <Icon name='therapist' className='text-primarygray icon-wrapper w-16 h-16 inline-block' />
          <h3 className='text-2xl font-bold text-primarygray my-2'>No therapists found</h3>
          <p className='text-primarygray text-lg font-semibold'>
            No therapists match your current search criteria. Try adjusting your filters or search
            terms.
          </p>
        </div>
      )}
    </>
  );
};

export default TherapistSearchResults;
