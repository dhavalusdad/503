import React, { useState } from 'react';

import { useUpdateTherapistAmdProviderId } from '@/api/therapist';
import type { GetTherapistAmdProviderIdResponse } from '@/api/types/therapist.dto';
import Button from '@/stories/Common/Button';
import Modal from '@/stories/Common/Modal';
import Table from '@/stories/Common/Table';

import type { ColumnDef } from '@tanstack/react-table';

interface ProviderSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GetTherapistAmdProviderIdResponse | null;
  isLoading: boolean;
  therapistId: string;
}

type ProviderData = {
  '@id': string;
  '@code': string;
  '@name': string;
};

const ProviderSyncModal: React.FC<ProviderSyncModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading,
  therapistId,
}) => {
  const [assigningProviderId, setAssigningProviderId] = useState<string | null>(null);

  // Update provider ID mutation
  const { mutateAsync: updateProviderIdMutation, isPending } = useUpdateTherapistAmdProviderId({
    therapist_id: therapistId,
  });

  const handleAssignProvider = async ({
    providerId,
    providerName,
  }: {
    providerId: string;
    providerName: string;
  }) => {
    setAssigningProviderId(providerId);
    try {
      await updateProviderIdMutation({
        amd_provider_id: providerId,
        amd_provider_name: providerName,
      });
      onClose();
    } catch (error) {
      console.error('Failed to assign provider:', error);
    } finally {
      setAssigningProviderId(null);
    }
  };

  const columns: ColumnDef<ProviderData>[] = [
    {
      id: '@id',
      accessorKey: '@id',
      header: 'ID',
      cell: ({ row }: { row: { original: ProviderData } }) => <>{row.original['@id']}</>,
      enableSorting: false,
    },
    {
      id: '@code',
      accessorKey: '@code',
      header: 'Code',
      cell: ({ row }: { row: { original: ProviderData } }) => <>{row.original['@code']}</>,
      enableSorting: false,
    },
    {
      id: '@name',
      accessorKey: '@name',
      header: 'Name',
      cell: ({ row }: { row: { original: ProviderData } }) => <>{row.original['@name']}</>,
      enableSorting: false,
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }: { row: { original: ProviderData } }) => {
        const providerId = row.original['@id'];
        const providerName = row.original['@name'];
        const isAssigning = assigningProviderId === providerId;

        return (
          <Button
            variant='filled'
            title={isAssigning ? 'Assigning...' : 'Assign'}
            isDisabled={isAssigning || isPending}
            onClick={() => handleAssignProvider({ providerId, providerName })}
            className='!px-6 rounded-10px '
          />
        );
      },
    },
  ];

  const providerData = data?.data?.providerlist?.provider || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Sync Provider'
      size='lg'
      closeButton
      contentClassName='pt-30px'
      isLoading={isLoading}
    >
      <>
        {providerData.length > 0 ? (
          <div>
            <Table
              data={providerData as ProviderData[]}
              columns={columns}
              className='w-full'
              totalCount={providerData.length}
              pageIndex={0}
              pageSize={providerData.length}
              sorting={[]}
              setSorting={() => {}}
              pagination={false}
              isLoading={isLoading}
            />
          </div>
        ) : data ? (
          <div className='text-center py-8'>
            <p className='text-blackdark text-lg font-semibold'>No providers found</p>
          </div>
        ) : null}
      </>
    </Modal>
  );
};

export default ProviderSyncModal;
