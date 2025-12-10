import { useEffect, useState, useCallback, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { therapistQueryKeys } from '@/api/common/appointment.queryKey.ts';
import { useInfiniteTherapistQuery } from '@/api/therapist';
import type {
  InfiniteTherapistQueryResponse,
  TherapistBasicDetails,
  TherapistSearchItem,
} from '@/api/types/therapist.dto';
import { ROUTES } from '@/constants/routePath';
import type { FilterState } from '@/features/appointment/types';
import { setFilters } from '@/redux/ducks/appointment-filters';
import type { SelectOption } from '@/stories/Common/Select';

import type { MultiValue } from 'react-select';

export const useBookAppointment = (savedFilters: FilterState) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [filter, setFilter] = useState<FilterState>(
    savedFilters || {
      sessionType: null,
      carrier: null,
      paymentMethod: null,
      language: null,
      therapistGender: null,
      city: null,
      state: null,
      areaOfFocus: [],
      therapyType: null,
      search: '',
      availability_start_date: '',
      availability_end_date: '',
    }
  );

  const [activeFilters, setActiveFilters] = useState<Partial<TherapistSearchItem>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchApplied, setIsSearchApplied] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistBasicDetails | null>(null);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filter).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null && value !== undefined;
    });
  }, [filter]);

  const {
    data: therapistData,
    isPending: isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTherapistQuery({
    ...(filter.search ? { search: filter.search } : {}),
    ...activeFilters,
  });

  const therapistList = useMemo(() => {
    return (
      (therapistData as InfiniteTherapistQueryResponse)?.pages?.flatMap(page => page.data || []) ||
      []
    );
  }, [therapistData]);

  const totalCount = useMemo(() => {
    return (therapistData as InfiniteTherapistQueryResponse)?.pages?.[0]?.total || 0;
  }, [therapistData]);

  const appliedFilters = {
    sessionType: filter.sessionType ? filter.sessionType : null,
    therapyType: filter.therapyType,
    areaOfFocus: filter.areaOfFocus,
    paymentMethod: filter.paymentMethod,
    carrier: filter.carrier,
    state: filter.state,
  };

  const handleSelectChange = useCallback(
    (
      field: keyof FilterState,
      selectedOption: SelectOption | MultiValue<SelectOption> | null
    ): void => {
      if (field === 'areaOfFocus' && Array.isArray(selectedOption)) {
        setFilter(prev => {
          const newFilter = {
            ...prev,
            areaOfFocus: selectedOption as SelectOption[] as { value: string; label: string }[],
          };

          return newFilter;
        });
      } else if (
        field === 'therapyType' ||
        field === 'language' ||
        field === 'paymentMethod' ||
        field === 'carrier' ||
        field === 'state' ||
        field === 'city' ||
        field === 'sessionType' ||
        field === 'therapistGender'
      ) {
        const value = (selectedOption as SelectOption)?.value;
        const label = (selectedOption as SelectOption)?.label;
        setFilter(prev => {
          const newFilter = {
            ...prev,
            [field]: !value
              ? null
              : {
                  value: value || '',
                  label: label || '',
                },
          };

          return newFilter;
        });
      } else {
        const value = (selectedOption as SelectOption)?.value;
        setFilter(prev => {
          const newFilter = {
            ...prev,
            [field]: value,
          };

          return newFilter;
        });
      }
    },
    []
  );

  const handleDateChange = useCallback(
    (field: 'availability_start_date' | 'availability_end_date', date: Date | null): void => {
      setFilter(prev => ({
        ...prev,
        [field]: date,
      }));
    },
    []
  );

  const handleRemoveFilter = useCallback(
    (field: keyof FilterState, value: string) => {
      setFilter(prev => ({
        ...prev,
        [field]: Array.isArray(prev[field])
          ? (prev[field] as string[]).filter(v => v !== value)
          : prev[field],
      }));
    },
    [setFilter]
  );

  const handleClearAreaOfFocus = useCallback(() => {
    setFilter(prev => ({
      ...prev,
      areaOfFocus: [],
    }));
  }, [setFilter]);

  const onSearch = useCallback((): void => {
    if (!hasActiveFilters) return;

    const newActiveFilters = {
      ...(filter.sessionType ? { session_type: filter.sessionType?.value } : {}),
      ...(filter.state ? { state: filter.state.value } : {}),
      ...(filter.city ? { city: filter.city?.value } : {}),
      ...(filter.carrier ? { carrier: filter.carrier.value } : {}),
      // Fix: Add proper validation for language object
      ...(filter.language?.value ? { language: filter.language.value } : {}),
      ...(filter.therapistGender ? { therapist_gender: filter.therapistGender.value } : {}),
      ...(filter.areaOfFocus?.length > 0
        ? { area_of_focus: filter.areaOfFocus.map(d => d.value) }
        : {}),
      // Fix: Add proper validation for therapyType object
      ...(filter.therapyType?.value ? { therapy_type: filter.therapyType.value } : {}),
      ...(filter.availability_start_date
        ? { availability_start_date: filter.availability_start_date }
        : {}),
      ...(filter.availability_end_date
        ? { availability_end_date: filter.availability_end_date }
        : {}),
    };

    setActiveFilters(newActiveFilters);
    setIsSearchApplied(true);

    dispatch(setFilters(filter));
  }, [filter, hasActiveFilters, queryClient]);

  const clearFilters = useCallback((): void => {
    setFilter({
      sessionType: null,
      carrier: null,
      paymentMethod: null,
      language: null,
      therapistGender: null,
      state: null,
      areaOfFocus: [],
      therapyType: null,
      search: '',
      availability_start_date: '',
      availability_end_date: '',
      city: null,
    });
    setActiveFilters({});
    setSearchTerm('');
    setIsSearchApplied(false);

    queryClient.removeQueries({
      queryKey: therapistQueryKeys?.search(),
    });
  }, [queryClient]);

  const handleTherapistClick = useCallback(
    (therapist: TherapistBasicDetails, fromDashboard = false): void => {
      if (fromDashboard) {
        setSelectedTherapist(therapist);
        setIsModalOpen(true);
      } else {
        navigate(ROUTES.BOOK_SLOT.path.replace(':id', therapist.id), { state: { appliedFilters } });
      }
    },
    [navigate, appliedFilters]
  );

  const handleRequestSlot = useCallback(
    (therapist_id: TherapistBasicDetails): void => {
      navigate(ROUTES.REQUEST_SLOT.path.replace(':id', therapist_id.id));
    },
    [navigate]
  );

  const handleSearchTermChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      setFilter(prev => ({
        ...prev,
        search: searchTerm,
      }));
    }, 500);
    return () => clearTimeout(debouncedSearch);
  }, [searchTerm]);

  useEffect(() => {
    const hasAnyFilterValue = Object.values(filter).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null && value !== undefined;
    });

    if (!hasAnyFilterValue) {
      setActiveFilters({});
      setIsSearchApplied(false);
      queryClient.removeQueries({
        queryKey: therapistQueryKeys?.search(),
      });
    }
  }, [filter, queryClient]);

  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      queryClient.invalidateQueries({
        queryKey: therapistQueryKeys?.search(),
      });
    }
  }, [activeFilters, queryClient]);

  useEffect(() => {
    if (hasActiveFilters) {
      onSearch();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (savedFilters) {
      setFilter(savedFilters);
    }
  }, [savedFilters]);

  return {
    filter,
    appliedFilters,
    searchTerm,
    therapistList,
    isLoading,
    isFetching,
    totalCount,
    isSearchApplied,
    activeSearch: isSearchApplied && Object.keys(activeFilters).length > 0,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleSelectChange,
    onSearch,
    handleTherapistClick,
    handleSearchTermChange,
    clearFilters,
    handleDateChange,
    handleRemoveFilter,
    selectedTherapist,
    setSelectedTherapist,
    isModalOpen,
    setIsModalOpen,
    handleClearAreaOfFocus,
    handleRequestSlot,
  };
};
