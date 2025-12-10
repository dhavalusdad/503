import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { useGetStaffById } from '@/api/staff';
import type { User } from '@/api/types/staff.dto';

const ViewStaffDetails = () => {
  const { id } = useParams();
  const [staffMember, setStaffMember] = useState<User | null>(null);
  const { data: getStaffMemberDetails } = useGetStaffById({
    staff_id: id,
    options: {
      enabled: !!id,
    },
  });

  useEffect(() => {
    if (getStaffMemberDetails) {
      setStaffMember(getStaffMemberDetails);
    }
  }, [getStaffMemberDetails]);

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-3.5'>
        <h5 className='text-lg font-bold leading-6 text-blackdark'>Staff Details</h5>
        <span className='w-full h-1px bg-surface' />
        <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-base font-bold leading-22px text-blackdark'>First Name</h6>
            <p className='text-base font-normal leading-22px text-primarygray break-all'>
              {staffMember?.first_name}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-base font-bold leading-22px text-blackdark'>Last Name</h6>
            <p className='text-base font-normal leading-22px text-primarygray break-all'>
              {staffMember?.last_name}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-base font-bold leading-22px text-blackdark'>Email Address</h6>
            <p className='text-base font-normal leading-22px text-primarygray break-all'>
              {staffMember?.email}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-base font-bold leading-22px text-blackdark'>Contact Number</h6>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {staffMember?.phone}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-base font-bold leading-22px text-blackdark'>Role</h6>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {staffMember?.roles?.[0]?.name}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-base font-bold leading-22px text-blackdark'>Status</h6>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {staffMember?.user_settings[0]?.is_active ? 'Active' : 'In Active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStaffDetails;
