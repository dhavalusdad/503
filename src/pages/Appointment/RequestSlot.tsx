import RequestSlot from '@/features/appointment/component/ClientAppointmentsBooking/RequestSlot';

const RequestSlotView = () => {
  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <h4 className='text-lg font-bold leading-6 text-blackdark mb-5'>Request Slot</h4>
      <RequestSlot />
    </div>
  );
};

export default RequestSlotView;
