import { useMemo } from 'react';

import { useGetDashboardData } from '@/api/admin-dashboard';
import { Icon, type IconNameType } from '@/stories/Common/Icon';

type CountDataType = {
  iconName: IconNameType;
  label: string;
  count: number;
};
const getComponent = (params: CountDataType) => {
  const { iconName, label, count } = params;
  return (
    <div className='bg-white py-5 px-6 rounded-20px shadow-cardshadow' key={label}>
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary text-white w-50px h-50px rounded-full flex items-center justify-center'>
            <Icon name={iconName} />
          </div>
          <p className='text-base font-medium leading-22px text-blackdark'>{label}</p>
        </div>
        <h2 className='text-32px font-bold text-primary leading-44px'>{count}</h2>
      </div>
    </div>
  );
};

const AdminDashboardDataCountCards = () => {
  const { data: dashboardData, isLoading } = useGetDashboardData({});
  const data = useMemo(() => {
    const arr: CountDataType[] = [
      { iconName: 'doubleUser', label: 'Clients', count: dashboardData?.clients as number },
      { iconName: 'calendar', label: 'Appointments', count: dashboardData?.appointments as number },
      { iconName: 'therapist', label: 'Therapists', count: dashboardData?.therapists as number },
      {
        iconName: 'clinicaddress',
        label: 'Clinical sessions',
        count: dashboardData?.clinical_sessions as number,
      },
      {
        iconName: 'video',
        label: 'Video sessions',
        count: dashboardData?.video_sessions as number,
      },
    ];
    return arr;
  }, [dashboardData]);
  return (
    <>
      {isLoading ? (
        <div className='flex justify-center items-center w-full'>
          <span
            className={`relative border-[5px] border-lime-500 border-b-lime-300 rounded-full block animate-spin h-5 w-5`}
          />
        </div>
      ) : (
        <div className='grid xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
          {data.map(card => getComponent(card))}
        </div>
      )}
    </>
  );
};

export default AdminDashboardDataCountCards;
