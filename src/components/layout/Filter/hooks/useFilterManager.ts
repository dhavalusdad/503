import { useState } from 'react';

export const useFilterManager = <T extends object>() => {
  // ** States **
  const [filters, setFilters] = useState<T>({} as T);
  const [isVisible, setIsVisible] = useState(false);

  // ** Helpers **
  const handleApplyFilter = (vals: T) => {
    setFilters(vals);
    setIsVisible(false);
  };

  const onClearFilter = () => {
    setFilters({} as T);
    setIsVisible(false);
  };

  return {
    filters,
    isVisible,
    setIsVisible,
    handleApplyFilter,
    onClearFilter,
  };
};
