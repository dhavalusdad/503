import { useState } from 'react';

import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetClientManagementDetailsQuery } from '@/api/clientManagement';
import Agreements from '@/features/admin/components/clientManagement/components/Agreemets';
import AppointmentHistory from '@/features/admin/components/clientManagement/components/AppointmentHistory';
import AssessmentForms from '@/features/admin/components/clientManagement/components/AssessmentForms';
import ClientDetails from '@/features/admin/components/clientManagement/components/ClientDetails';
import { isAdminPanelRole } from '@/helper';
import PaymentMethod from '@/pages/Preferences/PaymentMethod';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Spinner from '@/stories/Common/Spinner';

import { AdminInsuranceList } from './AdminInsuranceList';

const ClientManagementDetails = () => {
  const [activeTab, setActiveTab] = useState('Appointment History');
  const { role } = useSelector(currentUser);
  const params = useParams();
  const id = `${params.id}`;
  const tabs = [
    { label: 'Appointment History' },
    { label: 'Assessment Forms' },
    { label: 'Agreements' },
    { label: 'Insurances' },
    ...(isAdminPanelRole(role) ? [{ label: 'Payment profile' }] : []),
  ];

  const { data: clientData = {} } = useGetClientManagementDetailsQuery(id || '', false);

  return (
    <div className='flex flex-col gap-5'>
      <ClientDetails clientId={id} isTherapistPanel={false} />
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='inline-flex items-center gap-2.5 mb-2.5 rounded-10px bg-Gray p-1.5'>
          {tabs.map(tab => {
            const isActive = activeTab === tab.label;
            return (
              <Button
                variant={`${isActive ? 'filled' : 'none'}`}
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                title={`${tab.label}`}
                className={clsx(
                  'rounded-md py-2.5 px-4 text-base font-semibold',
                  isActive ? '' : 'bg-white border border-surface text-primarygray'
                )}
              />
            );
          })}
        </div>
        {activeTab === 'Appointment History' && <AppointmentHistory clientId={id} />}
        {activeTab === 'Assessment Forms' &&
          (!clientData?.user?.id ? (
            <div className='flex justify-center py-8'>
              <Spinner />
            </div>
          ) : (
            <AssessmentForms
              clientId={clientData?.user?.id}
              userId={id}
              clientData={clientData?.user}
            />
          ))}
        {activeTab === 'Agreements' && <Agreements clientId={id} />}
        {activeTab === 'Insurances' && (
          <>
            <AdminInsuranceList />
          </>
        )}
        {activeTab === 'Payment profile' && isAdminPanelRole(role) && (
          <PaymentMethod clientId={id} />
        )}
      </div>
    </div>
  );
};

export default ClientManagementDetails;
