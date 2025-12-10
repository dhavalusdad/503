import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import AppointmentFilters from '@/features/appointment/component/ClientAppointmentsBooking/AppointmentFilters';
import { useBookAppointment } from '@/features/appointment/component/ClientAppointmentsBooking/hooks/useBookAppointment';
import TherapistSearchResults from '@/features/appointment/component/ClientAppointmentsBooking/TherapistSearchResults';
import type { FilterState } from '@/features/appointment/types';
import { selectAppliedAppointmentFilters } from '@/redux/ducks/appointment-filters';

const BookAppointment = () => {
  const savedFilters = useSelector(selectAppliedAppointmentFilters);

  const {
    filter,
    appliedFilters,
    searchTerm,
    therapistList,
    isLoading,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleSelectChange,
    onSearch,
    handleTherapistClick,
    handleSearchTermChange,
    clearFilters,
    activeSearch,
    handleRequestSlot,
  } = useBookAppointment(savedFilters as FilterState);

  useEffect(() => {
    if (savedFilters?.therapyType || savedFilters?.areaOfFocus?.length || savedFilters?.language) {
      onSearch();
    }
  }, [handleSelectChange]);

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <h4 className='text-lg font-bold leading-6 text-blackdark mb-5'>Book Appointment</h4>

      <AppointmentFilters
        filter={filter}
        isLoading={isLoading}
        onSelectChange={handleSelectChange}
        onSearch={onSearch}
        onClearFilters={clearFilters}
        activeSearch={activeSearch}
      />

      <TherapistSearchResults
        appliedFilters={appliedFilters}
        therapistList={therapistList || []}
        isLoading={isLoading}
        searchTerm={searchTerm}
        totalCount={totalCount}
        activeSearch={activeSearch}
        onSearchTermChange={handleSearchTermChange}
        onTherapistClick={handleTherapistClick}
        onRequestSlot={handleRequestSlot}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default BookAppointment;
