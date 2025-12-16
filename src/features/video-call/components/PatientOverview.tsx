import React from 'react';

import Highcharts from 'highcharts';
import moment from 'moment';
import { useParams } from 'react-router-dom';

import { useGetAppointmentDetailsByVideoRoom } from '@/api/appointment';
import { TPIChart } from '@/features/video-call/components/TpiChart';

type PatientOverviewProps = {
  setHighChartsValue: React.Dispatch<React.SetStateAction<Highcharts.Options | undefined>>;
  highCharts?: Highcharts.Options;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PatientOverview = (props: PatientOverviewProps) => {
  const { roomId } = useParams<{ roomId: string; role: string }>();

  const {
    data: appointmentDetails,
    isLoading,
    isError,
  } = useGetAppointmentDetailsByVideoRoom(roomId!);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !appointmentDetails) {
    return <div>Error loading appointment details</div>;
  }

  const clientUser = appointmentDetails.client.user || '-';
  const fullName = `${clientUser.first_name} ${clientUser.last_name}`;
  const dob = clientUser.dob || '-';
  const age = moment().diff(moment(dob), 'years') || '';
  const gender = clientUser.gender;
  const therapyType = appointmentDetails.therapy_type.name || '-';

  return (
    <div className='flex flex-col gap-3 pt-2.5'>
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-1'>
          <span className='font-bold text-base leading-5 text-blackdark'>Name : </span>
          <span className='font-normal text-sm leading-5 text-primarygray'>{fullName}</span>
        </div>
        <div className='flex items-center gap-1'>
          <span className='font-bold text-base leading-5 text-blackdark'>Age : </span>
          <span className='font-normal text-sm leading-5 text-primarygray'>
            {age ? `${age} years` : ''}
          </span>
        </div>
        <div className='flex items-center gap-1'>
          <span className='font-bold text-base leading-5 text-blackdark'>Gender : </span>
          <span className='font-normal text-sm leading-5 text-primarygray'>{gender}</span>
        </div>
        <div className='flex items-center gap-1'>
          <span className='font-bold text-base leading-5 text-blackdark'>Therapy Type : </span>
          <span className='font-normal text-sm leading-5 text-primarygray'>{therapyType}</span>
        </div>
      </div>

      <TPIChart
        client_id={appointmentDetails.client.user.id}
        therapist_id={appointmentDetails.therapist.user.id}
        {...props}
      />
    </div>
  );
};
