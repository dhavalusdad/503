import { useState } from 'react';

import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetClientManagementDetailsQuery } from '@/api/clientManagement';
import { PermissionType } from '@/enums';
import { AdminInsuranceList } from '@/features/admin/components/clientManagement/components/AdminInsuranceList.tsx';
import Agreements from '@/features/admin/components/clientManagement/components/Agreemets';
import AppointmentHistory from '@/features/admin/components/clientManagement/components/AppointmentHistory';
import AssessmentForms from '@/features/admin/components/clientManagement/components/AssessmentForms';
import ClientDetails from '@/features/admin/components/clientManagement/components/ClientDetails';
import { isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import PaymentMethod from '@/pages/Preferences/PaymentMethod';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Spinner from '@/stories/Common/Spinner';

enum TABS {
  APPOINTMENT_HISTORY = 'Appointment History',
  ASSESSMENT_FORMS = 'Assessment Forms',
  AGREEMENTS = 'Agreements',
  INSURANCES = 'Insurances',
  PAYMENT_PROFILE = 'Payment profile',
}

const ClientManagementDetails = () => {
  const { role } = useSelector(currentUser);
  const params = useParams();
  const id = `${params.id}`;
  const isAdminPanel = isAdminPanelRole(role);
  const { hasPermission } = useRoleBasedRouting();

  const [
    hasAssessmentFormViewPermission = true,
    hasAgreementViewPermission = true,
    hasAppointmentViewPermission = true,
    hasPatientViewPermission = true,
  ] = isAdminPanel
    ? [
        hasPermission(PermissionType.ASSESSMENT_FORM_VIEW),
        hasPermission(PermissionType.AGREEMENTS_VIEW),
        hasPermission(PermissionType.APPOINTMENT_VIEW),
        hasPermission(PermissionType.PATIENT_VIEW),
      ]
    : [];

  const tabs = [
    ...(hasAppointmentViewPermission ? [{ label: TABS.APPOINTMENT_HISTORY }] : []),
    ...(hasAssessmentFormViewPermission ? [{ label: TABS.ASSESSMENT_FORMS }] : []),
    ...(hasAgreementViewPermission ? [{ label: TABS.AGREEMENTS }] : []),
    ...(hasPatientViewPermission ? [{ label: TABS.INSURANCES }] : []),
    ...(isAdminPanel && hasPatientViewPermission ? [{ label: TABS.PAYMENT_PROFILE }] : []),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].label);

  const { data: clientData = {} } = useGetClientManagementDetailsQuery(id || '', false);

  return (
    <div className='flex flex-col gap-5'>
      <ClientDetails clientId={id} isTherapistPanel={false} />
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='inline-flex items-center gap-2.5 mb-2.5 rounded-10px bg-Gray p-1.5 flex-wrap'>
          {tabs.map(tab => {
            const isActive = activeTab === tab.label;
            return (
              <Button
                variant={`${isActive ? 'filled' : 'none'}`}
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                title={`${tab.label}`}
                className={clsx(
                  'rounded-md px-4 ',
                  isActive ? '' : 'bg-white border border-surface text-primarygray'
                )}
              />
            );
          })}
        </div>
        {activeTab === TABS.APPOINTMENT_HISTORY && hasAppointmentViewPermission && (
          <AppointmentHistory clientId={id} />
        )}
        {activeTab === TABS.ASSESSMENT_FORMS &&
          (!clientData?.user?.id ? (
            <div className='flex justify-center py-8'>
              <Spinner />
            </div>
          ) : (
            <>
              {hasAssessmentFormViewPermission && (
                <AssessmentForms
                  clientId={clientData?.user?.id}
                  userId={id}
                  clientData={clientData?.user}
                />
              )}
            </>
          ))}
        {activeTab === TABS.AGREEMENTS && hasAgreementViewPermission && (
          <Agreements clientId={id} />
        )}
        {activeTab === TABS.INSURANCES && hasPatientViewPermission && (
          <>
            <AdminInsuranceList />
          </>
        )}
        {activeTab === TABS.PAYMENT_PROFILE && isAdminPanel && hasPatientViewPermission && (
          <PaymentMethod clientId={id} />
        )}
      </div>
    </div>
  );
};

export default ClientManagementDetails;
