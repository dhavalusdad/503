import { useState } from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetClientManagementDetailsQuery } from '@/api/clientManagement';
import AmdForms from '@/features/admin/components/clientManagement/components/AmdForms';
import AppointmentHistory from '@/features/admin/components/clientManagement/components/AppointmentHistory';
import AssessmentForms from '@/features/admin/components/clientManagement/components/AssessmentForms';
import ClientDetails from '@/features/admin/components/clientManagement/components/ClientDetails';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';

const MyClients = () => {
  const { client_id } = useParams();
  const user = useSelector(currentUser);

  const { data: clientData = {} } = useGetClientManagementDetailsQuery(client_id || '', false);

  if (!client_id) return <></>;
  const [recommendedSessionModal, SetRecommendedSessionModal] = useState(false);

  return (
    <div className='flex flex-col gap-5'>
      <ClientDetails clientId={client_id} isTherapistPanel={true} />
      <div className='bg-white rounded-20px border border-solid border-surface p-5 min-h-[380px]'>
        <AssessmentForms
          clientId={clientData?.user?.id}
          isTherapistPanel
          userId={client_id}
          therapistId={user.id}
          clientData={clientData?.user}
        />
      </div>
      <div className='bg-white rounded-20px border border-solid border-surface p-5 min-h-[380px]'>
        <AmdForms clientId={client_id} />
      </div>
      <div className='bg-white rounded-20px border border-solid border-surface p-5 min-h-[380px]'>
        <AppointmentHistory clientId={client_id} isTherapistPanel />
      </div>
      {recommendedSessionModal && (
        <Modal
          isOpen={recommendedSessionModal}
          title={'Number of Session'}
          onClose={() => SetRecommendedSessionModal(false)}
          footer={
            <Button
              variant='filled'
              title={'Submit'}
              onClick={() => {}}
              isDisabled={false}
              className='w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'
            />
          }
        >
          <InputField
            type='number'
            value={0}
            // onChange={e => console.log(e.target.value)}
            placeholder='10'
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900'
            min='1'
          />
        </Modal>
      )}
    </div>
  );
};

export default MyClients;
