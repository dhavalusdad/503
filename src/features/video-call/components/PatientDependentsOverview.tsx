import React from 'react';

import moment from 'moment';

import type { UserAppointment } from '@/features/admin/components/appointmentList/types';
type PatientOverviewProps = {
  dependentList: UserAppointment[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PatientDependentsOverview = (props: PatientOverviewProps) => {
  return (
    <div className='flex flex-col pt-2.5'>
      {Array.isArray(props.dependentList) &&
        props.dependentList.map((item: UserAppointment, index: number) => {
          const fullName = `${item?.user?.first_name} ${item?.user?.last_name}`;
          const age = moment().diff(moment(item?.user?.dob), 'years');
          const gender = item?.user?.gender;

          return (
            <div key={item?.user?.id}>
              <div className='flex flex-col gap-1.5 py-3'>
                <div className='flex items-center gap-1'>
                  <span className='font-bold text-base leading-5 text-blackdark'>Name :</span>
                  <span className='font-normal text-sm leading-5 text-primarygray'>{fullName}</span>
                </div>

                <div className='flex items-center gap-1'>
                  <span className='font-bold text-base leading-5 text-blackdark'>Age :</span>
                  <span className='font-normal text-sm leading-5 text-primarygray'>
                    {age ? `${age} years` : '-'}
                  </span>
                </div>

                <div className='flex items-center gap-1'>
                  <span className='font-bold text-base leading-5 text-blackdark'>Gender :</span>
                  <span className='font-normal text-sm leading-5 text-primarygray'>
                    {gender || '-'}
                  </span>
                </div>
              </div>

              {/* Divider except after last row */}
              {Array.isArray(props.dependentList) && index !== props.dependentList?.length - 1 && (
                <div className='w-full h-px bg-surface'></div>
              )}
            </div>
          );
        })}
    </div>
  );
};
