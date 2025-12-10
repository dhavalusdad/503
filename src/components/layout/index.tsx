import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useLogout } from '@/api/auth';
import { useUpdateActiveChatSession } from '@/api/chat';
import { tokenStorage } from '@/api/utils/tokenStorage';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { ROUTES } from '@/constants/routePath';
import PendingAgreementsGate from '@/features/client/components/ClientAgreement/PendingAgreementsGate';
import InsuranceGate from '@/features/insurance/components/InsuranceGate';
import type { ErrorResponse } from '@/features/login/types';
import PaymentGate from '@/features/payment/components/PaymentGate';
import { isAdminPanelRole, showToast } from '@/helper';
import { useSocketEmit, useSocketListener } from '@/hooks/socket';
import { clearUser, currentUser } from '@/redux/ducks/user';
import { persister } from '@/redux/store';
import Button from '@/stories/Common/Button';
import Modal from '@/stories/Common/Modal';

import type { AxiosError } from 'axios';

type AppLayoutProps = PropsWithChildren<object>;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string | undefined }>();
  const emit = useSocketEmit();
  const dispatch = useDispatch();
  const user = useSelector(currentUser);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1279);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<'payment' | 'insurance' | ''>('payment');

  const { mutate: logoutMutation } = useLogout();
  const { mutate: updateActiveChatSession } = useUpdateActiveChatSession();

  const logout = async (): Promise<void> => {
    const route = {
      CT: ROUTES.LOGIN.path,
      TP: ROUTES.THERAPIST_LOGIN.path,
      AD: ROUTES.ADMIN_LOGIN.path,
      BO: ROUTES.ADMIN_LOGIN.path,
    }[user.role];
    try {
      dispatch(
        clearUser({
          isRedirect: false,
          isForceClear: true,
        })
      );
      navigate(route as string);
      await logoutMutation();
      tokenStorage.clearTokens();
      emit('socket:disconnect_user');
      localStorage.removeItem('user');
      // Clear persist storage
      await persister.purge();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      showToast(error as AxiosError<ErrorResponse>, 'ERROR');
      dispatch(
        clearUser({
          isRedirect: false,
          isForceClear: true,
        })
      );
      tokenStorage.clearTokens();
      // Clear persist storage even on error
      await persister.purge();
      navigate(route as string);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const onLogout = () => {
    setLogoutModalOpen(true);
  };

  useEffect(() => {
    if (isAdminPanelRole(user.role)) return;
    updateActiveChatSession({
      sessionId: chatId || null,
    });
  }, [chatId]);

  useSocketListener<{ is_active: boolean }>(
    'staff-status-updated',
    useCallback(data => {
      if (!data?.is_active) {
        logout();
      }
    }, [])
  );

  return (
    <>
      <div className='flex bg-surfacelight h-screen'>
        <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} logout={onLogout} />
        <div
          className={clsx(
            'relative h-full flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ml-79px xl:ml-0'
          )}
        >
          <Header logout={onLogout} />

          <div className='p-5 flex-1 overflow-y-auto'>{children}</div>
        </div>
      </div>
      {/* update modal  */}
      <Modal
        isOpen={logoutModalOpen}
        title='Log Out'
        onClose={() => setLogoutModalOpen(false)}
        parentClassName='!z-[1000]'
        closeButton={false}
        footer={
          <div className='flex justify-end gap-5'>
            <Button
              variant='outline'
              title='Cancel'
              isIconFirst
              onClick={() => setLogoutModalOpen(false)}
              className=' rounded-10px !leading-5'
            />
            <Button
              variant='filled'
              title={'Yes, Logout'}
              onClick={logout}
              className=' border-red bg-red hover:bg-red/85 hover:border-red/85 rounded-10px !leading-5'
            />
          </div>
        }
        children={
          <>
            {' '}
            <p className=' text-lg font-semibold text-gray-500'>{`Are you sure you want to Log Out !`}</p>{' '}
          </>
        }
      />

      {/* Pending Agreement Modal */}

      {/* Insurance Check Modal */}
      {modalOpen === 'insurance' && <InsuranceGate setModalOpen={setModalOpen} />}
      {modalOpen === 'payment' && <PaymentGate setModalOpen={setModalOpen} />}
      {/* Payment Method Check Modal */}
      <PendingAgreementsGate />
    </>
  );
};

export default AppLayout;
