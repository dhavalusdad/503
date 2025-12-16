import { useMemo, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetAmdAppointmentsClientPayment } from '@/api/advancedMd';
import { useGetAppointmentDetails } from '@/api/appointment';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { useSendApprovalTransaction } from '@/api/transaction';
import type { AppointmentDetailsAreaOfFocus } from '@/api/types/calendar.dto';
import { UserRole } from '@/api/types/user.dto';
import DataNotFound from '@/components/common/DataNotFound';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus, PermissionType, SessionType, TransactionAction } from '@/enums';
import ChargeSlipDetails from '@/features/admin/components/appointmentList/components/ChargeSlipDetails';
import PaymentCardSelectionModal from '@/features/admin/components/appointmentList/components/PaymentCardSelectionModal';
import type { UserAppointment } from '@/features/admin/components/appointmentList/types';
import useTransaction from '@/features/admin/components/transaction/hooks';
import type { Transaction } from '@/features/admin/components/transaction/types';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import MemberCard from '@/features/appointment/component/ClientAppointmentsBooking/MemberCard';
import { AddMoreInsuranceModal } from '@/features/insurance/components/AddMoreInsuranceModal';
import { AppliedInsurance } from '@/features/insurance/components/AppliedInsurance';
import { isAdminPanelRole, normalizeText } from '@/helper';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Modal from '@/stories/Common/Modal';
import Skeleton from '@/stories/Common/Skeleton';
import SwiperComponent from '@/stories/Common/Swiper';
import Table from '@/stories/Common/Table';

import { ProcessRefundModal } from '../../transaction/components/ProcessRefundModal';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

export const getProfileImage = (profile: string) => {
  return profile ? `${SERVER_URL}${profile}` : '';
};

export const getFileFromUrl = (profile: string) => {
  return profile ? `${SERVER_URL}${profile}` : '';
};

