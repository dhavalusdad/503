import type { ClinicAddressInterface } from '@/features/management/components/clinicAddresses/hooks';
import Modal from '@/stories/Common/Modal';

interface ViewClinicDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicData: ClinicAddressInterface | null;
}

const ViewClinicDetailsModal = ({ isOpen, onClose, clinicData }: ViewClinicDetailsModalProps) => {
  if (!isOpen || !clinicData) return null;

  return (
    <Modal title='Clinic Address Details' isOpen={isOpen} onClose={onClose} closeButton={true}>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1.5'>
          <h3 className='text-base font-bold text-blackdark leading-22px'>Clinic Name</h3>
          <p className='text-base text-primarygray font-normal leading-22px'>{clinicData.name}</p>
        </div>
        <div className='flex flex-col gap-1.5'>
          <h3 className='text-base font-bold text-blackdark leading-22px'>Clinic Address</h3>
          <p className='text-base text-primarygray font-normal leading-22px'>
            {clinicData.address}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ViewClinicDetailsModal;
