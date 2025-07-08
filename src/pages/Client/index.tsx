import React from 'react';  
import { Table } from '@/stories/Common/Table';
import { clientColumns } from '@/features/client/components/ClientTableColumns';
import { dummyClients } from '@/features/client/data/dummyData';

const ClientPage: React.FC = () => {
  return (
        <div className="p-6">
          <Table
            data={dummyClients}
            columns={clientColumns}
            className="w-full"
          />
      </div>
  );
};

export default ClientPage; 