const AppointmentListView: React.FC = () => {
  const { appointment_id } = useParams();
  const navigate = useNavigate();
  const { timezone, client_id, role, id: currentUserId } = useSelector(currentUser);
  const isAdmin = isAdminPanelRole(role);
  const [showWarning, setShowWarning] = useState(false);
  const { invalidate } = useInvalidateQuery();
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = useRoleBasedRouting();
  const { data: appointmentDetails, isLoading } = useGetAppointmentDetails(appointment_id || '');
  const {
    data: appointmentPayment,
    refetch: refetchPayment,
    isLoading: isPaymentLoading,
    isFetching: isPaymentFetching,
  } = useGetAmdAppointmentsClientPayment({
    appointmentId: appointment_id,
    isNewData: !!appointmentDetails?.amd_total_charge,
  });

  const {
    mutateAsync: sendApproval,
    isPending,
    isError,
  } = useSendApprovalTransaction(appointment_id);

  const {
    columns,
    data: transactionTableData,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    toggleApprovalModal,
    setToggleApprovalModal,
    toggleDeclineModal,
    setToggleDeclineModal,
    isLoading: isTransactionLoading,
    toggleRefundModal,
    setToggleRefundModal,
  } = useTransaction({
    appointment_id: appointment_id,
    appointment_view: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableData = transactionTableData as Transaction[];

  const refetchAppointmentPayment = () => {
    refetchPayment().then(d => {
      if (d.data?.amd_total_charge) {
        invalidate(calendarQueryKeys.appointmentsDetail(appointment_id));
      }
      if (d.data?.amd_total_charge == null) {
        setShowWarning(true);
      }
    });
  };

  const handleBookedByNavigation = () => {
    const bookedBy = appointmentDetails?.booked_by_user;
    const clientUser = appointmentDetails?.client;
    const therapist = appointmentDetails?.therapist;

    // If booked_by matches client user → go to client details page
    const bookedById = bookedBy?.id;
    if (bookedById === clientUser?.user?.id) {
      navigate(ROUTES.CLIENT_MANAGEMENT_DETAILS.navigatePath(appointmentDetails?.client?.id));
    } else if (bookedById === therapist?.user?.id) {
      navigate(ROUTES.VIEW_THERAPIST_DETAILS.navigatePath(therapist?.id));
    } else if (role === UserRole.ADMIN && currentUserId !== bookedById) {
      navigate(ROUTES.STAFF_MANAGEMENT_DETAILS.navigatePath(bookedById));
    }
  };

  const isBookedByClickable = () => {
    const bookedBy = appointmentDetails?.booked_by_user?.id;
    const clientUser = appointmentDetails?.client?.user;
    const therapist = appointmentDetails?.therapist?.user;
    let bool = false;
    if (!clientUser?.id || !therapist?.id) return bool;
    if (isAdmin) {
      if (bookedBy !== currentUserId) {
        if (role === UserRole.ADMIN) {
          bool = true;
        } else if (bookedBy === clientUser?.id || bookedBy === therapist?.id) {
          bool = true;
        }
      }
    }
    return bool;
  };
  const [hasClientViewPermission, hasTherapistViewPermission] = useMemo(() => {
    return [
      isAdmin && hasPermission(PermissionType.PATIENT_VIEW),
      isAdmin && hasPermission(PermissionType.THERAPIST_VIEW),
    ];
  }, [hasPermission, isAdmin]);

  return (
    <>
      {isLoading ? (
        <>
          <Spinner />
        </>
      ) : (
        <div className='flex flex-col gap-5'>
          <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
            <>
              <div className='flex flex-wrap gap-5 items-center justify-between mb-3.5 border-b border-surface pb-3.5'>
                <h2 className='text-lg font-bold text-blackdark leading-6 mr-auto'>
                  Appointment Details
                </h2>
                <div className='flex items-center gap-2'>
                  <span className='text-blackdark text-base font-semibold'>Status:</span>
                  <AppointmentStatusBadge
                    status={appointmentDetails?.status}
                    type='appointment_status'
                  />
                </div>
                {isAdminPanelRole(role) &&
                  appointmentDetails?.third_party_api_log &&
                  appointmentDetails.third_party_api_log.length > 0 &&
                  hasPermission(PermissionType.THIRD_PARTY_LOGS_VIEW) && (
                    <Button
                      variant='filled'
                      title='Third Party API Log'
                      onClick={() =>
                        navigate(
                          ROUTES.THIRD_PARTY_API_LOGS_DETAILS.navigatePath(
                            appointmentDetails.third_party_api_log![0].id
                          )
                        )
                      }
                      className='rounded-10px'
                    />
                  )}
              </div>

              {/* Client Info */}
              {/* <div className='flex items-center gap-3 mb-6'></div> */}

              {/* Appointment Info Grid */}
              <div
                className={clsx(
                  'grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5',
                  appointmentDetails?.users_appointment &&
                    appointmentDetails?.users_appointment.length > 0
                    ? 'mb-5'
                    : ''
                )}
              >
                {/* Client */}
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Booked By</h3>
                  <div
                    className={clsx(
                      'flex items-center gap-3',
                      isBookedByClickable() && 'cursor-pointer'
                    )}
                    onClick={isAdmin ? handleBookedByNavigation : undefined}
                  >
                    <Image
                      imgPath={getProfileImage(appointmentDetails?.booked_by_user?.profile_image)}
                      firstName={
                        appointmentDetails?.booked_by_user?.first_name ||
                        appointmentDetails?.therapist?.user?.first_name
                      }
                      lastName={
                        appointmentDetails?.booked_by_user?.last_name ||
                        appointmentDetails?.therapist?.user?.last_name
                      }
                      alt='User Avatar'
                      imageClassName='rounded-full object-cover object-center w-full h-full'
                      className='w-10 min-w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                      initialClassName='!text-base'
                    />

                    <p
                      className={clsx(
                        'text-base font-bold leading-22px text-primary',
                        isBookedByClickable() && 'hover:underline cursor-pointer underline-offset-2'
                      )}
                    >
                      {appointmentDetails?.booked_by_user?.first_name ||
                        appointmentDetails?.therapist?.user?.first_name}{' '}
                      {appointmentDetails?.booked_by_user?.last_name ||
                        appointmentDetails?.therapist?.user?.last_name}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Client Name</h3>
                  <div
                    className={clsx(
                      'flex items-center gap-3',
                      hasClientViewPermission && 'cursor-pointer'
                    )}
                    onClick={
                      hasClientViewPermission
                        ? () =>
                            navigate(
                              ROUTES.CLIENT_MANAGEMENT_DETAILS.navigatePath(
                                appointmentDetails?.client?.id
                              )
                            )
                        : undefined
                    }
                  >
                    <Image
                      imgPath={getProfileImage(appointmentDetails?.client?.user?.profile_image)}
                      firstName={appointmentDetails?.client?.user?.first_name}
                      lastName={appointmentDetails?.client?.user?.last_name}
                      alt='User Avatar'
                      imageClassName='rounded-full object-cover object-center w-full h-full'
                      className='w-10 min-w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                      initialClassName='!text-base'
                    />

                    <p
                      className={clsx(
                        'text-base font-bold leading-22px text-primary',
                        hasClientViewPermission &&
                          'hover:underline cursor-pointer underline-offset-2'
                      )}
                    >
                      {appointmentDetails?.client?.user?.first_name}{' '}
                      {appointmentDetails?.client?.user?.last_name}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>
                    Therapist Name
                  </h3>
                  <div
                    className={clsx(
                      'flex items-center gap-3',
                      hasTherapistViewPermission && 'cursor-pointer'
                    )}
                    onClick={
                      hasTherapistViewPermission
                        ? () =>
                            navigate(
                              ROUTES.VIEW_THERAPIST_DETAILS.navigatePath(
                                appointmentDetails?.therapist?.id
                              )
                            )
                        : undefined
                    }
                  >
                    <Image
                      imgPath={getProfileImage(appointmentDetails?.therapist?.user?.profile_image)}
                      firstName={appointmentDetails?.therapist?.user?.first_name}
                      lastName={appointmentDetails?.therapist?.user?.last_name}
                      alt='User Avatar'
                      imageClassName='rounded-full object-cover object-center w-full h-full'
                      className='w-10 min-w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                      initialClassName='!text-base'
                    />

                    <p
                      className={clsx(
                        'text-base font-bold leading-22px text-primary',
                        hasTherapistViewPermission &&
                          'hover:underline cursor-pointer underline-offset-2'
                      )}
                    >
                      {appointmentDetails?.therapist?.user?.first_name}{' '}
                      {appointmentDetails?.therapist?.user?.last_name}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Booked On</h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.created_at
                      ? moment
                          .tz(moment(appointmentDetails?.created_at), timezone)
                          .format('MMM DD, YYYY')
                      : 'Not available'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>
                    Appointment Date
                  </h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.slot?.start_time
                      ? moment(appointmentDetails.slot.start_time)
                          .tz(timezone)
                          .format('dddd, MMMM D, YYYY')
                      : 'Not available'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>
                    Appointment Time
                  </h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.slot?.start_time && appointmentDetails?.slot?.end_time
                      ? moment(appointmentDetails.slot.start_time).tz(timezone).format('hh:mm A')
                      : 'Not available'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>
                    Appointment Type
                  </h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.amd_appointment_types &&
                    appointmentDetails.amd_appointment_types.length > 0
                      ? appointmentDetails.amd_appointment_types
                          .map((type: { amd_id: string; name: string }) => normalizeText(type.name))
                          .join(', ')
                      : 'Not specified'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Duration</h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.status === AppointmentStatus.COMPLETED
                      ? (() => {
                          const startTime = appointmentDetails?.logged_start_time
                            ? appointmentDetails?.logged_start_time
                            : appointmentDetails?.actual_start_time;
                          const endTime = appointmentDetails?.logged_end_time
                            ? appointmentDetails?.logged_end_time
                            : appointmentDetails?.actual_end_time;

                          if (!startTime || !endTime) return 'Not available';

                          const duration = Math.round(
                            moment(endTime).diff(moment(startTime), 'minutes')
                          );
                          return duration ? `${duration} minutes` : 'Not available';
                        })()
                      : 'Not available'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Area of Focus</h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.appointment_area_of_focus &&
                    appointmentDetails.appointment_area_of_focus.length > 0
                      ? appointmentDetails.appointment_area_of_focus
                          .map((area: AppointmentDetailsAreaOfFocus) => area.area_of_focus?.name)
                          .join(', ')
                      : 'Not specified'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Therapy Type</h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.therapy_type?.name || 'Not specified'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Session Type</h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.session_type || 'Not specified'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>Payment Type</h3>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {appointmentDetails?.payment_method?.name || 'Not specified'}
                  </p>
                </div>
                {appointmentDetails?.session_type === SessionType.CLINIC && (
                  <div className='flex flex-col gap-1.5'>
                    <h3 className='text-base font-bold text-blackdark leading-22px'>
                      Clinic Address
                    </h3>
                    <p className='text-base font-normal leading-22px text-primarygray break-words'>
                      {appointmentDetails?.clinic_display_name
                        ? `${appointmentDetails?.clinic_address?.name} - ${[appointmentDetails?.clinic_address?.address, appointmentDetails?.clinic_address?.city?.name, appointmentDetails?.clinic_address?.state?.name].filter(Boolean).join(', ')}`
                        : 'Not available'}
                    </p>
                  </div>
                )}
                <div className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3 2xl:col-span-4'>
                  <h3 className='text-base font-bold text-blackdark leading-22px'>
                    Reason for Visit
                  </h3>
                  <p className='text-base font-normal leading-22px text-primarygray break-all'>
                    {appointmentDetails?.appointment_reason || 'No reason provided'}
                  </p>
                </div>
              </div>
            </>
            {/* )} */}

            {appointmentDetails?.users_appointment &&
              appointmentDetails?.users_appointment.length > 0 && (
                <div className='flex flex-col gap-5'>
                  <div className='bg-blackdark/12 h-1px w-full'></div>
                  <div className='flex items-center gap-2'>
                    <h5 className='text-lg font-bold text-blackdark leading-6'>Dependents List</h5>
                    <span className='rounded-full bg-primary/10 text-primary text-sm font-semibold min-h-5 min-w-5 flex items-center justify-center'>
                      {appointmentDetails.users_appointment.length}
                    </span>
                  </div>
                  <div>
                    <SwiperComponent
                      slidesPerView={1}
                      spaceBetween={15}
                      className='w-full'
                      breakpoints={{
                        576: {
                          slidesPerView: 1,
                        },
                        768: {
                          slidesPerView: 1.5,
                        },
                        1024: {
                          slidesPerView: 2,
                        },
                        1280: {
                          slidesPerView: 2.3,
                        },
                        1536: {
                          slidesPerView: 3,
                        },
                      }}
                    >
                      {appointmentDetails.users_appointment.map(
                        (item: UserAppointment, index: number) => (
                          <div key={item.user.id} className='w-full'>
                            <MemberCard member={item.user} index={index} showDeleteButton={false} />
                          </div>
                        )
                      )}
                    </SwiperComponent>
                  </div>
                </div>
              )}
          </div>
          <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
            <div className='flex flex-wrap gap-2 items-center justify-between mb-3.5 border-b border-surface pb-3.5'>
              <h3 className='text-lg font-bold text-blackdark leading-6 mr-auto'>Insurance</h3>
              {/* Add More Insurance */}
              {!client_id &&
                !appointmentPayment?.amd_total_charge &&
                hasPermission(PermissionType.APPOINTMENT_EDIT) && (
                  <Button
                    variant='filled'
                    title='Apply Insurance'
                    icon={<Icon name='plus' />}
                    isIconFirst
                    onClick={() => setIsModalOpen(true)}
                    className='rounded-10px'
                    parentClassName='ml-auto'
                  />
                )}
            </div>
            <AppliedInsurance insurancesData={appointmentDetails?.insurances || []} />
          </div>
          {isAdminPanelRole(role) && (
            <>
              <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
                <div className='flex flex-wrap gap-3 lg:gap-5 items-center mb-3.5 border-b border-surface pb-3.5'>
                  <h3 className='text-lg font-bold text-blackdark leading-6 mr-auto order-1 lg:order-none'>
                    Charge Slip Details
                  </h3>
                  {((appointmentDetails?.amd_remaining_charge !== null &&
                    Number(appointmentDetails?.amd_remaining_charge) !== 0) ||
                    appointmentDetails?.amd_remaining_charge == null) && (
                    <>
                      {showWarning && (
                        <div className='border border-solid border-yellow rounded-10px bg-yellowlight flex flex-wrap justify-end items-center gap-2.5 p-2.5 order-3 lg:order-none mx-auto lg:mx-0'>
                          <div className='flex items-center gap-2.5'>
                            <Icon name='warning' className='text-yellow' />
                            <span className='text-base font-normal text-blackdark'>
                              Please generate charge slip in AdvancedMd
                            </span>
                          </div>
                        </div>
                      )}
                      {!appointmentDetails?.amd_total_charge ? (
                        <Button
                          variant='filled'
                          title='Generate Charge Slip'
                          parentClassName='order-2 lg:order-none'
                          className='rounded-10px'
                          isLoading={isPaymentFetching}
                          onClick={() => refetchAppointmentPayment()}
                        />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </div>
                {appointmentDetails?.amd_total_charge && appointmentPayment ? (
                  <ChargeSlipDetails
                    isLoading={isLoading || isPaymentFetching}
                    chargeSlipDate={
                      appointmentPayment?.amd_charge_date
                        ? moment(appointmentPayment.amd_charge_date).format('  DD, MMM, YYYY')
                        : ''
                    }
                    totalAmount={Number(appointmentPayment?.amd_total_charge)}
                    amountPaidByInsurance={Number(appointmentPayment?.amd_insurance_balance)}
                    selfPay={Number(appointmentPayment?.amd_patient_balance)}
                    remainingBalanceToPay={
                      !appointmentDetails?.amd_remaining_charge
                        ? 0
                        : Number(appointmentDetails?.amd_remaining_charge)
                    }
                    onUpdate={() => refetchAppointmentPayment()}
                    onCharge={() => setIsOpen(true)}
                  />
                ) : isPaymentLoading ? (
                  <div className='bg-white rounded-20px p-5'>
                    <Skeleton
                      count={5}
                      parentClassName='grid grid-cols-2 lg:grid-cols-3 gap-5'
                      className='h-8'
                    />

                    <div className='flex justify-end gap-5 mt-5'>
                      <Skeleton count={1} className='h-10 w-24 rounded-10px' />
                      <Skeleton count={1} className='h-10 w-24 rounded-10px' />
                    </div>
                  </div>
                ) : (
                  <div className='text-center'>
                    <DataNotFound />
                  </div>
                )}
              </div>
              <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
                <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>
                  Transaction History
                </h3>
                <Table
                  data={tableData}
                  columns={columns}
                  className='w-full'
                  onPageChange={setPageIndex}
                  onPageSizeChange={setPageSize}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  totalCount={total}
                  onSortingChange={onSortingChange}
                  sorting={sorting}
                  setSorting={setSorting}
                  isLoading={isTransactionLoading}
                />
              </div>{' '}
            </>
          )}

          {isModalOpen && (
            <AddMoreInsuranceModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              appointmentId={appointment_id}
            />
          )}

          {isOpen && (
            <PaymentCardSelectionModal
              amdPatientPaymentData={appointmentPayment}
              clientId={appointmentDetails?.client?.id}
              onClose={() => setIsOpen(false)}
              isOpen={isOpen}
              appointmentData={appointmentDetails}
            />
          )}

          {role == UserRole.ADMIN && (
            <>
              {' '}
              <Modal
                isOpen={toggleApprovalModal.isModalOpen}
                onClose={() => setToggleApprovalModal({ transaction_id: null, isModalOpen: false })}
                title={`Approve Transaction Request`}
                size='xs'
                closeButton={false}
                contentClassName='pt-30px'
                footerClassName='flex items-center justify-between gap-5'
                footer={
                  <>
                    <Button
                      variant='outline'
                      title='Cancel'
                      onClick={() =>
                        setToggleApprovalModal({ transaction_id: null, isModalOpen: false })
                      }
                      className='rounded-10px !leading-5 !px-6 w-full'
                      parentClassName='w-2/4'
                    />
                    <Button
                      variant='filled'
                      title='Confirm'
                      isLoading={isPending}
                      isDisabled={isPending}
                      onClick={async () => {
                        await sendApproval({
                          transaction_id: toggleApprovalModal.transaction_id,
                          action: TransactionAction.APPROVE,
                        });
                        setToggleApprovalModal({ transaction_id: null, isModalOpen: false });
                      }}
                      className='rounded-10px !leading-5 !px-6 w-full'
                      parentClassName='w-2/4'
                    />
                  </>
                }
              >
                <p className='text-lg font-semibold text-blackdark leading-7 text-center'>
                  Do you want to approve this transaction? <br /> This action cannot be undone.
                </p>
              </Modal>
              <Modal
                isOpen={toggleDeclineModal.isModalOpen && !isError}
                onClose={() => setToggleDeclineModal({ transaction_id: null, isModalOpen: false })}
                title={`Decline Transaction Request`}
                size='xs'
                closeButton={false}
                contentClassName='pt-30px'
                footerClassName='flex items-center justify-between gap-5'
                footer={
                  <>
                    <Button
                      variant='outline'
                      title='Cancel'
                      onClick={() =>
                        setToggleDeclineModal({ transaction_id: null, isModalOpen: false })
                      }
                      className='rounded-10px !leading-5 !px-6 w-full'
                      parentClassName='w-2/4'
                    />
                    <Button
                      variant='filled'
                      title='Confirm'
                      isLoading={isPending}
                      isDisabled={isPending}
                      onClick={async () => {
                        await sendApproval({
                          transaction_id: toggleDeclineModal.transaction_id,
                          action: TransactionAction.DECLINE,
                        });
                        setToggleDeclineModal({ transaction_id: null, isModalOpen: false });
                      }}
                      className='rounded-10px !leading-5 !px-6 w-full'
                      parentClassName='w-2/4'
                    />
                  </>
                }
              >
                <p className='text-lg font-semibold text-blackdark leading-7 text-center'>
                  Do you want to decline this transaction? <br /> This action cannot be undone"
                </p>
              </Modal>
            </>
          )}

          {toggleRefundModal.isModalOpen && (
            <ProcessRefundModal
              isOpen={toggleRefundModal.isModalOpen}
              onClose={() => setToggleRefundModal({ transaction_id: null, isModalOpen: false })}
              transaction={
                (transactionTableData as Transaction[]).find(
                  t => t.transaction_id === toggleRefundModal.transaction_id
                ) || null
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default AppointmentListView;
