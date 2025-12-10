import { useEffect, useState } from 'react';

import { useDeleteClinicAddress, useGetClinicAddressesList } from '@/api/clinic-addresses';
import useGetClinicAddressColumns from '@/features/management/components/clinicAddresses/hooks/useGetClinicAddressColumns';
import { useTableManagement } from '@/stories/Common/Table';

export interface ClinicAddressInterface {
  name: string;
  address: string;
  id: string;
  canDelete: boolean;
  therapist_count: number;
}

type ModalType = {
  addEdit: boolean;
  delete: boolean;
  viewDetails: boolean;
};

const useClinicAddresses = () => {
  const [openModal, setOpenModal] = useState<{
    addEdit: boolean;
    delete: boolean;
    viewDetails: boolean;
    id?: string;
    data?: ClinicAddressInterface;
    is_used?: boolean;
  }>({
    addEdit: false,
    delete: false,
    viewDetails: false,
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');

  const openCloseModal = (
    modalName: keyof ModalType,
    actionBool: boolean,
    id?: string,
    data?: ClinicAddressInterface
  ) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      id: id ?? undefined,
      data: data ?? undefined,
      is_used: (data?.therapist_count || 0) > 0,
    }));
  };

  const onCloseModal = (modalName: keyof ModalType) => {
    openCloseModal(modalName, false);
  };

  const handleRowClick = (rowData: ClinicAddressInterface) => {
    openCloseModal('viewDetails', true, rowData.id, rowData);
  };

  const { mutateAsync: deleteClinicAddress } = useDeleteClinicAddress();

  const handleDeleteClinicAddress = async () => {
    const { id } = openModal;
    if (id) {
      await deleteClinicAddress(id);
      onCloseModal('delete');
    }
  };

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = useTableManagement<ClinicAddressInterface, object>({
    apiCall: useGetClinicAddressesList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    },
  });

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const { data: clinicAddressesData, isLoading } = apiData;

  const { columns } = useGetClinicAddressColumns({
    handleRowClick,
    openCloseModal,
  });

  return {
    columns,
    openModal,
    openCloseModal,
    onCloseModal,
    data: clinicAddressesData?.data || [],
    total: clinicAddressesData?.total || 0,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteClinicAddress,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  };
};

export default useClinicAddresses;
