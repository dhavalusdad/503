import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import { ClientGeneralSettings } from '@/features/client/components/ClientGeneralSettings';
import Insurance from '@/pages/Preferences/Insurance';
import PaymentMethod from '@/pages/Preferences/PaymentMethod';
import Button from '@/stories/Common/Button';

interface Props {
  tab?: 'payment' | 'general' | 'insurance';
}

const GeneralSetting = (currentComponent: Props) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'general', title: 'General Setting', route: ROUTES.GENERAL_SETTING.path },
    { id: 'payment', title: 'Payment Method', route: ROUTES.PAYMENT_METHOD.path },
    { id: 'insurance', title: 'Insurance', route: ROUTES.INSURANCE.path },
  ];

  const renderContent = () => {
    switch (currentComponent.tab) {
      case 'general':
        return <ClientGeneralSettings />;
      case 'payment':
        return <PaymentMethod clientId='' />;
      case 'insurance':
        return <Insurance />;
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-wrap items-center gap-6 border-b border-solid border-surface'>
        {tabs.map(tab => (
          <Button
            key={tab.id}
            id={`tour-${tab.id}-tab`}
            variant='none'
            title={tab.title}
            onClick={() => navigate(tab.route)}
            className={clsx(
              '!text-lg !leading-6 !pt-0 !pb-3.5 relative ',
              tab.id === currentComponent.tab
                ? 'text-blackdark !font-bold after:absolute after:bottom-0 after:left-0 after:h-3px after:w-full after:bg-primary'
                : 'text-primarygray'
            )}
          />
        ))}
      </div>
      {renderContent()}
    </div>
  );
};

export default GeneralSetting;
