import { useMemo, useState } from 'react';

import { useGetQueueQuery } from '@/api/queueManagement';
import type { CommonFilterField } from '@/components/layout/Filter';
import { FIELD_TYPE } from '@/constants/CommonConstant';
import {
  ASSIGNEE_OPTION,
  REQUEST_TYPE_OPTION,
  STATUS_OPTION,
} from '@/features/admin/components/backofficeQueue/constant';
import useGetQueueListColumns from '@/features/admin/components/backofficeQueue/hooks/useGetQueueListColumns';
import type {
  QueueFilterDataType,
  QueueDataType,
  ModalType,
} from '@/features/admin/components/backofficeQueue/types';
import useTableWithFilters, {
  type BaseQueryParams,
} from '@/stories/Common/Table/hook/useTableWithFilters';

const useGetQueueManagement = () => {
  // ** States **
  const [id, setId] = useState<string>('');

  const [openModal, setOpenModal] = useState<ModalType>({
    modal: '',
    denied: false,
    escalate: false,
    resolve: false,
    transferTo: false,
    status: 'escalate',
  });

  // ** Custom Hooks **
  const { columns } = useGetQueueListColumns({ openCloseModal });
  const { filterManager, tableManager, handleSearchChange, currentPage, setCurrentPage } =
    useTableWithFilters<QueueDataType, QueueFilterDataType, BaseQueryParams<QueueFilterDataType>>({
      apiCall: useGetQueueQuery,
      initialQueryParams: {
        columns: JSON.stringify([
          'id',
          'request_type',
          'requester_role',
          'created_at',
          'updated_at',
          'assigned_to_role',
          'status',
        ]),
      },
    });
  const { filters, handleApplyFilter, isVisible, onClearFilter, setIsVisible } = filterManager;
  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = tableManager;

  function openCloseModal(
    modalName: 'denied' | 'escalate' | 'resolve' | 'transferTo',
    modal?: string,
    actionBool?: boolean,
    id?: string,
    role?: string
  ) {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      modal: modal ?? '',
      queue_id: id ?? '',
      role: role ?? '',
      status: modalName,
    }));
  }

  // ** API Data **
  const { data: queueListData, isFetching: isQueueListDataFetching, isLoading } = apiData;

  // ** Memos **
  const filterFields: CommonFilterField<QueueFilterDataType> = useMemo(() => {
    return [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'created_at',
        label: 'Ticket Raised Date',
      },
      {
        type: FIELD_TYPE.SELECT,
        label: 'Status',
        name: 'status',
        options: STATUS_OPTION,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.REQUEST_TYPE,
        label: 'Request Type',
        name: 'request_type',
        options: REQUEST_TYPE_OPTION,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.ASSIGNEE,
        label: 'Assigned To',
        name: 'assigned_to_role',
        options: ASSIGNEE_OPTION,
        isMulti: true,
      },
    ];
  }, []);

  return {
    columns,
    data: queueListData?.data || [],
    total: queueListData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    filterFields,
    handleApplyFilter,
    onClearFilter,
    filters,
    setIsVisible,
    isVisible,
    isQueueListDataFetching,
    openModal,
    setOpenModal,
    currentPage,
    setCurrentPage,
    isLoading,
  };
};

export default useGetQueueManagement;
